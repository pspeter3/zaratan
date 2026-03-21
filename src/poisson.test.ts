import { expect, test } from "vite-plus/test";

import { poisson } from "./poisson";
import type { Bounds2D, Point2D } from "./utils/geometry";
import { pointCount, pointX, pointY, type PointId } from "./utils/point-buffer";
import { createRandom } from "./utils/random";

const EPSILON = 1e-9;

function distance(source: Point2D, target: Point2D): number {
  return Math.hypot(target.x - source.x, target.y - source.y);
}

function toPoints(buffer: Float64Array): Point2D[] {
  const count = pointCount(buffer);
  const points: Point2D[] = [];
  for (let i = 0; i < count; i++) {
    const id = i as PointId;
    points.push({ x: pointX(buffer, id), y: pointY(buffer, id) });
  }
  return points;
}

function matchesPoint(actual: Point2D, expected: Point2D, epsilon = EPSILON): boolean {
  return Math.abs(actual.x - expected.x) <= epsilon && Math.abs(actual.y - expected.y) <= epsilon;
}

function findPoint(points: readonly Point2D[], expected: Point2D): Point2D | undefined {
  return points.find((point) => matchesPoint(point, expected));
}

function expectPoint(points: readonly Point2D[], expected: Point2D): Point2D {
  const point = findPoint(points, expected);
  expect(point).toBeDefined();
  return point!;
}

function isWithinBounds(point: Point2D, bounds: Bounds2D, epsilon = EPSILON): boolean {
  return (
    point.x >= bounds.min.x - epsilon &&
    point.x <= bounds.max.x + epsilon &&
    point.y >= bounds.min.y - epsilon &&
    point.y <= bounds.max.y + epsilon
  );
}

function buildInnerBoundary(bounds: Bounds2D, radius: number): Point2D[] {
  const corners: Point2D[] = [
    { x: bounds.min.x, y: bounds.min.y },
    { x: bounds.max.x, y: bounds.min.y },
    { x: bounds.max.x, y: bounds.max.y },
    { x: bounds.min.x, y: bounds.max.y },
  ];
  const boundary: Point2D[] = [];

  for (let i = 0; i < corners.length; i++) {
    const source = corners[i];
    const target = corners[(i + 1) % corners.length];
    const segments = Math.round(distance(source, target) / radius);
    const dx = (target.x - source.x) / segments;
    const dy = (target.y - source.y) / segments;
    for (let step = 0; step < segments; step++) {
      boundary.push({
        x: source.x + dx * step,
        y: source.y + dy * step,
      });
    }
  }

  return boundary;
}

function buildOuterBoundary(innerBoundary: readonly Point2D[]): Point2D[] {
  const boundary: Point2D[] = [];

  for (let i = 0; i < innerBoundary.length; i++) {
    const source = innerBoundary[i];
    const target = innerBoundary[(i + 1) % innerBoundary.length];
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const edgeLength = Math.hypot(dx, dy);
    const height = (edgeLength * Math.sqrt(3)) / 2;
    boundary.push({
      x: (source.x + target.x) / 2 + (dy / edgeLength) * height,
      y: (source.y + target.y) / 2 - (dx / edgeLength) * height,
    });
  }

  return boundary;
}

test("poisson", () => {
  const bounds: Bounds2D = {
    min: { x: 0, y: 0 },
    max: { x: 1, y: 1 },
  };
  const radius = 0.125;
  const buffer = poisson({ bounds, radius, rand: createRandom(42) });
  const points = toPoints(buffer);
  const innerBoundary = buildInnerBoundary(bounds, radius);
  const outerBoundary = buildOuterBoundary(innerBoundary);

  expect(innerBoundary).toHaveLength(32);
  expect(outerBoundary).toHaveLength(32);

  for (const point of [
    { x: bounds.min.x, y: bounds.min.y },
    { x: bounds.max.x, y: bounds.min.y },
    { x: bounds.max.x, y: bounds.max.y },
    { x: bounds.min.x, y: bounds.max.y },
  ]) {
    expect(findPoint(innerBoundary, point)).toBeDefined();
  }

  for (const point of innerBoundary) {
    expectPoint(points, point);
  }

  for (let i = 0; i < outerBoundary.length; i++) {
    const outerPoint = expectPoint(points, outerBoundary[i]);
    const source = innerBoundary[i];
    const target = innerBoundary[(i + 1) % innerBoundary.length];
    const edgeLength = distance(source, target);

    expect(distance(outerPoint, source)).toBeCloseTo(edgeLength, 9);
    expect(distance(outerPoint, target)).toBeCloseTo(edgeLength, 9);
  }

  for (const point of points) {
    if (!isWithinBounds(point, bounds)) {
      expect(findPoint(outerBoundary, point)).toBeDefined();
    }
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      expect(distance(points[i], points[j])).toBeGreaterThanOrEqual(radius - EPSILON);
    }
  }
});
