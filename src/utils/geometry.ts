export interface Point2DRecord {
  readonly x: number;
  readonly y: number;
}

export type Point2DTuple = readonly [x: number, y: number];

export interface Bounds2DRecord {
  readonly min: Point2DRecord;
  readonly max: Point2DRecord;
}

export type Bounds2DTuple = readonly [min: Point2DTuple, max: Point2DTuple];
