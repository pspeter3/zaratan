const UINT32_SIZE = 32;
const UINT32_MAX = Math.pow(2, UINT32_SIZE);

/**
 * Converts a number to uint32.
 * @param value
 */
export const uint32 = (value: number): number => value >>> 0;

/**
 * Converts a uint32 to number.
 * @param value
 */
export const float53 = (value: number): number => value / UINT32_MAX;

/**
 * Rotates a value left by the number of bits.
 * @param value
 * @param bits
 */
export const rotateBits = (value: number, bits: number): number =>
    (value << bits) | (value >>> (UINT32_SIZE - bits));
