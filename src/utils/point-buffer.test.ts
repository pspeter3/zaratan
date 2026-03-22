import { expect, test } from "vite-plus/test";

import type { Brand } from "./brand";
import { Point2D } from "./geometry";
import type { PointId } from "./point-buffer";
import { PointBuffer, pointCount, pointIds, pointX, pointY } from "./point-buffer";

function asPointId(value: number): PointId {
  return value as PointId;
}

test("pointCount returns the number of packed points", () => {
  const buffer = [10, 20, 30, 40, -5, -6];

  expect(pointCount(buffer)).toBe(3);
});

test("pointIds yields zero-based ids in storage order", () => {
  const buffer = [10, 20, 30, 40, -5, -6];

  expect(Array.from(pointIds(buffer))).toEqual([0, 1, 2]);
});

test("pointIds is empty for an empty buffer", () => {
  expect(Array.from(pointIds([]))).toEqual([]);
});

test("pointX and pointY read coordinates at the requested id", () => {
  const buffer = [10, 20, 30, 40, -5, -6];

  expect(pointX(buffer, asPointId(0))).toBe(10);
  expect(pointY(buffer, asPointId(0))).toBe(20);
  expect(pointX(buffer, asPointId(2))).toBe(-5);
  expect(pointY(buffer, asPointId(2))).toBe(-6);
});

test("helpers work with typed arrays via PointBufferLike", () => {
  const buffer = new Float32Array([1.5, 2.5, 3.5, 4.5]);
  const ids = Array.from(pointIds(buffer));
  const secondId = ids[1];

  expect(pointCount(buffer)).toBe(2);
  expect(ids).toEqual([0, 1]);
  expect(secondId).toBe(1);

  if (secondId === undefined) {
    throw new Error("Expected a second point id.");
  }

  expect(pointX(buffer, secondId)).toBeCloseTo(3.5);
  expect(pointY(buffer, secondId)).toBeCloseTo(4.5);
});

type VertexId = Brand<PointId, "VertexId">;

function asVertexId(value: number): VertexId {
  return value as VertexId;
}

test("PointBuffer exposes the wrapped buffer and logical point count", () => {
  const raw = new Float64Array([10, 20, 30, 40]);
  const buffer = new PointBuffer(raw);

  expect(buffer.raw).toBe(raw);
  expect(buffer.size).toBe(2);
});

test("PointBuffer.point materializes a Point2D for the requested id", () => {
  const buffer = new PointBuffer(new Float64Array([10, 20, 30, 40, -5, -6]));
  const point = buffer.point(asPointId(2));

  expect(point).toBeInstanceOf(Point2D);
  expect(point).toEqual(new Point2D(-5, -6));
});

test("PointBuffer iterates typed ids, points, and entries in storage order", () => {
  const buffer = new PointBuffer<VertexId>(new Float64Array([1, 2, 3, 4]));

  expect(Array.from(buffer.keys())).toEqual([0, 1]);
  expect(Array.from(buffer.values())).toEqual([new Point2D(1, 2), new Point2D(3, 4)]);
  expect(Array.from(buffer.entries())).toEqual([
    [0, new Point2D(1, 2)],
    [1, new Point2D(3, 4)],
  ]);
  expect(Array.from(buffer)).toEqual([new Point2D(1, 2), new Point2D(3, 4)]);
  expect(buffer.point(asVertexId(1))).toEqual(new Point2D(3, 4));
});
