import Delaunator from "delaunator";

import type { Brand } from "./brand";
import { PointBuffer, pointX, pointY, type PointId } from "./point-buffer";

/**
 * Branded id for a primal-mesh tile stored in {@link DualMesh.tiles}.
 */
export type TileId = Brand<PointId, "TileId">;

/**
 * Branded id for a dual-mesh node stored in {@link DualMesh.nodes}.
 */
export type NodeId = Brand<PointId, "NodeId">;

/**
 * Branded id for a directed Delaunay edge in the half-edge topology.
 */
export type EdgeId = Brand<number, "EdgeId">;

const TRIANGLE_STRIDE = 3;

/**
 * Delaunay-backed mesh exposing primal tiles and dual nodes.
 *
 * Tiles are the input sample points. Nodes are derived dual-mesh positions
 * stored as triangle centroids, indexed in the same order as Delaunator's
 * triangle array.
 */
export class DualMesh {
  /**
   * Returns the next directed edge inside the owning node's three-edge cycle.
   *
   * @param edge - The edge to advance.
   * @returns The next edge for the same node.
   */
  static nextEdge(edge: EdgeId): EdgeId {
    const offset = edge % TRIANGLE_STRIDE;
    return (edge - offset + ((offset + 1) % TRIANGLE_STRIDE)) as EdgeId;
  }

  /**
   * Returns the previous directed edge inside the owning node's three-edge cycle.
   *
   * @param edge - The edge to rewind.
   * @returns The previous edge for the same node.
   */
  static prevEdge(edge: EdgeId): EdgeId {
    const offset = edge % TRIANGLE_STRIDE;
    return (edge - offset + ((offset + TRIANGLE_STRIDE - 1) % TRIANGLE_STRIDE)) as EdgeId;
  }

  /**
   * Returns the dual node that owns a directed edge.
   *
   * @param edge - The directed edge to inspect.
   * @returns The node containing `edge`.
   */
  static edgeNode(edge: EdgeId): NodeId {
    return Math.floor(edge / TRIANGLE_STRIDE) as NodeId;
  }

  /**
   * Iterates the three directed edges that bound a node.
   *
   * @param node - The node to inspect.
   * @returns The node's directed edges in Delaunator storage order.
   */
  static *nodeEdges(node: NodeId): Generator<EdgeId> {
    const firstEdge = node * TRIANGLE_STRIDE;
    yield firstEdge as EdgeId;
    yield (firstEdge + 1) as EdgeId;
    yield (firstEdge + 2) as EdgeId;
  }

  /** Primal mesh tiles backed by the original packed coordinate buffer. */
  readonly tiles: PointBuffer<TileId>;

  /** Dual mesh nodes stored as per-triangle centroid positions. */
  readonly nodes: PointBuffer<NodeId>;

  #delaunator: Delaunator<Float64Array>;

  /**
   * Builds the mesh from interleaved tile coordinates.
   *
   * @param tiles - Packed tile coordinates in `[x0, y0, x1, y1, ...]` order.
   */
  constructor(tiles: Float64Array) {
    this.tiles = new PointBuffer<TileId>(tiles);
    this.#delaunator = new Delaunator(tiles);

    const nodeCount = this.#delaunator.triangles.length / TRIANGLE_STRIDE;
    const nodes = new Float64Array(nodeCount * 2);
    for (let node = 0; node < nodeCount; node++) {
      const nodeId = node as NodeId;
      let cx = 0;
      let cy = 0;
      for (const tile of this.nodeTiles(nodeId)) {
        cx += pointX(this.tiles.raw, tile);
        cy += pointY(this.tiles.raw, tile);
      }
      nodes[2 * node] = cx / TRIANGLE_STRIDE;
      nodes[2 * node + 1] = cy / TRIANGLE_STRIDE;
    }
    this.nodes = new PointBuffer<NodeId>(nodes);
  }

  /**
   * Returns the opposite directed edge across the shared primal edge.
   *
   * @param edge - The directed edge to inspect.
   * @returns The opposite edge, or `null` on the hull.
   */
  edgeOpposite(edge: EdgeId): EdgeId | null {
    const opposite = this.#delaunator.halfedges[edge];
    return opposite === -1 ? null : (opposite as EdgeId);
  }

  /**
   * Returns the start tile for a directed edge.
   *
   * @param edge - The directed edge to inspect.
   * @returns The tile at the edge origin.
   */
  edgeStartTile(edge: EdgeId): TileId {
    return this.#delaunator.triangles[edge] as TileId;
  }

  /**
   * Returns the end tile for a directed edge.
   *
   * @param edge - The directed edge to inspect.
   * @returns The tile at the edge destination.
   */
  edgeEndTile(edge: EdgeId): TileId {
    return this.#delaunator.triangles[DualMesh.nextEdge(edge)] as TileId;
  }

  /**
   * Iterates every directed edge in storage order.
   *
   * @returns All directed edges in the mesh.
   */
  *edgeIds(): Generator<EdgeId> {
    for (let edge = 0; edge < this.#delaunator.triangles.length; edge++) {
      yield edge as EdgeId;
    }
  }

  /**
   * Iterates the three tiles incident to a node.
   *
   * @param node - The node to inspect.
   * @returns The node's incident tiles in Delaunator storage order.
   */
  *nodeTiles(node: NodeId): Generator<TileId> {
    const firstEdge = node * TRIANGLE_STRIDE;
    yield this.#delaunator.triangles[firstEdge] as TileId;
    yield this.#delaunator.triangles[firstEdge + 1] as TileId;
    yield this.#delaunator.triangles[firstEdge + 2] as TileId;
  }

  /**
   * Iterates adjacent nodes across each non-hull edge of a node.
   *
   * @param node - The node to inspect.
   * @returns Neighboring nodes in edge order, excluding hull gaps.
   */
  *nodeNeighbors(node: NodeId): Generator<NodeId> {
    for (const edge of DualMesh.nodeEdges(node)) {
      const opposite = this.edgeOpposite(edge);
      if (opposite !== null) {
        yield DualMesh.edgeNode(opposite);
      }
    }
  }
}
