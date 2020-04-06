import * as PIXI from 'pixi.js';

export class FloatingText extends PIXI.Text
{
    constructor(s:string, style:Partial<PIXI.TextStyle> = {fill:'white', fontSize:16})
    {
        super(s, style);
        this.scale.set(1 / (style.fontSize as number));
        this.anchor.set(0.5, 1.0);
    }

    tick(ticker:PIXI.Ticker)
    {
        this.alpha -= ticker.deltaTime*0.01;
    }
}