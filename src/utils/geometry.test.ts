import { describe, expect, test } from "vite-plus/test";

import { Bounds2D, Point2D, Segment2D, distance, mixPoints, quadrance } from "./geometry";

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

  test("segmentTo returns a segment from this point to another point", () => {
    const source = new Point2D(1, 2);
    const target = new Point2D(3, 4);
    const segment = source.segmentTo(target);

    expect(segment).toBeInstanceOf(Segment2D);
    expect(segment.source).toBe(source);
    expect(segment.target).toBe(target);
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

  test("contains returns true for interior points", () => {
    const bounds = new Bounds2D(new Point2D(1, 2), new Point2D(3, 4));

    expect(bounds.contains({ x: 2, y: 3 })).toBe(true);
  });

  test("contains includes points on the boundary", () => {
    const bounds = new Bounds2D(new Point2D(1, 2), new Point2D(3, 4));

    expect(bounds.contains({ x: 1, y: 2 })).toBe(true);
    expect(bounds.contains({ x: 3, y: 4 })).toBe(true);
    expect(bounds.contains({ x: 1, y: 3 })).toBe(true);
    expect(bounds.contains({ x: 2, y: 4 })).toBe(true);
  });

  test("contains returns false for points outside the bounds", () => {
    const bounds = new Bounds2D(new Point2D(1, 2), new Point2D(3, 4));

    expect(bounds.contains({ x: 0, y: 3 })).toBe(false);
    expect(bounds.contains({ x: 2, y: 5 })).toBe(false);
  });
});

describe("Segment2D", () => {
  test("fromTuple", () => {
    const segment = Segment2D.fromTuple([
      [1, 2],
      [3, 4],
    ]);

    expect(segment.source).toBeInstanceOf(Point2D);
    expect(segment.target).toBeInstanceOf(Point2D);
    expect(segment.source.x).toEqual(1);
    expect(segment.source.y).toEqual(2);
    expect(segment.target.x).toEqual(3);
    expect(segment.target.y).toEqual(4);
  });

  test("fromRecord", () => {
    const segment = Segment2D.fromRecord({
      source: { x: 1, y: 2 },
      target: { x: 3, y: 4 },
    });

    expect(segment.source).toBeInstanceOf(Point2D);
    expect(segment.target).toBeInstanceOf(Point2D);
    expect(segment.source.x).toEqual(1);
    expect(segment.source.y).toEqual(2);
    expect(segment.target.x).toEqual(3);
    expect(segment.target.y).toEqual(4);
  });

  test("length returns euclidean segment length", () => {
    const segment = new Segment2D(new Point2D(1, 2), new Point2D(4, 6));

    expect(segment.length).toEqual(5);
  });

  test("lengthSquared returns squared euclidean segment length", () => {
    const segment = new Segment2D(new Point2D(1, 2), new Point2D(4, 6));

    expect(segment.lengthSquared).toEqual(25);
  });

  test("mix returns an interpolated point on the segment", () => {
    const segment = new Segment2D(new Point2D(0, 2), new Point2D(8, 10));
    const mixed = segment.mix(0.25);

    expect(mixed).toBeInstanceOf(Point2D);
    expect(mixed.x).toEqual(2);
    expect(mixed.y).toEqual(4);
  });

  test("distance returns the shortest distance to a point", () => {
    const segment = new Segment2D(new Point2D(0, 0), new Point2D(4, 0));

    expect(segment.distance({ x: 2, y: 3 })).toEqual(3);
    expect(segment.distance({ x: 7, y: 4 })).toEqual(5);
  });

  test("quadrance returns the squared shortest distance to a point", () => {
    const segment = new Segment2D(new Point2D(0, 0), new Point2D(4, 0));

    expect(segment.quadrance({ x: 2, y: 0 })).toEqual(0);
    expect(segment.quadrance({ x: 2, y: 3 })).toEqual(9);
    expect(segment.quadrance({ x: 7, y: 4 })).toEqual(25);
  });

  test("distance and quadrance fall back to the endpoint for zero-length segments", () => {
    const segment = new Segment2D(new Point2D(1, 2), new Point2D(1, 2));

    expect(segment.distance({ x: 4, y: 6 })).toEqual(5);
    expect(segment.quadrance({ x: 4, y: 6 })).toEqual(25);
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
