/// <reference lib="webworker" />

import { DualMesh } from "./dual-mesh";
import { poisson } from "./poisson";
import { pointX, pointY, type PointBuffer, type PointId } from "./utils/point-buffer";
import { createRandom } from "./utils/random";

export interface OffscreenInitMessage {
  readonly canvas: OffscreenCanvas;
}

export interface OffscreenStageMessage {
  readonly name: string;
  readonly blob: Blob;
}

const SIZE = 1024;
const WIDTH = SIZE;
const HEIGHT = SIZE;
const RADIUS = 128;
const SEED = 42;

const STROKE_SIZE = 2;
const FILL_STYLE = "#000";
const DELAUNAY_STROKE_STYLE = "#505050";
const DUAL_STROKE_STYLE = "#fff";

addEventListener("message", render);

async function render({ data: { canvas } }: MessageEvent<OffscreenInitMessage>): Promise<void> {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (ctx === null) {
    throw new Error("Failed to created 2D context");
  }
  resize(canvas);
  const mesh = new DualMesh(
    poisson({
      bounds: { min: { x: 0, y: 0 }, max: { x: WIDTH, y: HEIGHT } },
      radius: RADIUS,
      rand: createRandom(SEED),
    }),
  );
  reset(ctx);
  const delaunay = new Path2D();
  const duals = new Path2D();
  for (const edge of mesh.edgeIds()) {
    const opposite = mesh.edgeOpposite(edge);
    if (opposite !== null && edge > opposite) {
      continue;
    }
    addSegment(delaunay, mesh.points, mesh.edgeStartPoint(edge), mesh.edgeEndPoint(edge));
    if (opposite === null) {
      continue;
    }
    addSegment(duals, mesh.corners, DualMesh.edgeTriangle(edge), DualMesh.edgeTriangle(opposite));
  }
  ctx.strokeStyle = DELAUNAY_STROKE_STYLE;
  ctx.lineWidth = STROKE_SIZE;
  ctx.stroke(delaunay);
  ctx.strokeStyle = DUAL_STROKE_STYLE;
  ctx.lineWidth = STROKE_SIZE * 2;
  ctx.stroke(duals);
  const blob = await canvas.convertToBlob();
  const message: OffscreenStageMessage = { name: "Dual Mesh", blob };
  postMessage(message);
}

function resize(canvas: OffscreenCanvas): void {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
}

function reset(ctx: OffscreenCanvasRenderingContext2D): void {
  ctx.fillStyle = FILL_STYLE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}

function addSegment(path: Path2D, buffer: PointBuffer, source: PointId, target: PointId): void {
  path.moveTo(pointX(buffer, source), pointY(buffer, source));
  path.lineTo(pointX(buffer, target), pointY(buffer, target));
}
