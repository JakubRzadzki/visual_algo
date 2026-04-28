import { useMemo } from 'react';

/**
 * Basic Grid Stage for pathfinding algorithms.
 * Renders a 20x20 CSS grid.
 */
export default function GridStage() {
  const rows = 20;
  const cols = 20;
  const totalCells = rows * cols;

  // For the first commit, just render empty cells
  const cells = useMemo(() => Array.from({ length: totalCells }, (_, i) => i), [totalCells]);

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 gap-4">
      <div className="w-full max-w-3xl aspect-square bg-[#0a0e1a] rounded-xl border border-ice-blue/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center p-4">
        <div 
          className="w-full h-full grid gap-[1px] bg-slate-800"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
          }}
        >
          {cells.map((index) => (
            <div 
              key={index} 
              className="w-full h-full bg-[#0a0e1a] transition-colors duration-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
