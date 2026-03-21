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
  const width = max.x - min.x;
  const height = max.y - min.y;
  const cell = radius * Math.SQRT1_2;
  const pds = new FastPoissonDiskSampling(
    {
      shape: [width + cell, height + cell],
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
