import { expect, test } from "vite-plus/test";

import {
  addCatmullRomSpline,
  assembleContourLines,
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
