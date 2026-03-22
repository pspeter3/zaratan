import FastPoissonDiskSampling, {
  type FastPoissonDiskSamplingPoint,
} from "fast-2d-poisson-disk-sampling";

import type { Bounds2DRecord } from "./geometry";
import type { Random } from "./random";

const EQUILATERAL = Math.sqrt(3) / 2;

/**
 * Configuration for generating a Poisson disk distribution inside rectangular bounds.
 */
export interface PoissonParams {
  /** Bounding box whose perimeter anchors the generated sample set. */
  readonly bounds: Bounds2DRecord;
  /** Minimum spacing passed to the Poisson disk sampler. */
  readonly radius: number;
  /** Maximum number of candidate attempts per active sample. */
  readonly tries?: number;
  /** Optional random source forwarded to the sampler implementation. */
  readonly rand?: Random;
}

/**
 * Generates interleaved coordinates for a bounded Poisson disk layout.
 *
 * The output starts with boundary points on the rectangle perimeter, followed by
 * interior Poisson samples and an offset outer ring used to stabilize downstream
 * triangulation.
 *
 * @param params - Bounds, spacing, and optional randomness settings.
 * @returns Packed coordinates in `[x0, y0, x1, y1, ...]` order.
 */
export function poisson({
  bounds: { min, max },
  radius,
  tries,
  rand,
}: PoissonParams): Float64Array {
  const width = max.x - min.x;
  const height = max.y - min.y;
  const pds = new FastPoissonDiskSampling(
    {
      shape: [width, height],
      radius,
      tries,
    },
    rand,
  );
  const boundary: FastPoissonDiskSamplingPoint[] = [];
  const outer: FastPoissonDiskSamplingPoint[] = [];
  const hSegments = segments(width, radius);
  const vSegments = segments(height, radius);
  const hStep = step(width, hSegments);
  const vStep = step(height, vSegments);
  const hOffset = offset(hStep);
  const vOffset = offset(vStep);

  for (let i = 0; i <= hSegments; i++) {
    const x = hStep * i;
    for (const y of [0, height]) {
      boundary.push([x, y]);
    }

    if (i < hSegments) {
      const mX = x + hStep / 2;
      for (const mY of [-hOffset, height + hOffset]) {
        outer.push([mX, mY]);
      }
    }
  }

  // Horizontal edges own the four corners; vertical edges add only interior points.
  for (let i = 0; i < vSegments; i++) {
    const y = vStep * i;

    if (i > 0) {
      for (const x of [0, width]) {
        boundary.push([x, y]);
      }
    }

    const mY = y + vStep / 2;
    for (const mX of [-vOffset, width + vOffset]) {
      outer.push([mX, mY]);
    }
  }

  for (const point of boundary) {
    pds.addPoint(seedPoint(point, width, height));
  }

  pds.fill();
  const interior = pds.getAllPoints().slice(boundary.length);
  return Float64Array.from(
    boundary
      .concat(interior, outer)
      .values()
      .flatMap(([x, y]) => [x + min.x, y + min.y]),
  );
}

/**
 * Calculates how many evenly spaced segments are needed to cover a side length.
 *
 * @param side - The side length to subdivide.
 * @param radius - The target maximum spacing between neighboring points.
 * @returns The number of segments, clamped to at least `1`.
 */
function segments(side: number, radius: number): number {
  return Math.max(1, Math.floor(side / radius));
}

/**
 * Converts a segment count into the spacing between neighboring sample positions.
 *
 * @param side - The side length being subdivided.
 * @param segments - The number of equal subdivisions.
 * @returns The distance between adjacent subdivision points.
 */
function step(side: number, segments: number): number {
  return side / segments;
}

/**
 * Converts a boundary step length into the outward offset for the outer helper ring.
 *
 * @param step - The spacing between adjacent boundary points.
 * @returns The perpendicular offset based on equilateral triangle height.
 */
function offset(step: number): number {
  return step * EQUILATERAL;
}

/**
 * Nudges boundary points that lie on the maximum edges back inside the sampler domain.
 *
 * @param point - The boundary point to normalize for seeding.
 * @param width - The sampler domain width.
 * @param height - The sampler domain height.
 * @returns A point guaranteed to lie strictly inside the sampler domain.
 */
function seedPoint(
  [x, y]: FastPoissonDiskSamplingPoint,
  width: number,
  height: number,
): FastPoissonDiskSamplingPoint {
  return [seedCoordinate(x, width), seedCoordinate(y, height)];
}

/**
 * Replaces an inclusive maximum-edge coordinate with the largest in-bounds value.
 *
 * @param value - The coordinate to normalize.
 * @param max - The exclusive upper bound for the sampler axis.
 * @returns `value` when already in bounds, otherwise `max * (1 - Number.EPSILON)`.
 */
function seedCoordinate(value: number, max: number): number {
  if (value < max) {
    return value;
  }
  return max * (1 - Number.EPSILON);
}
