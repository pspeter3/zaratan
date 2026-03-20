import { uniformFloat64 } from "pure-rand/distribution/uniformFloat64";
import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";

export type Random = Math["random"];

export function createRandom(seed: number): Random {
  const generator = xoroshiro128plus(seed);

  return () => uniformFloat64(generator);
}
