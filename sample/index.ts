import * as PIXI from 'pixi.js';
import { Board, BoardState, BoardTileMap, BoardThing } from '../board';
import { FloatingText } from '../floatingtext';
import { pan, zoom } from '../helpers';
import { TickrateCalculator} from '../tickratecalculator';
import { interpolateLinear } from '../interpolation';
declare var require;


PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// load textures
const tilesTexture = PIXI.BaseTexture.from(require("./tiles.png"));
const menTexture = PIXI.BaseTexture.from(require("./men.png"));

// create app
const canvas = document.getElementById('canvas');
const app = new PIXI.Application({
    view:canvas as any,
    resizeTo:window
})


const tilemap:BoardTileMap = {
    width:64,
    height:48,
    layers:[
        []
    ]
}

for (let i = 0; i < tilemap.width*tilemap.height; i++)
{
    tilemap.layers[0].push({frame:0, order:-1, atlas:0});
}

// construct sample state to be rendered
let s:BoardState = {
    things:{},
    tilemap:tilemap
}

// make board and put on stage
// scale by 16
const board = new Board({
    0:{width:2, height:2, texture:tilesTexture},
    1:{width:2, height:2, texture:menTexture}
})

board.x = 0;
board.y = 0;
board.scale.set(16);

app.stage.addChild(board);

const debug = new PIXI.Text("debug", {fill:'white', fontSize:16});
app.stage.addChild(debug);

class Man implements BoardThing
{
    life:number = 60*600;
    x: number = 0;
    y: number = 0;
    prevPos:{x:number, y:number} = {x:0, y:0};
    pos:{x:number, y:number} = {x:0, y:0};
    radius: number = 1;
    frame: number = Math.floor(Math.random() * 4);
    atlas: number = 1;
    order: number = 0;

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
    board.addFloatingText("Hi!", man.x, man.y, {fill:'white', fontSize:32});
}

window.onkeydown = (e)=>
{
    pan(board, 1, 0);
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

let iterations = 0;

const serverCalc = new TickrateCalculator(2);
const clientCalc = new TickrateCalculator();

setInterval(()=>{
    const len = Object.keys(s.things).length;
    if (len< 1000)
    {
        spawnMan();
    }

    Object.entries(s.things).forEach((v)=>{
        const m = v[1] as Man;
        const id = v[0] as string;
        m.update();
        if (m.life <= 0)
        {
            board.addFloatingText("Bye!", m.x, m.y, {fontSize:32});
            delete s.things[id];
        }
    });
    
    const i = Math.floor(Math.random()*s.tilemap.width*s.tilemap.height);
    s.tilemap.layers[0][i].frame = Math.floor(Math.random()*4);

    serverCalc.tick();
}, 33);


function interpolate()
{
   // if (serverCalc.stable && clientCalc.stable)
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
    clientCalc.tick();
    interpolate();
    board.tick(app.ticker, s);
    debug.text = `Last:${clientCalc.factor(serverCalc)}`;
})

