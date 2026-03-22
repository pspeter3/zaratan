import { mix } from "./math";

/**
 * A read-only object representation of a 2D point.
 */
export interface Point2DRecord {
  readonly x: number;
  readonly y: number;
}

/**
 * A tuple representation of a 2D point in `[x, y]` order.
 */
export type Point2DTuple = readonly [x: number, y: number];

/**
 * An immutable 2D point value.
 */
export class Point2D implements Point2DRecord {
  /**
   * Creates a point from an object with `x` and `y` properties.
   *
   * @param point - The source point record.
   * @returns A new `Point2D` instance.
   */
  static fromRecord({ x, y }: Point2DRecord): Point2D {
    return new Point2D(x, y);
  }

  /**
   * Creates a point from a tuple in `[x, y]` order.
   *
   * @param point - The source point tuple.
   * @returns A new `Point2D` instance.
   */
  static fromTuple([x, y]: Point2DTuple): Point2D {
    return new Point2D(x, y);
  }

  readonly x: number;
  readonly y: number;

  /**
   * Creates a 2D point.
   *
   * @param x - The horizontal coordinate.
   * @param y - The vertical coordinate.
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns the Euclidean distance from this point to another point.
   *
   * @param point - The point to measure against.
   * @returns The distance between the two points.
   */
  distance({ x, y }: Point2DRecord): number {
    return distance(this.x, this.y, x, y);
  }

  /**
   * Returns the squared Euclidean distance from this point to another point.
   *
   * @param point - The point to measure against.
   * @returns The squared distance between the two points.
   */
  quadrance({ x, y }: Point2DRecord): number {
    return quadrance(this.x, this.y, x, y);
  }

  /**
   * Linearly interpolates from this point to another point.
   *
   * @param point - The point returned when `t` is `1`.
   * @param t - The interpolation factor.
   * @returns A new point between this point and `point`.
   */
  mix({ x, y }: Point2DRecord, t: number): Point2D {
    return mixPoints(this.x, this.y, x, y, t);
  }
}

/**
 * A read-only object representation of 2D bounds.
 */
export interface Bounds2DRecord {
  readonly min: Point2DRecord;
  readonly max: Point2DRecord;
}

/**
 * A tuple representation of 2D bounds in `[[minX, minY], [maxX, maxY]]` order.
 */
export type Bounds2DTuple = readonly [min: Point2DTuple, max: Point2DTuple];

/**
 * Immutable minimum and maximum points describing a 2D bounding box.
 */
export class Bounds2D {
  /**
   * Creates bounds from an object representation.
   *
   * @param bounds - The source bounds record.
   * @returns A new `Bounds2D` instance.
   */
  static fromRecord({ min, max }: Bounds2DRecord): Bounds2D {
    return new Bounds2D(Point2D.fromRecord(min), Point2D.fromRecord(max));
  }

  /**
   * Creates bounds from a tuple representation.
   *
   * @param bounds - The source bounds tuple.
   * @returns A new `Bounds2D` instance.
   */
  static fromTuple([min, max]: Bounds2DTuple): Bounds2D {
    return new Bounds2D(Point2D.fromTuple(min), Point2D.fromTuple(max));
  }

  readonly min: Point2D;
  readonly max: Point2D;

  /**
   * Creates 2D bounds from minimum and maximum points.
   *
   * @param min - The lower-left or minimum point.
   * @param max - The upper-right or maximum point.
   */
  constructor(min: Point2D, max: Point2D) {
    this.min = min;
    this.max = max;
  }
}

/**
 * Returns the Euclidean distance between two 2D coordinates.
 *
 * @param x1 - The first point's x-coordinate.
 * @param y1 - The first point's y-coordinate.
 * @param x2 - The second point's x-coordinate.
 * @param y2 - The second point's y-coordinate.
 * @returns The distance between the two points.
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Returns the squared Euclidean distance between two 2D coordinates.
 *
 * @param x1 - The first point's x-coordinate.
 * @param y1 - The first point's y-coordinate.
 * @param x2 - The second point's x-coordinate.
 * @param y2 - The second point's y-coordinate.
 * @returns The squared distance between the two points.
 */
export function quadrance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}

/**
 * Linearly interpolates between two 2D coordinates.
 *
 * @param x1 - The first point's x-coordinate.
 * @param y1 - The first point's y-coordinate.
 * @param x2 - The second point's x-coordinate.
 * @param y2 - The second point's y-coordinate.
 * @param t - The interpolation factor.
 * @returns A new point between the two coordinates.
 */
export function mixPoints(x1: number, y1: number, x2: number, y2: number, t: number): Point2D {
  return new Point2D(mix(x1, x2, t), mix(y1, y2, t));
}
