import { uniformFloat64 } from "pure-rand/distribution/uniformFloat64";
import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";

/**
 * Zero-argument random number generator returning values in the `[0, 1)` range.
 */
export type Random = Math["random"];

/**
 * Creates a deterministic pseudorandom number generator from a numeric seed.
 *
 * @param seed - Initial seed for the underlying `xoroshiro128plus` generator.
 * @returns A `Math.random`-compatible function backed by deterministic state.
 */
export function createRandom(seed: number): Random {
  const generator = xoroshiro128plus(seed);

  return () => uniformFloat64(generator);
}
