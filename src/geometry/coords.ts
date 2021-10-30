import { Vector } from "./vector";

/**
 * Coordinates interface.
 */
export interface Coords {
    [index: number]: number;
}

const DIMENSIONS = 2;
const xOffset = (index: number): number => DIMENSIONS * index;
const yOffset = (index: number): number => xOffset(index) + 1;

/**
 * Writes a vector to coordinates.
 * @param coords The coordinates to write to
 * @param index The index to write at
 * @param vector The vector to write
 */
export const writeCoords = (
    coords: Coords,
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
export const readCoords = (coords: Coords, index: number): Vector =>
    new Vector(coords[xOffset(index)], coords[yOffset(index)]);
