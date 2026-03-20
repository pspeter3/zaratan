import Delaunator from "delaunator";

import type { Brand } from "./utils/brand";
import { pointIds, pointX, pointY, type PointBuffer, type PointId } from "./utils/point-buffer";

export type TriangleId = Brand<number, "TriangleId">;
export type EdgeId = Brand<number, "EdgeId">;
export type CornerId = Brand<PointId, "CornerId">;

const TRIANGLE_STRIDE = 3;

export class DualMesh {
  static nextEdge(edge: EdgeId): EdgeId {
    const offset = edge % TRIANGLE_STRIDE;
    return (edge - offset + ((offset + 1) % TRIANGLE_STRIDE)) as EdgeId;
  }

  static prevEdge(edge: EdgeId): EdgeId {
    const offset = edge % TRIANGLE_STRIDE;
    return (edge - offset + ((offset + TRIANGLE_STRIDE - 1) % TRIANGLE_STRIDE)) as EdgeId;
  }

  static edgeTriangle(edge: EdgeId): TriangleId {
    return Math.floor(edge / TRIANGLE_STRIDE) as TriangleId;
  }
  readonly points: PointBuffer;
  readonly corners: PointBuffer;

  #delaunator: Delaunator<Float64Array>;

  constructor(points: Float64Array) {
    this.points = points;
    this.#delaunator = new Delaunator(points);
    this.corners = Float64Array.from(
      this.triangleIds().flatMap((t) => {
        let cx = 0;
        let cy = 0;
        for (const point of this.trianglePoints(t as TriangleId)) {
          cx += pointX(this.points, point);
          cy += pointY(this.points, point);
        }
        return [cx / TRIANGLE_STRIDE, cy / TRIANGLE_STRIDE];
      }),
    );
  }

  edgeOpposite(edge: EdgeId): EdgeId | null {
    const opposite = this.#delaunator.halfedges[edge];
    return opposite === -1 ? null : (opposite as EdgeId);
  }

  edgeStartPoint(edge: EdgeId): PointId {
    return this.#delaunator.triangles[edge] as PointId;
  }

  edgeEndPoint(edge: EdgeId): PointId {
    return this.#delaunator.triangles[DualMesh.nextEdge(edge)] as PointId;
  }

  triangleCorner(triangle: TriangleId): CornerId {
    return triangle as CornerId;
  }

  cornerTriangle(corner: CornerId): TriangleId {
    return corner as TriangleId;
  }

  *edgeIds(): Generator<EdgeId> {
    for (let edge = 0; edge < this.#delaunator.triangles.length; edge++) {
      yield edge as EdgeId;
    }
  }

  *triangleIds(): Generator<TriangleId> {
    const triangleCount = this.#delaunator.triangles.length / TRIANGLE_STRIDE;
    for (let triangle = 0; triangle < triangleCount; triangle++) {
      yield triangle as TriangleId;
    }
  }

  cornerIds(): Generator<CornerId> {
    return pointIds(this.corners) as Generator<CornerId>;
  }

  *triangleEdges(triangle: TriangleId): Generator<EdgeId> {
    const firstEdge = triangle * TRIANGLE_STRIDE;
    yield firstEdge as EdgeId;
    yield (firstEdge + 1) as EdgeId;
    yield (firstEdge + 2) as EdgeId;
  }

  *trianglePoints(triangle: TriangleId): Generator<PointId> {
    const firstEdge = triangle * TRIANGLE_STRIDE;
    yield this.#delaunator.triangles[firstEdge] as PointId;
    yield this.#delaunator.triangles[firstEdge + 1] as PointId;
    yield this.#delaunator.triangles[firstEdge + 2] as PointId;
  }

  *triangleNeighbors(triangle: TriangleId): Generator<TriangleId> {
    for (const edge of this.triangleEdges(triangle)) {
      const opposite = this.edgeOpposite(edge);
      if (opposite !== null) {
        yield DualMesh.edgeTriangle(opposite);
      }
    }
  }
}
