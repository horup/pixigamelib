import * as PIXI from 'pixi.js';



/** A thing on the board that has a fluid position */
export interface BoardThing extends BoardTile
{
    x:number;
    y:number;
    radius:number;
}

export interface BoardTile
{
    /** The index which contains the texture to use */
    frame:number;

    /** The index which contains the texture to use */
    textureIndex:number;

    /** Render order as to control overlapping */
    order:number;
}

export interface BoardTileMap
{
    /** Width of the tilemap */
    width:number;
    height:number;
    /** Layers containing tiles */
    layers:BoardTile[][];
}

/** The state of the board. 
 *  Interface must be implemented by consumer and can be extended 
 *  for the particular game needs */
export interface BoardState
{
    things:{[id:string]:BoardThing};
    tilemap:BoardTileMap;
}

export class BoardSprite extends PIXI.Sprite implements BoardThing
{
    constructor()
    {
        super();
       
    }

    radius: number = 1;
    frame: number = 0;
    order: number = 0;
    textureIndex:number = 0;

    update(boardThing:BoardThing, board:Board)
    {
        this.radius = boardThing.radius;
        this.order = boardThing.order;
        this.textureIndex = boardThing.textureIndex;
        
        this.x = boardThing.x;
        this.y = boardThing.y;
        const atlas = board.textures[this.textureIndex];
        if (this.texture.baseTexture != atlas.texture)
        {
            this.texture = new PIXI.Texture(atlas.texture);
            this.frame = -1;
        }

        if (this.frame != boardThing.frame)
        {
            this.frame = boardThing.frame;
            const w = atlas.texture.width / atlas.width;
            const h = atlas.texture.height / atlas.height;
            const x = this.frame % atlas.width * w;
            const y = Math.floor(this.frame / atlas.width) * h;
            this.texture.frame = new PIXI.Rectangle(x, y, w, h);
            this.width = 1;
            this.height = 1;
            this.anchor.set(0.5, 0.5);
        }

        

       /* this.texture.frame.width = atlas.texture.width / atlas.width;
        console.log(this.texture.frame.width);
        this.texture.frame.height = atlas.texture.height / atlas.height;*/

    }
}

export interface Atlas
{
    texture:PIXI.BaseTexture;
    width:number;
    height:number;
}
export type AtlasMap = {[id:number]:Atlas};


/** Represents a gameboard with tiles and things. 
 *  Assumes a size of 1x1 per thing and tile. 
 *  Scale to appropriate size. 
 */
export class Board extends PIXI.Container
{
    things:{[id:number]:BoardSprite} = {};

    textures:AtlasMap;
    constructor(textures:AtlasMap)
    {
        super();
        this.textures = textures;
    }

    update(state:BoardState)
    {
        for (const atlas of Object.values(this.textures))
        {
            if (atlas.texture.width == 0)
                return; // not loaded yet, return untill loaded
        }
        for (let id in state.things)
        {
            let thing = state.things[id];
            let sprite = this.things[id] as BoardSprite;
            if (sprite == null)
            {
                sprite = new BoardSprite();
                this.things[id] = sprite;
                this.addChild(sprite);
            }

            sprite.update(thing, this);
        }
    }
}