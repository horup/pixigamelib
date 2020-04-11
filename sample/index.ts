import * as PIXI from 'pixi.js';
import { AtlasSpriteContainer, Tilemap, AtlasTileProps } from '../atlasspritecontainer';
import { FadingText } from '../fadingtext';
import { pan, zoom } from '../helpers';
import { TickrateCalculator} from '../tickratecalculator';
import { interpolateLinear } from '../interpolations';
import { AtlasSpriteProps } from '..';
import { CenteredText } from '../centeredtext';
declare var require;


PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const loader = PIXI.Loader.shared;
loader
.add("tiles", require("./tiles.png"))
.add("men", require("./men.png"))
.load();

// create app
const canvas = document.getElementById('canvas');
const app = new PIXI.Application({
    view:canvas as any,
    resizeTo:window
})
/*
const status = new PIXI.Text("Status", {fill:'white'} as Partial<PIXI.TextStyle>);
status.x = app.view.width / 2;
status.y = app.view.height / 2;
app.stage.addChild(status);*/

const status = new CenteredText(app.view, "Loading...", {fill:'white'});
status.zIndex = 100000;
app.stage.addChild(status);

loader.on('complete', ()=>
{
    status.text = "";
    const res = loader.resources;
    const atlas = {
        0:{width:2, height:2, texture:res["tiles"].texture.baseTexture},
        1:{width:2, height:2, texture:res["men"].texture.baseTexture}
    }
    console.log(loader.resources);


    const tilemap = {
        width:64,
        height:64
        
    }


    // construct sample state to be rendered
    let s = {
        things:{},
        tilemap:tilemap
    }

    // make board and put on stage
    // scale by 16
    const board = new AtlasSpriteContainer(atlas)


    const map:Tilemap<AtlasTileProps> = {};
    for (let y = 0; y < tilemap.height; y++)
    {
        map[y] = {};
        for (let x = 0; x < tilemap.width; x++)
        {
            map[y][x] = {
                atlas:0,
                frame:0,
                zIndex:0
            }
        }
    }

    board.setTiles(0, map);


    board.x = 0;
    board.y = 0;
    board.scale.set(16);

    app.stage.addChild(board);

    const debug = new PIXI.Text("debug", {fill:'white', fontSize:16});
    app.stage.addChild(debug);

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

    function spawnMan()
    {
        const man = new Man(Math.random() * s.tilemap.width,
            Math.random() * s.tilemap.height);
        
        s.things[nextId++] = man;
        const t = new FadingText({text:"Hi!", x:man.x, y:man.y});
        board.addChild(t);
    }

    window.onkeydown = (e)=>
    {
        
    }

    window.onmousewheel = (e:WheelEvent)=>
    {
        console.log(e);
        const dir = -Math.sign(e.deltaY) ;
        const speed = 1.2;
        let g = new PIXI.Point(e.clientX, e.clientY);
        /*if (dir < 0)
            g.set(app.view.width / 2, app.view.height /2);*/
        zoom(board, speed * dir, g);
    }


    window.onmousemove = (e:MouseEvent)=>{
        if (e.buttons == 1)
        {
            pan(board, -e.movementX, -e.movementY);
        }
        //pan(board, 1, 1);
    }

    let iterations = 0;

    const serverCalc = new TickrateCalculator(2);
    const clientCalc = new TickrateCalculator();

    setInterval(()=>{
        const len = Object.keys(s.things).length;
        const l = 100;
   //     if (len < l)
        {
            for (let i = len - l; i < l; i++)
                spawnMan();
        }

        Object.entries(s.things).forEach((v)=>{
            const m = v[1] as Man;
            const id = v[0] as string;
            m.update();
            board.setSprites({[id]:m});
            if (m.life <= 0)
            {
                
                delete s.things[id];
                board.removeSprites({[id]:{}});
                const t = new FadingText({
                    text:"Bye!",
                    x:m.x,
                    y:m.y
                })
                board.addChild(t);
            }
        });
        
        /*const i = Math.floor(Math.random()*s.tilemap.width*s.tilemap.height);
        s.tilemap.layers[0][i].frame = Math.floor(Math.random()*4);*/
        const x = Math.floor(Math.random()*s.tilemap.width);
        const y = Math.floor(Math.random()*s.tilemap.height);
        const frame = Math.floor(Math.random()*4);

    /*    board.setTiles(0, {
            [y]:{
                [x]:{
                    atlas:0,
                    frame:frame,
                    zIndex:0
                }
            }
        })*/

        serverCalc.tick();
    }, 33);


    function interpolate()
    {
        if (serverCalc.stable && clientCalc.stable)
        {
            const f = clientCalc.factor(serverCalc);
            Object.values(s.things).forEach((t:Man)=>{
                t.x = interpolateLinear(t.prevPos.x, t.pos.x, f);
                t.y = interpolateLinear(t.prevPos.y, t.pos.y, f);
            });
        }
    }

    app.ticker.add(()=>
    {
        board.setSprites(s.things);
        clientCalc.tick();
        interpolate();
        debug.text = `FPS:${app.ticker.FPS}`;
    })

});

