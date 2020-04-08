/** Class to help keep track of 
 *  ticks such that tickrate can be calculated */
export class TickrateCalculator
{
    private maxTicks = 60;
    private ticks:number[] = [];
    /**
     * max ticks to keep track of.
     */
    constructor(maxTicks = 60)
    {
        this.maxTicks = maxTicks;
        this._lasttick = performance.now();
    }

    private _avg:number = 1;
    
    /** Gets the average tickrate expressed in milliseconds */
    get avgTickrateMS()
    {
        return this._avg;
    }

    get stable()
    {
        return this.tick.length == this.maxTicks;
    }

    private _lasttick;
    get lastTick()
    {
        return this._lasttick;
    }

    /** Calculates the difference between the last tick of both
     *  calculators
     */
    diffLast(other:TickrateCalculator)
    {
        return this.lastTick - other.lastTick;
    }

    /** Calculates the factor of where this calculator is in time,
     *  compared to the tickrate and last tick of the other calculator.
     *  Both calculators should be stable before using this function.
     */
    factor(other:TickrateCalculator)
    {
        const diffLast = this.diffLast(other);
        const otherTickrate = other.avgTickrateMS;
        return diffLast / otherTickrate;
    }


    tick()
    {
        this._lasttick = performance.now();
        this.ticks.push(this._lasttick);
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