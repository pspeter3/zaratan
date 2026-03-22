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
