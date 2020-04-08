/** Interpolate from v0 to v1, with the given factor */
export function interpolateLinear(v0, v1, f)
{
    const v = v0 + (v1 - v0) * f;
    return v;
}