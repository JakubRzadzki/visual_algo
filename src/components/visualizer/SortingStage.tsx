/**
 * @file SortingStage.tsx
 * @description Displays both an array box table and vertical bars with dynamic arrows at the bottom.
 *
 * Visualizes a sorting or searching algorithm's active state by rendering:
 * 1. An elegant array grid/table showing exact values and indices.
 * 2. Animated vertical bars representing value magnitude.
 * 3. Pointing arrows below indicating which elements are currently active.
 */

import { useState, useEffect, useMemo } from 'react';
import type { VisualizationEvent, ArrayInput } from '../../types';
import { globalEventBus } from '../../core/EventBus';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';

export default function SortingStage() {
  const [array, setArray] = useState<number[]>([]);
  const [activeEvent, setActiveEvent] = useState<VisualizationEvent | null>(null);

  // Initialize array from store if available
  const { visualizationData } = useUIStore();

  useEffect(() => {
    if (visualizationData && 'values' in visualizationData) {
      setArray([...(visualizationData as ArrayInput).values]);
    }
  }, [visualizationData]);

  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((event: VisualizationEvent) => {
      setActiveEvent(event);

      if (event.type === 'TRACE_LOADED') {
        if (event.metadata.initialState && Array.isArray(event.metadata.initialState)) {
          setArray([...event.metadata.initialState]);
        }
      } else if (event.type === 'ARRAY_SWAP') {
        setArray(prev => {
          const next = [...prev];
          const [i, j] = event.indices;
          const temp = next[i];
          next[i] = next[j];
          next[j] = temp;
          return next;
        });
      } else if (event.type === 'ARRAY_SET') {
        setArray(prev => {
          const next = [...prev];
          next[event.index] = event.value;
          return next;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const maxValue = useMemo(() => Math.max(...array, 1), [array]);

  // Extract pointers based on event type
  let pointers: number[] | null = null;
  let targetPointer: number | null = null;

  if (activeEvent?.type === 'ARRAY_COMPARE' || activeEvent?.type === 'ARRAY_SWAP') {
    pointers = activeEvent.indices;
  } else if (activeEvent?.type === 'SEARCH_CHECK') {
    pointers = [activeEvent.index];
    targetPointer = activeEvent.index;
  } else if (activeEvent?.type === 'SEARCH_FOUND') {
    pointers = [activeEvent.index];
    targetPointer = activeEvent.index;
  } else if (activeEvent?.type === 'SEARCH_NARROW') {
    pointers = [activeEvent.left, activeEvent.right, activeEvent.mid];
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 gap-6 bg-[#0a0e1a] rounded-xl shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      
      {/* ── 1. Top Section: Array Boxes / Table Representation ── */}
      <div className="w-full flex flex-col items-center gap-2 mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
          Array View (Boxes)
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
          <AnimatePresence>
            {array.map((value, index) => {
              const isPointerI = pointers?.[0] === index;
              const isPointerJ = pointers?.[1] === index;
              const isPointerK = pointers?.[2] === index;
              const hasPointer = isPointerI || isPointerJ || isPointerK;

              // Grid item background styling
              let gridBg = 'bg-slate-800/40 border-slate-700/50 text-slate-300';
              if (activeEvent?.type === 'SEARCH_FOUND' && index === targetPointer) {
                gridBg = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
              } else if (hasPointer) {
                gridBg = 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
              } else if (activeEvent?.type === 'SEARCH_NARROW') {
                if (index < activeEvent.left || index > activeEvent.right) {
                  gridBg = 'bg-slate-900/40 border-slate-800/40 text-slate-600 opacity-40';
                }
              }

              return (
                <motion.div
                  key={`box-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border font-mono text-sm font-bold select-none transition-all duration-300 backdrop-blur-md cursor-default ${gridBg}`}
                >
                  <span className="text-[10px] text-slate-500 block leading-none mb-0.5">
                    [{index}]
                  </span>
                  <span className="leading-none">{value}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── 2. Middle Section: Vertical Bars + 3. Bottom Section: Pointer Arrows ── */}
      <div className="flex-1 w-full flex items-end justify-center gap-3">
        <AnimatePresence>
          {array.map((value, index) => {
            const heightPercent = (value / maxValue) * 100;
            const isPointerI = pointers?.[0] === index;
            const isPointerJ = pointers?.[1] === index;
            const isPointerK = pointers?.[2] === index;
            const hasPointer = isPointerI || isPointerJ || isPointerK;

            // Color logic for bar
            let bgColor = 'bg-gradient-to-t from-sky-600/80 to-sky-400/80';
            if (activeEvent?.type === 'SEARCH_FOUND' && index === targetPointer) {
              bgColor = 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
            } else if (hasPointer) {
              bgColor = 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]';
            } else if (activeEvent?.type === 'SEARCH_NARROW') {
              if (index < activeEvent.left || index > activeEvent.right) {
                bgColor = 'bg-slate-800/30 border-slate-700/20 text-slate-700 opacity-40';
              }
            }

            return (
              <div key={`col-${index}`} className="flex flex-col items-center justify-end h-full min-h-[160px]">
                {/* Visual bar with value on top */}
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-12 rounded-t-lg transition-all duration-300 flex items-end justify-center pb-3 font-bold text-sm select-none border border-white/5 ${bgColor}`}
                  style={{ height: `${Math.max(heightPercent, 12)}%` }}
                >
                  <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{value}</span>
                </motion.div>

                {/* Arrow pointer area below each bar */}
                <div className="h-12 w-full flex flex-col items-center justify-start mt-2">
                  {hasPointer && (
                    <motion.div
                      layoutId={`pointer-${index}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center select-none"
                    >
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-amber-400 mb-1 animate-bounce" />
                      <span className="text-amber-400 font-extrabold text-[11px] uppercase tracking-wider bg-slate-900/60 border border-amber-400/30 rounded px-1.5 py-0.5">
                        {isPointerI ? 'i' : isPointerJ ? 'j' : 'mid'}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
