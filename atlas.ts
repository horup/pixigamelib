import * as PIXI from 'pixi.js';

/**An atlas holding a texture with number rows * columns is the number of 
 * frames 
 */
export interface Atlas
{
    texture:PIXI.BaseTexture;
    columns:number;
    rows:number;
}
/**A map of multiple atlases */
export type AtlasMap = {[id:number]:Atlas};
