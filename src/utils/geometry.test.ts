import { describe, expect, test } from "vite-plus/test";

import { Bounds2D, Point2D, distance, mixPoints, quadrance } from "./geometry";

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

  test("distance returns euclidean distance to another point", () => {
    const point = new Point2D(1, 2);

    expect(point.distance({ x: 4, y: 6 })).toEqual(5);
  });

  test("quadrance returns squared euclidean distance to another point", () => {
    const point = new Point2D(1, 2);

    expect(point.quadrance({ x: 4, y: 6 })).toEqual(25);
  });

  test("mix returns an interpolated point", () => {
    const point = new Point2D(0, 2);
    const mixed = point.mix({ x: 8, y: 10 }, 0.25);

    expect(mixed).toBeInstanceOf(Point2D);
    expect(mixed.x).toEqual(2);
    expect(mixed.y).toEqual(4);
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

describe("distance", () => {
  test("returns euclidean distance between coordinates", () => {
    expect(distance(1, 2, 4, 6)).toEqual(5);
  });
});

describe("quadrance", () => {
  test("returns squared euclidean distance between coordinates", () => {
    expect(quadrance(1, 2, 4, 6)).toEqual(25);
  });
});

describe("mixPoints", () => {
  test("returns an interpolated point", () => {
    const point = mixPoints(0, 2, 8, 10, 0.25);

    expect(point).toBeInstanceOf(Point2D);
    expect(point.x).toEqual(2);
    expect(point.y).toEqual(4);
  });
});
