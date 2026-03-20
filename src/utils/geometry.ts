export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface Bounds2D {
  readonly min: Point2D;
  readonly max: Point2D;
}
