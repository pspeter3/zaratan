import type { InitCommand, SubmitCommand } from "./commands";
import type { ZaratanParams } from "./zaratan";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const params = document.getElementById("params") as HTMLFormElement;

const worker = new Worker(new URL("./offscreen-worker.ts", import.meta.url), { type: "module" });
const offscreenCanvas = canvas.transferControlToOffscreen();

worker.postMessage({ kind: "init", canvas: offscreenCanvas } satisfies InitCommand, [
  offscreenCanvas,
]);
params.addEventListener("submit", onSubmit);
params.requestSubmit();

function onSubmit(this: HTMLFormElement, event: SubmitEvent): void {
  event.preventDefault();
  const params = parseParams(this.elements);
  worker.postMessage({
    kind: "submit",
    params,
  } satisfies SubmitCommand);
}

function parseParams(controls: HTMLFormControlsCollection): ZaratanParams {
  const seed = parseControl(controls, "seed");
  const width = parseControl(controls, "width");
  const height = parseControl(controls, "height");
  const radius = parseControl(controls, "radius");
  return { seed, width, height, radius };
}

function parseControl(controls: HTMLFormControlsCollection, name: keyof ZaratanParams): number {
  return (controls.namedItem(name) as HTMLInputElement).valueAsNumber;
}
