import * as PIXI from 'pixi.js';
import { AtlasSpriteContainer } from '../atlasspritecontainer';
import { FadingText } from '../fadingtext';
import { pan, zoom } from '../helpers';
import { TickrateCalculator} from '../tickratecalculator';
import { interpolateLinear } from '../interpolations';
import { AtlasSpriteProps } from '..';
import { CenteredText } from '../centeredtext';
import { AtlasTileContainer, AtlasTileProps, Tilemap } from '../atlastilecontainer';
declare var require;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const loader = PIXI.Loader.shared
.add("tiles", require("./tiles.png"))
.add("men", require("./men.png"))
.load();

// create app
const canvas = document.getElementById('canvas');
const app = new PIXI.Application({
    view:canvas as any,
    resizeTo:window
})

const board = new PIXI.Container();
const status = new CenteredText(app.view, "Loading...", {fill:'white'});
app.stage.addChild(board);
app.stage.addChild(status);
const debug = new PIXI.Text("debug", {fill:'white', fontSize:16});
app.stage.addChild(debug);

loader.on('complete', ()=>
{
    status.text = "";
    const res = loader.resources;
    const atlas = {
        0:{width:2, height:2, texture:res["tiles"].texture.baseTexture},
        1:{width:2, height:2, texture:res["men"].texture.baseTexture}
    }
   
    const men:{[index:number]:AtlasSpriteProps} = {}
    const ground = new AtlasTileContainer(atlas);
    board.addChild(ground);
    const sprites = new AtlasSpriteContainer(atlas);
    board.addChild(sprites);

    const map:Tilemap<AtlasTileProps> = {};
    const w = 32, h = 32;
    for (let y = 0; y < h; y++)
    {
        map[y] = {};
        for (let x = 0; x < w; x++)
        {
            map[y][x] = {
                atlas:0,
                frame:0,
                zIndex:0
            }
        }
    }

    ground.setTiles(0, map);
    board.scale.set(16);

    class Man implements AtlasSpriteProps
    {
        life:number = 60+Math.random()*60;
        x: number = 0;
        y: number = 0;
        prevPos:{x:number, y:number} = {x:0, y:0};
        pos:{x:number, y:number} = {x:0, y:0};
        radius: number = 1;
        frame: number = Math.floor(Math.random() * 4);
        atlas: number = 1;
        zIndex: number = 0;

        constructor(x:number, y:number)
        {
            this.x = x;
            this.y = y;
            this.prevPos = {x:x, y:y};
            this.pos = {x:x, y:y};
        }
        
        update()
        {
            this.life -= 1;
            const speed = 1;
            this.prevPos = this.pos;
            this.pos = {...this.prevPos};
            this.pos.x += (Math.random() - 0.5) * speed;
            this.pos.y += (Math.random() - 0.5) * speed;
        }
    }

    let nextId = 0;

    window.onkeydown = (e)=>
    {
        
    }

    window.onmousewheel = (e:WheelEvent)=>
    {
        console.log(e);
        const dir = -Math.sign(e.deltaY) ;
        const speed = 1.2;
        let g = new PIXI.Point(e.clientX, e.clientY);
        zoom(board, speed * dir, g);
    }


    window.onmousemove = (e:MouseEvent)=>{
        if (e.buttons == 1)
        {
            pan(board, -e.movementX, -e.movementY);
        }
    }

    let iterations = 0;

    const serverCalc = new TickrateCalculator(2);
    const clientCalc = new TickrateCalculator();

    setInterval(()=>{
        const len = Object.keys(men).length;
        const l = 100;
        for (let i = len - l; i < l; i++){
            const man = new Man(Math.random() * w,
            Math.random() * h);
        
            men[nextId++] = man;
            const t = new FadingText({text:"Hi!", x:man.x, y:man.y});
            board.addChild(t);
        }

        Object.entries(men).forEach((v)=>{
            const m = v[1] as Man;
            const id = v[0] as string;
            m.update();
            sprites.setSprites({[id]:m});
            if (m.life <= 0)
            {
                
                delete men[id];
                sprites.removeSprites({[id]:{}});
                const t = new FadingText({
                    text:"Bye!",
                    x:m.x,
                    y:m.y
                })
                sprites.addChild(t);
            }
        });
        
       
        const x = Math.floor(Math.random()*w);
        const y = Math.floor(Math.random()*h);
        const frame = Math.floor(Math.random()*4);

        ground.setTiles(0, {
            [y]:{
                [x]:{
                    atlas:0,
                    frame:frame,
                    zIndex:0
                }
            }
        })

        serverCalc.tick();
    }, 33);


    function interpolate()
    {
        if (serverCalc.stable && clientCalc.stable)
        {
            const f = clientCalc.factor(serverCalc);
            Object.values(men).forEach((t:Man)=>{
                t.x = interpolateLinear(t.prevPos.x, t.pos.x, f);
                t.y = interpolateLinear(t.prevPos.y, t.pos.y, f);
            });
        }
    }

    app.ticker.add(()=>
    {
        sprites.setSprites(men);
        clientCalc.tick();
        interpolate();
        debug.text = `FPS:${app.ticker.FPS}`;
    })

});

