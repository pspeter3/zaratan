import { Vector } from "./vector";

const DIMENSIONS = 2;
const xOffset = (index: number): number => DIMENSIONS * index;
const yOffset = (index: number): number => xOffset(index) + 1;

/**
 * Create coordinates with a capacity.
 * @param capacity The capacity
 * @returns The coordinates
 */
export const createCoords = (capacity: number): Int16Array =>
    new Int16Array(DIMENSIONS * capacity);

/**
 * Slice the coordinates based on the count
 * @param coords The coordinates to slice
 * @param count The count
 * @returns The sliced coordinates
 */
export const sliceCoords = (coords: Int16Array, count: number): Int16Array =>
    coords.slice(0, DIMENSIONS * count);

/**
 * Writes a vector to coordinates.
 * @param coords The coordinates to write to
 * @param index The index to write at
 * @param vector The vector to write
 */
export const writeCoords = (
    coords: Int16Array,
    index: number,
    { x, y }: Vector,
): void => {
    coords[xOffset(index)] = x;
    coords[yOffset(index)] = y;
};

/**
 * Reads a vector from coordinates.
 * @param coords The coordinates to read from
 * @param index The index to read at
 * @returns The vector
 */
export const readCoords = (coords: Int16Array, index: number): Vector =>
    new Vector(coords[xOffset(index)], coords[yOffset(index)]);
