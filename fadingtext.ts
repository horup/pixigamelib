import * as PIXI from 'pixi.js';

export interface FadingTextProps
{
    text:string;
    x:number;
    y:number;
    style?:Partial<PIXI.TextStyle>;
}

/** Fading text which floats on a container and disappears gradually */
export class FadingText extends PIXI.Text
{
    ticker:PIXI.Ticker;
    constructor(ticker:PIXI.Ticker, props:FadingTextProps)
    {
        super(props.text, props.style != null ? props.style : {fill:'white', fontSize:16});
        this.x = props.x;
        this.y = props.y;
        this.scale.set(1 / (this.style.fontSize as number));
        this.anchor.set(0.5, 1.0);
        this.ticker = ticker;
        ticker.add(this.tick);
    }

    tick = ()=>
    {
        const speed = 0.01;
        this.alpha -= this.ticker.deltaTime * speed;
        if (this.alpha <= 0 )
        {
            if (this.parent != null)
                this.parent.removeChild(this);
            this.ticker.remove(this.tick);
        }
    }
}