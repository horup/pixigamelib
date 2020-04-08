/** Class to help keep track of 
 *  ticks such that tickrate can be calculated */
export class TickRateCalculator
{
    private maxTicks = 60;
    private ticks:number[] = [];
    /**
     * max ticks to keep track of.
     */
    constructor(maxTicks = 60)
    {
        this.maxTicks = maxTicks;
    }

    private _avg:number = 1;
    /** Gets the average tickrate expressed in milliseconds */
    get avgMS()
    {
        return this._avg;
    }

    tick()
    {
        this.ticks.push(performance.now());
        if (this.ticks.length > this.maxTicks)
        {
            this.ticks.splice(0, 1);
        }

        if (this.ticks.length > 1)
        {
            const t = this.ticks;
            const d = [] as number[];
            for (let i = 0; i < this.ticks.length - 1; i++)
                d[i] = t[i+1] - t[i];
            this._avg = d.reduce((sum, time)=>sum + time);
            this._avg /= d.length;
        }
    }
}