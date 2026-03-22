import { expect, test } from "vite-plus/test";

import { DualMesh, type EdgeId, type TriangleId } from "./dual-mesh";
import { pointCount, pointX, pointY, type PointId } from "./utils/point-buffer";

function asPointId(value: number): PointId {
  return value as PointId;
}

function asEdgeId(value: number): EdgeId {
  return value as EdgeId;
}

function asTriangleId(value: number): TriangleId {
  return value as TriangleId;
}

function fixturePoints(): Float64Array {
  return new Float64Array([0, 0, 2, 0, 0, 2, 3, 1, 1, 1]);
}

test("constructor keeps the input buffer and computes centroid corners", () => {
  const points = fixturePoints();
  const mesh = new DualMesh(points);

  expect(mesh.points).toBe(points);
  expect(Array.from(mesh.corners)).toEqual([1, 1 / 3, 1 / 3, 1, 2, 2 / 3, 4 / 3, 4 / 3]);
});

test("point-buffer helpers work with mesh points and corners", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(pointCount(mesh.points)).toBe(5);
  expect(pointX(mesh.points, asPointId(4))).toBe(1);
  expect(pointY(mesh.points, asPointId(4))).toBe(1);

  expect(pointCount(mesh.corners)).toBe(4);
  expect(pointX(mesh.corners, asTriangleId(2))).toBe(2);
  expect(pointY(mesh.corners, asTriangleId(2))).toBeCloseTo(2 / 3);
});

test("edge topology helpers match the fixed triangulation", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(DualMesh.nextEdge(asEdgeId(0))).toBe(1);
  expect(DualMesh.prevEdge(asEdgeId(0))).toBe(2);
  expect(DualMesh.nextEdge(asEdgeId(5))).toBe(3);
  expect(DualMesh.prevEdge(asEdgeId(5))).toBe(4);

  expect(DualMesh.edgeTriangle(asEdgeId(6))).toBe(2);
  expect(mesh.edgeStartPoint(asEdgeId(6))).toBe(4);
  expect(mesh.edgeEndPoint(asEdgeId(6))).toBe(3);

  expect(mesh.edgeOpposite(asEdgeId(0))).toBe(8);
  expect(mesh.edgeOpposite(asEdgeId(6))).toBe(10);
  expect(mesh.edgeOpposite(asEdgeId(1))).toBeNull();
});

test("triangle ids index the dual corners buffer directly", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(pointX(mesh.corners, asTriangleId(3))).toBeCloseTo(4 / 3);
  expect(pointY(mesh.corners, asTriangleId(3))).toBeCloseTo(4 / 3);
});

test("id iterators expose all branded edge and triangle ids", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(Array.from(mesh.edgeIds())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  expect(Array.from(mesh.triangleIds())).toEqual([0, 1, 2, 3]);
});

test("triangle traversal helpers preserve raw Delaunator-derived order", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(Array.from(DualMesh.triangleEdges(asTriangleId(1)))).toEqual([3, 4, 5]);
  expect(Array.from(mesh.trianglePoints(asTriangleId(1)))).toEqual([0, 2, 4]);
  expect(Array.from(mesh.triangleNeighbors(asTriangleId(1)))).toEqual([3, 0]);
});
