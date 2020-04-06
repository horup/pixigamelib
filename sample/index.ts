import * as PIXI from 'pixi.js';
import { Board, BoardState, BoardTileMap } from '../board';
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
    tilemap.layers[0].push({frame:i%4, order:0, atlas:0});
}

// construct sample state to be rendered
let s:BoardState = {
    things:{
        "0":{
            frame:0,
            order:1,
            radius:1,
            atlas:1,
            x:1,
            y:1
        },
        "1":{
            frame:1,
            order:1,
            radius:1,
            atlas:1,
            x:2,
            y:2
        },
        "2":{
            frame:2,
            order:1,
            radius:1,
            atlas:1,
            x:3,
            y:3
        }
    },
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

app.ticker.add(()=>
{
    board.update(s)
})

