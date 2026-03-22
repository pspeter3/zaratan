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
