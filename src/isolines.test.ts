import { expect, test } from "vite-plus/test";

import { DualMesh } from "./dual-mesh";
import {
  addCatmullRomIsolines,
  addCatmullRomSpline,
  addIsolines,
  assembleContourLines,
  contourLevels,
  type ContourPoint,
  type ContourSegment,
  type PathBuilder,
} from "./isolines";

type PathCommand =
  | { readonly type: "moveTo"; readonly x: number; readonly y: number }
  | { readonly type: "lineTo"; readonly x: number; readonly y: number }
  | { readonly type: "closePath" };

class RecordingPath implements PathBuilder {
  readonly commands: PathCommand[] = [];

  moveTo(x: number, y: number): void {
    this.commands.push({ type: "moveTo", x, y });
  }

  lineTo(x: number, y: number): void {
    this.commands.push({ type: "lineTo", x, y });
  }

  closePath(): void {
    this.commands.push({ type: "closePath" });
  }
}

function point(key: string, x: number, y: number): ContourPoint {
  return { key, x, y };
}

function segment(start: ContourPoint, end: ContourPoint): ContourSegment {
  return { start, end };
}

function fixturePoints(): Float64Array {
  return new Float64Array([0, 0, 2, 0, 0, 2, 3, 1, 1, 1]);
}

function binaryHeightmap(bits: number): Float64Array {
  return new Float64Array([0, 1, 2, 3, 4].map((index) => (bits >> index) & 1));
}

function unstablePoint(keys: readonly string[], x: number, y: number): ContourPoint {
  let index = 0;
  return {
    get key() {
      const current = keys[Math.min(index, keys.length - 1)];
      index++;
      return current;
    },
    x,
    y,
  } as ContourPoint;
}

test("contourLevels skips out-of-bounds points and spaces levels across the interior range", () => {
  const buffer = new Float64Array([-1, 0, 3, 0, 0, -1, 0, 3, 0, 0, 2, 2]);
  const heightmap = new Float64Array([100, 200, 300, 400, 2, 8]);

  expect(contourLevels(buffer, heightmap, 2, 2, 2)).toEqual([4, 6]);
});

test("contourLevels returns no levels when the range is missing, non-finite, or flat", () => {
  expect(contourLevels(new Float64Array([-1, -1]), new Float64Array([5]), 2, 1, 1)).toEqual([]);
  expect(
    contourLevels(
      new Float64Array([0, 0, 1, 1]),
      new Float64Array([1, Number.POSITIVE_INFINITY]),
      2,
      1,
      1,
    ),
  ).toEqual([]);
  expect(contourLevels(new Float64Array([0, 0, 1, 1]), new Float64Array([2, 2]), 2, 1, 1)).toEqual(
    [],
  );
});

test("addIsolines interpolates raw contour segments from the triangulation", () => {
  const path = new RecordingPath();

  addIsolines(path, new DualMesh(fixturePoints()), binaryHeightmap(0b10000), 0.5);

  expect(path.commands).toEqual([
    { type: "moveTo", x: 1.5, y: 0.5 },
    { type: "lineTo", x: 0.5, y: 0.5 },
    { type: "moveTo", x: 0.5, y: 1.5 },
    { type: "lineTo", x: 0.5, y: 0.5 },
    { type: "moveTo", x: 2, y: 1 },
    { type: "lineTo", x: 1.5, y: 0.5 },
    { type: "moveTo", x: 2, y: 1 },
    { type: "lineTo", x: 0.5, y: 1.5 },
  ]);
});

test("addIsolines covers every triangle contour mask", () => {
  const cases = [
    [0b00000, 0],
    [0b01100, 3],
    [0b10001, 4],
    [0b10110, 4],
    [0b11111, 0],
  ] as const;

  for (const [bits, segmentCount] of cases) {
    const path = new RecordingPath();
    addIsolines(path, new DualMesh(fixturePoints()), binaryHeightmap(bits), 0.5);
    expect(path.commands).toHaveLength(segmentCount * 2);
  }
});

test("addCatmullRomIsolines assembles mesh contours into a closed spline", () => {
  const path = new RecordingPath();

  addCatmullRomIsolines(path, new DualMesh(fixturePoints()), binaryHeightmap(0b10000), 0.5);

  expect(path.commands[0]).toEqual({ type: "moveTo", x: 1.5, y: 0.5 });
  const lineSegments = path.commands.filter(({ type }) => type === "lineTo");
  expect(lineSegments.length).toBeGreaterThan(4);
  expect(lineSegments.at(-1)).toEqual({ type: "lineTo", x: 1.5, y: 0.5 });
  expect(path.commands.at(-1)).toEqual({ type: "closePath" });
});

test("assembleContourLines orders open contours by shared edge keys", () => {
  const a = point("a", 0, 0);
  const b = point("b", 1, 0);
  const c = point("c", 2, 0);
  const d = point("d", 3, 0);

  const lines = assembleContourLines([segment(b, c), segment(a, b), segment(c, d)]);

  expect(lines).toHaveLength(1);
  expect(lines[0].closed).toBe(false);
  expect(lines[0].points.map(({ key }) => key)).toEqual(["a", "b", "c", "d"]);
});

test("assembleContourLines handles reversed segment orientations in open contours", () => {
  const a = point("a", 0, 0);
  const b = point("b", 1, 0);
  const c = point("c", 2, 0);

  const lines = assembleContourLines([segment(b, a), segment(c, b)]);

  expect(lines).toHaveLength(1);
  expect(lines[0].closed).toBe(false);
  expect(lines[0].points.map(({ key }) => key)).toEqual(["a", "b", "c"]);
});

test("assembleContourLines keeps closed contours as loops", () => {
  const a = point("a", 0, 0);
  const b = point("b", 1, 0);
  const c = point("c", 0.5, 1);

  const lines = assembleContourLines([segment(a, b), segment(c, a), segment(b, c)]);

  expect(lines).toHaveLength(1);
  expect(lines[0].closed).toBe(true);
  expect(lines[0].points).toHaveLength(3);
  expect(lines[0].points.map(({ key }) => key).toSorted()).toEqual(["a", "b", "c"]);
});

test("assembleContourLines follows closed loops across reversed edges", () => {
  const a = point("a", 0, 0);
  const b = point("b", 1, 0);
  const c = point("c", 0.5, 1);

  const lines = assembleContourLines([segment(a, b), segment(a, c), segment(b, c)]);

  expect(lines).toHaveLength(1);
  expect(lines[0].closed).toBe(true);
  expect(lines[0].points.map(({ key }) => key)).toEqual(["a", "b", "c"]);
});

test("assembleContourLines returns an open line when a loop cannot continue", () => {
  const lines = assembleContourLines([
    segment(point("a", 0, 0), unstablePoint(["b", "missing"], 1, 0)),
    segment(point("a", 0, 1), point("b", 1, 1)),
  ]);

  expect(lines).toHaveLength(2);
  expect(lines.some((line) => !line.closed && line.points.length === 2)).toBe(true);
});

test("addCatmullRomSpline ignores contours shorter than two points", () => {
  const path = new RecordingPath();

  addCatmullRomSpline(path, [{ x: 0, y: 0 }], false);

  expect(path.commands).toEqual([]);
});

test("addCatmullRomSpline falls back to straight segments for a line", () => {
  const path = new RecordingPath();

  addCatmullRomSpline(
    path,
    [
      { x: 0, y: 0 },
      { x: 2, y: 1 },
    ],
    false,
  );

  expect(path.commands).toEqual([
    { type: "moveTo", x: 0, y: 0 },
    { type: "lineTo", x: 2, y: 1 },
  ]);
});

test("addCatmullRomSpline closes two-point contours without smoothing", () => {
  const path = new RecordingPath();

  addCatmullRomSpline(
    path,
    [
      { x: 0, y: 0 },
      { x: 2, y: 1 },
    ],
    true,
  );

  expect(path.commands).toEqual([
    { type: "moveTo", x: 0, y: 0 },
    { type: "lineTo", x: 2, y: 1 },
    { type: "closePath" },
  ]);
});

test("addCatmullRomSpline samples smooth segments for open contours", () => {
  const path = new RecordingPath();

  addCatmullRomSpline(
    path,
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 0 },
    ],
    false,
  );

  expect(path.commands[0]).toEqual({ type: "moveTo", x: 0, y: 0 });
  expect(path.commands.filter(({ type }) => type === "lineTo").length).toBeGreaterThan(3);
  expect(path.commands.at(-1)).toEqual({ type: "lineTo", x: 3, y: 0 });
});

test("addCatmullRomSpline closes spline loops", () => {
  const path = new RecordingPath();

  addCatmullRomSpline(
    path,
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 2 },
    ],
    true,
  );

  expect(path.commands[0]).toEqual({ type: "moveTo", x: 0, y: 0 });
  const lineSegments = path.commands.filter(({ type }) => type === "lineTo");
  expect(lineSegments.length).toBeGreaterThan(3);
  expect(lineSegments.at(-1)).toEqual({ type: "lineTo", x: 0, y: 0 });
  expect(path.commands.at(-1)).toEqual({ type: "closePath" });
});

test("addCatmullRomSpline returns early when a tiny closed contour collapses during resampling", () => {
  const path = new RecordingPath();

  addCatmullRomSpline(
    path,
    [
      { x: 0, y: 0 },
      { x: 1e-8, y: 0 },
      { x: 2e-8, y: 0 },
    ],
    true,
  );

  expect(path.commands).toEqual([]);
});

test("addCatmullRomSpline stays finite when every control point is identical", () => {
  const path = new RecordingPath();

  addCatmullRomSpline(
    path,
    [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 1 },
    ],
    false,
  );

  expect(path.commands[0]).toEqual({ type: "moveTo", x: 1, y: 1 });
  for (const command of path.commands) {
    if (command.type === "closePath") {
      continue;
    }

    expect(Number.isFinite(command.x)).toBe(true);
    expect(Number.isFinite(command.y)).toBe(true);
  }
});

test("addCatmullRomSpline stays finite with near-zero contour segments", () => {
  const path = new RecordingPath();

  addCatmullRomSpline(
    path,
    [
      { x: 0, y: 0 },
      { x: 1e-6, y: 0 },
      { x: 3e-6, y: 0 },
      { x: 3e-6, y: 0 },
    ],
    false,
  );

  expect(path.commands[0]).toEqual({ type: "moveTo", x: 0, y: 0 });
  for (const command of path.commands) {
    if (command.type === "closePath") {
      continue;
    }

    expect(Number.isFinite(command.x)).toBe(true);
    expect(Number.isFinite(command.y)).toBe(true);
  }
});

test("addCatmullRomSpline keeps sampled coordinates finite on uneven closed contours", () => {
  const path = new RecordingPath();

  addCatmullRomSpline(
    path,
    [
      { x: 0, y: 0 },
      { x: 8, y: 0 },
      { x: 8.2, y: 0.1 },
      { x: 4, y: 5 },
      { x: 0.1, y: 4.9 },
    ],
    true,
  );

  for (const command of path.commands) {
    if (command.type === "closePath") {
      continue;
    }

    expect(Number.isFinite(command.x)).toBe(true);
    expect(Number.isFinite(command.y)).toBe(true);
  }
});
