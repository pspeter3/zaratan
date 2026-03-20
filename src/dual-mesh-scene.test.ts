import { expect, test } from "vite-plus/test";

import { DualMesh } from "./dual-mesh";
import {
  collectDelaunaySegments,
  collectDualSegments,
  createDualMeshScene,
} from "./dual-mesh-scene";
import { pointIds, pointX, pointY } from "./utils/point-buffer";

function fixtureMesh(): DualMesh {
  return new DualMesh(new Float64Array([0, 0, 2, 0, 0, 2, 3, 1, 1, 1]));
}

function normalizeSegment({
  start,
  end,
}: {
  readonly start: { readonly x: number; readonly y: number };
  readonly end: { readonly x: number; readonly y: number };
}): string {
  const first = `${start.x.toFixed(6)},${start.y.toFixed(6)}`;
  const second = `${end.x.toFixed(6)},${end.y.toFixed(6)}`;
  return [first, second].sort().join(" -> ");
}

test("createDualMeshScene returns the same points for the same canvas size", () => {
  const first = createDualMeshScene(1024, 1024);
  const second = createDualMeshScene(1024, 1024);

  expect(Array.from(first.points)).toEqual(Array.from(second.points));
});

test("createDualMeshScene keeps sampled points inside the padded bounds", () => {
  const scene = createDualMeshScene(1024, 768);

  for (const point of pointIds(scene.points)) {
    const x = pointX(scene.points, point);
    const y = pointY(scene.points, point);

    expect(x).toBeGreaterThanOrEqual(scene.bounds.min.x);
    expect(x).toBeLessThanOrEqual(scene.bounds.max.x);
    expect(y).toBeGreaterThanOrEqual(scene.bounds.min.y);
    expect(y).toBeLessThanOrEqual(scene.bounds.max.y);
  }
});

test("collectDelaunaySegments de-duplicates shared edges and keeps hull edges", () => {
  const segments = collectDelaunaySegments(fixtureMesh());

  expect(segments).toHaveLength(8);
  expect(new Set(segments.map(normalizeSegment))).toEqual(
    new Set([
      "0.000000,0.000000 -> 0.000000,2.000000",
      "0.000000,0.000000 -> 1.000000,1.000000",
      "0.000000,0.000000 -> 2.000000,0.000000",
      "0.000000,2.000000 -> 1.000000,1.000000",
      "0.000000,2.000000 -> 3.000000,1.000000",
      "1.000000,1.000000 -> 2.000000,0.000000",
      "1.000000,1.000000 -> 3.000000,1.000000",
      "2.000000,0.000000 -> 3.000000,1.000000",
    ]),
  );
});

test("collectDualSegments only includes unique interior centroid connections", () => {
  const segments = collectDualSegments(fixtureMesh());

  expect(segments).toHaveLength(4);
  expect(new Set(segments.map(normalizeSegment))).toEqual(
    new Set([
      "0.333333,1.000000 -> 1.000000,0.333333",
      "0.333333,1.000000 -> 1.333333,1.333333",
      "1.000000,0.333333 -> 2.000000,0.666667",
      "1.333333,1.333333 -> 2.000000,0.666667",
    ]),
  );
});
