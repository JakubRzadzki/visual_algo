import type { GraphNode, GraphEdge, VisualizationEvent } from '../types';
import { globalEventBus } from './EventBus';
import { GraphLayoutEngine } from './GraphLayoutEngine';
import { globalEngine, Easing } from './AnimationEngine';

const NODE_RADIUS = 18;
const NODE_COLOR = '#1e3a5f';
const NODE_BORDER = '#7dd3fc';
const LABEL_COLOR = '#e2e8f0';
const EDGE_COLOR = 'rgba(125, 211, 252, 0.25)'; // dim ice-blue
const EDGE_ACTIVE = '#7dd3fc'; // bright on highlight
const EDGE_ACCEPTED = '#34d399'; // green — Kruskal accept
const EDGE_REJECTED = '#f87171'; // red — Kruskal reject
const WEIGHT_COLOR = 'rgba(148, 163, 184, 0.7)';

/**
 * Edge highlight state with smooth opacity transitions
 */
interface EdgeHighlightState {
  type: 'relax' | 'accepted' | 'rejected';
  startTime: number;
  animationId?: string;
  opacity: number; // 0-1 for smooth fade effects
}

/**
 * GraphRenderer
 * Canvas-based renderer for the force-directed graph
 * Subscribes to GlobalEventBus for algorithm events (GRAPH_RELAX, GRAPH_EDGE_HIGHLIGHT)
 * Delegates node positioning to GraphLayoutEngine
 * Uses smooth easing animations for edge highlight transitions
 */
export class GraphRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  private layoutEngine: GraphLayoutEngine;

  // Tracks highlighted edges with smooth opacity transitions
  private edgeHighlights: Map<string, EdgeHighlightState> = new Map();

  private rafId: number | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement, nodes: GraphNode[], edges: GraphEdge[]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;

    // Initialize nodes in a circle layout for stability if they don't have positions
    const seeded = nodes.map((n, idx) => {
      if (n.x && n.y) {
        return { ...n }; // Keep existing positions
      }

      // Circle layout to prevent initial clustering
      const angle = (idx / nodes.length) * Math.PI * 2;
      const radius = Math.min(this.width, this.height) * 0.3;
      const centerX = this.width / 2;
      const centerY = this.height / 2;

      return {
        ...n,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0
      };
    });

    this.layoutEngine = new GraphLayoutEngine(seeded, edges);
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Initialize renderer and subscribe to events
   */
  public init(): void {
    this.unsubscribe = globalEventBus.subscribe(this.handleEvent);
    this.rafId = requestAnimationFrame(this.loop);
  }

  /**
   * Cleanup and unsubscribe
   */
  public destroy(): void {
    if (this.unsubscribe) this.unsubscribe();
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    // Cancel any pending animations
    for (const highlight of this.edgeHighlights.values()) {
      if (highlight.animationId) {
        globalEngine.cancelAnimation(highlight.animationId);
      }
    }
  }

  /**
   * Handle canvas resize
   */
  public resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  /**
   * Pause physics when algorithm playback is running
   */
  public setPhysicsActive(active: boolean): void {
    this.layoutEngine.setActive(active);
  }

  // ─── Event Handling ────────────────────────────────────────────────────────

  /**
   * Handle algorithm events and schedule smooth highlight animations
   */
  private handleEvent = (event: VisualizationEvent): void => {
    if (event.type === 'GRAPH_RELAX') {
      // Dijkstra relaxing an edge — smooth cyan highlight
      this.scheduleHighlightAnimation(event.edgeId, 'relax', 800);
    }

    if (event.type === 'GRAPH_EDGE_HIGHLIGHT') {
      // Kruskal accepting/rejecting — smooth color highlight
      const type = event.accepted ? 'accepted' : 'rejected';
      this.scheduleHighlightAnimation(event.edgeId, type, 1200);
    }
  };

  /**
   * Schedule a smooth highlight animation for an edge
   * Uses easing to fade in, hold briefly, then fade out
   */
  private scheduleHighlightAnimation(
    edgeId: string,
    type: 'relax' | 'accepted' | 'rejected',
    durationMs: number
  ): void {
    // Cancel any existing animation for this edge
    const existing = this.edgeHighlights.get(edgeId);
    if (existing?.animationId) {
      globalEngine.cancelAnimation(existing.animationId);
    }

    // Create highlight state
    const state: EdgeHighlightState = {
      type,
      startTime: performance.now(),
      opacity: 0,
    };

    this.edgeHighlights.set(edgeId, state);

    // Fade in (0-40% of duration), hold (40-60%), fade out (60-100%)
    const animId = globalEngine.scheduleAnimation(
      durationMs,
      (progress: number) => {
        if (progress < 0.4) {
          // Fade in
          state.opacity = Easing.easeOutQuad(progress / 0.4);
        } else if (progress < 0.6) {
          // Hold at full opacity
          state.opacity = 1;
        } else {
          // Fade out
          state.opacity = 1 - Easing.easeOut((progress - 0.6) / 0.4);
        }
      },
      Easing.linear,
      () => {
        // Clean up when animation completes
        this.edgeHighlights.delete(edgeId);
      }
    );

    state.animationId = animId;
  }

  // ─── Render Loop ───────────────────────────────────────────────────────────

  /**
   * Main RAF render loop for smooth graph rendering
   */
  private loop = (): void => {
    const state = this.layoutEngine.tick();
    this.draw(state.nodes, state.edges);
    this.rafId = requestAnimationFrame(this.loop);
  };

  /**
   * Draw the graph with optimized edge and node rendering
   */
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
      const to = pos[edge.to];
      if (!from || !to) continue;

      const highlight = this.edgeHighlights.get(edge.id);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      if (highlight) {
        // Draw edge with smooth opacity-based highlighting
        const opacity = highlight.opacity;

        if (highlight.type === 'accepted') {
          ctx.strokeStyle = this.applyOpacity(EDGE_ACCEPTED, opacity);
          ctx.lineWidth = 1.5 + opacity * 1.5; // Smooth width transition
          ctx.shadowColor = EDGE_ACCEPTED;
          ctx.shadowBlur = 4 + opacity * 8;
        } else if (highlight.type === 'rejected') {
          ctx.strokeStyle = this.applyOpacity(EDGE_REJECTED, opacity);
          ctx.lineWidth = 1.5 + opacity * 0.5;
          ctx.shadowColor = EDGE_REJECTED;
          ctx.shadowBlur = 2 + opacity * 6;
        } else if (highlight.type === 'relax') {
          ctx.strokeStyle = this.applyOpacity(EDGE_ACTIVE, opacity);
          ctx.lineWidth = 1.5 + opacity * 1;
          ctx.shadowColor = EDGE_ACTIVE;
          ctx.shadowBlur = 4 + opacity * 12;
        }
      } else {
        // Default edge appearance
        ctx.strokeStyle = EDGE_COLOR;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
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
      const grad = ctx.createRadialGradient(
        node.x - 5,
        node.y - 5,
        3,
        node.x,
        node.y,
        NODE_RADIUS
      );
      grad.addColorStop(0, '#2d6a9f');
      grad.addColorStop(1, NODE_COLOR);
      ctx.fillStyle = grad;
      ctx.fill();

      // Glowing border
      ctx.strokeStyle = NODE_BORDER;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = NODE_BORDER;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();

      // Node label
      ctx.fillStyle = LABEL_COLOR;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    }
  }

  /**
   * Apply opacity to an RGB/hex color by converting to RGBA
   * Smooth opacity transitions for visual feedback
   */
  private applyOpacity(color: string, opacity: number): string {
    // Convert hex to RGB if needed
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // If already RGBA, replace opacity
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/,  `${opacity})`);
    }
    return color;
  }
}
