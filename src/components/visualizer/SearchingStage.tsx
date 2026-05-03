/**
 * @file SearchingStage.tsx
 * @description Visualizes array searching algorithms using horizontal blocks and pointer arrows.
 * Direct trace-derived boundaries for complete deterministic scrubbing & time-travel playback.
 */

import { useState, useEffect } from 'react';
import type { VisualizationEvent, ArrayInput } from '../../types';
import { globalEventBus } from '../../core/EventBus';
import { globalEngine } from '../../core/AnimationEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';

export default function SearchingStage() {
  const [array, setArray] = useState<number[]>([]);
  const [_, setStepCounter] = useState<number>(0);

  const { visualizationData, activeSearchingAlgorithm } = useUIStore();

  useEffect(() => {
    if (visualizationData && 'values' in visualizationData) {
      const initArray = (visualizationData as ArrayInput).values;
      setArray([...initArray]);
    }
  }, [visualizationData]);

  // Sync state changes when scrubbed or played
  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((event: VisualizationEvent) => {
      if (event.type === 'SYSTEM_PLAYBACK_STATE' || event.type === 'TRACE_LOADED') {
        setStepCounter((event as any).currentStep || 0);
      } else if (event.step !== undefined) {
        setStepCounter(event.step);
      }
    });
    return () => unsubscribe();
  }, []);

  // ─── Direct Trace Derivation (Time Travel) ───
  const engineState = globalEngine.getState();
  const currentStep = engineState.currentStep;
  const trace = globalEngine.getTrace();

  let startIdx = 0;
  let endIdx = array.length - 1;
  let activeIndices: number[] = [];
  let isFound = false;
  let target: number | null = null;
  let statusMessage = 'Ready to scan';

  if (trace && trace.events.length > 0) {
    if (trace.metadata?.initialState && array.length === 0) {
      setArray([...trace.metadata.initialState]);
      endIdx = trace.metadata.initialState.length - 1;
    }

    // Process all events up to the current step
    const eventsSlice = trace.events.slice(0, currentStep);

    eventsSlice.forEach((ev: any) => {
      if (typeof ev.target === 'number') {
        target = ev.target;
      }

      if (typeof ev.left === 'number') {
        startIdx = ev.left;
      }
      if (typeof ev.right === 'number') {
        endIdx = ev.right;
      }

      // Elimination logic
      if (ev.type && ev.type.toUpperCase().includes('CHECK')) {
        if (activeSearchingAlgorithm && activeSearchingAlgorithm.toLowerCase().includes('linear')) {
          if (target !== null && ev.value !== undefined && ev.value !== target) {
            startIdx = ev.index + 1;
          }
        } else {
          if (ev.value !== undefined && target !== null) {
            if (ev.value < target) {
              startIdx = ev.index + 1;
            } else if (ev.value > target) {
              endIdx = ev.index - 1;
            }
          }
        }
      }

      if (ev.type && typeof ev.type === 'string' && ev.type.toUpperCase().includes('FOUND') && !ev.type.toUpperCase().includes('NOT')) {
        isFound = true;
      }
      if (ev.type && typeof ev.type === 'string' && ev.type.toUpperCase().includes('NOT_FOUND')) {
        isFound = false;
      }
    });

    // Active event highlights
    const activeEvent = trace.events[currentStep - 1];
    if (activeEvent) {
      const ev = activeEvent as any;
      if (typeof ev.index === 'number') activeIndices.push(ev.index);
      if (typeof ev.mid === 'number') activeIndices.push(ev.mid);
      if (Array.isArray(ev.indices)) {
        ev.indices.forEach((i: any) => {
          if (typeof i === 'number') activeIndices.push(i);
        });
      }

      if (ev.type?.toUpperCase().includes('FOUND') && !ev.type?.toUpperCase().includes('NOT')) {
        statusMessage = `✓ Target element found at index [${ev.index}]!`;
      } else if (ev.type?.toUpperCase().includes('NOT_FOUND')) {
        statusMessage = `✗ Element not found in array`;
      } else if (activeIndices.length > 0) {
        statusMessage = `Comparing element ${array[activeIndices[0]]} with target...`;
      } else if (ev.type?.toUpperCase().includes('NARROW')) {
        statusMessage = `Narrowing search window to indices [${ev.left} - ${ev.right}]`;
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-8 gap-8 bg-[#0a0e1a] rounded-xl shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-ice-blue/10 select-none">
      
      {/* ── 1. Top Section: Descriptive Info & Target value card ── */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full select-none border-b border-ice-blue/10 pb-4 gap-4">
        <div className="flex flex-col">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
            Searching Process
          </h2>
          <div className="text-lg font-bold font-sans mt-1">
            {isFound ? (
              <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-pulse">
                {statusMessage}
              </span>
            ) : statusMessage.includes('✗') ? (
              <span className="text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.4)]">
                {statusMessage}
              </span>
            ) : activeIndices.length > 0 ? (
              <span className="text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse">
                {statusMessage}
              </span>
            ) : (
              <span className="text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                {statusMessage}
              </span>
            )}
          </div>
        </div>

        {/* Target value Box - Pink just like in the video */}
        {target !== null && (
          <div className="flex items-center gap-3 bg-pink-500/10 border border-pink-400/30 p-2 px-4 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.2)]">
            <span className="text-xs font-semibold text-pink-300 uppercase tracking-wide">Target</span>
            <motion.div
              layout
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-11 h-11 bg-pink-500 border border-pink-400 flex items-center justify-center text-lg font-extrabold text-white rounded-xl shadow-lg shadow-pink-500/50"
            >
              {target}
            </motion.div>
          </div>
        )}
      </div>

      {/* ── 2. Middle Section: Array Elements with Exit Animations ── */}
      <div className="flex flex-wrap items-center justify-center gap-6 max-w-full relative min-h-[160px]">
        <AnimatePresence>
          {array
            .map((value, index) => ({ value, index }))
            .filter(({ index }) => index >= startIdx && index <= endIdx)
            .map(({ value, index }) => {
              const isActivePointer = activeIndices.includes(index);

              let gridBg = 'bg-blue-400/10 border-blue-400/40 text-blue-200';
              if (isFound && isActivePointer) {
                gridBg = 'bg-green-500 border-green-400 text-white shadow-[0_0_35px_rgba(34,197,94,0.6)] font-black ring-2 ring-green-300 animate-pulse';
              } else if (isActivePointer) {
                gridBg = 'bg-purple-600 border-purple-400 text-white shadow-[0_0_25px_rgba(147,51,234,0.5)] font-black ring-2 ring-purple-400';
              }

              const isLinear = activeSearchingAlgorithm && activeSearchingAlgorithm.toLowerCase().includes('linear');
              const isLow = !isLinear && index === startIdx;
              const isHigh = !isLinear && index === endIdx;
              const isMid = !isLinear && activeIndices.includes(index);

              return (
                <motion.div
                  key={value}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 60, scale: 0.7, transition: { duration: 0.4 } }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="flex flex-col items-center group relative min-w-[72px]"
                >
                  {/* Visual low/mid/high Pointer Labels Above elements */}
                  <div className="h-6 text-xs font-mono font-bold tracking-wide select-none">
                    {isLow && <span className="text-purple-300">low</span>}
                    {isMid && <span className="text-pink-300 ml-2">mid</span>}
                    {isHigh && <span className="text-purple-300 ml-2">high</span>}
                  </div>

                  {/* Main value box */}
                  <motion.div
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border backdrop-blur-md select-none transition-all duration-300 cursor-default ${gridBg} relative overflow-visible shadow-lg shadow-black/20 hover:scale-105`}
                  >
                    <span className="text-lg font-sans font-bold tracking-tight">{value}</span>
                  </motion.div>

                  {/* Scanning pointer label at the bottom */}
                  <div className="h-12 flex flex-col items-center justify-start mt-2">
                    {isActivePointer && !isFound && (
                      <motion.div
                        layoutId={`pointer-scanning-${index}`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center select-none"
                      >
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-purple-400 mb-1 animate-bounce" />
                        <div className="text-[10px] font-black bg-purple-900 border border-purple-400/40 rounded px-1.5 py-0.5 tracking-wider select-none shadow-md text-purple-200">
                          SCANNING
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Manual Step Controls right inside the visualizer */}
      <div className="flex gap-4 select-none">
        <button
          onClick={() => globalEngine.stepBackward()}
          className="px-4 py-2 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition"
        >
          ⏮ Previous Step
        </button>
        <button
          onClick={() => globalEngine.stepForward()}
          className="px-4 py-2 bg-ice-blue/20 border border-ice-blue/40 hover:bg-ice-blue/30 text-ice-blue rounded-lg text-sm font-bold transition"
        >
          ⏭ Next Step
        </button>
      </div>

      {/* ── 3. Footer Section ── */}
      <div className="text-slate-600 font-mono text-[10px] uppercase tracking-widest select-none">
        Array-Based Search Visualization
      </div>
    </div>
  );
}
