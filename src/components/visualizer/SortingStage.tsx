import React from 'react';
import { VisualizationEvent } from '../../types';

interface SortingStageProps {
  array: number[];
  activeEvent: VisualizationEvent | null;
}

/**
 * Visualizes a sorting algorithm state using vertical bars.
 * Serves as the main stage for all sorting algorithm execution traces.
 */
export const SortingStage: React.FC<SortingStageProps> = ({ array, activeEvent }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-end p-8 gap-4 bg-[#0a0e1a] rounded-xl shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Bars container placeholder */}
      <div className="flex-1 w-full flex items-end justify-center gap-1">
        {/* Bars will be rendered here */}
      </div>
      {/* Pointers container placeholder */}
      <div className="h-10 w-full relative">
        {/* Pointers will be rendered here */}
      </div>
    </div>
  );
};
