import { DualMesh } from "./dual-mesh";
import type { Point2D } from "./utils/geometry";
import { pointIds, pointX, pointY, type PointBuffer, type PointId } from "./utils/point-buffer";

export interface PathBuilder {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath?(): void;
}

export interface ContourPoint extends Point2D {
  readonly key: string;
}

export interface ContourSegment {
  readonly start: ContourPoint;
  readonly end: ContourPoint;
}

export interface ContourLine {
  readonly closed: boolean;
  readonly points: readonly ContourPoint[];
}

const CATMULL_ROM_ALPHA = 0.5;
const SPLINE_SEGMENT_PIXELS = 12;
const PARAMETER_EPSILON = 1e-6;

export function contourLevels(
  buffer: PointBuffer,
  heightmap: Float64Array,
  count: number,
  width: number,
  height: number,
): number[] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const id of pointIds(buffer)) {
    const x = pointX(buffer, id);
    const y = pointY(buffer, id);
    if (x < 0 || x > width || y < 0 || y > height) {
      continue;
    }

    const value = heightmap[id];
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [];
  }

  const step = (max - min) / (count + 1);
  return Array.from({ length: count }, (_, index) => min + step * (index + 1));
}

export function addIsolines(
  path: PathBuilder,
  mesh: DualMesh,
  heightmap: Float64Array,
  level: number,
): void {
  for (const segment of contourSegments(mesh, heightmap, level)) {
    path.moveTo(segment.start.x, segment.start.y);
    path.lineTo(segment.end.x, segment.end.y);
  }
}

export function addCatmullRomIsolines(
  path: PathBuilder,
  mesh: DualMesh,
  heightmap: Float64Array,
  level: number,
): void {
  for (const line of assembleContourLines(contourSegments(mesh, heightmap, level))) {
    addCatmullRomSpline(path, line.points, line.closed);
  }
}

export function assembleContourLines(segments: readonly ContourSegment[]): ContourLine[] {
  const segmentsByKey = new Map<string, number[]>();
  for (const [index, segment] of segments.entries()) {
    segmentsByKey.set(segment.start.key, [...(segmentsByKey.get(segment.start.key) ?? []), index]);
    segmentsByKey.set(segment.end.key, [...(segmentsByKey.get(segment.end.key) ?? []), index]);
  }

  const used = new Set<number>();
  const lines: ContourLine[] = [];

  for (const [key, indices] of segmentsByKey) {
    if (indices.length !== 1) {
      continue;
    }

    const line = walkContourLine(key, segments, segmentsByKey, used);
    if (line !== null) {
      lines.push(line);
    }
  }

  for (let index = 0; index < segments.length; index++) {
    if (used.has(index)) {
      continue;
    }

    lines.push(walkContourLoop(index, segments, segmentsByKey, used));
  }

  return lines;
}

export function addCatmullRomSpline(
  path: PathBuilder,
  points: readonly Point2D[],
  closed: boolean,
): void {
  if (points.length < 2) {
    return;
  }

  if (points.length < 3) {
    path.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index++) {
      path.lineTo(points[index].x, points[index].y);
    }
    if (closed) {
      path.closePath?.();
    }
    return;
  }

  const splinePoints = closed ? resampleClosedContour(points) : resampleOpenContour(points);
  if (splinePoints.length < 2) {
    return;
  }

  path.moveTo(splinePoints[0].x, splinePoints[0].y);
  const segmentCount = closed ? splinePoints.length : splinePoints.length - 1;
  for (let index = 0; index < segmentCount; index++) {
    const p0 = catmullRomPoint(splinePoints, index - 1, closed);
    const p1 = catmullRomPoint(splinePoints, index, closed);
    const p2 = catmullRomPoint(splinePoints, index + 1, closed);
    const p3 = catmullRomPoint(splinePoints, index + 2, closed);
    const stepCount = splineSubdivisionCount(p1, p2);
    for (let step = 1; step <= stepCount; step++) {
      const point = sampleCentripetalCatmullRom(p0, p1, p2, p3, step / stepCount);
      path.lineTo(point.x, point.y);
    }
  }

  if (closed) {
    path.closePath?.();
  }
}

function contourSegments(mesh: DualMesh, heightmap: Float64Array, level: number): ContourSegment[] {
  const pointsByKey = new Map<string, ContourPoint>();
  const segments: ContourSegment[] = [];

  for (const triangle of mesh.triangleIds()) {
    const [a, b, c] = Array.from(mesh.trianglePoints(triangle));
    const mask =
      (heightmap[a] >= level ? 1 : 0) |
      (heightmap[b] >= level ? 2 : 0) |
      (heightmap[c] >= level ? 4 : 0);

    switch (mask) {
      case 0:
      case 7:
        break;
      case 1:
      case 6:
        segments.push(contourSegment(mesh.points, a, b, c, a, heightmap, level, pointsByKey));
        break;
      case 2:
      case 5:
        segments.push(contourSegment(mesh.points, a, b, b, c, heightmap, level, pointsByKey));
        break;
      case 3:
      case 4:
        segments.push(contourSegment(mesh.points, b, c, c, a, heightmap, level, pointsByKey));
        break;
    }
  }

  return segments;
}

function contourSegment(
  buffer: PointBuffer,
  sourceA: PointId,
  targetA: PointId,
  sourceB: PointId,
  targetB: PointId,
  heightmap: Float64Array,
  level: number,
  pointsByKey: Map<string, ContourPoint>,
): ContourSegment {
  return {
    start: contourPoint(
      buffer,
      sourceA,
      targetA,
      heightmap[sourceA],
      heightmap[targetA],
      level,
      pointsByKey,
    ),
    end: contourPoint(
      buffer,
      sourceB,
      targetB,
      heightmap[sourceB],
      heightmap[targetB],
      level,
      pointsByKey,
    ),
  };
}

function contourPoint(
  buffer: PointBuffer,
  source: PointId,
  target: PointId,
  sourceHeight: number,
  targetHeight: number,
  level: number,
  pointsByKey: Map<string, ContourPoint>,
): ContourPoint {
  const key = edgeKey(source, target);
  const existing = pointsByKey.get(key);
  if (existing !== undefined) {
    return existing;
  }

  const [x, y] = interpolateEdge(buffer, source, target, sourceHeight, targetHeight, level);
  const point: ContourPoint = { key, x, y };
  pointsByKey.set(key, point);
  return point;
}

function edgeKey(source: PointId, target: PointId): string {
  return source < target ? `${source}:${target}` : `${target}:${source}`;
}

function interpolateEdge(
  buffer: PointBuffer,
  source: PointId,
  target: PointId,
  sourceHeight: number,
  targetHeight: number,
  level: number,
): [number, number] {
  const delta = targetHeight - sourceHeight;
  const offset = (level - sourceHeight) / delta;
  const x = interpolate(pointX(buffer, source), pointX(buffer, target), offset);
  const y = interpolate(pointY(buffer, source), pointY(buffer, target), offset);
  return [x, y];
}

function interpolate(source: number, target: number, offset: number): number {
  return source + (target - source) * offset;
}

function walkContourLine(
  startKey: string,
  segments: readonly ContourSegment[],
  segmentsByKey: ReadonlyMap<string, readonly number[]>,
  used: Set<number>,
): ContourLine | null {
  const points: ContourPoint[] = [];
  let currentKey = startKey;

  while (true) {
    const nextSegment = nextUnusedSegment(segmentsByKey.get(currentKey), used);
    if (nextSegment === null) {
      return points.length >= 2 ? { closed: false, points } : null;
    }

    used.add(nextSegment);
    const segment = segments[nextSegment];
    const current = segment.start.key === currentKey ? segment.start : segment.end;
    const next = segment.start.key === currentKey ? segment.end : segment.start;
    if (points.length === 0) {
      points.push(current);
    }
    points.push(next);
    currentKey = next.key;
  }
}

function walkContourLoop(
  startSegment: number,
  segments: readonly ContourSegment[],
  segmentsByKey: ReadonlyMap<string, readonly number[]>,
  used: Set<number>,
): ContourLine {
  used.add(startSegment);
  const segment = segments[startSegment];
  const points: ContourPoint[] = [segment.start, segment.end];
  const startKey = segment.start.key;
  let currentKey = segment.end.key;

  while (currentKey !== startKey) {
    const nextSegment = nextUnusedSegment(segmentsByKey.get(currentKey), used);
    if (nextSegment === null) {
      return { closed: false, points };
    }

    used.add(nextSegment);
    const nextEdge = segments[nextSegment];
    const nextPoint = nextEdge.start.key === currentKey ? nextEdge.end : nextEdge.start;
    points.push(nextPoint);
    currentKey = nextPoint.key;
  }

  points.pop();
  return { closed: true, points };
}

function nextUnusedSegment(
  indices: readonly number[] | undefined,
  used: ReadonlySet<number>,
): number | null {
  if (indices === undefined) {
    return null;
  }

  for (const index of indices) {
    if (!used.has(index)) {
      return index;
    }
  }

  return null;
}

function catmullRomPoint(points: readonly Point2D[], index: number, closed: boolean): Point2D {
  if (closed) {
    const wrapped = ((index % points.length) + points.length) % points.length;
    return points[wrapped];
  }

  if (index < 0) {
    return extrapolatePoint(points[1], points[0]);
  }

  if (index >= points.length) {
    return extrapolatePoint(points[points.length - 2], points[points.length - 1]);
  }

  return points[index];
}

function resampleOpenContour(points: readonly Point2D[]): Point2D[] {
  return resampleContour(points, false);
}

function resampleClosedContour(points: readonly Point2D[]): Point2D[] {
  return resampleContour(points, true);
}

function resampleContour(points: readonly Point2D[], closed: boolean): Point2D[] {
  const segmentLengths = contourSegmentLengths(points, closed);
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  if (totalLength === 0) {
    return [...points];
  }

  const targetStep = Math.min(
    SPLINE_SEGMENT_PIXELS,
    totalLength / Math.max(closed ? points.length * 2 : (points.length - 1) * 2, 1),
  );
  const step = Math.max(targetStep, PARAMETER_EPSILON);

  const resampled: Point2D[] = [{ x: points[0].x, y: points[0].y }];
  let segmentIndex = 0;
  let traversed = 0;
  let nextDistance = step;
  while (nextDistance < totalLength - PARAMETER_EPSILON) {
    while (
      segmentIndex < segmentLengths.length - 1 &&
      traversed + segmentLengths[segmentIndex] < nextDistance
    ) {
      traversed += segmentLengths[segmentIndex];
      segmentIndex++;
    }

    const segmentLength = segmentLengths[segmentIndex];
    const start = points[segmentIndex];
    const end = points[(segmentIndex + 1) % points.length];
    const offset =
      segmentLength <= PARAMETER_EPSILON ? 0 : (nextDistance - traversed) / segmentLength;
    resampled.push({
      x: interpolate(start.x, end.x, offset),
      y: interpolate(start.y, end.y, offset),
    });
    nextDistance += step;
  }

  if (closed) {
    return resampled;
  }

  const last = points[points.length - 1];
  resampled.push({ x: last.x, y: last.y });
  return resampled;
}

function contourSegmentLengths(points: readonly Point2D[], closed: boolean): number[] {
  const segmentCount = closed ? points.length : points.length - 1;
  return Array.from({ length: segmentCount }, (_, index) =>
    distance(points[index], points[(index + 1) % points.length]),
  );
}

function splineSubdivisionCount(source: Point2D, target: Point2D): number {
  return Math.max(3, Math.ceil(distance(source, target) / SPLINE_SEGMENT_PIXELS));
}

function sampleCentripetalCatmullRom(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  offset: number,
): Point2D {
  const t0 = 0;
  const t1 = t0 + parameterStep(p0, p1);
  const t2 = t1 + parameterStep(p1, p2);
  const t3 = t2 + parameterStep(p2, p3);
  const t = interpolate(t1, t2, offset);

  const a1 = interpolatePoint(p0, p1, t0, t1, t);
  const a2 = interpolatePoint(p1, p2, t1, t2, t);
  const a3 = interpolatePoint(p2, p3, t2, t3, t);
  const b1 = interpolatePoint(a1, a2, t0, t2, t);
  const b2 = interpolatePoint(a2, a3, t1, t3, t);
  return interpolatePoint(b1, b2, t1, t2, t);
}

function parameterStep(source: Point2D, target: Point2D): number {
  return Math.max(Math.pow(distance(source, target), CATMULL_ROM_ALPHA), PARAMETER_EPSILON);
}

function interpolatePoint(
  source: Point2D,
  target: Point2D,
  start: number,
  end: number,
  offset: number,
): Point2D {
  if (Math.abs(end - start) <= PARAMETER_EPSILON) {
    return { x: target.x, y: target.y };
  }

  const ratio = (offset - start) / (end - start);
  return {
    x: interpolate(source.x, target.x, ratio),
    y: interpolate(source.y, target.y, ratio),
  };
}

function extrapolatePoint(source: Point2D, anchor: Point2D): Point2D {
  return {
    x: anchor.x * 2 - source.x,
    y: anchor.y * 2 - source.y,
  };
}

function distance(source: Point2D, target: Point2D): number {
  return Math.hypot(target.x - source.x, target.y - source.y);
}
