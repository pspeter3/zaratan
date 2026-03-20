import FastPoissonDiskSampling from "fast-2d-poisson-disk-sampling";

import type { Bounds2D } from "./utils/geometry";
import type { Random } from "./utils/random";

export interface PoissonParams {
  readonly bounds: Bounds2D;
  readonly radius: number;
  readonly tries?: number;
  readonly rand?: Random;
}

export function poisson({
  bounds: { min, max },
  radius,
  tries,
  rand,
}: PoissonParams): Float64Array {
  const pds = new FastPoissonDiskSampling(
    {
      shape: [max.x - min.x, max.y - min.y],
      radius,
      tries,
    },
    rand,
  );
  pds.fill();
  return Float64Array.from(
    pds
      .getAllPoints()
      .values()
      .flatMap(([x, y]) => [x + min.x, y + min.y]),
  );
}
