const UINT32_SIZE = 32;
const UINT32_MAX = Math.pow(2, UINT32_SIZE);

/**
 * Converts a number to a uint32.
 * @param value The number to convert
 * @returns The uint32 value
 */
export const uint32 = (value: number): number => value >>> 0;

/**
 * Converts a uint32 to a number between [0,1).
 * @param value The uint32 value to convert
 * @returns The float53 value
 */
export const float53 = (value: number): number => value / UINT32_MAX;

/**
 * Rotates a value left by the number of bits.
 * @param value The value to rotate
 * @param bits The number of bits to rotate
 * @returns The rotated value
 */
export const rotateBits = (value: number, bits: number): number =>
    (value << bits) | (value >>> (UINT32_SIZE - bits));
