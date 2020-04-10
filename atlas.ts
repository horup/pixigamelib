import * as PIXI from 'pixi.js';

export interface Atlas
{
    texture:PIXI.BaseTexture;
    width:number;
    height:number;
}
export type AtlasMap = {[id:number]:Atlas};
