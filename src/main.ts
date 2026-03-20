import type { OffscreenWorkerMessage } from "./offscreen-worker";

import "./style.css";

const SIZE = 1024;

const canvas = document.getElementById("demo-canvas") as HTMLCanvasElement;

canvas.width = SIZE;
canvas.height = SIZE;

const worker = new Worker(new URL("./offscreen-worker.ts", import.meta.url), { type: "module" });
const offscreenCanvas = canvas.transferControlToOffscreen();
const message: OffscreenWorkerMessage = {
  canvas: offscreenCanvas,
  width: SIZE,
  height: SIZE,
};

worker.postMessage(message, [offscreenCanvas]);
