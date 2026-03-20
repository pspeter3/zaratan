import { DualMesh, type EdgeId } from "./dual-mesh";
import { poisson } from "./poisson";
import type { Bounds2D, Point2D } from "./utils/geometry";
import { type PointBuffer, type PointId, pointX, pointY } from "./utils/point-buffer";
import { createRandom } from "./utils/random";

export interface Segment2D {
  readonly start: Point2D;
  readonly end: Point2D;
}

export interface DualMeshScene {
  readonly bounds: Bounds2D;
  readonly points: Float64Array;
  readonly delaunaySegments: readonly Segment2D[];
  readonly dualSegments: readonly Segment2D[];
}

const SCENE_SEED = 42;

export function scenePadding(width: number, height: number): number {
  return Math.max(48, Math.min(width, height) * 0.1);
}

export function sceneRadius(width: number, height: number): number {
  return Math.max(72, Math.min(width, height) * 0.125);
}

export function sceneBounds(width: number, height: number): Bounds2D {
  const padding = scenePadding(width, height);
  const xPadding = Math.min(padding, width / 2);
  const yPadding = Math.min(padding, height / 2);

  return {
    min: { x: xPadding, y: yPadding },
    max: { x: width - xPadding, y: height - yPadding },
  };
}

export function createDualMeshScene(width: number, height: number): DualMeshScene {
  const bounds = sceneBounds(width, height);
  const points = poisson({
    bounds,
    radius: sceneRadius(width, height),
    rand: createRandom(SCENE_SEED),
  });
  const mesh = new DualMesh(points);

  return {
    bounds,
    points,
    delaunaySegments: collectDelaunaySegments(mesh),
    dualSegments: collectDualSegments(mesh),
  };
}

export function collectDelaunaySegments(mesh: DualMesh): Segment2D[] {
  return collectUniqueEdgeSegments(mesh, (edge) =>
    segmentFromIndices(mesh.points, mesh.edgeStartPoint(edge), mesh.edgeEndPoint(edge)),
  );
}

export function collectDualSegments(mesh: DualMesh): Segment2D[] {
  return collectUniqueEdgeSegments(mesh, (edge, opposite) => {
    if (opposite === null) {
      return null;
    }

    return segmentFromIndices(
      mesh.corners,
      mesh.triangleCorner(DualMesh.edgeTriangle(edge)),
      mesh.triangleCorner(DualMesh.edgeTriangle(opposite)),
    );
  });
}

type EdgeSegmentFactory = (edge: EdgeId, opposite: EdgeId | null) => Segment2D | null;

function collectUniqueEdgeSegments(mesh: DualMesh, createSegment: EdgeSegmentFactory): Segment2D[] {
  const segments: Segment2D[] = [];

  for (const edge of mesh.edgeIds()) {
    const opposite = mesh.edgeOpposite(edge);
    if (opposite !== null && edge > opposite) {
      continue;
    }

    const segment = createSegment(edge, opposite);
    if (segment) {
      segments.push(segment);
    }
  }

  return segments;
}

function segmentFromIndices(buffer: PointBuffer, start: number, end: number): Segment2D {
  return {
    start: pointAt(buffer, start),
    end: pointAt(buffer, end),
  };
}

function pointAt(buffer: PointBuffer, id: number): Point2D {
  const pointId = id as PointId;
  return { x: pointX(buffer, pointId), y: pointY(buffer, pointId) };
}
