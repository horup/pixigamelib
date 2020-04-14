import * as PIXI from 'pixi.js';
import { AtlasMap } from ".";

export interface AtlasTileProps
{
    /** The part of the texture to be shown */
    frame:number;

    /** The index of the atlas map of the sprite */
    atlas:number;

    /** Render order as to control overlapping */
    zIndex?:number;
    
    /** Anchor, where to place the sprite */
    anchor?:{x:number, y:number};

    /**Tint */
    tint?:number;

    /**Alpha */
    alpha?:number;
}

/** Props for AtlasSprite */
export interface AtlasSpriteProps extends AtlasTileProps
{
    /** x position of the sprite */
    x:number;

    /** y position of the sprite */
    y:number;
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

    /**Partially updates the sprite based upon a new set of props */
    spread(props:Partial<AtlasSpriteProps>)
    {
        this.x = props.x != undefined ? props.x : this.x;
        this.y = props.y != undefined ? props.y : this.y;
        this.atlas = props.atlas != undefined ? props.atlas : this.atlas;
        const atlas = this.atlasMap[this.atlas];
        this.zIndex = props.zIndex != undefined ? props.zIndex : this.zIndex;
        this.tint = props.tint != undefined ? props.tint : this.tint;
        this.alpha = props.alpha != undefined ? props.alpha : this.alpha;

        if (props.anchor != null && props.anchor.x != null)
        {

            if (props.anchor.y != undefined)
            {
                this.anchor.set(props.anchor.x, props.anchor.y);

            }
            else
                this.anchor.set(props.anchor.x);
        }

        let forceFrame = false;
        if (this.texture.baseTexture != atlas.texture)
        {
            this.texture.destroy();
            this.texture = new PIXI.Texture(atlas.texture);
            forceFrame = true;
        }

        if (this.frame != props.frame || forceFrame)
        {
            this.frame = props.frame;
            const w = atlas.texture.width / atlas.columns;
            const h = atlas.texture.height / atlas.rows;
            const x = this.frame % atlas.columns * w;
            const y = Math.floor(this.frame / atlas.columns) * h;
            this.texture.frame = new PIXI.Rectangle(x, y, w, h);
            this.width = 1;
            this.height = 1;
        }
    }
}