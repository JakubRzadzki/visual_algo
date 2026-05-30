/**
 * NativeGraphStage.tsx — Pure SVG + Framer Motion Graph Rendering Engine
 *
 * Replaces Cytoscape.js for full control over animations and the
 * "Glacier Glassmorphism" aesthetic. View-only — no node dragging.
 *
 * Architecture
 * ────────────
 *  • SVG viewBox 800×600 with hardcoded template coordinates
 *  • Framer Motion for smooth node/edge transitions
 *  • EventBus subscription bypasses React re-render cycle:
 *      – ANIMATION_FRAME / SYSTEM_PLAYBACK_STATE are SKIPPED
 *      – Only graph-specific events trigger setState
 *  • Glacier Glassmorphism via SVG <filter> glow + dark palette
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { useParams } from "react-router-dom";
import { globalEventBus } from "../../core/EventBus";
import { globalEngine } from "../../core/AnimationEngine";
import { useUIStore } from "../../store/uiStore";
import { translateGraphDescription } from "../../sorting/utils/translationHelper";
import type {
  GraphInput,
  GraphNode,
  GraphEdge,
  VisualizationEvent,
} from "../../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_RADIUS = 22;
const SVG_W = 800;
const SVG_H = 600;

/** Glacier Glassmorphism palette */
const C = {
  // Base
  nodeFill: "#0f172a",
  nodeStroke: "#334155",
  edgeStroke: "#334155",
  edgeStrokeLight: "#475569",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  weightBg: "rgba(15,23,42,0.85)",
  // Highlights
  violet: "rgba(139,92,246,0.4)",
  violetStroke: "#a78bfa",
  cyan: "#06b6d4",
  green: "#22c55e",
  greenLight: "#34d399",
  blue: "#3b82f6",
  blueLight: "#60a5fa",
  yellow: "#facc15",
  yellowLight: "#fde047",
  pink: "#ec4899",
  pinkLight: "#f472b6",
  purple: "#a855f7",
  purpleLight: "#c084fc",
  red: "#ef4444",
  white: "#e2e8f0",
} as const;

/** Arrowhead marker variants keyed by semantic name */
const ARROW_VARIANTS: { key: string; fill: string }[] = [
  { key: "default", fill: C.edgeStrokeLight },
  { key: "highlight", fill: C.white },
  { key: "cyan", fill: C.cyan },
  { key: "green", fill: C.green },
  { key: "red", fill: C.red },
];

// ─── Visual State Types ───────────────────────────────────────────────────────

interface NodeVis {
  fill: string;
  stroke: string;
  scale: number;
  status: string;
}
interface EdgeVis {
  stroke: string;
  strokeWidth: number;
  isPath: boolean;
  labelScale: number;
  markerKey: string;
}

const mkNode = (): NodeVis => ({
  fill: C.nodeFill,
  stroke: C.nodeStroke,
  scale: 1,
  status: "default",
});

const mkEdge = (): EdgeVis => ({
  stroke: C.edgeStroke,
  strokeWidth: 2,
  isPath: false,
  labelScale: 1,
  markerKey: "default",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map the full algorithm name from Zustand store to a template key. */
function resolveAlgoId(url: string | undefined, storeName: string): string {
  if (url) return url;
  const s = storeName.toLowerCase();
  if (s.includes("dijkstra")) return "dijkstra";
  if (s.includes("kruskal")) return "kruskal";
  if (s.includes("prim")) return "prim";
  if (s.includes("breadth") || s === "bfs") return "bfs";
  if (s.includes("depth") || s === "dfs") return "dfs";
  if (s.includes("topo")) return "topo-sort";
  return "dijkstra";
}

/**
 * Shorten a line at both ends by `r` so edges don't overlap node circles.
 * Extra 4 px gap at the target for a clean arrowhead landing.
 */
function endpoints(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  r: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { x1: sx, y1: sy, x2: tx, y2: ty };
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: sx + ux * r,
    y1: sy + uy * r,
    x2: tx - ux * (r + 4),
    y2: ty - uy * (r + 4),
  };
}

/** Events relevant to this stage (everything else is skipped). */
const RELEVANT = new Set([
  "TRACE_LOADED",
  "SYSTEM_LOG",
  "GRAPH_NODE_HIGHLIGHT",
  "GRAPH_EDGE_HIGHLIGHT",
  "GRAPH_RELAX",
  "GRAPH_NODE_ADD",
  "GRAPH_EDGE_ADD",
  "GRAPH_NODE_MOVE",
  "GRAPH_EDGE_REMOVE",
]);

// ─── Component ────────────────────────────────────────────────────────────────

export default function NativeGraphStage({ graph }: { graph: GraphInput }) {
  /* ── Routing & store ── */
  const params = useParams<{ algoId?: string; id?: string }>();
  const activeGraphAlgorithm = useUIStore((s) => s.activeGraphAlgorithm);
  const language = useUIStore((s) => s.language);

  const activeAlgo = resolveAlgoId(
    params.algoId ?? params.id,
    activeGraphAlgorithm,
  );
  const isDirected = graph.isDirected !== false;
  const showWeights = ["dijkstra", "kruskal", "prim"].includes(activeAlgo);


  /* ── Visual state (only mutated on graph events → no 60 fps churn) ── */
  const [nodeVis, setNodeVis] = useState<Map<string, NodeVis>>(() => new Map());
  const [edgeVis, setEdgeVis] = useState<Map<string, EdgeVis>>(() => new Map());
  const [hiddenN, setHiddenN] = useState<Set<string>>(() => new Set());
  const [hiddenE, setHiddenE] = useState<Set<string>>(() => new Set());
  const [popCnt, setPopCnt] = useState<Map<string, number>>(() => new Map());
  const [dynNodes, setDynNodes] = useState<Map<string, GraphNode>>(() => new Map());
  const [dynEdges, setDynEdges] = useState<Map<string, GraphEdge>>(() => new Map());

  /* ── Algorithm sidebar state ── */
  const [algo, setAlgo] = useState({
    dist: {} as Record<string, number>,
    indeg: {} as Record<string, number>,
    queue: [] as string[],
    mst: [] as string[],
    msg: "",
  });

  /* ── Refs for stable callbacks ── */
  const gRef = useRef(graph);
  gRef.current = graph;
  const algoRef = useRef(activeAlgo);
  algoRef.current = activeAlgo;
  const timers = useRef<Map<string, number>>(new Map());

  /* ── Reset ── */
  const reset = useCallback(() => {
    setNodeVis(new Map());
    setEdgeVis(new Map());
    setPopCnt(new Map());

    const hn = new Set<string>();
    const he = new Set<string>();
    const dn = new Map<string, GraphNode>();
    const de = new Map<string, GraphEdge>();
    for (const n of gRef.current.nodes) {
      if (n.hidden) hn.add(n.id);
      dn.set(n.id, { ...n });
    }
    for (const e of gRef.current.edges) {
      if (e.hidden) he.add(e.id);
      de.set(e.id, { ...e });
    }
    setHiddenN(hn);
    setHiddenE(he);
    setDynNodes(dn);
    setDynEdges(de);

    const g = gRef.current;
    const d: Record<string, number> = {};
    const ind: Record<string, number> = {};
    for (const n of g.nodes) {
      d[n.id] = Infinity;
      ind[n.id] = 0;
    }
    for (const e of g.edges) ind[e.to] = (ind[e.to] || 0) + 1;
    setAlgo({ dist: d, indeg: ind, queue: [], mst: [], msg: "" });

    timers.current.forEach((id) => clearTimeout(id));
    timers.current.clear();
  }, []);

  /* ── Reset on graph swap ── */
  useEffect(() => {
    reset();
  }, [graph, reset]);

  /* ── Sidebar state rebuild (replays trace) ── */
  const rebuild = useCallback((events: VisualizationEvent[]) => {
    const g = gRef.current;
    const a = algoRef.current;
    const d: Record<string, number> = {};
    const ind: Record<string, number> = {};
    let q: string[] = [];
    const mst: string[] = [];
    let msg = "";

    for (const n of g.nodes) {
      d[n.id] = Infinity;
      ind[n.id] = 0;
    }
    for (const edge of g.edges) ind[edge.to] = (ind[edge.to] || 0) + 1;

    for (const ev of events) {
      if (ev.type === "SYSTEM_LOG") {
        msg = ev.message;
      } else if (ev.type === "GRAPH_NODE_HIGHLIGHT") {
        if (a === "bfs" || a === "dfs") {
          if (!q.includes(ev.nodeId)) q.push(ev.nodeId);
        }
        if (ev.distance !== undefined) d[ev.nodeId] = ev.distance;
      } else if (ev.type === "GRAPH_EDGE_HIGHLIGHT") {
        if (ev.accepted) {
          if (!mst.includes(ev.edgeId)) mst.push(ev.edgeId);
          const edge = g.edges.find((e) => e.id === ev.edgeId);
          if (edge) {
            ind[edge.to] = Math.max(0, (ind[edge.to] || 1) - 1);
            if (a === "bfs" || a === "dfs") q = q.filter((x) => x !== edge.from);
          }
        }
      } else if (ev.type === "GRAPH_RELAX") {
        if (!mst.includes(ev.edgeId)) mst.push(ev.edgeId);
        const edge = g.edges.find((e) => e.id === ev.edgeId);
        if (edge) d[edge.to] = ev.weight;
      }
    }
    setAlgo({ dist: d, indeg: ind, queue: q, mst, msg });
  }, []);

  /* ── EventBus subscription ── */
  useEffect(() => {
    const unsub = globalEventBus.subscribe((ev: VisualizationEvent) => {
      if (!RELEVANT.has(ev.type)) return; // ← skip ANIMATION_FRAME etc.

      // Always rebuild sidebar from trace so scrubbing stays in sync
      const trace = globalEngine.getTrace();
      if (trace) rebuild(trace.events.slice(0, ev.step + 1));

      // ── TRACE_LOADED → full reset ─────────────────────────────────────
      if (ev.type === "TRACE_LOADED") {
        reset();
        return;
      }

      // ── Reverse events → revert to default ────────────────────────────
      if (ev.isReverse) {
        if (ev.type === "GRAPH_NODE_HIGHLIGHT") {
          setNodeVis((p) => {
            const m = new Map(p);
            m.delete(ev.nodeId);
            return m;
          });
        } else if (
          ev.type === "GRAPH_EDGE_HIGHLIGHT" ||
          ev.type === "GRAPH_RELAX"
        ) {
          setEdgeVis((p) => {
            const m = new Map(p);
            m.delete(ev.edgeId);
            return m;
          });
        } else if (ev.type === "GRAPH_NODE_ADD") {
          setHiddenN((p) => new Set([...p, ev.nodeId]));
          // We can't perfectly undo add without knowing previous state, but hiding is usually enough
        } else if (ev.type === "GRAPH_EDGE_ADD") {
          setHiddenE((p) => new Set([...p, ev.edgeId]));
          // same
        } else if (ev.type === "GRAPH_NODE_MOVE") {
          // Can't perfectly undo move without history
        } else if (ev.type === "GRAPH_EDGE_REMOVE") {
          setHiddenE((p) => {
            const s = new Set(p);
            s.delete(ev.edgeId);
            return s;
          });
        }
        return;
      }

      // ── Forward: NODE_HIGHLIGHT ────────────────────────────────────────
      if (ev.type === "GRAPH_NODE_HIGHLIGHT") {
        let v: NodeVis;
        switch (ev.status) {
          case "start":
            v = { fill: C.green, stroke: C.greenLight, scale: 1.1, status: "start" };
            break;
          case "current":
            v = { fill: C.yellow, stroke: C.yellowLight, scale: 1.2, status: "current" };
            break;
          case "queued":
            v = { fill: C.purple, stroke: C.purpleLight, scale: 1.05, status: "queued" };
            break;
          case "visited":
            v = { fill: C.blue, stroke: C.blueLight, scale: 1, status: "visited" };
            break;
          case "path":
            v = { fill: C.pink, stroke: C.pinkLight, scale: 1.2, status: "path" };
            break;
          case "red":
            v = { fill: "rgba(239, 68, 68, 0.3)", stroke: "#ef4444", scale: 1, status: "red" };
            break;
          case "black":
            v = { fill: "#0f172a", stroke: "#475569", scale: 1, status: "black" };
            break;
          case "finished":
            v = { fill: C.nodeFill, stroke: "#06b6d4", scale: 1.1, status: "finished" };
            break;
          default:
            v = { fill: C.violet, stroke: C.violetStroke, scale: 1.2, status: "highlight" };
        }
        setNodeVis((p) => new Map(p).set(ev.nodeId, v));
      }

      // ── Forward: EDGE_HIGHLIGHT ────────────────────────────────────────
      else if (ev.type === "GRAPH_EDGE_HIGHLIGHT") {
        let vis: EdgeVis;
        let permanent = false;

        if (ev.status === "path") {
          vis = { stroke: C.cyan, strokeWidth: 6, isPath: true, labelScale: 1.15, markerKey: "cyan" };
          permanent = true;
        } else if (ev.status === "backtrack") {
          vis = { stroke: C.red, strokeWidth: 3, isPath: false, labelScale: 1, markerKey: "red" };
        } else if (ev.accepted) {
          vis = { stroke: C.green, strokeWidth: 3, isPath: false, labelScale: 1.1, markerKey: "green" };
          permanent = true;
        } else {
          vis = { stroke: C.white, strokeWidth: 4, isPath: false, labelScale: 1.15, markerKey: "highlight" };
        }

        setEdgeVis((p) => new Map(p).set(ev.edgeId, vis));

        if (!permanent) {
          const prev = timers.current.get(ev.edgeId);
          if (prev !== undefined) clearTimeout(prev);
          const tid = window.setTimeout(() => {
            setEdgeVis((p) => {
              const m = new Map(p);
              m.delete(ev.edgeId);
              return m;
            });
            timers.current.delete(ev.edgeId);
          }, 500);
          timers.current.set(ev.edgeId, tid);
        }
      }

      // ── Forward: RELAX ─────────────────────────────────────────────────
      else if (ev.type === "GRAPH_RELAX") {
        setEdgeVis((p) =>
          new Map(p).set(ev.edgeId, {
            stroke: C.cyan,
            strokeWidth: 3,
            isPath: false,
            labelScale: 1.15,
            markerKey: "cyan",
          }),
        );
        const edge = gRef.current.edges.find((e) => e.id === ev.edgeId);
        if (edge) {
          setPopCnt((p) => new Map(p).set(edge.to, (p.get(edge.to) || 0) + 1));
        }
      }

      // ── Forward: NODE/EDGE ADD / REMOVE / MOVE ─────────────────────────
      else if (ev.type === "GRAPH_NODE_ADD") {
        setDynNodes((p) => {
          const m = new Map(p);
          if (!m.has(ev.nodeId)) {
            m.set(ev.nodeId, { id: ev.nodeId, label: ev.label ?? ev.nodeId, x: 0, y: 0, vx: 0, vy: 0 });
          }
          return m;
        });
        setHiddenN((p) => {
          const s = new Set(p);
          s.delete(ev.nodeId);
          return s;
        });
      } else if (ev.type === "GRAPH_EDGE_ADD") {
        setDynEdges((p) => {
          const m = new Map(p);
          m.set(ev.edgeId, { id: ev.edgeId, from: ev.from, to: ev.to, weight: ev.weight ?? 0 });
          return m;
        });
        setHiddenE((p) => {
          const s = new Set(p);
          s.delete(ev.edgeId);
          return s;
        });
      } else if (ev.type === "GRAPH_NODE_MOVE") {
        setDynNodes((p) => {
          const m = new Map(p);
          const n = m.get(ev.nodeId);
          if (n) m.set(ev.nodeId, { ...n, x: ev.x, y: ev.y });
          return m;
        });
      } else if (ev.type === "GRAPH_EDGE_REMOVE") {
        setHiddenE((p) => {
          const s = new Set(p);
          s.add(ev.edgeId);
          return s;
        });
      }
    });

    return () => {
      timers.current.forEach((id) => clearTimeout(id));
      timers.current.clear();
      unsub();
    };
  }, [rebuild, reset]);

  // ═══════════════════════════════════════════════════════════════════════════
  // JSX
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full h-full flex select-none">
      {/* ─── SVG Canvas ──────────────────────────────────────────────── */}
      <div className="flex-1 h-full min-w-0 relative">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          className="bg-[#030712]"
        >
          {/* ── Definitions ── */}
          <defs>
            {/* Glass-orb glow filter */}
            <filter
              id="node-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="4"
                result="blur"
              />
              <feFlood
                floodColor="#38bdf8"
                floodOpacity="0.35"
                result="color"
              />
              <feComposite
                in="color"
                in2="blur"
                operator="in"
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arrowhead markers — one per color variant */}
            {ARROW_VARIANTS.map((v) => (
              <marker
                key={v.key}
                id={`arrow-${v.key}`}
                markerWidth="10"
                markerHeight="8"
                refX="10"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L10,4 L0,8 Z" fill={v.fill} />
              </marker>
            ))}
          </defs>

          {/* ── Edges layer (rendered BELOW nodes) ── */}
          <g>
            {Array.from(dynEdges.values()).map((edge) => {
              if (hiddenE.has(edge.id)) return null;
              const src = dynNodes.get(edge.from);
              const tgt = dynNodes.get(edge.to);
              if (!src || !tgt) return null;

              const vis = edgeVis.get(edge.id) ?? mkEdge();
              const isTrie = activeAlgo === "trie";
              const radius = isTrie ? 16 : NODE_RADIUS;
              const ep = endpoints(src.x, src.y, tgt.x, tgt.y, radius);
              const mx = (src.x + tgt.x) / 2;
              const my = (src.y + tgt.y) / 2;

              const marker = isDirected
                ? `url(#arrow-${vis.markerKey})`
                : undefined;

              return (
                <g key={edge.id}>
                  {/* Edge line */}
                  <motion.line
                    initial={{ x1: ep.x1, y1: ep.y1, x2: ep.x2, y2: ep.y2 }}
                    animate={{
                      x1: ep.x1,
                      y1: ep.y1,
                      x2: ep.x2,
                      y2: ep.y2,
                      stroke: vis.stroke,
                      strokeWidth: vis.strokeWidth,
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 14 }}
                    markerEnd={marker}
                    strokeLinecap="round"
                    className={vis.isPath ? "edge-flow-anim" : undefined}
                    opacity={vis.isPath ? 1 : 0.7}
                  />

                  {/* Weight label */}
                  {showWeights && (
                    <motion.g
                      animate={{ scale: vis.labelScale }}
                      transition={{ duration: 0.15 }}
                      style={{ transformOrigin: `${mx}px ${my}px` }}
                    >
                      <rect
                        x={-14}
                        y={-10}
                        width={28}
                        height={20}
                        rx={4}
                        fill={C.weightBg}
                        stroke="rgba(71,85,105,0.3)"
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill={C.textSecondary}
                        fontSize={11}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {edge.weight}
                      </text>
                    </motion.g>
                  )}
                </g>
              );
            })}
          </g>

          {/* ── Distance / In-Degree badges ── */}
          <g>
            {Array.from(dynNodes.values()).map((node) => {
              if (hiddenN.has(node.id)) return null;
              let txt = "";
              if (activeAlgo === "dijkstra") {
                const d = algo.dist[node.id];
                txt = `d: ${d === Infinity || d === undefined ? "∞" : d}`;
              } else if (activeAlgo === "topo-sort") {
                txt = `in: ${algo.indeg[node.id] ?? 0}`;
              }
              if (!txt) return null;

              const pop = popCnt.get(node.id) ?? 0;
              return (
                  <motion.g
                    animate={{ x: node.x, y: node.y + 40, scale: pop > 0 ? [1, 1.5, 1] : 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 14 }}
                    style={{ transformOrigin: "0px 0px" }}
                  >
                    <rect
                      x={-24}
                      y={-10}
                      width={48}
                      height={18}
                      rx={4}
                      fill="rgba(15,23,42,0.75)"
                      stroke="rgba(6,182,212,0.2)"
                      strokeWidth={1}
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill={C.cyan}
                      fontSize={10}
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {txt}
                    </text>
                  </motion.g>
              );
            })}
          </g>

          {/* ── Nodes layer ── */}
          <g>
            {Array.from(dynNodes.values()).map((node) => {
              if (hiddenN.has(node.id)) return null;
              const vis = nodeVis.get(node.id) ?? mkNode();
              const isTrie = activeAlgo === "trie";
              const radius = isTrie ? 16 : NODE_RADIUS;
              
              const isFinished = vis.status === "finished";
              const strokeColor = isFinished ? "#06b6d4" : vis.stroke;
              const strokeW = isFinished ? 4 : 2.5;

              return (
                <motion.g
                  key={node.id}
                  initial={{ x: node.x, y: node.y, scale: 0 }}
                  animate={{ x: node.x, y: node.y, scale: vis.scale }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 14,
                  }}
                  style={{ transformOrigin: "0px 0px" }}
                >
                  {/* Glow circle (filter) */}
                  <motion.circle
                    cx={0}
                    cy={0}
                    r={radius}
                    filter={vis.status === "black" ? undefined : "url(#node-glow)"}
                    animate={{
                      fill: vis.fill,
                      stroke: strokeColor,
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    strokeWidth={strokeW}
                  />
                  {/* Label */}
                  <text
                    x={0}
                    y={isTrie ? 0 : 5}
                    textAnchor="middle"
                    dominantBaseline={isTrie ? "central" : "auto"}
                    fill={C.textPrimary}
                    fontSize={isTrie ? 18 : 14}
                    fontFamily="monospace"
                    fontWeight="bold"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {node.label}
                  </text>
                </motion.g>
              );
            })}
          </g>
        </svg>

        {/* ── Legend overlay ── */}
        <div className="absolute bottom-4 left-4 glass-panel px-4 py-3 rounded-xl text-[10px] sm:text-xs space-y-1 bg-slate-900/40 backdrop-blur-md border border-white/10 text-slate-400 z-20">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-[#334155]"
              style={{ background: "#0f172a" }}
            />
            <span>{language === "pl" ? "Wierzchołek" : "Node"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>{language === "pl" ? "Odwiedzony" : "Visited"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>
              {language === "pl" ? "Ścieżka / MST" : "Path / MST"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-slate-600" />
            <span>{language === "pl" ? "Waga Krawędzi" : "Edge Weight"}</span>
          </div>
        </div>
      </div>

      {/* ─── Algorithm State Sidebar ─────────────────────────────────── */}
      <div className="w-64 h-full border-l border-white/10 p-3 sm:p-4 flex flex-col gap-4 bg-[#0a0f1d]/70 backdrop-blur overflow-y-auto select-none z-10 text-slate-200">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {language === "pl" ? "Stan Algorytmu" : "Algorithm State"}
        </h4>

        {/* System message */}
        {algo.msg && (
          <div className="bg-ice-blue/10 border border-ice-blue/25 rounded-xl p-3 text-xs text-slate-300 font-medium leading-relaxed">
            {translateGraphDescription(algo.msg, language)}
          </div>
        )}

        {/* ── Dijkstra distances ── */}
        {activeAlgo === "dijkstra" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">
              {language === "pl" ? "Szacowane Odległości" : "Tentative Distances"}
            </label>
            <div className="flex flex-col gap-1.5">
              {graph.nodes.map((n) => {
                const d = algo.dist[n.id];
                const val = d === Infinity || d === undefined ? "∞" : d;
                return (
                  <div
                    key={n.id}
                    className="flex justify-between items-center text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg"
                  >
                    <span className="font-mono text-slate-400">
                      {language === "pl"
                        ? `Wierzchołek ${n.label || n.id}`
                        : `Node ${n.label || n.id}`}
                    </span>
                    <span className="font-bold text-ice-blue">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BFS / DFS queue/stack ── */}
        {(activeAlgo === "bfs" || activeAlgo === "dfs") && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">
              {activeAlgo === "bfs"
                ? language === "pl"
                  ? "Bufor Kolejki"
                  : "Queue Buffer"
                : language === "pl"
                  ? "Bufor Stosu"
                  : "Stack Buffer"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {algo.queue.length > 0 ? (
                algo.queue.map((id) => {
                  const lbl =
                    graph.nodes.find((n) => n.id === id)?.label || id;
                  return (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs border border-purple-500/30"
                    >
                      {lbl}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-500 italic">
                  {language === "pl" ? "Pusty" : "Empty"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Kruskal / Prim MST edges ── */}
        {(activeAlgo === "kruskal" || activeAlgo === "prim") && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">
              {language === "pl"
                ? "Wybrane Krawędzie MST"
                : "MST Selected Edges"}
            </label>
            <div className="flex flex-col gap-1.5">
              {algo.mst.length > 0 ? (
                algo.mst.map((id) => {
                  const edge = graph.edges.find((e) => e.id === id);
                  if (!edge) return null;
                  const u =
                    graph.nodes.find((n) => n.id === edge.from)?.label ??
                    edge.from;
                  const v =
                    graph.nodes.find((n) => n.id === edge.to)?.label ??
                    edge.to;
                  return (
                    <div
                      key={id}
                      className="flex justify-between items-center text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg"
                    >
                      <span className="text-slate-300">
                        {u} ↔ {v}
                      </span>
                      <span className="font-bold text-emerald-400">
                        wt: {edge.weight}
                      </span>
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-slate-500 italic font-mono">
                  {language === "pl" ? "Brak krawędzi MST" : "No MST edges"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Topo Sort in-degrees ── */}
        {activeAlgo === "topo-sort" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">
              {language === "pl"
                ? "Stopnie wejściowe (In-Degrees)"
                : "In-Degrees"}
            </label>
            <div className="flex flex-col gap-1.5">
              {graph.nodes.map((n) => (
                <div
                  key={n.id}
                  className="flex justify-between items-center text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg"
                >
                  <span className="font-mono text-slate-400">
                    {language === "pl"
                      ? `Wierzchołek ${n.label || n.id}`
                      : `Node ${n.label || n.id}`}
                  </span>
                  <span className="font-bold text-amber-400">
                    {algo.indeg[n.id] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
