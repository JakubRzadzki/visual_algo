/**
 * @file MatrixStage.tsx
 * @description Premium visualizer stage for Dynamic Programming (DP) algorithms.
 *
 * Renders an interactive 2D table equipped with real-time HUD calculation dashboards,
 * dynamic subproblem formulas, highlighted coordinate intersections, and curved Bezier SVG
 * dependency links. Achieves state-of-the-art educational efficacy by clarifying precisely
 * how optimal solutions are constructed frame-by-frame.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { globalEventBus } from '../../core/EventBus';
import { useUIStore } from '../../store/uiStore';
import type { VisualizationEvent } from '../../types';

/**
 * Represents the state of a single cell in the DP matrix.
 */
interface CellState {
  /** Numerical value evaluated at this subproblem state. */
  value: number | null;
  /** True if the cell is currently evaluated or updated in the active event frame. */
  highlighted: boolean;
  /** Accent color associated with the target evaluation step. */
  color: string;
  /** True if this cell serves as a direct source dependency for the active evaluation. */
  isDependency: boolean;
}

/**
 * Renders an educational HUD panel that displays real-time mathematical formulas
 * and decision rationale for the active DP subproblem calculation.
 *
 * @param props - Component parameters containing the active cell coordinates, headers, and matrix states.
 */
function FormulaHUDPanel({
  algoName,
  activeCell,
  rowHeaders,
  colHeaders,
  cells,
}: {
  algoName: string;
  activeCell: [number, number] | null;
  rowHeaders: string[];
  colHeaders: string[];
  cells: CellState[][];
}) {
  if (!activeCell) {
    return (
      <div className="w-full glass-panel px-6 py-4 rounded-xl border border-ice-blue/10 flex items-center justify-between text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500/40 animate-pulse" />
          <span>Algorithm standby: awaiting frame step trigger...</span>
        </div>
        <span className="font-mono text-[10px] bg-white/5 px-2 py-1 rounded text-slate-500">
          {algoName}
        </span>
      </div>
    );
  }

  const [r, c] = activeCell;
  const isKnapsack = algoName.toLowerCase().includes('knapsack');
  const isLCS = algoName.toLowerCase().includes('subsequence') || algoName.toLowerCase().includes('lcs');

  // ─── 0/1 Knapsack HUD Parsing ──────────────────────────────────────────────
  if (isKnapsack) {
    const rowHeader = rowHeaders[r] || '';
    const colHeader = colHeaders[c] || '';
    
    // Parse weight and value from row header string e.g., "Item 1 (w:3, v:20)"
    const match = rowHeader.match(/w:\s*(\d+),\s*v:\s*(\d+)/);
    const weight = match ? parseInt(match[1], 10) : 0;
    const itemVal = match ? parseInt(match[2], 10) : 0;
    const capacity = parseInt(colHeader.replace(/\D/g, ''), 10) || c;

    const valExcl = r > 0 && cells[r - 1]?.[c]?.value !== null ? cells[r - 1][c].value : 0;
    const canInclude = weight <= capacity;
    const subproblemCapacity = capacity - weight;
    const valSubproblem = r > 0 && canInclude && cells[r - 1]?.[subproblemCapacity]?.value !== null
      ? (cells[r - 1][subproblemCapacity].value as number)
      : 0;
    const valIncl = canInclude ? valSubproblem + itemVal : 0;

    const optimalChoice = canInclude && valIncl > (valExcl || 0) ? 'INCLUDE' : 'EXCLUDE';
    const computedVal = cells[r]?.[c]?.value !== null ? cells[r][c].value : '—';
    const capacityProgress = (capacity / (colHeaders.length - 1)) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full glass-panel-elevated p-4 rounded-xl border border-cyan-500/20 shadow-xl flex flex-col gap-3"
      >
        {/* Header Title with Capacity Gauge */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Knapsack Decision Matrix
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="font-mono text-xs text-slate-300">
              dp[{r}][{c}]
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold leading-none">Current Capacity</span>
              <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${capacityProgress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] bg-white/5 px-3 py-1 rounded-lg border border-white/5">
              <span className="text-slate-400">
                W: <strong className="text-amber-400 font-mono">{capacity}</strong>
              </span>
              {r > 0 && (
                <>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">
                    Item {r} (w:{weight}, v:{itemVal})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Calculation Matrix Body */}
        {r === 0 || c === 0 ? (
          <div className="text-xs text-slate-400 italic py-1 flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            <span>Base Case: With 0 items or 0 capacity, the maximum value we can carry is 0.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="text-[11px] text-slate-400 font-medium">
              Decision: <span className="text-white">Should we include Item {r} in a knapsack of capacity {capacity}?</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Exclude */}
              <div
                className={`p-3 rounded-lg border transition-all relative ${
                  optimalChoice === 'EXCLUDE'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold uppercase tracking-wider">
                    NO: Leave Item {r}
                  </span>
                  {optimalChoice === 'EXCLUDE' && (
                    <span className="bg-cyan-500 text-cyan-950 font-bold px-1.5 py-0.5 rounded text-[9px] animate-pulse">
                      CHOSEN
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs text-slate-300 flex items-center justify-between bg-black/20 px-2.5 py-1.5 rounded">
                  <span>Value from previous items at same capacity</span>
                  <strong className="text-sm text-cyan-300">{valExcl}</strong>
                </div>
              </div>

              {/* Option 2: Include */}
              <div
                className={`p-3 rounded-lg border transition-all relative ${
                  !canInclude
                    ? 'bg-red-500/5 border-red-500/10 text-slate-500 opacity-40'
                    : optimalChoice === 'INCLUDE'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold uppercase tracking-wider">
                    YES: Take Item {r}
                  </span>
                  {!canInclude ? (
                    <span className="text-red-400 font-bold text-[9px]">TOO HEAVY</span>
                  ) : optimalChoice === 'INCLUDE' ? (
                    <span className="bg-emerald-500 text-emerald-950 font-bold px-1.5 py-0.5 rounded text-[9px] animate-pulse">
                      CHOSEN
                    </span>
                  ) : null}
                </div>
                <div className="font-mono text-xs flex items-center justify-between bg-black/20 px-2.5 py-1.5 rounded">
                  {canInclude ? (
                    <>
                      <span className="text-slate-400">
                        Value({itemVal}) + Previous value at capacity({subproblemCapacity})
                      </span>
                      <strong className="text-sm text-emerald-400">
                        {itemVal} + {valSubproblem} = {valIncl}
                      </strong>
                    </>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">
                      Item weight {weight} &gt; capacity {capacity}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conclusion Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          <div className="flex gap-4">
            <span>Formula: <code className="text-cyan-400 lowercase">max(above, left_offset + value)</code></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Resulting Value:</span>
            <span className="text-white bg-white/10 px-2 py-0.5 rounded font-mono text-xs border border-white/10">{computedVal}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Longest Common Subsequence HUD Parsing ────────────────────────────────
  if (isLCS) {
    const rowHeader = rowHeaders[r] || '';
    const colHeader = colHeaders[c] || '';

    // Extract raw character representations e.g., "T1[2]: C" -> "C"
    const char1 = rowHeader.includes(':') ? rowHeader.split(':')[1].trim() : '';
    const char2 = colHeader.includes(':') ? colHeader.split(':')[1].trim() : '';

    const isMatch = r > 0 && c > 0 && char1 === char2 && char1 !== '';
    const valPrevDiag = r > 0 && c > 0 && cells[r - 1]?.[c - 1]?.value !== null ? (cells[r - 1][c - 1].value as number) : 0;
    const valExcludeT1 = r > 0 && cells[r - 1]?.[c]?.value !== null ? (cells[r - 1][c].value as number) : 0;
    const valExcludeT2 = c > 0 && cells[r]?.[c - 1]?.value !== null ? (cells[r][c - 1].value as number) : 0;
    const computedVal = cells[r]?.[c]?.value !== null ? cells[r][c].value : '—';

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full glass-panel-elevated p-4 rounded-xl border border-pink-500/20 shadow-xl flex flex-col gap-3"
      >
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
              LCS Decision Logic
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="font-mono text-xs text-slate-300">
              dp[{r}][{c}]
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {r > 0 && c > 0 ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Comparing</span>
                  <span className="text-cyan-300 font-mono font-bold">'{char1}'</span>
                  <span className="text-slate-600">↔</span>
                  <span className="text-amber-400 font-mono font-bold">'{char2}'</span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-tighter ${
                    isMatch ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-white/5'
                  }`}
                >
                  {isMatch ? 'MATCH FOUND' : 'MISMATCH'}
                </span>
              </>
            ) : (
              <span className="text-[10px] text-slate-500 uppercase font-bold">Base Case Analysis</span>
            )}
          </div>
        </div>

        {/* Calculation Matrix Body */}
        {r === 0 || c === 0 ? (
          <div className="text-xs text-slate-400 italic py-1 flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            <span>If one string is empty, the Longest Common Subsequence must be of length 0.</span>
          </div>
        ) : isMatch ? (
          /* Match Pathway */
          <div className="flex flex-col gap-2">
             <div className="text-[11px] text-slate-400 font-medium">
              Decision: <span className="text-white font-semibold italic">A match is found! Increment the LCS length of the previous subproblem.</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
              <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold uppercase tracking-wider">
                <span>Diagonal Dependency (dp[i-1][j-1]) + 1</span>
                <span className="bg-emerald-500 text-emerald-950 font-bold px-1.5 py-0.5 rounded text-[9px] animate-pulse">
                  OPTIMAL PATH
                </span>
              </div>
              <div className="font-mono text-xs flex items-center justify-between bg-black/20 px-3 py-2 rounded">
                <span className="text-slate-300 italic">Previous LCS length + 1</span>
                <strong className="text-sm text-emerald-400">
                  {valPrevDiag} + 1 = {computedVal}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          /* Mismatch Branching */
          <div className="flex flex-col gap-3">
             <div className="text-[11px] text-slate-400 font-medium">
              Decision: <span className="text-white">Characters don't match. Taking the maximum LCS from excluding either character.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-3 rounded-lg border transition-all relative ${
                  (valExcludeT1 || 0) >= (valExcludeT2 || 0)
                    ? 'bg-pink-500/10 border-pink-500/30 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold uppercase tracking-wider">
                  <span>Exclude '{char1}'</span>
                  {(valExcludeT1 || 0) >= (valExcludeT2 || 0) && (
                    <span className="bg-pink-500 text-pink-950 font-bold px-1.5 py-0.5 rounded text-[9px] animate-pulse">
                      CHOSEN
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs flex items-center justify-between bg-black/20 px-2.5 py-1.5 rounded">
                  <span className="text-slate-400 text-[10px]">dp[i-1][j]</span>
                  <strong className="text-sm text-pink-300">{valExcludeT1}</strong>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border transition-all relative ${
                  (valExcludeT2 || 0) > (valExcludeT1 || 0)
                    ? 'bg-pink-500/10 border-pink-500/30 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold uppercase tracking-wider">
                  <span>Exclude '{char2}'</span>
                  {(valExcludeT2 || 0) > (valExcludeT1 || 0) && (
                    <span className="bg-pink-500 text-pink-950 font-bold px-1.5 py-0.5 rounded text-[9px] animate-pulse">
                      CHOSEN
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs flex items-center justify-between bg-black/20 px-2.5 py-1.5 rounded">
                  <span className="text-slate-400 text-[10px]">dp[i][j-1]</span>
                  <strong className="text-sm text-pink-300">{valExcludeT2}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conclusion Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          <div className="flex gap-4">
            <span>Formula: <code className="text-pink-400 lowercase">{isMatch ? 'diag + 1' : 'max(above, left)'}</code></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Resulting Value:</span>
            <span className="text-white bg-white/10 px-2 py-0.5 rounded font-mono text-xs border border-white/10">{computedVal}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Fallback generic info panel
  return (
    <div className="w-full glass-panel px-6 py-4 rounded-xl border border-ice-blue/10 flex items-center justify-between text-slate-300 text-xs font-mono">
      <span>Updating cell table[{r}][{c}]</span>
      <span className="text-cyan-400 font-bold">Value: {cells[r]?.[c]?.value !== null ? cells[r][c].value : '—'}</span>
    </div>
  );
}

/**
 * Renders an inventory of items for the Knapsack problem, highlighting picked ones.
 */
function ItemInventory({ items, pickedIndices }: { items: any[], pickedIndices: number[] }) {
  if (!items || items.length === 0) return null;

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 glass-panel p-4 flex flex-col gap-3 border border-ice-blue/10 overflow-y-auto max-h-full"
    >
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">
        Available Items
      </h3>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => {
          const isPicked = pickedIndices.includes(idx);
          return (
            <motion.div
              key={`item-${idx}`}
              animate={{ 
                borderColor: isPicked ? '#10b981' : 'rgba(255,255,255,0.05)',
                backgroundColor: isPicked ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)'
              }}
              className="p-3 rounded-lg border flex flex-col gap-1 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Item {idx + 1}</span>
                {isPicked && (
                  <span className="text-[9px] bg-emerald-500 text-emerald-950 font-bold px-1.5 py-0.5 rounded leading-none">PICKED</span>
                )}
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-300 font-mono">Value: <strong className="text-emerald-400">{item.value}</strong></span>
                  <span className="text-xs text-slate-300 font-mono">Weight: <strong className="text-cyan-400">{item.weight}</strong></span>
                </div>
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/5">
                  <span className="text-lg opacity-40">📦</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/**
 * MatrixStage — Dynamic Programming UI Visualizer Stage.
 *
 * Implements high-fidelity visual highlights, active row/col intersections,
 * and elegant quadratic Bezier dependency link curves.
 *
 * @component
 */
export default function MatrixStage() {
  const activeDPAlgorithm = useUIStore((state) => state.activeDPAlgorithm);
  const [algoName, setAlgoName] = useState<string>(activeDPAlgorithm || '0/1 Knapsack');

  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [cells, setCells] = useState<CellState[][]>([]);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [dependencies, setDependencies] = useState<[number, number][]>([]);
  const [rowHeaders, setRowHeaders] = useState<string[]>([]);
  const [colHeaders, setColHeaders] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  /** Synchronize default state with global storage selection */
  useEffect(() => {
    if (activeDPAlgorithm) {
      setAlgoName(activeDPAlgorithm);
    }
  }, [activeDPAlgorithm]);

  /** Initializes matrix canvas grids with clean initial memory footprint */
  const initMatrix = useCallback((r: number, c: number, customRowHeaders?: string[], customColHeaders?: string[]) => {
    const newCells: CellState[][] = Array.from({ length: r }, () =>
      Array.from({ length: c }, () => ({
        value: null,
        highlighted: false,
        color: '',
        isDependency: false,
      }))
    );
    setRows(r);
    setCols(c);
    setCells(newCells);
    setRowHeaders(customRowHeaders || Array.from({ length: r }, (_, i) => `Row ${i}`));
    setColHeaders(customColHeaders || Array.from({ length: c }, (_, i) => `Col ${i}`));
    setPickedIndices([]);
  }, []);

  /** Listen to standard global event dispatches to drive frame-by-frame progression */
  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((event: VisualizationEvent) => {
      switch (event.type) {
        case 'TRACE_LOADED': {
          if (event.metadata?.algorithmName) {
            setAlgoName(event.metadata.algorithmName);
          }
          if (event.metadata?.items) {
            setItems(event.metadata.items);
          }
          const rowsCount = event.metadata.rowHeaders?.length || event.metadata.nodeCount || 5;
          const colsCount = event.metadata.colHeaders?.length || event.metadata.nodeCount || 5;
          initMatrix(rowsCount, colsCount, event.metadata.rowHeaders, event.metadata.colHeaders);
          setActiveCell(null);
          setDependencies([]);
          break;
        }

        case 'MATRIX_CELL_UPDATE': {
          const { row, col, value, dependencies: deps = [] } = event;

          setCells((prev) => {
            const next = prev.map((r) => r.map((c) => ({ ...c, highlighted: false, isDependency: false })));

            // Matrix padding expansion logic
            while (next.length <= row) {
              next.push(Array.from({ length: cols || col + 1 }, () => ({ value: null, highlighted: false, color: '', isDependency: false })));
            }
            while (next[row].length <= col) {
              for (let rIdx = 0; rIdx < next.length; rIdx++) {
                next[rIdx].push({ value: null, highlighted: false, color: '', isDependency: false });
              }
            }

            // Assign target cell evaluation state
            next[row][col] = { value, highlighted: true, color: '#06b6d4', isDependency: false };

            // Apply distinct dependency badges to preceding subproblem nodes
            deps.forEach(([dr, dc]) => {
              if (next[dr] && next[dr][dc]) {
                next[dr][dc].isDependency = true;
              }
            });

            return next;
          });

          setActiveCell([row, col]);
          setDependencies(deps);
          if (row >= rows) setRows(row + 1);
          if (col >= cols) setCols(col + 1);
          break;
        }

        case 'MATRIX_CELL_HIGHLIGHT': {
          const { row, col, color } = event;
          setCells((prev) => {
            if (row >= prev.length || col >= prev[row].length) return prev;
            const next = prev.map((r) => [...r]);
            next[row][col] = {
              ...next[row][col],
              highlighted: true,
              color: color || '#22c55e',
            };
            return next;
          });

          // If it's a backtracking highlight, add to path
          if (color === '#10b981' || color === '#ef4444' || color === '#3b82f6') {
            setActiveCell([row, col]);
            setDependencies([]); // Clear dependencies for backtracking view
          }
          break;
        }

        case 'KNAPSACK_FINAL_SELECTION': {
          setPickedIndices(event.indices);
          break;
        }
      }
    });

    return () => unsubscribe();
  }, [rows, cols, initMatrix]);

  /** Computes smooth quadratic Bezier SVG connections linking dependencies */
  const bezierCurves = useMemo(() => {
    if (!activeCell || dependencies.length === 0) return [];

    const CELL_SIZE = 48; // 3rem = 48px
    const GAP = 4; // gap-1 = 4px
    const HEADER_W = 120; // Expanded header width padding for richer descriptions
    const HEADER_H = 32; // Column header container vertical offset

    const [tr, tc] = activeCell;
    const targetX = HEADER_W + tc * (CELL_SIZE + GAP) + CELL_SIZE / 2;
    const targetY = HEADER_H + tr * (CELL_SIZE + GAP) + CELL_SIZE / 2;

    return dependencies.map(([sr, sc]) => {
      const sourceX = HEADER_W + sc * (CELL_SIZE + GAP) + CELL_SIZE / 2;
      const sourceY = HEADER_H + sr * (CELL_SIZE + GAP) + CELL_SIZE / 2;

      // Calculate control point to introduce a state-of-the-art aesthetic curve
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const cx = sourceX + dx * 0.45;
      const cy = sourceY + dy * 0.1 - Math.min(40, Math.abs(dx) * 0.3);

      return {
        pathString: `M ${sourceX} ${sourceY} Q ${cx} ${cy} ${targetX} ${targetY}`,
        x1: sourceX,
        y1: sourceY,
        x2: targetX,
        y2: targetY,
      };
    });
  }, [activeCell, dependencies]);

  return (
    <div ref={containerRef} className="flex-1 w-full h-full flex flex-col p-6 gap-5 select-none bg-[#050810] overflow-hidden">
      {/* ── Top HUD Dashboard ── */}
      <FormulaHUDPanel
        algoName={algoName}
        activeCell={activeCell}
        rowHeaders={rowHeaders}
        colHeaders={colHeaders}
        cells={cells}
      />

      <div className="flex-1 flex gap-5 overflow-hidden">
        {/* ── Matrix Scroll Canvas Grid ── */}
        <div className="flex-1 relative glass-panel p-6 rounded-2xl border border-ice-blue/10 shadow-2xl overflow-auto flex flex-col justify-start items-start">
          {/* SVG Arrow Canvas Overlay */}
          <svg className="absolute inset-0 pointer-events-none z-20" style={{ minWidth: '100%', minHeight: '100%' }}>
            <defs>
              <marker id="bezierArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
              </marker>
              <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
              </linearGradient>
            </defs>

            <AnimatePresence>
              {bezierCurves.map((curve, idx) => (
                <g key={`curve-group-${idx}`}>
                  {/* Secondary underlying neon shadow stroke */}
                  <motion.path
                    d={curve.pathString}
                    fill="none"
                    stroke="rgba(245, 158, 11, 0.15)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Primary Traveling Bezier Connection */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    d={curve.pathString}
                    fill="none"
                    stroke="url(#neonGradient)"
                    strokeWidth="2.5"
                    strokeDasharray="6 3"
                    markerEnd="url(#bezierArrow)"
                  />
                  {/* Traveling glowing vector tip indicator */}
                  <motion.circle
                    initial={{ cx: curve.x1, cy: curve.y1, opacity: 0 }}
                    animate={{ cx: curve.x2, cy: curve.y2, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                    r="3.5"
                    fill="#ffffff"
                    className="filter drop-shadow-[0_0_6px_#ffffff]"
                  />
                </g>
              ))}
            </AnimatePresence>
          </svg>

          <div className="relative z-10 w-full min-w-max pb-4">
            {/* ── Column Headers ── */}
            <div className="flex gap-1 mb-2" style={{ paddingLeft: '120px' }}>
              {colHeaders.map((h, cIdx) => {
                const isColActive = activeCell?.[1] === cIdx;
                return (
                  <div
                    key={`col-head-${cIdx}`}
                    className={`w-12 h-8 flex items-center justify-center text-[10px] font-mono rounded transition-all ${
                      isColActive
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold'
                        : 'text-slate-500 bg-white/[0.01]'
                    }`}
                  >
                    {h.replace('Base (0)', '0').replace('W=', '')}
                  </div>
                );
              })}
            </div>

            {/* ── Grid Rows ── */}
            {cells.map((row, rIdx) => {
              const isRowActive = activeCell?.[0] === rIdx;
              return (
                <div key={`matrix-row-${rIdx}`} className="flex items-center gap-1 mb-1">
                  {/* Row Header Label */}
                  <div
                    className={`w-[116px] h-12 px-2 flex items-center justify-start text-[10px] font-mono shrink-0 truncate rounded transition-all ${
                      isRowActive
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold'
                        : 'text-slate-400 bg-white/[0.01]'
                    }`}
                    title={rowHeaders[rIdx]}
                  >
                    <span className="truncate">{rowHeaders[rIdx]}</span>
                  </div>

                  {/* Subproblem Cells */}
                  {row.map((cell, cIdx) => {
                    const isCalculated = cell.value !== null;
                    return (
                      <motion.div
                        key={`grid-cell-${rIdx}-${cIdx}`}
                        layout
                        initial={false}
                        animate={{
                          backgroundColor: cell.highlighted
                            ? cell.color + '33'
                            : cell.isDependency
                            ? '#f59e0b2a'
                            : isCalculated
                            ? '#ffffff08'
                            : '#0a0e1a80',
                          borderColor: cell.highlighted
                            ? cell.color
                            : cell.isDependency
                            ? '#f59e0b77'
                            : isCalculated
                            ? '#334155'
                            : '#1e293b',
                          scale: cell.highlighted ? 1.08 : cell.isDependency ? 1.03 : 1,
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                        className={`
                          w-12 h-12 flex items-center justify-center text-xs font-mono font-bold 
                          rounded-lg border relative transition-colors duration-150 cursor-pointer
                          ${
                            cell.highlighted
                              ? 'text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] z-10'
                              : cell.isDependency
                              ? 'text-amber-300 z-5'
                              : isCalculated
                              ? 'text-slate-300'
                              : 'text-slate-600 font-normal'
                          }
                        `}
                        whileHover={{ scale: 1.05, borderColor: '#7dd3fc', zIndex: 15 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={cell.value}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.15 }}
                          >
                            {isCalculated ? cell.value : '·'}
                          </motion.span>
                        </AnimatePresence>

                        {/* Small visual accent badges for active roles */}
                        {cell.highlighted && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        )}
                        {cell.isDependency && (
                          <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-amber-400" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Item Inventory Sidebar ── */}
        {algoName.toLowerCase().includes('knapsack') && (
          <ItemInventory items={items} pickedIndices={pickedIndices} />
        )}
      </div>

      {/* ── Explanatory Graphic Legend Footer ── */}
      <div className="flex flex-wrap justify-center gap-6 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
          <span className="text-cyan-300 font-bold">Active Evaluation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-400/50" />
          <span className="text-amber-300 font-bold">Subproblem Dependency</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#10b98133] border border-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="text-emerald-400 font-bold">Picked for Solution</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#ef444433] border border-[#ef4444]" />
          <span className="text-red-400 font-bold">Skipped (Backtrack)</span>
        </div>
      </div>
    </div>
  );
}
