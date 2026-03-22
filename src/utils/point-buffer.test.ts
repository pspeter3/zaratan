import { expect, test } from "vite-plus/test";

import type { PointId } from "./point-buffer";
import { pointCount, pointIds, pointX, pointY } from "./point-buffer";

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

test("helpers work with typed arrays via PointBuffer", () => {
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
