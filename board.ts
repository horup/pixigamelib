import * as PIXI from 'pixi.js';
import { FloatingText } from './floatingtext';



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

    /** The index which contains the atlas to use */
    atlas:number;

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

export class BoardTileSprite extends PIXI.Sprite implements BoardTile
{
    frame: number = 0;
    order: number = 0;
    atlas:number = 0;
    update(layer:number, index:number, tilemap:BoardTileMap, atlases:AtlasMap)
    {
        const tile = tilemap.layers[layer][index];
        const atlas = atlases[tile.atlas];
        this.zIndex = tile.order;

        if (this.texture.baseTexture != atlas.texture)
        {
            this.texture = new PIXI.Texture(atlas.texture);
            this.frame = -1;
        }

        if (this.frame != tile.frame)
        {
            this.frame = tile.frame;
            const w = atlas.texture.width / atlas.width;
            const h = atlas.texture.height / atlas.height;
            const x = this.frame % atlas.width * w;
            const y = Math.floor(this.frame / atlas.width) * h;
            this.texture.frame = new PIXI.Rectangle(x, y, w, h);
            this.width = 1;
            this.height = 1;
            this.anchor.set(0.0, 0.0);
        }
    }
}

export class BoardThingSprite extends PIXI.Sprite implements BoardThing
{
    radius: number = 1;
    frame: number = 0;
    order: number = 0;
    atlas:number = 0;

    update(boardThing:BoardThing, board:Board)
    {
        this.radius = boardThing.radius;
        this.order = boardThing.order;
        this.atlas = boardThing.atlas;
        
        this.x = boardThing.x;
        this.y = boardThing.y;
        this.zIndex = boardThing.order;
        const atlas = board.textures[this.atlas];
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
    tilemapWidth:number = 0;
    tilemapHeight:number = 0;
    things:{[id:number]:BoardThingSprite} = {};
    floatingTexts:FloatingText[] = [];
    layers:BoardTileSprite[][] = [];
    textures:AtlasMap;
    constructor(textures:AtlasMap)
    {
        super();
        this.textures = textures;
        this.sortableChildren = true;
    }

    addFloatingText(s:string, x:number, y:number, style?:Partial<PIXI.TextStyle>)
    {
        const t = new FloatingText(s, style);
        t.x = x;
        t.y = y;
        this.floatingTexts.push(t);
        this.addChild(t);
        return t;
    }

    private tickFloatingTexts(ticker:PIXI.Ticker)
    {
        this.floatingTexts.forEach(v=>v.tick(ticker));
        const remove = this.floatingTexts.filter(v=>v.alpha <= 0);
        remove.forEach(r=>this.removeChild(r));
        if (remove.length != 0)
            this.floatingTexts = this.floatingTexts.filter(v=>v.alpha > 0);
    }

    private tickThings(ticker:PIXI.Ticker, state:BoardState)
    {
        for (let id in state.things)
        {
            let thing = state.things[id];
            let sprite = this.things[id] as BoardThingSprite;
            if (sprite == null)
            {
                sprite = new BoardThingSprite();
                this.things[id] = sprite;
                this.addChild(sprite);
            }

            sprite.update(thing, this);
        }

        for (let id in this.things)
        {
            if (state.things[id] == undefined)
            {
                this.removeChild(this.things[id]);
                delete this.things[id];
            }
        }
    }

    private tickTilemap(ticker:PIXI.Ticker, state:BoardState)
    {
        if (this.layers.length != state.tilemap.layers.length || state.tilemap.width == this.tilemapWidth || state.tilemap.height == this.tilemapHeight)
        {
            this.layers.forEach(layer=>layer.forEach(s=>this.removeChild(s)));
            this.layers = [];
            for (let i = 0; i < state.tilemap.layers.length; i++)
            {
                const l = [] as BoardTileSprite[];
                for (let y = 0; y < state.tilemap.height; y++)
                {
                    for (let x = 0; x < state.tilemap.width; x++)
                    {
                        const s = new BoardTileSprite();
                        s.x = x;
                        s.y = y;
                        this.addChild(s);
                        l.push(s);
                    }
                }

                this.layers.push(l);
            }
        }

        for (let i = 0; i < state.tilemap.layers.length; i++)
        {
            const spriteLayer = this.layers[i];
            const layer = state.tilemap.layers[i];
            for (let j = 0; j < layer.length; j++)
            {
                const sprite = spriteLayer[j];
                sprite.update(i, j, state.tilemap, this.textures);
            }
        }
    }

    tick(ticker:PIXI.Ticker, state:BoardState)
    {
        for (const atlas of Object.values(this.textures))
        {
            if (atlas.texture.width == 0)
                return; // not loaded yet, return untill loaded
        }
        
        this.tickThings(ticker, state);
        this.tickTilemap(ticker, state);
        this.tickFloatingTexts(ticker);
    }
}