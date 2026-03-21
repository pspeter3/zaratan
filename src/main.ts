import type { OffscreenWorkerMessage } from "./offscreen-worker";

import "./style.css";

const canvas = document.getElementById("demo-canvas") as HTMLCanvasElement;

const worker = new Worker(new URL("./offscreen-worker.ts", import.meta.url), { type: "module" });
const offscreenCanvas = canvas.transferControlToOffscreen();
const message: OffscreenWorkerMessage = {
  canvas: offscreenCanvas,
};

worker.postMessage(message, [offscreenCanvas]);
