import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalEventBus } from '../../core/EventBus';
import type { VisualizationEvent } from '../../types';

/**
 * Represents the state of a single cell in the DP matrix.
 */
interface CellState {
  /** The numerical value stored in the cell. */
  value: number | null;
  /** Whether the cell is currently being updated or highlighted. */
  highlighted: boolean;
  /** Hex or Tailwind color for the highlight. */
  color: string;
  /** Whether this cell is a dependency for the current calculation. */
  isDependency: boolean;
}

/**
 * MatrixStage — Visual stage for Dynamic Programming tables.
 * 
 * Renders a 2D matrix grid that reacts to MATRIX_CELL_UPDATE and
 * MATRIX_CELL_HIGHLIGHT events. It visualizes dependencies using
 * SVG arrows and highlights.
 * 
 * @component
 */
export default function MatrixStage() {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [cells, setCells] = useState<CellState[][]>([]);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [dependencies, setDependencies] = useState<[number, number][]>([]);
  const [rowHeaders, setRowHeaders] = useState<string[]>([]);
  const [colHeaders, setColHeaders] = useState<string[]>([]);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Initializes or resets the matrix with given dimensions.
   */
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

  // Listen for algorithm events
  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((event: VisualizationEvent) => {
      switch (event.type) {
        case 'TRACE_LOADED':
          // Reset matrix based on metadata or default
          const size = event.metadata.nodeCount || 5;
          initMatrix(size, size);
          setActiveCell(null);
          setDependencies([]);
          break;

        case 'MATRIX_CELL_UPDATE':
          const { row, col, value, dependencies: deps = [] } = event;
          
          setCells(prev => {
            // Create a deep copy and expand if necessary
            let next = [...prev.map(r => r.map(c => ({ ...c, highlighted: false, isDependency: false })))];
            
            // Expansion logic (if matrix grows dynamically)
            while (next.length <= row) {
              next.push(Array.from({ length: cols || col + 1 }, () => ({ value: null, highlighted: false, color: '', isDependency: false })));
            }
            while (next[row].length <= col) {
              for(let r = 0; r < next.length; r++) {
                next[r].push({ value: null, highlighted: false, color: '', isDependency: false });
              }
            }

            // Update target cell
            next[row][col] = { value, highlighted: true, color: '#06b6d4', isDependency: false };

            // Mark dependencies
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

        case 'MATRIX_CELL_HIGHLIGHT':
          setCells(prev => {
            if (event.row >= prev.length || event.col >= prev[event.row].length) return prev;
            const next = prev.map(r => [...r]);
            next[event.row][event.col] = { 
              ...next[event.row][event.col], 
              highlighted: true, 
              color: event.color || '#f59e0b' 
            };
            return next;
          });
          break;
      }
    });

    return () => unsubscribe();
  }, [rows, cols, initMatrix]);

  /**
   * Calculates the SVG coordinates for dependency arrows.
   */
  const arrows = useMemo(() => {
    if (!activeCell || dependencies.length === 0 || !gridRef.current) return [];

    const CELL_SIZE = 48; // 3rem = 48px
    const GAP = 4; // gap-1 = 4px
    const HEADER_W = 40; // w-10 = 40px
    const HEADER_H = 24; // h-6 = 24px

    const [tr, tc] = activeCell;
    const targetX = HEADER_W + tc * (CELL_SIZE + GAP) + CELL_SIZE / 2;
    const targetY = HEADER_H + tr * (CELL_SIZE + GAP) + CELL_SIZE / 2;

    return dependencies.map(([sr, sc]) => {
      const sourceX = HEADER_W + sc * (CELL_SIZE + GAP) + CELL_SIZE / 2;
      const sourceY = HEADER_H + sr * (CELL_SIZE + GAP) + CELL_SIZE / 2;
      return { x1: sourceX, y1: sourceY, x2: targetX, y2: targetY };
    });
  }, [activeCell, dependencies]);

  return (
    <div ref={containerRef} className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 gap-6 select-none bg-[#050810]">
      <div className="relative glass-panel p-8 rounded-2xl border border-ice-blue/10 shadow-2xl overflow-auto max-w-full max-h-full">
        
        {/* SVG Arrow Overlay */}
        <svg className="absolute inset-0 pointer-events-none z-20" width="100%" height="100%">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>
          <AnimatePresence>
            {arrows.map((arrow, i) => (
              <motion.line
                key={`arrow-${i}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                x1={arrow.x1} y1={arrow.y1}
                x2={arrow.x2} y2={arrow.y2}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#arrowhead)"
              />
            ))}
          </AnimatePresence>
        </svg>

        <div ref={gridRef} className="relative z-10">
          {/* Column headers */}
          <div className="flex gap-1 mb-1 ml-10">
            {colHeaders.map((h, i) => (
              <div key={`ch-${i}`} className="w-12 h-6 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {cells.map((row, r) => (
            <div key={`row-${r}`} className="flex gap-1 mb-1">
              {/* Row header */}
              <div className="w-10 h-12 flex items-center justify-center text-[10px] text-slate-500 font-mono shrink-0">
                {rowHeaders[r]}
              </div>

              {row.map((cell, c) => (
                <motion.div
                  key={`cell-${r}-${c}`}
                  layout
                  initial={false}
                  animate={{
                    backgroundColor: cell.highlighted 
                      ? cell.color + '44' 
                      : cell.isDependency 
                        ? '#f59e0b33' 
                        : cell.value !== null 
                          ? '#ffffff0a' 
                          : '#0f172a66',
                    borderColor: cell.highlighted 
                      ? cell.color 
                      : cell.isDependency 
                        ? '#f59e0b66' 
                        : '#1e293b',
                    scale: cell.highlighted ? 1.05 : 1,
                  }}
                  className={`
                    w-12 h-12 flex items-center justify-center text-xs font-mono font-bold 
                    rounded-md border transition-colors duration-200
                    ${cell.highlighted ? 'text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] z-10' : 'text-slate-400'}
                    ${cell.isDependency ? 'text-amber-200' : ''}
                  `}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={cell.value}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      {cell.value !== null ? cell.value : '—'}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
          <span>Calculating</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-400/40" />
          <span>Dependency</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-white/5 border border-slate-700" />
          <span>Stored Value</span>
        </div>
      </div>
    </div>
  );
}
