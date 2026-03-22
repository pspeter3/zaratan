/// <reference lib="webworker" />

import { effect, signal } from "@preact/signals-core";

import type { OffscreenWorkerCommand } from "./commands";
import { DualMesh } from "./utils/dual-mesh";
import { Bounds2D } from "./utils/geometry";
import { pointX, pointY, type PointBufferLike, type PointId } from "./utils/point-buffer";
import { poisson } from "./utils/poisson";
import { createRandom } from "./utils/random";
import { Surface2D } from "./utils/surface2d";
import type { ZaratanParams } from "./zaratan";

export interface OffscreenInitMessage {
  readonly canvas: OffscreenCanvas;
}

const surfaceSignal = signal<Surface2D | null>(null);
const paramsSignal = signal<ZaratanParams | null>(null);

const STROKE_SIZE = 2;
const FILL_STYLE = "#000";
const DELAUNAY_STROKE_STYLE = "#505050";
const DUAL_STROKE_STYLE = "#fff";

addEventListener("message", onMessage);
effect(render);

function onMessage({ data }: MessageEvent<OffscreenWorkerCommand>): void {
  switch (data.kind) {
    case "init": {
      surfaceSignal.value = new Surface2D(data.canvas);
      break;
    }
    case "submit": {
      paramsSignal.value = data.params;
      break;
    }
  }
}

function render(): void {
  const surface = surfaceSignal.value;
  if (surface === null) {
    return;
  }
  const params = paramsSignal.value;
  if (params === null) {
    return;
  }
  const { width, height, radius, seed } = params;
  surface.resize(width, height);
  const rand = createRandom(seed);
  const mesh = new DualMesh(
    poisson({
      bounds: Bounds2D.fromDimensions(width, height),
      radius,
      rand,
    }),
  );
  const delaunay = new Path2D();
  const duals = new Path2D();
  for (const edge of mesh.edgeIds()) {
    const opposite = mesh.edgeOpposite(edge);
    if (opposite !== null && edge > opposite) {
      continue;
    }
    addSegment(delaunay, mesh.tiles.raw, mesh.edgeStartTile(edge), mesh.edgeEndTile(edge));
    if (opposite === null) {
      continue;
    }
    addSegment(duals, mesh.nodes.raw, DualMesh.edgeNode(edge), DualMesh.edgeNode(opposite));
  }
  surface.clear(FILL_STYLE);
  surface.stroke(delaunay, {
    style: DELAUNAY_STROKE_STYLE,
    width: STROKE_SIZE,
    cap: "round",
    join: "round",
  });
  surface.stroke(duals, {
    style: DUAL_STROKE_STYLE,
    width: STROKE_SIZE * 2,
    cap: "round",
    join: "round",
  });
}

function addSegment(path: Path2D, buffer: PointBufferLike, source: PointId, target: PointId): void {
  path.moveTo(pointX(buffer, source), pointY(buffer, source));
  path.lineTo(pointX(buffer, target), pointY(buffer, target));
}
