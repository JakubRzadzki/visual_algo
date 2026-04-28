import { useState, useCallback } from 'react';

type CellType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'path';

/**
 * Grid Stage for pathfinding algorithms.
 * Renders an interactive 20x20 CSS grid supporting drawing walls.
 * Features static Start and End nodes for the initial implementation.
 */
export default function GridStage() {
  const rows = 20;
  const cols = 20;
  const totalCells = rows * cols;

  const START_INDEX = 0; // Top-left
  const END_INDEX = totalCells - 1; // Bottom-right

  // Initialize cells with empty, start, and end nodes
  const [cells, setCells] = useState<CellType[]>(() => {
    const initial = Array(totalCells).fill('empty');
    initial[START_INDEX] = 'start';
    initial[END_INDEX] = 'end';
    return initial;
  });

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [drawMode, setDrawMode] = useState<'wall' | 'empty'>('wall'); // Are we placing walls or erasing them?

  // Prevent modifying start and end nodes
  const isModifiable = (index: number) => index !== START_INDEX && index !== END_INDEX;

  const handleMouseDown = useCallback((index: number) => {
    if (!isModifiable(index)) return;
    
    setIsMouseDown(true);
    // Determine if we're drawing walls or erasing them based on the initial cell clicked
    const newDrawMode = cells[index] === 'wall' ? 'empty' : 'wall';
    setDrawMode(newDrawMode);
    
    setCells(prev => {
      const newCells = [...prev];
      newCells[index] = newDrawMode;
      return newCells;
    });
  }, [cells]);

  const handleMouseEnter = useCallback((index: number) => {
    if (!isMouseDown || !isModifiable(index)) return;
    
    setCells(prev => {
      if (prev[index] === drawMode) return prev; // No change needed
      const newCells = [...prev];
      newCells[index] = drawMode;
      return newCells;
    });
  }, [isMouseDown, drawMode]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  const getCellColorClass = (type: CellType) => {
    switch (type) {
      case 'start': return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10';
      case 'end': return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] z-10';
      case 'wall': return 'bg-slate-500 hover:bg-slate-400';
      case 'visited': return 'bg-cyan-500/40 border border-cyan-400/50';
      case 'path': return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] z-10';
      case 'empty': default: return 'bg-[#0a0e1a] hover:bg-slate-800';
    }
  };

  return (
    <div 
      className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 gap-4 select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragStart={(e) => e.preventDefault()} // Prevent default browser drag behavior
    >
      <div className="w-full max-w-3xl aspect-square bg-[#0a0e1a] rounded-xl border border-ice-blue/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center p-4">
        <div 
          className="w-full h-full grid gap-[1px] bg-slate-800 relative"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
          }}
        >
          {cells.map((type, index) => (
            <div 
              key={index}
              onMouseDown={() => handleMouseDown(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              className={`w-full h-full transition-colors duration-200 ${
                isModifiable(index) ? 'cursor-pointer' : 'cursor-default'
              } ${getCellColorClass(type)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
