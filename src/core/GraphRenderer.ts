import type { GraphNode, GraphEdge, VisualizationEvent } from '../types';
import { globalEventBus } from './EventBus';
import { GraphLayoutEngine } from './GraphLayoutEngine';

const NODE_RADIUS     = 18;
const NODE_COLOR      = '#1e3a5f';
const NODE_BORDER     = '#7dd3fc';
const LABEL_COLOR     = '#e2e8f0';
const EDGE_COLOR      = 'rgba(125, 211, 252, 0.25)';  // dim ice-blue
const EDGE_ACTIVE     = '#7dd3fc';                      // bright on highlight
const EDGE_ACCEPTED   = '#34d399';                      // green — Kruskal accept
const EDGE_REJECTED   = '#f87171';                      // red — Kruskal reject
const WEIGHT_COLOR    = 'rgba(148, 163, 184, 0.7)';

/**
 * GraphRenderer
 * Canvas-based renderer for the force-directed graph.
 * Subscribes to GlobalEventBus for algorithm events (GRAPH_RELAX, GRAPH_EDGE_HIGHLIGHT).
 * Delegates node positioning to GraphLayoutEngine.
 */
export class GraphRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  private layoutEngine: GraphLayoutEngine;

  // Tracks highlighted edges with their colour intent
  private edgeHighlights: Map<string, 'relax' | 'accepted' | 'rejected'> = new Map();

  private rafId: number | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement, nodes: GraphNode[], edges: GraphEdge[]) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d')!;
    this.width    = canvas.width;
    this.height   = canvas.height;

    // Scatter nodes randomly inside canvas if they have no position yet
    const seeded = nodes.map((n, i) => ({
      ...n,
      x: n.x || (100 + Math.random() * (this.width  - 200)),
      y: n.y || (100 + Math.random() * (this.height - 200)),
    }));

    this.layoutEngine = new GraphLayoutEngine(seeded, edges);
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  public init(): void {
    // Subscribe to algorithm events from the EventBus
    this.unsubscribe = globalEventBus.subscribe(this.handleEvent);
    this.rafId = requestAnimationFrame(this.loop);
  }

  public destroy(): void {
    if (this.unsubscribe) this.unsubscribe();
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  public resize(w: number, h: number): void {
    this.width  = w;
    this.height = h;
    this.canvas.width  = w;
    this.canvas.height = h;
  }

  /** Pause physics when main algorithm playback is running. */
  public setPhysicsActive(active: boolean): void {
    this.layoutEngine.setActive(active);
  }

  // ─── Event Handling ────────────────────────────────────────────────────────

  private handleEvent = (event: VisualizationEvent): void => {
    if (event.type === 'GRAPH_RELAX') {
      // Dijkstra relaxing an edge — flash cyan
      this.edgeHighlights.set(event.edgeId, 'relax');

      // Clear the highlight after a short visual dwell
      setTimeout(() => this.edgeHighlights.delete(event.edgeId), 800);
    }

    if (event.type === 'GRAPH_EDGE_HIGHLIGHT') {
      // Kruskal accepting/rejecting — keep colour until next event clears it
      this.edgeHighlights.set(event.edgeId, event.accepted ? 'accepted' : 'rejected');
      setTimeout(() => this.edgeHighlights.delete(event.edgeId), 1200);
    }
  };

  // ─── Render Loop ───────────────────────────────────────────────────────────

  private loop = (): void => {
    const state = this.layoutEngine.tick();
    this.draw(state.nodes, state.edges);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private draw(nodes: GraphNode[], edges: GraphEdge[]): void {
    const { ctx, width, height } = this;

    // Clear frame
    ctx.clearRect(0, 0, width, height);

    // Build a quick id→position lookup for edge drawing
    const pos: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) pos[n.id] = { x: n.x, y: n.y };

    // ── Edges ──────────────────────────────────────────────────────────────
    for (const edge of edges) {
      const from = pos[edge.from];
      const to   = pos[edge.to];
      if (!from || !to) continue;

      const highlight = this.edgeHighlights.get(edge.id);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x,   to.y);

      if (highlight === 'accepted') {
        ctx.strokeStyle = EDGE_ACCEPTED;
        ctx.lineWidth   = 3;
        ctx.shadowColor = EDGE_ACCEPTED;
        ctx.shadowBlur  = 12;
      } else if (highlight === 'rejected') {
        ctx.strokeStyle = EDGE_REJECTED;
        ctx.lineWidth   = 2;
        ctx.shadowColor = EDGE_REJECTED;
        ctx.shadowBlur  = 8;
      } else if (highlight === 'relax') {
        ctx.strokeStyle = EDGE_ACTIVE;
        ctx.lineWidth   = 2.5;
        ctx.shadowColor = EDGE_ACTIVE;
        ctx.shadowBlur  = 16;
      } else {
        ctx.strokeStyle = EDGE_COLOR;
        ctx.lineWidth   = 1.5;
        ctx.shadowBlur  = 0;
      }

      ctx.stroke();
      ctx.restore();

      // Draw edge weight label at midpoint
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      ctx.fillStyle = WEIGHT_COLOR;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(edge.weight), mx, my - 4);
    }

    // ── Nodes ──────────────────────────────────────────────────────────────
    for (const node of nodes) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);

      // Gradient fill for depth effect
      const grad = ctx.createRadialGradient(node.x - 5, node.y - 5, 3, node.x, node.y, NODE_RADIUS);
      grad.addColorStop(0, '#2d6a9f');
      grad.addColorStop(1, NODE_COLOR);
      ctx.fillStyle = grad;
      ctx.fill();

      // Glowing border
      ctx.strokeStyle = NODE_BORDER;
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = NODE_BORDER;
      ctx.shadowBlur  = 8;
      ctx.stroke();
      ctx.restore();

      // Node label
      ctx.fillStyle   = LABEL_COLOR;
      ctx.font        = 'bold 12px Inter, sans-serif';
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    }
  }
}
