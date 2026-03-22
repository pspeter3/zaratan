/// <reference lib="webworker" />

import { DualMesh } from "./utils/dual-mesh";
import { pointX, pointY, type PointBufferLike, type PointId } from "./utils/point-buffer";
import { poisson } from "./utils/poisson";
import { createRandom } from "./utils/random";
import { Surface2D } from "./utils/surface2d";

export interface OffscreenInitMessage {
  readonly canvas: OffscreenCanvas;
}

const SIZE = 1024;
const WIDTH = SIZE;
const HEIGHT = SIZE;
const RADIUS = 128;
const SEED = 1337;

const STROKE_SIZE = 2;
const FILL_STYLE = "#000";
const DELAUNAY_STROKE_STYLE = "#505050";
const DUAL_STROKE_STYLE = "#fff";

addEventListener("message", render);

function render({ data: { canvas } }: MessageEvent<OffscreenInitMessage>): void {
  const surface = new Surface2D(canvas);
  surface.resize(WIDTH, HEIGHT);
  const rand = createRandom(SEED);
  const mesh = new DualMesh(
    poisson({
      bounds: { min: { x: 0, y: 0 }, max: { x: WIDTH, y: HEIGHT } },
      radius: RADIUS,
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
