import { useState, useCallback } from 'react';

type CellType = 'empty' | 'wall';

/**
 * Grid Stage for pathfinding algorithms.
 * Renders an interactive 20x20 CSS grid supporting drawing walls.
 */
export default function GridStage() {
  const rows = 20;
  const cols = 20;
  const totalCells = rows * cols;

  // Initialize all cells as empty
  const [cells, setCells] = useState<CellType[]>(Array(totalCells).fill('empty'));
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [drawMode, setDrawMode] = useState<'wall' | 'empty'>('wall'); // Are we placing walls or erasing them?

  const handleMouseDown = useCallback((index: number) => {
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
    if (!isMouseDown) return;
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

  return (
    <div 
      className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 gap-4 select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragStart={(e) => e.preventDefault()} // Prevent default browser drag behavior
    >
      <div className="w-full max-w-3xl aspect-square bg-[#0a0e1a] rounded-xl border border-ice-blue/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center p-4">
        <div 
          className="w-full h-full grid gap-[1px] bg-slate-800"
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
              className={`w-full h-full transition-colors duration-200 cursor-pointer ${
                type === 'wall' ? 'bg-slate-500 hover:bg-slate-400' : 'bg-[#0a0e1a] hover:bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
