import React, { useMemo } from 'react';
import type { VisualizationEvent } from '../../types';
import { motion } from 'motion/react';

interface SortingStageProps {
  array: number[];
  activeEvent: VisualizationEvent | null;
}

/**
 * Visualizes a sorting algorithm state using vertical bars.
 * Serves as the main stage for all sorting algorithm execution traces.
 */
export const SortingStage: React.FC<SortingStageProps> = ({ array, activeEvent }) => {
  // Calculate the maximum value to scale bar heights proportionally
  const maxValue = useMemo(() => Math.max(...array, 1), [array]);

  // Extract pointers if the current event is comparing or swapping elements
  const pointers = (activeEvent?.type === 'ARRAY_COMPARE' || activeEvent?.type === 'ARRAY_SWAP') 
    ? activeEvent.indices 
    : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-end p-8 gap-4 bg-[#0a0e1a] rounded-xl shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Bars container */}
      <div className="flex-1 w-full flex items-end justify-center gap-2">
        {array.map((value, index) => {
          const heightPercent = (value / maxValue) * 100;
          const isPointerI = pointers?.[0] === index;
          const isPointerJ = pointers?.[1] === index;
          const hasPointer = isPointerI || isPointerJ;

          return (
            <div key={index} className="flex flex-col items-center justify-end h-full">
              {/* The visual bar */}
              <motion.div
                layout
                className={`w-12 rounded-t-md transition-colors duration-300 flex items-end justify-center pb-2 text-white font-semibold text-sm ${
                  hasPointer ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ height: `${heightPercent}%` }}
              >
                {value}
              </motion.div>
              
              {/* Pointer area below the bar */}
              <div className="h-10 w-full flex flex-col items-center justify-start mt-2">
                {isPointerI && (
                  <motion.div layoutId="pointer-i" className="flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-orange-500 mb-1"></div>
                    <span className="text-orange-500 font-bold text-xs uppercase">i</span>
                  </motion.div>
                )}
                {isPointerJ && !isPointerI && (
                  <motion.div layoutId="pointer-j" className="flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-orange-500 mb-1"></div>
                    <span className="text-orange-500 font-bold text-xs uppercase">j</span>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
