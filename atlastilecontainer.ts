import * as PIXI from 'pixi.js';
import { AtlasSprite, AtlasTileProps } from './atlassprite';
import {  AtlasMap } from './atlas';


export type Tilemap<T> = {[y:number]:{[x:number]:T}};
export type LayeredTilemap<T> = {[layer:number]:Tilemap<T>};

/**A container of tiles, each of which is an AtlasSprite
 */
export class AtlasTileContainer extends PIXI.Container
{
    private tiles:LayeredTilemap<AtlasSprite> = {};
    private atlasMap:AtlasMap;
    constructor(atlasMap:AtlasMap)
    {
        super();
        this.atlasMap = atlasMap;
        this.sortableChildren = true;
    }

    /**Sets the tiles */
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
                        x:parseInt(x),
                        y:parseInt(y)
                    }, this.atlasMap);
                    
                    this.tiles[layer][y][x] = sprite;
                    this.addChild(sprite);
                    sprite.spread(tile);
                }
                else
                {
                    const sprite = this.tiles[layer][y][x];
                    sprite.spread(tile);
                }
            }
        }
    }

    /**Removes the tile if they exists, freeing up the resources in the process */
    removeTiles(layer:number, tilemap:Tilemap<any>)
    {
        if (this.tiles[layer] == null)
            return;
        for (let y in tilemap)
        {
            if (this.tiles[layer][y] == null)
                continue;
            for (let x in tilemap[y])
            {
                if (this.tiles[layer][y][x] != null)
                {
                    this.removeChild(this.tiles[layer][y][x]);
                    this.tiles[layer][y][x].destroy({texture:true});
                    delete this.tiles[layer][y][x];
                }
            }
        }
    }
}