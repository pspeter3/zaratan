import type { OffscreenInitMessage, OffscreenStageMessage } from "./offscreen-worker";

import "./style.css";

const canvas = document.createElement("canvas");
const list = document.getElementById("list") as HTMLUListElement;
const itemTmpl = document.getElementById("item") as HTMLTemplateElement;

const worker = new Worker(new URL("./offscreen-worker.ts", import.meta.url), { type: "module" });
const offscreenCanvas = canvas.transferControlToOffscreen();
const message: OffscreenInitMessage = {
  canvas: offscreenCanvas,
};

worker.postMessage(message, [offscreenCanvas]);
worker.addEventListener("message", addStage);

function addStage({ data: { name, blob } }: MessageEvent<OffscreenStageMessage>): void {
  const item = document.importNode(itemTmpl.content, true);
  item.querySelector("figcaption")!.textContent = name;
  item.querySelector("img")!.src = URL.createObjectURL(blob);
  list.appendChild(item);
}
