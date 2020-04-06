import * as PIXI from 'pixi.js';
import { Board, BoardState, BoardTileMap, BoardThing } from '../board';
declare var require;

// load textures
const tilesTexture = PIXI.BaseTexture.from(require("./tiles.png"));
const menTexture = PIXI.BaseTexture.from(require("./men.png"));

// create app
const canvas = document.getElementById('canvas');
const app = new PIXI.Application({
    view:canvas as any
})

const tilemap:BoardTileMap = {
    width:64,
    height:64,
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

board.scale.set(16);
app.stage.addChild(board);

class Man implements BoardThing
{
    x: number = 0;
    y: number = 0;
    radius: number = 1;
    frame: number = Math.floor(Math.random() * 4);
    atlas: number = 1;
    order: number = 0;
    
    update()
    {
        const speed = 0.1;
        this.x += (Math.random() - 0.5) * speed;
        this.y += (Math.random() - 0.5) * speed;
        this.order = this.y;
    }
}

let nextId = 0;

function spawnMan()
{
    const man = new Man();
    man.x = Math.random() * 64;
    man.y = Math.random() * 64;
    s.things[nextId++] = man;
}

app.ticker.add(()=>
{
    if (Object.keys(s.things).length < 1000)
    {
        spawnMan();
    }

    Object.values(s.things).forEach((m:Man)=>(m.update()));
    
    const i = Math.floor(Math.random()*64*64);
    s.tilemap.layers[0][i].frame = Math.floor(Math.random()*4);

    board.update(s)
})

