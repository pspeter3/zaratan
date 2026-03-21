/// <reference lib="webworker" />

import { createDualMeshScene, type Segment2D } from "./dual-mesh-scene";

export interface OffscreenWorkerMessage {
  readonly canvas: OffscreenCanvas;
  readonly width: number;
  readonly height: number;
}

const DELAUNAY_STROKE_STYLE = "#505050";
const DUAL_STROKE_STYLE = "#fff";

addEventListener("message", ({ data }: MessageEvent<OffscreenWorkerMessage>) => {
  const { canvas, width, height } = data;
  const context = canvas.getContext("2d", { alpha: false, desynchronized: true });

  if (!context) {
    throw new Error("Failed to create a 2D context for the offscreen canvas.");
  }

  canvas.width = width;
  canvas.height = height;

  drawScene(context, width, height);
});

function drawScene(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number) {
  const { delaunaySegments, dualSegments } = createDualMeshScene(width, height);
  const baseLineWidth = Math.max(1, Math.min(width, height) * 0.002);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  strokeSegments(ctx, delaunaySegments, DELAUNAY_STROKE_STYLE, baseLineWidth);
  strokeSegments(ctx, dualSegments, DUAL_STROKE_STYLE, Math.max(2, baseLineWidth * 2));
}

function strokeSegments(
  ctx: OffscreenCanvasRenderingContext2D,
  segments: readonly Segment2D[],
  strokeStyle: string,
  lineWidth: number,
) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  for (const { start, end } of segments) {
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
  }

  ctx.stroke();
}
