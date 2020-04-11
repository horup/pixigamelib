import * as PIXI from 'pixi.js';
import { AtlasSprite, AtlasSpriteProps } from './atlassprite';
import { AtlasMap } from '.';

/**A container of AtlasSprites.
 * Provides set, spread and delete methods which makes it convienient to update
 * the sprites of the container. 
 */
export class AtlasSpriteContainer extends PIXI.Container
{
    private sprites:{[id:string]:AtlasSprite} = {};
    private atlasMap:AtlasMap;
    constructor(atlasMap:AtlasMap)
    {
        super();
        this.atlasMap = atlasMap;
        this.sortableChildren = true;
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

    /**Removes the sprites with the given id, and removes them from the container */
    removeSprites(sprites:{[id:string]:any})
    {
        for (let id in sprites)
        {
            if (this.sprites[id])
            {
                const r = this.removeChild(this.sprites[id]);
                r.destroy({texture:true});
                delete this.sprites[id];
            }
        }
    }
}