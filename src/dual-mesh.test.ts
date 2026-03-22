import { expect, test } from "vite-plus/test";

import { DualMesh, type EdgeId, type NodeId, type TileId } from "./dual-mesh";
import { pointX, pointY } from "./utils/point-buffer";

function asTileId(value: number): TileId {
  return value as TileId;
}

function asEdgeId(value: number): EdgeId {
  return value as EdgeId;
}

function asNodeId(value: number): NodeId {
  return value as NodeId;
}

function fixturePoints(): Float64Array {
  return new Float64Array([0, 0, 2, 0, 0, 2, 3, 1, 1, 1]);
}

test("constructor wraps the input buffer and computes centroid nodes", () => {
  const tiles = fixturePoints();
  const mesh = new DualMesh(tiles);

  expect(mesh.tiles.raw).toBe(tiles);
  expect(mesh.tiles.size).toBe(5);
  expect(mesh.nodes.size).toBe(4);
  expect(Array.from(mesh.nodes.raw)).toEqual([1, 1 / 3, 1 / 3, 1, 2, 2 / 3, 4 / 3, 4 / 3]);
});

test("point-buffer helpers work with mesh tiles and nodes", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(pointX(mesh.tiles.raw, asTileId(4))).toBe(1);
  expect(pointY(mesh.tiles.raw, asTileId(4))).toBe(1);

  expect(pointX(mesh.nodes.raw, asNodeId(2))).toBe(2);
  expect(pointY(mesh.nodes.raw, asNodeId(2))).toBeCloseTo(2 / 3);
});

test("edge topology helpers match the fixed triangulation", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(DualMesh.nextEdge(asEdgeId(0))).toBe(1);
  expect(DualMesh.prevEdge(asEdgeId(0))).toBe(2);
  expect(DualMesh.nextEdge(asEdgeId(5))).toBe(3);
  expect(DualMesh.prevEdge(asEdgeId(5))).toBe(4);

  expect(DualMesh.edgeNode(asEdgeId(6))).toBe(2);
  expect(mesh.edgeStartTile(asEdgeId(6))).toBe(4);
  expect(mesh.edgeEndTile(asEdgeId(6))).toBe(3);

  expect(mesh.edgeOpposite(asEdgeId(0))).toBe(8);
  expect(mesh.edgeOpposite(asEdgeId(6))).toBe(10);
  expect(mesh.edgeOpposite(asEdgeId(1))).toBeNull();
});

test("node ids index the dual node buffer directly", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(pointX(mesh.nodes.raw, asNodeId(3))).toBeCloseTo(4 / 3);
  expect(pointY(mesh.nodes.raw, asNodeId(3))).toBeCloseTo(4 / 3);
});

test("iterators expose all branded edge, node, and tile ids", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(Array.from(mesh.edgeIds())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  expect(Array.from(mesh.nodes.keys())).toEqual([0, 1, 2, 3]);
  expect(Array.from(mesh.tiles.keys())).toEqual([0, 1, 2, 3, 4]);
});

test("node traversal helpers preserve raw Delaunator-derived order", () => {
  const mesh = new DualMesh(fixturePoints());

  expect(Array.from(DualMesh.nodeEdges(asNodeId(1)))).toEqual([3, 4, 5]);
  expect(Array.from(mesh.nodeTiles(asNodeId(1)))).toEqual([0, 2, 4]);
  expect(Array.from(mesh.nodeNeighbors(asNodeId(1)))).toEqual([3, 0]);
});
