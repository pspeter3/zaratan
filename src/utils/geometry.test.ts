import { describe, expect, test } from "vite-plus/test";

import { Bounds2D, Point2D } from "./geometry";

describe("Point2D", () => {
  test("fromTuple", () => {
    const point = Point2D.fromTuple([1, 2]);
    expect(point).toBeInstanceOf(Point2D);
    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);
  });

  test("fromRecord", () => {
    const point = Point2D.fromRecord({ x: 1, y: 2 });
    expect(point).toBeInstanceOf(Point2D);
    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);
  });
});

describe("Bounds2D", () => {
  test("fromTuple", () => {
    const bounds = Bounds2D.fromTuple([
      [1, 2],
      [3, 4],
    ]);

    expect(bounds.min).toBeInstanceOf(Point2D);
    expect(bounds.max).toBeInstanceOf(Point2D);
    expect(bounds.min.x).toEqual(1);
    expect(bounds.min.y).toEqual(2);
    expect(bounds.max.x).toEqual(3);
    expect(bounds.max.y).toEqual(4);
  });

  test("fromRecord", () => {
    const bounds = Bounds2D.fromRecord({
      min: { x: 1, y: 2 },
      max: { x: 3, y: 4 },
    });

    expect(bounds.min).toBeInstanceOf(Point2D);
    expect(bounds.max).toBeInstanceOf(Point2D);
    expect(bounds.min.x).toEqual(1);
    expect(bounds.min.y).toEqual(2);
    expect(bounds.max.x).toEqual(3);
    expect(bounds.max.y).toEqual(4);
  });
});
