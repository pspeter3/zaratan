import type { Brand } from "./brand";
import { Point2D } from "./geometry";

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

/**
 * Entry yielded by {@link PointBuffer.entries}, pairing a point id with its
 * materialized {@link Point2D} value.
 */
export type PointBufferEntry<T extends PointId = PointId> = readonly [id: T, point: Point2D];

/**
 * Read-only view over an interleaved point buffer.
 *
 * The wrapper keeps the underlying packed storage available through
 * {@link PointBuffer.raw} while exposing iterable helpers that materialize
 * {@link Point2D} values on demand.
 *
 * @typeParam T - The branded point-id type produced by {@link keys} and
 * returned by {@link entries}.
 */
export class PointBuffer<T extends PointId = PointId> implements Iterable<Point2D> {
  /** The underlying packed coordinate storage. */
  readonly raw: PointBufferLike;

  /**
   * Creates a point-buffer view without copying the underlying storage.
   *
   * @param buffer - Interleaved coordinates in `[x0, y0, x1, y1, ...]` order.
   */
  constructor(buffer: PointBufferLike) {
    this.raw = buffer;
  }

  /**
   * Returns the number of logical points in the wrapped buffer.
   */
  get size(): number {
    return pointCount(this.raw);
  }

  /**
   * Iterates branded point ids in storage order.
   */
  keys(): Generator<T> {
    return pointIds(this.raw) as Generator<T>;
  }

  /**
   * Iterates materialized points in storage order.
   */
  *values(): Generator<Point2D> {
    for (const id of this.keys()) {
      yield this.point(id);
    }
  }

  /**
   * Iterates `[id, point]` pairs in storage order.
   */
  *entries(): Generator<PointBufferEntry<T>> {
    for (const id of this.keys()) {
      yield [id, this.point(id)];
    }
  }

  /**
   * Iterates materialized points in storage order.
   */
  [Symbol.iterator](): Iterator<Point2D> {
    return this.values();
  }

  /**
   * Returns the materialized point for a logical point id.
   *
   * @param id - The point to read from the packed buffer.
   * @returns A `Point2D` with the stored coordinates.
   */
  point(id: T): Point2D {
    return new Point2D(pointX(this.raw, id), pointY(this.raw, id));
  }
}
