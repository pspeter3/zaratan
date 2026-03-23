import { clamp, mix } from "./math";

/**
 * A read-only object representation of a 2D point.
 */
export interface Point2DRecord {
  /** The horizontal coordinate. */
  readonly x: number;
  /** The vertical coordinate. */
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

  /** The horizontal coordinate. */
  readonly x: number;
  /** The vertical coordinate. */
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

  /**
   * Creates a segment from this point to another point.
   *
   * @param other - The segment endpoint opposite this point.
   * @returns A new `Segment2D` from this point to `other`.
   */
  segmentTo(other: Point2D): Segment2D {
    return new Segment2D(this, other);
  }
}

/**
 * A read-only object representation of 2D bounds.
 */
export interface Bounds2DRecord {
  /** The minimum or lower-left corner. */
  readonly min: Point2DRecord;
  /** The maximum or upper-right corner. */
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

  /**
   * Creates bounds from the origin to the provided width and height.
   *
   * @param width - The maximum x-coordinate.
   * @param height - The maximum y-coordinate.
   * @returns A new `Bounds2D` instance spanning from `(0, 0)`.
   */
  static fromDimensions(width: number, height: number): Bounds2D {
    return new Bounds2D(new Point2D(0, 0), new Point2D(width, height));
  }

  /** The minimum or lower-left corner. */
  readonly min: Point2D;
  /** The maximum or upper-right corner. */
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

  /**
   * Returns whether a point lies within these bounds, including the boundary.
   *
   * @param point - The point to test.
   * @returns `true` when `point` is inside or on the bounds.
   */
  contains({ x, y }: Point2DRecord): boolean {
    return x >= this.min.x && x <= this.max.x && y >= this.min.y && y <= this.max.y;
  }
}

/**
 * A read-only object representation of a 2D segment.
 */
export interface Segment2DRecord {
  /** The segment start point. */
  readonly source: Point2DRecord;
  /** The segment end point. */
  readonly target: Point2DRecord;
}

/**
 * A tuple representation of a 2D segment in `[[sourceX, sourceY], [targetX, targetY]]` order.
 */
export type Segement2DTuple = readonly [source: Point2DTuple, target: Point2DTuple];

/**
 * An immutable line segment between two 2D points.
 */
export class Segment2D {
  /**
   * Creates a segment from an object representation.
   *
   * @param segment - The source segment record.
   * @returns A new `Segment2D` instance.
   */
  static fromRecord({ source, target }: Segment2DRecord): Segment2D {
    return new Segment2D(Point2D.fromRecord(source), Point2D.fromRecord(target));
  }

  /**
   * Creates a segment from a tuple representation.
   *
   * @param segment - The source segment tuple.
   * @returns A new `Segment2D` instance.
   */
  static fromTuple([source, target]: Segement2DTuple): Segment2D {
    return new Segment2D(Point2D.fromTuple(source), Point2D.fromTuple(target));
  }

  /** The segment start point. */
  readonly source: Point2D;
  /** The segment end point. */
  readonly target: Point2D;

  /**
   * Creates a 2D segment from source and target points.
   *
   * @param source - The segment start point.
   * @param target - The segment end point.
   */
  constructor(source: Point2D, target: Point2D) {
    this.source = source;
    this.target = target;
  }

  /**
   * Returns the Euclidean length of the segment.
   *
   * @returns The distance between the source and target points.
   */
  get length(): number {
    return this.source.distance(this.target);
  }

  /**
   * Returns the squared Euclidean length of the segment.
   *
   * @returns The squared distance between the source and target points.
   */
  get lengthSquared(): number {
    return this.source.quadrance(this.target);
  }

  /**
   * Linearly interpolates along the segment.
   *
   * @param t - The interpolation factor, where `0` returns `source` and `1` returns `target`.
   * @returns A new point on the segment's supporting line.
   */
  mix(t: number): Point2D {
    return this.source.mix(this.target, t);
  }

  /**
   * Returns the shortest Euclidean distance from the segment to a point.
   *
   * @param point - The point to measure against.
   * @returns The distance from `point` to the nearest point on the segment.
   */
  distance(point: Point2DRecord): number {
    return Math.sqrt(this.quadrance(point));
  }

  /**
   * Returns the squared shortest Euclidean distance from the segment to a point.
   *
   * @param point - The point to measure against.
   * @returns The squared distance from `point` to the nearest point on the segment.
   */
  quadrance({ x, y }: Point2DRecord): number {
    const dx = this.target.x - this.source.x;
    const dy = this.target.y - this.source.y;
    const lengthSquared = this.lengthSquared;

    if (lengthSquared === 0) {
      return this.source.quadrance({ x, y });
    }

    const projection = clamp(
      ((x - this.source.x) * dx + (y - this.source.y) * dy) / lengthSquared,
      0,
      1,
    );

    return quadrance(
      x,
      y,
      mix(this.source.x, this.target.x, projection),
      mix(this.source.y, this.target.y, projection),
    );
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

/**
 * Returns the arithmetic mean of a non-empty iterable of points.
 *
 * @param points - The points to average.
 * @returns A point whose coordinates are the mean of all input points.
 * @throws {Error} When `points` is empty.
 */
export function centroid(points: Iterable<Point2D>): Point2D {
  let count = 0;
  let x = 0;
  let y = 0;
  for (const point of points) {
    count++;
    x += point.x;
    y += point.y;
  }
  if (count === 0) {
    throw new Error("Empty iterable");
  }
  return new Point2D(x / count, y / count);
}
