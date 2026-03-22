/// <reference lib="webworker" />

import { createNoise2D } from "simplex-noise";

import { DualMesh } from "./dual-mesh";
import { addCatmullRomIsolines, addIsolines, contourLevels } from "./isolines";
import { poisson } from "./poisson";
import { pointX, pointY, type PointBufferLike, type PointId } from "./utils/point-buffer";
import { createRandom } from "./utils/random";
import { Surface2D } from "./utils/surface2d";

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
  const surface = new Surface2D(canvas);
  surface.resize(WIDTH, HEIGHT);
  const rand = createRandom(SEED);
  const mesh = new DualMesh(
    poisson({
      bounds: { min: { x: 0, y: 0 }, max: { x: WIDTH, y: HEIGHT } },
      radius: RADIUS,
      rand,
    }),
  );
  const delaunay = new Path2D();
  const duals = new Path2D();
  for (const edge of mesh.edgeIds()) {
    const opposite = mesh.edgeOpposite(edge);
    if (opposite !== null && edge > opposite) {
      continue;
    }
    addSegment(delaunay, mesh.tiles.raw, mesh.edgeStartTile(edge), mesh.edgeEndTile(edge));
    if (opposite === null) {
      continue;
    }
    addSegment(duals, mesh.nodes.raw, DualMesh.edgeNode(edge), DualMesh.edgeNode(opposite));
  }
  surface.clear(FILL_STYLE);
  surface.stroke(delaunay, {
    style: DELAUNAY_STROKE_STYLE,
    width: STROKE_SIZE,
    cap: "round",
    join: "round",
  });
  surface.stroke(duals, {
    style: DUAL_STROKE_STYLE,
    width: STROKE_SIZE * 2,
    cap: "round",
    join: "round",
  });
  await snapshot("Dual Mesh", surface);
  const noise = createNoise2D(rand);
  const heightmap = Float64Array.from(mesh.tiles.keys(), (id) =>
    noise(pointX(mesh.tiles.raw, id) / SIZE, pointY(mesh.tiles.raw, id) / SIZE),
  );
  const isolines = new Path2D();
  const levels = contourLevels(mesh.tiles.raw, heightmap, ISOLINE_COUNT, WIDTH, HEIGHT);
  for (const level of levels) {
    addIsolines(isolines, mesh, heightmap, level);
  }
  surface.clear(FILL_STYLE);
  surface.stroke(delaunay, {
    style: DELAUNAY_STROKE_STYLE,
    width: STROKE_SIZE,
    cap: "round",
    join: "round",
  });
  surface.stroke(isolines, {
    style: ISOLINE_STROKE_STYLE,
    width: STROKE_SIZE * 1.5,
    cap: "round",
    join: "round",
  });
  await snapshot("Isolines", surface);
  const splines = new Path2D();
  for (const level of levels) {
    addCatmullRomIsolines(splines, mesh, heightmap, level);
  }
  surface.clear(FILL_STYLE);
  surface.stroke(delaunay, {
    style: DELAUNAY_STROKE_STYLE,
    width: STROKE_SIZE,
    cap: "round",
    join: "round",
  });
  surface.stroke(splines, {
    style: ISOLINE_STROKE_STYLE,
    width: STROKE_SIZE * 1.5,
    cap: "round",
    join: "round",
  });
  await snapshot("Catmull-Rom Splines", surface);
}

function addSegment(path: Path2D, buffer: PointBufferLike, source: PointId, target: PointId): void {
  path.moveTo(pointX(buffer, source), pointY(buffer, source));
  path.lineTo(pointX(buffer, target), pointY(buffer, target));
}

async function snapshot(name: string, surface: Surface2D): Promise<void> {
  const blob = await surface.snapshot();
  const message: OffscreenStageMessage = { name, blob };
  postMessage(message);
}
