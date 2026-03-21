import FastPoissonDiskSampling, {
  type FastPoissonDiskSamplingPoint,
} from "fast-2d-poisson-disk-sampling";

import type { Bounds2D } from "./utils/geometry";
import type { Random } from "./utils/random";

const EQUILATERAL = Math.sqrt(3) / 2;

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
  const outer: FastPoissonDiskSamplingPoint[] = [];
  const hSegments = segments(width, radius);
  const vSegments = segments(height, radius);
  const hStep = step(width, hSegments);
  const vStep = step(height, vSegments);
  const horizontalOffset = offset(hStep);
  const verticalOffset = offset(vStep);

  for (let i = 0; i <= hSegments; i++) {
    const x = hStep * i;
    pds.addPoint([x, 0]);
    pds.addPoint([x, height]);

    if (i < hSegments) {
      const midX = x + hStep / 2;
      outer.push([midX, -horizontalOffset], [midX, height + horizontalOffset]);
    }
  }

  // Horizontal edges own the four corners; vertical edges add only interior points.
  for (let i = 0; i < vSegments; i++) {
    const y = vStep * i;

    if (i > 0) {
      pds.addPoint([0, y]);
      pds.addPoint([width, y]);
    }

    const midY = y + vStep / 2;
    outer.push([-verticalOffset, midY], [width + verticalOffset, midY]);
  }

  pds.fill();
  return Float64Array.from(
    pds
      .getAllPoints()
      .concat(outer)
      .values()
      .flatMap(([x, y]) => [x + min.x, y + min.y]),
  );
}

function segments(side: number, radius: number): number {
  return Math.max(1, Math.round(side / radius));
}

function step(side: number, segments: number): number {
  return side / segments;
}

function offset(step: number): number {
  return step * EQUILATERAL;
}
