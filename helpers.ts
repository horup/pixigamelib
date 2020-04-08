import * as PIXI from 'pixi.js';

/** Pans the container with the given amount */
export function pan(container:PIXI.Container, vx:number, vy:number)
{
    container.x -= vx;
    container.y -= vy;
}

/** Performs a zoom on the container, with the given speed with the given point in focus */
export function zoom(container:PIXI.Container, speed:number, point:PIXI.Point)
{
    if (Math.abs(speed) > 0)
    {
        const factor = speed > 0 ? speed : 1/Math.abs(speed);
        let s = container.scale.x * factor;

        const l1 = container.toLocal(point);
        const g1 = point;
        container.scale.set(s);
        const g2 = container.toGlobal(l1);
        const vx = (g2.x - g1.x);
        const vy = (g2.y - g1.y);

        container.position.x -= vx;
        container.position.y -= vy;
    }
}
