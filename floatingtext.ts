import * as PIXI from 'pixi.js';

export class FloatingText extends PIXI.Text
{
    ticker:PIXI.Ticker;
    constructor(s:string, ticker:PIXI.Ticker, style:Partial<PIXI.TextStyle> = {fill:'white', fontSize:16})
    {
        super(s, style);
        this.scale.set(1 / (style.fontSize as number));
        this.ticker = ticker;
        this.anchor.set(0.5, 1.0);
        this.ticker.add(this.tick);
    }

    tick = ()=>
    {
        this.alpha -= 0.01;
        if (this.alpha <= 0)
        {
            if (this.parent != null)
                this.parent.removeChild(this);
            this.ticker.remove(this.tick);
        }
    }
}