/**
 * Linearly interpolates between two numbers.
 *
 * @param a - The value returned when `t` is `0`.
 * @param b - The value returned when `t` is `1`.
 * @param t - The interpolation factor.
 * @returns The interpolated value between `a` and `b`.
 */
export function mix(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}

/**
 * Restricts a number to the inclusive range defined by `min` and `max`.
 *
 * @param value - The number to constrain.
 * @param min - The lower bound.
 * @param max - The upper bound.
 * @returns `value` clamped to the `[min, max]` range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
