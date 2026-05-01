import { useState, useEffect, useRef, useCallback } from 'react';
import { globalEventBus } from '../../core/EventBus';
import type { VisualizationEvent } from '../../types';

interface CellState {
  value: number | null;
  highlighted: boolean;
  color: string;
  isDependency: boolean;
}

const DEFAULT_SIZE = 5;
const defaultCells = (): CellState[][] => Array.from({ length: DEFAULT_SIZE }, () =>
  Array.from({ length: DEFAULT_SIZE }, () => ({
    value: null, highlighted: false, color: '', isDependency: false,
  }))
);

/**
 * MatrixStage — Visual stage for Dynamic Programming tables.
 * Renders a 2D matrix grid that reacts to MATRIX_CELL_UPDATE and
 * MATRIX_CELL_HIGHLIGHT events from the AnimationEngine.
 * Shows dependency arrows from source cells to the target cell.
 */
export default function MatrixStage() {
  const [rows, setRows] = useState(DEFAULT_SIZE);
  const [cols, setCols] = useState(DEFAULT_SIZE);
  const [cells, setCells] = useState<CellState[][]>(defaultCells);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [dependencies, setDependencies] = useState<[number, number][]>([]);
  const [rowHeaders, setRowHeaders] = useState<string[]>(Array.from({ length: DEFAULT_SIZE }, (_, i) => `${i}`));
  const [colHeaders, setColHeaders] = useState<string[]>(Array.from({ length: DEFAULT_SIZE }, (_, i) => `${i}`));
  const gridRef = useRef<HTMLDivElement>(null);

  // Initialize empty matrix
  const initMatrix = useCallback((r: number, c: number) => {
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
    setRowHeaders(Array.from({ length: r }, (_, i) => `${i}`));
    setColHeaders(Array.from({ length: c }, (_, i) => `${i}`));
  }, []);

  // Subscribe to matrix events from the EventBus
  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((event: VisualizationEvent) => {
      if (event.type === 'TRACE_LOADED') {
        // Reset the matrix when a new trace is loaded
        // Default to a 5x5 if no specific size is in metadata
        const size = event.metadata.nodeCount || 5;
        initMatrix(size, size);
        setActiveCell(null);
        setDependencies([]);
        return;
      }

      if (event.type === 'MATRIX_CELL_UPDATE') {
        const { row, col, value, dependencies: deps } = event;

        // Ensure matrix is large enough
        setCells(prev => {
          // Expand if needed
          while (prev.length <= row) {
            prev.push(Array.from({ length: cols || col + 1 }, () => ({ value: null, highlighted: false, color: '', isDependency: false })));
          }
          while (prev[row].length <= col) {
            prev[row].push({ value: null, highlighted: false, color: '', isDependency: false });
          }

          const next = prev.map(r => r.map(c => ({ ...c, highlighted: false, isDependency: false })));
          next[row][col] = { value, highlighted: true, color: '#06b6d4', isDependency: false };

          // Mark dependency cells
          if (deps) {
            for (const [dr, dc] of deps) {
              if (dr < next.length && dc < next[dr].length) {
                next[dr][dc] = { ...next[dr][dc], isDependency: true };
              }
            }
          }

          return next;
        });

        setActiveCell([row, col]);
        setDependencies(deps || []);

        // Update rows/cols if matrix grew
        if (row >= rows) setRows(row + 1);
        if (col >= cols) setCols(col + 1);
      }

      if (event.type === 'MATRIX_CELL_HIGHLIGHT') {
        const { row, col, color } = event;
        setCells(prev => {
          if (row >= prev.length || col >= prev[row].length) return prev;
          const next = prev.map(r => [...r]);
          next[row][col] = { ...next[row][col], highlighted: true, color: color || '#f59e0b' };
          return next;
        });
      }
    });

    return () => unsubscribe();
  }, [rows, cols, initMatrix]);

  // Default matrix is initialized via useState defaults above

  const getCellClasses = (cell: CellState, r: number, c: number) => {
    const isActive = activeCell?.[0] === r && activeCell?.[1] === c;
    let base = 'flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 rounded-md border ';

    if (isActive) {
      base += 'bg-cyan-500/30 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105 z-10 ';
    } else if (cell.isDependency) {
      base += 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)] ';
    } else if (cell.highlighted) {
      base += 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300 ';
    } else if (cell.value !== null) {
      base += 'bg-white/5 border-slate-700/30 text-slate-300 ';
    } else {
      base += 'bg-slate-900/40 border-slate-800/20 text-slate-600 ';
    }

    return base;
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 gap-4 select-none">
      <div
        ref={gridRef}
        className="relative w-full max-w-3xl bg-[#0a0e1a] rounded-xl border border-ice-blue/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-auto p-6"
      >
        {/* Column headers */}
        <div className="flex gap-1 mb-1 ml-10">
          {colHeaders.slice(0, cols).map((h, i) => (
            <div key={`ch-${i}`} className="w-12 h-6 flex items-center justify-center text-[10px] text-slate-500 font-mono">
              {h}
            </div>
          ))}
        </div>

        {/* Matrix grid */}
        {cells.slice(0, rows).map((row, r) => (
          <div key={`row-${r}`} className="flex gap-1 mb-1">
            {/* Row header */}
            <div className="w-10 h-12 flex items-center justify-center text-[10px] text-slate-500 font-mono shrink-0">
              {rowHeaders[r]}
            </div>

            {row.slice(0, cols).map((cell, c) => (
              <div
                key={`cell-${r}-${c}`}
                className={getCellClasses(cell, r, c)}
                style={{ width: '3rem', height: '3rem' }}
              >
                {cell.value !== null ? cell.value : '—'}
              </div>
            ))}
          </div>
        ))}

        {/* Dependency indicators */}
        {activeCell && dependencies.length > 0 && (
          <div className="absolute top-2 right-2 glass-panel px-3 py-2 rounded-lg text-[10px] text-slate-400 space-y-0.5">
            <div className="text-cyan-400 font-semibold mb-1">
              Target: [{activeCell[0]}, {activeCell[1]}]
            </div>
            {dependencies.map(([dr, dc], i) => (
              <div key={i} className="text-amber-400">
                ← Dep: [{dr}, {dc}]
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-400/60" />
          <span>Active Cell</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-400/40" />
          <span>Dependency</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-400/30" />
          <span>Computed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-900/40 border border-slate-800/20" />
          <span>Empty</span>
        </div>
      </div>
    </div>
  );
}
