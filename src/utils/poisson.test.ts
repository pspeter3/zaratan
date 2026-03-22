import { expect, test } from "vite-plus/test";

import { Bounds2D, Point2D } from "./geometry";
import { pointIds, pointX, pointY } from "./point-buffer";
import { poisson } from "./poisson";
import { createRandom } from "./random";

const EPSILON = 1e-9;

function toPoints(buffer: Float64Array): Point2D[] {
  return Array.from(pointIds(buffer), (id) => new Point2D(pointX(buffer, id), pointY(buffer, id)));
}

function buildInnerBoundary(bounds: Bounds2D, radius: number): Point2D[] {
  const corners: Point2D[] = [
    bounds.min,
    new Point2D(bounds.max.x, bounds.min.y),
    bounds.max,
    new Point2D(bounds.min.x, bounds.max.y),
  ];
  const boundary: Point2D[] = [];

  for (let i = 0; i < corners.length; i++) {
    const source = corners[i];
    const target = corners[(i + 1) % corners.length];
    const edge = source.segmentTo(target);
    const segments = Math.max(1, Math.floor(edge.length / radius));
    for (let step = 0; step < segments; step++) {
      boundary.push(edge.mix(step / segments));
    }
  }

  return boundary;
}

function buildOuterBoundary(innerBoundary: readonly Point2D[]): Point2D[] {
  const boundary: Point2D[] = [];

  for (let i = 0; i < innerBoundary.length; i++) {
    const source = innerBoundary[i];
    const target = innerBoundary[(i + 1) % innerBoundary.length];
    const edge = source.segmentTo(target);
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const height = (edge.length * Math.sqrt(3)) / 2;
    const midpoint = edge.mix(0.5);
    boundary.push(
      new Point2D(
        midpoint.x + (dy / edge.length) * height,
        midpoint.y - (dx / edge.length) * height,
      ),
    );
  }

  return boundary;
}

function closeToPoint(point: Point2D): ReturnType<typeof expect.objectContaining> {
  return expect.objectContaining({
    x: expect.closeTo(point.x, 9),
    y: expect.closeTo(point.y, 9),
  });
}

function expectPoissonBoundary({
  bounds,
  radius,
  seed,
}: {
  readonly bounds: Bounds2D;
  readonly radius: number;
  readonly seed: number;
}): void {
  const buffer = poisson({ bounds, radius, rand: createRandom(seed) });
  const points = toPoints(buffer);
  const innerBoundary = buildInnerBoundary(bounds, radius);
  const outerBoundary = buildOuterBoundary(innerBoundary);
  const outsideBounds = points.filter((point) => !bounds.contains(point));

  expect(innerBoundary).toEqual(
    expect.arrayContaining([
      { x: bounds.min.x, y: bounds.min.y },
      { x: bounds.max.x, y: bounds.min.y },
      { x: bounds.max.x, y: bounds.max.y },
      { x: bounds.min.x, y: bounds.max.y },
    ]),
  );
  expect(points).toEqual(expect.arrayContaining(innerBoundary));
  expect(points).toEqual(expect.arrayContaining(outerBoundary.map(closeToPoint)));
  expect(outsideBounds).toHaveLength(outerBoundary.length);
  expect(outsideBounds).toEqual(expect.arrayContaining(outerBoundary.map(closeToPoint)));

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      expect(points[i].distance(points[j])).toBeGreaterThanOrEqual(radius - EPSILON);
    }
  }
}

test("poisson", () => {
  const bounds = new Bounds2D(new Point2D(0, 0), new Point2D(1, 1));
  const radius = 0.125;

  expect(buildInnerBoundary(bounds, radius)).toHaveLength(32);
  expectPoissonBoundary({ bounds, radius, seed: 42 });
});

test("poisson keeps sampler points within bounds", () => {
  expectPoissonBoundary({
    bounds: new Bounds2D(new Point2D(0, 0), new Point2D(1.49, 1.49)),
    radius: 1,
    seed: 3,
  });
});
