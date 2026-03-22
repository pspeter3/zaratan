export interface Point2DRecord {
  readonly x: number;
  readonly y: number;
}

export type Point2DTuple = readonly [x: number, y: number];

export class Point2D implements Point2DRecord {
  static fromRecord({ x, y }: Point2DRecord): Point2D {
    return new Point2D(x, y);
  }

  static fromTuple([x, y]: Point2DTuple): Point2D {
    return new Point2D(x, y);
  }

  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export interface Bounds2DRecord {
  readonly min: Point2DRecord;
  readonly max: Point2DRecord;
}

export type Bounds2DTuple = readonly [min: Point2DTuple, max: Point2DTuple];

export class Bounds2D {
  static fromRecord({ min, max }: Bounds2DRecord): Bounds2D {
    return new Bounds2D(Point2D.fromRecord(min), Point2D.fromRecord(max));
  }

  static fromTuple([min, max]: Bounds2DTuple): Bounds2D {
    return new Bounds2D(Point2D.fromTuple(min), Point2D.fromTuple(max));
  }

  readonly min: Point2D;
  readonly max: Point2D;

  constructor(min: Point2D, max: Point2D) {
    this.min = min;
    this.max = max;
  }
}
