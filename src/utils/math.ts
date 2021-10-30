/**
 * Snaps a value to farther from zero.
 * The opposite of Math.trunc.
 * @param value The value to snap
 * @returns The snapped value
 */
export const snap = (value: number): number =>
    Math.sign(value) * Math.ceil(Math.abs(value));
