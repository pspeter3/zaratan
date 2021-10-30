import { hashList, List } from "./hash";

export type HashNoise = (values: List<number>) => number;

/**
 * Create a hash noise function.
 * @param seed The noise seed
 * @returns The noise function
 */
export const createHashNoise =
    (seed: number): HashNoise =>
    (values) =>
        hashList(values, seed);
