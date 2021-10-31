import { hashList, List } from "./hash";
import { float53 } from "./uint32";

export type HashNoise = (values: List<number>) => number;

/**
 * Create a hash noise function.
 * @param seed The noise seed
 * @returns The noise function
 */
export const createHashNoise =
    (seed: number): HashNoise =>
    (values) =>
        float53(hashList(values, seed));
