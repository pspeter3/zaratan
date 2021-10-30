/**
 * Snaps a value to farther from zero.
 * The opposite of Math.trunc.
 * @param value The value to snap
 * @returns The snapped value
 */
export const snap = (value: number): number =>
    Math.sign(value) * Math.ceil(Math.abs(value));

/**
 * Interpolates between a & b with weight t.
 * @param a The starting value
 * @param b The ending value
 * @param t The weight
 * @returns The interpolated value.
 */
export const lerp = (a: number, b: number, t: number): number =>
    a * (1 - t) + b * t;
