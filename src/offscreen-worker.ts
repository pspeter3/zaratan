/// <reference lib="webworker" />

export interface OffscreenWorkerInitMessage {
  readonly kind: "init";
  readonly canvas: OffscreenCanvas;
  readonly width: number;
  readonly height: number;
}

const FULL_CIRCLE = Math.PI * 2;
const HEXAGON_SIDES = 6;
const START_ANGLE = -Math.PI / 2;

addEventListener("message", (event: MessageEvent<OffscreenWorkerInitMessage>) => {
  const { canvas, width, height } = event.data;
  const context = canvas.getContext("2d", { alpha: false, desynchronized: true });

  if (!context) {
    throw new Error("Failed to create a 2D context for the offscreen canvas.");
  }

  const bitmapWidth = Math.max(1, Math.round(width));
  const bitmapHeight = Math.max(1, Math.round(height));

  canvas.width = bitmapWidth;
  canvas.height = bitmapHeight;

  drawScene(context, bitmapWidth, bitmapHeight);
});

function drawScene(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(24, Math.min(width, height) * 0.36);
  const lineWidth = Math.max(2, radius * 0.03);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, FULL_CIRCLE);
  ctx.stroke();

  ctx.beginPath();
  for (let index = 0; index < HEXAGON_SIDES; index += 1) {
    const angle = START_ANGLE + (FULL_CIRCLE * index) / HEXAGON_SIDES;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (index === 0) {
      ctx.moveTo(x, y);
      continue;
    }

    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.lineJoin = "round";
  ctx.stroke();
}
