/**
 * @file GridStage.tsx
 * @description Premium interactive visualizer stage for pathfinding and grid algorithms.
 *
 * Features a 20x20 responsive grid with draggable start/end points, obstacle painting,
 * real-time HUD metrics (g/h/f scores for A*), and high-fidelity Framer Motion animations.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams } from "react-router-dom";
import { RotateCcw, Trash2, Eye, Navigation, MapPin, Flag } from "lucide-react";
import { globalEventBus } from "../../core/EventBus";
import { useUIStore } from "../../store/uiStore";
import { globalEngine } from "../../core/AnimationEngine";
import { globalWorkerPool } from "../../core/WorkerPool";
import type { VisualizationEvent, GridInput } from "../../types";

type CellState =
  | "empty"
  | "wall"
  | "start"
  | "end"
  | "visited"
  | "path"
  | "active"
  | "flood";

interface GridCell {
  type: CellState;
  gScore?: number;
  hScore?: number;
  fScore?: number;
  parent?: { x: number; y: number };
}

/** Transient cell states produced by playback (cleared on reset / rebuild). */
const DYNAMIC_STATES: ReadonlySet<CellState> = new Set([
  "visited",
  "path",
  "active",
  "flood",
]);

/**
 * Maps an algorithm's highlight color to a visual cell state.
 *  - #eab308 → optimal path (A*)
 *  - #06b6d4 → active expansion wavefront (A*)
 *  - #3b82f6 / #0ea5e9 → flood fill water (FloodFill)
 *  - anything else → generic visited/explored
 */
function highlightTypeForColor(color?: string): CellState {
  switch (color) {
    case "#eab308":
      return "path";
    case "#06b6d4":
      return "active";
    case "#3b82f6":
    case "#0ea5e9":
      return "flood";
    default:
      return "visited";
  }
}

/**
 * GridStage Component
 */
export default function GridStage() {
  const ROWS = 20;
  const COLS = 20;

  // Global State
  const { id: activeAlgorithmId } = useParams<{ id: string }>();
  const isAnimating = useUIStore((state) => state.isAnimating);
  const language = useUIStore((state) => state.language);

  // Local Grid State
  const [grid, setGrid] = useState<GridCell[][]>(() =>
    Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ type: "empty" })),
    ),
  );

  const [startPos, setStartPos] = useState({ x: 2, y: 10 });
  const [endPos, setEndPos] = useState({ x: 17, y: 10 });

  // Interaction State
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<
    "start" | "end" | null
  >(null);
  const [paintMode, setPaintMode] = useState<"wall" | "empty">("wall");

  // Stats HUD State
  const [stats, setStats] = useState({
    visitedCount: 0,
    pathLength: 0,
    currentF: 0,
    currentG: 0,
    currentH: 0,
    activeCoord: null as { x: number; y: number } | null,
  });

  // Initialize start/end
  useEffect(() => {
    setGrid((prev) => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      next[startPos.y][startPos.x].type = "start";
      next[endPos.y][endPos.x].type = "end";
      return next;
    });
  }, [startPos, endPos]);

  // Keep latest references for the worker
  const gridRef = useRef<GridCell[][]>(grid);
  const startPosRef = useRef(startPos);
  const endPosRef = useRef(endPos);
  const runIdRef = useRef(0);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  
  useEffect(() => {
    startPosRef.current = startPos;
  }, [startPos]);
  
  useEffect(() => {
    endPosRef.current = endPos;
  }, [endPos]);

  /**
   * Re-run algorithm on grid/start/end changes
   */
  const triggerAlgorithm = useCallback(async () => {
    if (!activeAlgorithmId) return;

    const currentGrid = gridRef.current;
    const currentStart = startPosRef.current;
    const currentEnd = endPosRef.current;

    const walls: { x: number; y: number }[] = [];
    currentGrid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.type === "wall") walls.push({ x, y });
      });
    });

    const input: GridInput = {
      width: COLS,
      height: ROWS,
      walls,
      start: currentStart,
      target: currentEnd,
    };

    // Publish the grid topology so the source-code editor reflects the
    // painted walls/start/target as `walls = [...]`, `start = (...)`, etc.
    useUIStore.getState().setVisualizationData(input);

    const currentRunId = ++runIdRef.current;

    try {
      const trace = await globalWorkerPool.run(activeAlgorithmId, input);
      if (runIdRef.current === currentRunId) {
        globalEngine.loadTrace(trace);
      }
    } catch (err) {
      console.error("Failed to run grid algorithm:", err);
    }
  }, [activeAlgorithmId]);

  const gridTopologyHash = useMemo(() => {
    const walls: string[] = [];
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.type === "wall") walls.push(`${x},${y}`);
      });
    });
    return `${walls.join(";")} | S:${startPos.x},${startPos.y} | E:${endPos.x},${endPos.y}`;
  }, [grid, startPos, endPos]);

  // Trigger on load or when topology changes
  useEffect(() => {
    if (!isMouseDown) {
      triggerAlgorithm();
    }
  }, [activeAlgorithmId, gridTopologyHash, isMouseDown, triggerAlgorithm]);

  /**
   * Deterministically reconstructs the visual grid state after applying the
   * first `targetStep` trace events. Used when stepping/seeking backwards,
   * where incremental forward mutation cannot be undone.
   */
  const rebuildToStep = useCallback((targetStep: number) => {
    const trace = globalEngine.getTrace();

    let visitedCount = 0;
    let pathLength = 0;
    let activeCoord: { x: number; y: number } | null = null;

    setGrid((prev) => {
      // Start from a clean board, preserving only walls / start / end.
      const next: GridCell[][] = prev.map((row) =>
        row.map((cell): GridCell =>
          DYNAMIC_STATES.has(cell.type)
            ? { type: "empty" }
            : { ...cell, fScore: undefined, gScore: undefined, hScore: undefined },
        ),
      );

      const events = trace?.events ?? [];
      const upTo = Math.max(0, Math.min(targetStep, events.length));
      for (let i = 0; i < upTo; i++) {
        const ev = events[i];
        if (ev.type === "MATRIX_CELL_UPDATE") {
          const cell = next[ev.row][ev.col];
          if (cell.type !== "start" && cell.type !== "end" && cell.type !== "wall") {
            next[ev.row][ev.col] = { ...cell, type: "visited", fScore: ev.value as number };
            visitedCount++;
          }
        } else if (ev.type === "MATRIX_CELL_HIGHLIGHT") {
          const cell = next[ev.row][ev.col];
          if (cell.type !== "start" && cell.type !== "end" && cell.type !== "wall") {
            next[ev.row][ev.col] = { ...cell, type: highlightTypeForColor(ev.color) };
          }
          if (ev.color === "#eab308") pathLength++;
          activeCoord = { x: ev.col, y: ev.row };
        }
      }
      return next;
    });

    setStats((s) => ({ ...s, visitedCount, pathLength, activeCoord }));
  }, []);

  /**
   * Handle Visualization Events
   */
  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe(
      (event: VisualizationEvent) => {
        // Stepping/seeking backwards replays in reverse: rebuild the board from
        // scratch up to the event's own step so the undo is visually correct.
        if (event.isReverse) {
          rebuildToStep(event.step);
          return;
        }

        switch (event.type) {
          case "TRACE_LOADED":
            setGrid((prev) =>
              prev.map((row) =>
                row.map((cell) => {
                  if (DYNAMIC_STATES.has(cell.type)) {
                    return {
                      type: "empty",
                      fScore: undefined,
                      gScore: undefined,
                      hScore: undefined,
                    };
                  }
                  return cell;
                }),
              ),
            );
            setStats({
              visitedCount: 0,
              pathLength: 0,
              currentF: 0,
              currentG: 0,
              currentH: 0,
              activeCoord: null,
            });
            break;

          case "MATRIX_CELL_UPDATE": {
            const { row, col, value, dependencies } = event;
            setGrid((prev) => {
              const next = [...prev];
              next[row] = [...next[row]];
              const cell = next[row][col];
              if (
                cell.type !== "start" &&
                cell.type !== "end" &&
                cell.type !== "wall"
              ) {
                next[row][col] = {
                  ...cell,
                  type: "visited",
                  fScore: value as number,
                  parent: dependencies?.[0]
                    ? { x: dependencies[0][1], y: dependencies[0][0] }
                    : undefined,
                };
              }
              return next;
            });
            setStats((s) => ({ ...s, visitedCount: s.visitedCount + 1 }));
            break;
          }

          case "MATRIX_CELL_HIGHLIGHT": {
            const { row, col, color } = event;
            const nextType = highlightTypeForColor(color);
            setGrid((prev) => {
              const next = [...prev];
              next[row] = [...next[row]];
              const cell = next[row][col];

              if (
                cell.type !== "start" &&
                cell.type !== "end" &&
                cell.type !== "wall"
              ) {
                next[row][col] = { ...cell, type: nextType };
              }
              return next;
            });

            if (color === "#eab308") {
              setStats((s) => ({ ...s, pathLength: s.pathLength + 1 }));
            }

            setStats((s) => ({ ...s, activeCoord: { x: col, y: row } }));
            break;
          }
        }
      },
    );

    return () => unsubscribe();
  }, [rebuildToStep]);

  // Mouse Handlers
  const handleMouseDown = (x: number, y: number) => {
    if (isAnimating) return;
    setIsMouseDown(true);
    if (x === startPos.x && y === startPos.y) {
      setDraggedNodeType("start");
    } else if (x === endPos.x && y === endPos.y) {
      setDraggedNodeType("end");
    } else {
      const isWall = grid[y][x].type === "wall";
      const mode = isWall ? "empty" : "wall";
      setPaintMode(mode);
      updateCell(x, y, mode);
    }
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (!isMouseDown) return;

    if (draggedNodeType === "start") {
      if (grid[y][x].type !== "wall" && (x !== endPos.x || y !== endPos.y)) {
        setStartPos({ x, y });
      }
    } else if (draggedNodeType === "end") {
      if (
        grid[y][x].type !== "wall" &&
        (x !== startPos.x || y !== startPos.y)
      ) {
        setEndPos({ x, y });
      }
    } else {
      updateCell(x, y, paintMode);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setDraggedNodeType(null);
  };

  const updateCell = (x: number, y: number, type: CellState) => {
    if (
      (x === startPos.x && y === startPos.y) ||
      (x === endPos.x && y === endPos.y)
    )
      return;

    setGrid((prev) => {
      const next = [...prev];
      next[y] = [...next[y]];
      next[y][x] = { ...next[y][x], type };
      return next;
    });
  };

  const clearWalls = () => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          cell.type === "wall" ? { ...cell, type: "empty" } : cell,
        ),
      ),
    );
  };

  const resetGrid = () => {
    setGrid(
      Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => ({ type: "empty" })),
      ),
    );
    setStartPos({ x: 2, y: 10 });
    setEndPos({ x: 17, y: 10 });
  };

  return (
    <div
      className="flex-1 w-full h-full flex flex-col p-6 gap-6 bg-[#050810] overflow-hidden select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Top HUD Panel ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Eye size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              {language === "pl" ? "Odwiedzone Komórki" : "Visited Cells"}
            </div>
            <div className="text-xl font-mono text-cyan-500">
              {stats.visitedCount}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Navigation size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              {language === "pl" ? "Długość Ścieżki" : "Path Length"}
            </div>
            <div className="text-xl font-mono text-emerald-500">
              {stats.pathLength}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/10 col-span-1 md:col-span-2 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                {language === "pl" ? "Aktywna Komórka" : "Active Cell"}
              </span>
              <span className="text-lg font-mono text-amber-400">
                {stats.activeCoord
                  ? `(${stats.activeCoord.x}, ${stats.activeCoord.y})`
                  : "N/A"}
              </span>
            </div>
            {activeAlgorithmId === "a-star" && (
              <div className="flex gap-4 border-l border-white/5 pl-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    {language === "pl" ? "koszt f (f-score)" : "f-score"}
                  </span>
                  <span className="text-sm font-mono text-white">
                    {stats.currentF || "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    {language === "pl" ? "koszt g (g-score)" : "g-score"}
                  </span>
                  <span className="text-sm font-mono text-slate-400">
                    {stats.currentG || "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearWalls}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
              title={language === "pl" ? "Wyczyść Ściany" : "Clear Walls"}
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={resetGrid}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
              title={language === "pl" ? "Resetuj Siatkę" : "Reset Grid"}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Grid Stage ── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div
          className="relative bg-slate-900/50 rounded-2xl border border-white/5 shadow-2xl p-4 overflow-hidden"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            aspectRatio: "1 / 1",
            width: "min(100%, 70vh)",
            gap: "2px",
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <GridCellComponent
                key={`${x}-${y}`}
                x={x}
                y={y}
                cell={cell}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
              />
            )),
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex justify-center gap-8 text-[10px] text-slate-500 uppercase font-bold tracking-widest py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span>{language === "pl" ? "Start" : "Start"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          <span>{language === "pl" ? "Cel" : "Target"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-500" />
          <span>{language === "pl" ? "Ściana" : "Wall"}</span>
        </div>
        {activeAlgorithmId === "flood-fill" ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-sky-500/60 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
            <span>{language === "pl" ? "Woda" : "Water"}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-400/50" />
              <span>{language === "pl" ? "Zbadane" : "Explored"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <span>
                {language === "pl" ? "Najkrótsza Ścieżka" : "Shortest Path"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Individual Grid Cell Component
 */
function GridCellComponent({
  x,
  y,
  cell,
  onMouseDown,
  onMouseEnter,
}: {
  x: number;
  y: number;
  cell: GridCell;
  onMouseDown: (x: number, y: number) => void;
  onMouseEnter: (x: number, y: number) => void;
}) {
  const getVariants = () => {
    switch (cell.type) {
      case "visited":
        return {
          initial: { scale: 0.3, borderRadius: "50%", opacity: 0 },
          animate: {
            scale: 1,
            borderRadius: "4px",
            opacity: 1,
            backgroundColor: "rgba(6, 182, 212, 0.3)",
          },
        };
      case "path":
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1, backgroundColor: "#fbbf24" },
        };
      case "active":
        return {
          animate: { scale: [1, 1.2, 1], backgroundColor: "#22d3ee" },
        };
      case "flood":
        // Water spreading outward: ripple-in from the center in oceanic blue.
        return {
          initial: { scale: 0.2, borderRadius: "50%", opacity: 0 },
          animate: {
            scale: 1,
            borderRadius: "4px",
            opacity: 1,
            backgroundColor: "rgba(14, 165, 233, 0.55)",
            boxShadow: "0 0 10px rgba(14, 165, 233, 0.35)",
          },
        };
      default:
        return {};
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      onMouseDown={() => onMouseDown(x, y)}
      onMouseEnter={() => onMouseEnter(x, y)}
      className={`
        w-full h-full rounded-xs transition-all duration-300 relative cursor-crosshair
        ${cell.type === "empty" ? "bg-white/2 hover:bg-white/8" : ""}
        ${cell.type === "wall" ? "bg-slate-700 shadow-inner" : ""}
        ${cell.type === "start" ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20 cursor-grab active:cursor-grabbing" : ""}
        ${cell.type === "end" ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] z-20 cursor-grab active:cursor-grabbing" : ""}
      `}
      layout
    >
      <AnimatePresence mode="wait">
        {(cell.type === "visited" ||
          cell.type === "path" ||
          cell.type === "active" ||
          cell.type === "flood") && (
          <motion.div
            key={cell.type}
            initial={variants.initial}
            animate={variants.animate}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 rounded-xs"
            style={{ zIndex: cell.type === "path" ? 10 : 5 }}
          />
        )}
      </AnimatePresence>

      {/* Start/End Icons */}
      {cell.type === "start" && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <MapPin size={12} fill="currentColor" />
        </div>
      )}
      {cell.type === "end" && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <Flag size={12} fill="currentColor" />
        </div>
      )}
    </motion.div>
  );
}
