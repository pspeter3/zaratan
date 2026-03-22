/// <reference lib="webworker" />

import { createNoise2D } from "simplex-noise";

import { DualMesh } from "./dual-mesh";
import { poisson } from "./poisson";
import { pointIds, pointX, pointY, type PointBuffer, type PointId } from "./utils/point-buffer";
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
  for (const level of contourLevels(mesh.points, heightmap, ISOLINE_COUNT)) {
    addIsolines(isolines, mesh, heightmap, level);
  }
  ctx.strokeStyle = DELAUNAY_STROKE_STYLE;
  ctx.lineWidth = STROKE_SIZE;
  ctx.stroke(delaunay);
  ctx.strokeStyle = ISOLINE_STROKE_STYLE;
  ctx.lineWidth = STROKE_SIZE * 1.5;
  ctx.stroke(isolines);
  await snapshot("Isolines", canvas);
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

function contourLevels(buffer: PointBuffer, heightmap: Float64Array, count: number): number[] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const id of pointIds(buffer)) {
    const x = pointX(buffer, id);
    const y = pointY(buffer, id);
    if (x < 0 || x > WIDTH || y < 0 || y > HEIGHT) {
      continue;
    }

    const value = heightmap[id];
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [];
  }

  const step = (max - min) / (count + 1);
  return Array.from({ length: count }, (_, index) => min + step * (index + 1));
}

function addIsolines(path: Path2D, mesh: DualMesh, heightmap: Float64Array, level: number): void {
  for (const triangle of mesh.triangleIds()) {
    const [a, b, c] = Array.from(mesh.trianglePoints(triangle));
    const mask =
      (heightmap[a] >= level ? 1 : 0) |
      (heightmap[b] >= level ? 2 : 0) |
      (heightmap[c] >= level ? 4 : 0);

    switch (mask) {
      case 0:
      case 7:
        break;
      case 1:
      case 6:
        addInterpolatedSegment(path, mesh.points, a, b, c, a, heightmap, level);
        break;
      case 2:
      case 5:
        addInterpolatedSegment(path, mesh.points, a, b, b, c, heightmap, level);
        break;
      case 3:
      case 4:
        addInterpolatedSegment(path, mesh.points, b, c, c, a, heightmap, level);
        break;
      default:
        break;
    }
  }
}

function addInterpolatedSegment(
  path: Path2D,
  buffer: PointBuffer,
  sourceA: PointId,
  targetA: PointId,
  sourceB: PointId,
  targetB: PointId,
  heightmap: Float64Array,
  level: number,
): void {
  const [startX, startY] = interpolateEdge(
    buffer,
    sourceA,
    targetA,
    heightmap[sourceA],
    heightmap[targetA],
    level,
  );
  const [endX, endY] = interpolateEdge(
    buffer,
    sourceB,
    targetB,
    heightmap[sourceB],
    heightmap[targetB],
    level,
  );
  path.moveTo(startX, startY);
  path.lineTo(endX, endY);
}

function interpolateEdge(
  buffer: PointBuffer,
  source: PointId,
  target: PointId,
  sourceHeight: number,
  targetHeight: number,
  level: number,
): [number, number] {
  const delta = targetHeight - sourceHeight;
  const offset = delta === 0 ? 0.5 : (level - sourceHeight) / delta;
  const x = interpolate(pointX(buffer, source), pointX(buffer, target), offset);
  const y = interpolate(pointY(buffer, source), pointY(buffer, target), offset);
  return [x, y];
}

function interpolate(source: number, target: number, offset: number): number {
  return source + (target - source) * offset;
}

async function snapshot(name: string, canvas: OffscreenCanvas): Promise<void> {
  const blob = await canvas.convertToBlob();
  const message: OffscreenStageMessage = { name, blob };
  postMessage(message);
}
