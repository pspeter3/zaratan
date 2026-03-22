import { describe, expect, test } from "vite-plus/test";

import { Point2D } from "./geometry";

describe("Point2D", () => {
  test("fromTuple", () => {
    const point = Point2D.fromTuple([1, 2]);
    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);
  });

  test("fromRecord", () => {
    const point = Point2D.fromRecord({ x: 1, y: 2 });
    expect(point.x).toEqual(1);
    expect(point.y).toEqual(2);
  });
});
