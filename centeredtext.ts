import * as PIXI from 'pixi.js';

/**Text which will center itself */
export class CenteredText extends PIXI.Text
{
    view:HTMLCanvasElement;
    constructor(view:HTMLCanvasElement, text:string, style:Partial<PIXI.TextStyle>)
    {
        super(text, style);
        this.anchor.set(0.5, 0.5);
        this.view = view;
        PIXI.Ticker.shared.add(this.tick);
        this.on('removed', ()=>
        {
            console.log("removed");
            PIXI.Ticker.shared.remove(this.tick);
        })
    }

    tick = ()=>
    {
        this.x = this.view.width /2;
        this.y = this.view.height /2;
    }
}