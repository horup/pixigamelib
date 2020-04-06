import * as PIXI from 'pixi.js';
import { Board, BoardState, BoardTileMap, BoardThing } from '../board';
import { FloatingText } from '../floatingtext';
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
    radius: number = 1;
    frame: number = Math.floor(Math.random() * 4);
    atlas: number = 1;
    order: number = 0;
    
    update(ticker:PIXI.Ticker)
    {
        this.life -= 1;
        const speed = ticker.deltaTime * 0.1;
        this.x += (Math.random() - 0.5) * speed;
        this.y += (Math.random() - 0.5) * speed;
        this.order = this.y;
    }
}

let nextId = 0;

function spawnMan()
{
    const man = new Man();
    man.x = Math.random() * s.tilemap.width;
    man.y = Math.random() * s.tilemap.height;
    s.things[nextId++] = man;
    board.addFloatingText("Hi!", man.x, man.y, {fill:'white', fontSize:32});
}

let iterations = 0;
app.ticker.add(()=>
{
    iterations++;
    const len = Object.keys(s.things).length;
    if (len< 10000)
    {
        spawnMan();
    }

    Object.entries(s.things).forEach((v)=>{
        const m = v[1] as Man;
        const id = v[0] as string;
        m.update(app.ticker);
        if (m.life <= 0)
        {
            board.addFloatingText("Bye!", m.x, m.y, {fontSize:32});
            delete s.things[id];
        }
    });
    
    const i = Math.floor(Math.random()*s.tilemap.width*s.tilemap.height);
    s.tilemap.layers[0][i].frame = Math.floor(Math.random()*4);

    board.tick(app.ticker, s);

    if (iterations % 60 == 0)
        debug.text = `FPS:${Math.floor(app.ticker.FPS)} MEN:${len}`
})

