/// <reference lib="webworker" />

import { createNoise2D } from "simplex-noise";

import { DualMesh } from "./dual-mesh";
import { addCatmullRomIsolines, addIsolines, contourLevels } from "./isolines";
import { poisson } from "./poisson";
import { pointIds, pointX, pointY, type PointBufferLike, type PointId } from "./utils/point-buffer";
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
const SEED = 1337;

const STROKE_SIZE = 2;
const FILL_STYLE = "#000";
const DELAUNAY_STROKE_STYLE = "#505050";
const DUAL_STROKE_STYLE = "#fff";
const ISOLINE_STROKE_STYLE = "#fff";
const ISOLINE_COUNT = 12;

addEventListener("message", render);

async function render({ data: { canvas } }: MessageEvent<OffscreenInitMessage>): Promise<void> {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (ctx === null) {
    throw new Error("Failed to created 2D context");
  }
  resize(canvas);
  const rand = createRandom(SEED);
  const mesh = new DualMesh(
    poisson({
      bounds: { min: { x: 0, y: 0 }, max: { x: WIDTH, y: HEIGHT } },
      radius: RADIUS,
      rand,
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
  await snapshot("Dual Mesh", canvas);
  reset(ctx);
  const noise = createNoise2D(rand);
  const heightmap = Float64Array.from(pointIds(mesh.points), (id) =>
    noise(pointX(mesh.points, id) / SIZE, pointY(mesh.points, id) / SIZE),
  );
  const isolines = new Path2D();
  const levels = contourLevels(mesh.points, heightmap, ISOLINE_COUNT, WIDTH, HEIGHT);
  for (const level of levels) {
    addIsolines(isolines, mesh, heightmap, level);
  }
  ctx.strokeStyle = DELAUNAY_STROKE_STYLE;
  ctx.lineWidth = STROKE_SIZE;
  ctx.stroke(delaunay);
  ctx.strokeStyle = ISOLINE_STROKE_STYLE;
  ctx.lineWidth = STROKE_SIZE * 1.5;
  ctx.stroke(isolines);
  await snapshot("Isolines", canvas);
  reset(ctx);
  const splines = new Path2D();
  for (const level of levels) {
    addCatmullRomIsolines(splines, mesh, heightmap, level);
  }
  ctx.strokeStyle = DELAUNAY_STROKE_STYLE;
  ctx.lineWidth = STROKE_SIZE;
  ctx.stroke(delaunay);
  ctx.strokeStyle = ISOLINE_STROKE_STYLE;
  ctx.lineWidth = STROKE_SIZE * 1.5;
  ctx.stroke(splines);
  await snapshot("Catmull-Rom Splines", canvas);
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

function addSegment(path: Path2D, buffer: PointBufferLike, source: PointId, target: PointId): void {
  path.moveTo(pointX(buffer, source), pointY(buffer, source));
  path.lineTo(pointX(buffer, target), pointY(buffer, target));
}

async function snapshot(name: string, canvas: OffscreenCanvas): Promise<void> {
  const blob = await canvas.convertToBlob();
  const message: OffscreenStageMessage = { name, blob };
  postMessage(message);
}
