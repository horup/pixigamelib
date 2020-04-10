import * as PIXI from 'pixi.js';
import { FadingText } from './fadingtext';
import { AtlasSprite, AtlasSpriteProps } from './atlassprite';
import { AtlasMap } from '.';

export type Tilemap<T> = {[y:number]:{[x:number]:T}};
export type LayeredTilemap<T> = {[layer:number]:Tilemap<T>};

export interface AtlasTileProps
{
    frame:number;
    atlas:number;
    zIndex:number;
}

/**A container of AtlasSprites.
 * Provides set, spread and delete methods which makes it convienient to update
 * the sprites of the container. 
 */
export class AtlasSpriteContainer extends PIXI.Container
{
    private sprites:{[id:string]:AtlasSprite} = {};
    private tiles:LayeredTilemap<AtlasSprite> = {};
    private atlasMap:AtlasMap;
    constructor(atlasMap:AtlasMap)
    {
        super();
        this.atlasMap = atlasMap;
        this.sortableChildren = true;
    }

    setTiles(layer:number, tilemap:Tilemap<AtlasTileProps>)
    {
        if (this.tiles[layer] == null)
            this.tiles[layer] = {};
        for (let y in tilemap)
        {
            if (this.tiles[layer][y] == null)
                this.tiles[layer][y] = {};
            for (let x in tilemap[y])
            {
                const tile = tilemap[y][x];
                if (this.tiles[layer][y][x] == null)
                {
                    const sprite = new AtlasSprite({
                        atlas:tile.atlas,
                        frame:tile.frame,
                        zIndex:tile.zIndex,
                        x:parseInt(x),
                        y:parseInt(y)
                    }, this.atlasMap);
                    this.tiles[layer][y][x] = sprite;
                    this.addChild(sprite);
                }
                else
                {
                    const sprite = this.tiles[layer][y][x];
                    sprite.spread(tile);
                }
            }
        }
    }

    /** Sets the sprites with the indicated id.
     *  If the sprite is not found, it is created and added to the container.
     */
    setSprites(sprites:{[id:string]:AtlasSpriteProps})
    {
        for (let id in sprites)
        {
            const props = sprites[id];
            if (this.sprites[id] == null)
            {
                this.sprites[id] = new AtlasSprite(props, this.atlasMap);
                this.addChild(this.sprites[id]);
            }
            else
            {
                this.sprites[id].spread(props);
            }
        }
    }

    /** Partially sets the sprites with the indicated id.
     *  Props undefined have no effect on the sprite.
     *  If the sprite is not found, it is not created and the spread is ignored.
     */
    spreadSprites(sprites:{[id:string]:Partial<AtlasSpriteProps>})
    {
        for (let id in sprites)
        {
            const props = sprites[id];
            if (this.sprites[id] != null)
            {
                //this.sprites[id] = this.sprites[id];//{...this.sprites[id], ...things[id]};
                const sprite = this.sprites[id];
                sprite.spread(props);
            }
        }
    }

    /**Deletes the sprites with the given id, and removes them from the container */
    deleteSprites(sprites:{[id:string]:any})
    {
        for (let id in sprites)
        {
            if (this.sprites[id])
            {
                this.removeChild(this.sprites[id]);
                delete this.sprites[id];
            }
        }
    }

   /* tilemapWidth:number = 0;
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
    }*/
}