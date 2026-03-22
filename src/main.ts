import type { InitCommand, SubmitCommand } from "./commands";

import "./style.css";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const worker = new Worker(new URL("./offscreen-worker.ts", import.meta.url), { type: "module" });
const offscreenCanvas = canvas.transferControlToOffscreen();

worker.postMessage({ kind: "init", canvas: offscreenCanvas } satisfies InitCommand, [
  offscreenCanvas,
]);
worker.postMessage({
  kind: "submit",
  params: { width: 1024, height: 1024, radius: 128, seed: 1337 },
} satisfies SubmitCommand);
