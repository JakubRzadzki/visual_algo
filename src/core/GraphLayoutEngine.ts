import type { GraphNode, GraphEdge, GraphState } from '../types';

/**
 * Physics simulation constants optimized for smooth, precise animation
 * These values balance visual appeal with computational efficiency
 */
const REPULSION = 6000; // Coulomb constant — pushes nodes apart
const ATTRACTION = 0.03; // Hooke constant — pulls connected nodes together
const DAMPING = 0.88; // Velocity decay per tick — improved from 0.85 for better settling
const VELOCITY_THRESHOLD = 0.01; // Stop updating velocity when below this threshold (eliminate jitter)
const MIN_DIST = 30; // Minimum node-to-node distance (avoid singularity)

/**
 * GraphLayoutEngine
 * Pure-TS force-directed physics simulation.
 * Call tick() once per RAF frame to advance positions.
 * No DOM / canvas access — purely mathematical.
 */
export class GraphLayoutEngine {
  private nodes: GraphNode[];
  private edges: GraphEdge[];
  private highlightedEdges: Set<string> = new Set();
  private active = true; // paused when main Engine is playing

  constructor(initialNodes: GraphNode[], initialEdges: GraphEdge[]) {
    this.nodes = initialNodes.map(n => ({ ...n })); // deep copy
    this.edges = initialEdges.map(e => ({ ...e }));
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Advance physics by one frame and return the new state snapshot. */
  public tick(): GraphState {
    if (this.active) {
      this.applyRepulsion();
      this.applyAttraction();
      this.integrateVelocities();
    }
    return this.snapshot();
  }

  /** Highlight a set of edges (called from GraphRenderer on GRAPH_RELAX / GRAPH_EDGE_HIGHLIGHT). */
  public setHighlightedEdges(ids: Set<string>): void {
    this.highlightedEdges = ids;
  }

  /** Pause / resume physics (paused while algorithm playback is active). */
  public setActive(active: boolean): void {
    this.active = active;
  }

  /** Replace graph data (e.g. when user loads a new algorithm). */
  public reset(nodes: GraphNode[], edges: GraphEdge[]): void {
    this.nodes = nodes.map(n => ({ ...n }));
    this.edges = edges.map(e => ({ ...e }));
    this.highlightedEdges.clear();
  }

  // ─── Physics ───────────────────────────────────────────────────────────────

  /** Coulomb repulsion: every node pushes every other node away. */
  private applyRepulsion(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST);
        const force = REPULSION / (dist * dist);

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        // Equal and opposite forces
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }
  }

  /** Hooke spring: edges pull connected nodes towards each other. */
  private applyAttraction(): void {
    const nodeMap: Record<string, GraphNode> = {};
    for (const n of this.nodes) nodeMap[n.id] = n;

    for (const edge of this.edges) {
      const a = nodeMap[edge.from];
      const b = nodeMap[edge.to];
      if (!a || !b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;

      // Hooke: F = k * displacement
      a.vx += dx * ATTRACTION;
      a.vy += dy * ATTRACTION;
      b.vx -= dx * ATTRACTION;
      b.vy -= dy * ATTRACTION;
    }
  }

  /**
   * Integrate velocities into positions with adaptive damping
   * Applies damping and velocity threshold to eliminate jitter
   * Velocities below threshold are zeroed to prevent oscillation
   */
  private integrateVelocities(): void {
    for (const node of this.nodes) {
      node.x += node.vx;
      node.y += node.vy;

      // Apply damping with velocity threshold for smooth settling
      node.vx *= DAMPING;
      node.vy *= DAMPING;

      // Zero out very small velocities to prevent unnecessary oscillation
      if (Math.abs(node.vx) < VELOCITY_THRESHOLD) node.vx = 0;
      if (Math.abs(node.vy) < VELOCITY_THRESHOLD) node.vy = 0;
    }
  }

  /** Return an immutable snapshot of the current state. */
  private snapshot(): GraphState {
    return {
      nodes: this.nodes.map(n => ({ ...n })),
      edges: this.edges.map(e => ({ ...e })),
      highlightedEdges: new Set(this.highlightedEdges),
    };
  }
}
