import type { Brand } from "./brand";

/**
 * Branded index for a logical point stored in a {@link PointBufferLike}.
 */
export type PointId = Brand<number, "PointId">;

/**
 * Interleaved 2D coordinates in the form `[x0, y0, x1, y1, ...]`.
 *
 * Callers are expected to provide an even-length buffer.
 */
export type PointBufferLike = ArrayLike<number>;

/** Number of scalar entries used for a single point (`x` and `y`). */
const STRIDE = 2;

/**
 * Returns the number of logical points in an interleaved coordinate buffer.
 */
export function pointCount(buffer: PointBufferLike): number {
  return buffer.length / STRIDE;
}

/**
 * Iterates point ids in storage order.
 *
 * Ids are zero-based and map directly to `STRIDE`-sized slots in the buffer.
 */
export function* pointIds(buffer: PointBufferLike): Generator<PointId> {
  const count = pointCount(buffer);
  for (let i = 0; i < count; i++) {
    yield i as PointId;
  }
}

/**
 * Returns the `x` coordinate for a point id.
 *
 * @remarks
 * This helper does not perform bounds checks on `id`.
 */
export function pointX(buffer: PointBufferLike, id: PointId): number {
  return buffer[STRIDE * id];
}

/**
 * Returns the `y` coordinate for a point id.
 *
 * @remarks
 * This helper does not perform bounds checks on `id`.
 */
export function pointY(buffer: PointBufferLike, id: PointId): number {
  return buffer[STRIDE * id + 1];
}
