import * as PIXI from 'pixi.js';
import { AtlasMap } from ".";

/** Props for AtlasSprite */
export interface AtlasSpriteProps
{
    /** x position of the sprite */
    x:number;

    /** y position of the sprite */
    y:number;

    /** The index which contains the texture to use from the atlasmap */
    frame:number;

    /** The index of the atlas map of the sprite */
    atlas:number;

    /** Render order as to control overlapping */
    zIndex:number;
}


/** A Sprite which uses an Atlas instead of just a texture.
 */
export class AtlasSprite extends PIXI.Sprite implements AtlasSpriteProps
{
    atlas:number = -1;
    frame:number = -1;
    atlasMap:AtlasMap;

    constructor(props:AtlasSpriteProps, atlasMap:AtlasMap)
    {
        super(new PIXI.Texture(atlasMap[props.atlas].texture));
        this.atlasMap = atlasMap;
        this.spread(props);
        this.width = 1;
        this.height = 1;
    }

    spread(props:Partial<AtlasSpriteProps>)
    {
        this.x = props.x != undefined ? props.x : this.x;
        this.y = props.y != undefined ? props.y : this.y;
        this.atlas = props.atlas != undefined ? props.atlas : this.atlas;
        const atlas = this.atlasMap[this.atlas];
        this.zIndex = props.zIndex != undefined ? props.zIndex : this.zIndex;

        let forceFrame = false;
        if (this.texture.baseTexture != atlas.texture)
        {
            this.texture = new PIXI.Texture(atlas.texture);
            forceFrame = true;
        }

        if (this.frame != props.frame || forceFrame)
        {
            this.frame = props.frame;
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