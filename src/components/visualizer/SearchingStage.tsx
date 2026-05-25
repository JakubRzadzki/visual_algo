/**
 * @file SearchingStage.tsx
 * @description Visualizes array searching algorithms using horizontal blocks and pointer arrows.
 * Direct trace-derived boundaries for complete deterministic scrubbing & time-travel playback.
 */

import { useState, useEffect } from "react";
import type { VisualizationEvent, ArrayInput } from "../../types";
import { globalEventBus } from "../../core/EventBus";
import { globalEngine } from "../../core/AnimationEngine";
import { motion, AnimatePresence } from "motion/react";
import { useUIStore } from "../../store/uiStore";

export default function SearchingStage() {
  const { visualizationData, activeSearchingAlgorithm, language } = useUIStore();
  const [array, setArray] = useState<number[]>(() => {
    if (visualizationData && "values" in visualizationData) {
      return [...(visualizationData as ArrayInput).values];
    }
    return [3, 9, 10, 27, 38, 43, 82];
  });
  const [, setStepCounter] = useState<number>(0);

  // Sync state changes when scrubbed or played
  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe(
      (event: VisualizationEvent) => {
        if (
          event.type === "SYSTEM_PLAYBACK_STATE" ||
          event.type === "TRACE_LOADED"
        ) {
          if ("currentStep" in event) {
            setStepCounter(event.currentStep);
          }
        } else if (event.step !== undefined) {
          setStepCounter(event.step);
        }
      },
    );
    return () => unsubscribe();
  }, []);

  // ─── Direct Trace Derivation (Time Travel) ───
  const engineState = globalEngine.getState();
  const currentStep = engineState.currentStep;
  const trace = globalEngine.getTrace();

  let startIdx = 0;
  let endIdx = array.length - 1;
  const activeIndices: number[] = [];
  let isFound = false;
  let target: number | null = null;
  let statusMessage = language === "pl" ? "Gotowy do skanowania" : "Ready to scan";

  if (trace && trace.events.length > 0) {
    if (trace.metadata?.initialState && array.length === 0) {
      setArray([...trace.metadata.initialState]);
      endIdx = trace.metadata.initialState.length - 1;
    }

    // Process all events up to the current step
    const eventsSlice = trace.events.slice(0, currentStep);

    eventsSlice.forEach((ev: VisualizationEvent) => {
      if ("target" in ev && typeof ev.target === "number") {
        target = ev.target;
      }
      if ("left" in ev && typeof ev.left === "number") {
        startIdx = ev.left;
      }
      if ("right" in ev && typeof ev.right === "number") {
        endIdx = ev.right;
      }

      // Elimination logic
      if (ev.type && ev.type.toUpperCase().includes("CHECK")) {
        if (
          activeSearchingAlgorithm &&
          activeSearchingAlgorithm.toLowerCase().includes("linear")
        ) {
          if (
            target !== null &&
            "value" in ev &&
            ev.value !== undefined &&
            ev.value !== target &&
            "index" in ev
          ) {
            startIdx = (ev as { index: number }).index + 1;
          }
        } else {
          if (
            "value" in ev &&
            ev.value !== undefined &&
            target !== null &&
            "index" in ev
          ) {
            const val = (ev as { value: number }).value;
            const idx = (ev as { index: number }).index;
            if (val < target) {
              startIdx = idx + 1;
            } else if (val > target) {
              endIdx = idx - 1;
            }
          }
        }
      }

      if (
        ev.type &&
        typeof ev.type === "string" &&
        ev.type.toUpperCase().includes("FOUND") &&
        !ev.type.toUpperCase().includes("NOT")
      ) {
        isFound = true;
      }
      if (
        ev.type &&
        typeof ev.type === "string" &&
        ev.type.toUpperCase().includes("NOT_FOUND")
      ) {
        isFound = false;
      }
    });

    // Active event highlights
    const activeEvent = trace.events[currentStep - 1];
    if (activeEvent) {
      const ev = activeEvent as VisualizationEvent;
      if ("index" in ev && typeof ev.index === "number")
        activeIndices.push(ev.index);
      if ("mid" in ev && typeof ev.mid === "number") activeIndices.push(ev.mid);
      if ("indices" in ev && Array.isArray(ev.indices)) {
        ev.indices.forEach((i: number) => {
          if (typeof i === "number") activeIndices.push(i);
        });
      }

      if (
        ev.type?.toUpperCase().includes("FOUND") &&
        !ev.type?.toUpperCase().includes("NOT")
      ) {
        const index = "index" in ev ? (ev as { index: number }).index : "?";
        statusMessage = language === "pl"
          ? `SUKCES: Znaleziono szukaną wartość pod indeksem [${index}]`
          : `SUCCESS: Target found at index [${index}]`;
      } else if (ev.type?.toUpperCase().includes("NOT_FOUND")) {
        statusMessage = language === "pl"
          ? `BŁĄD: Szukana wartość nie została znaleziona w tablicy`
          : `ERROR: Element not found in array`;
      } else if (activeIndices.length > 0) {
        statusMessage = language === "pl"
          ? `Porównywanie elementu ${array[activeIndices[0]]} z wartością szukaną...`
          : `Comparing element ${array[activeIndices[0]]} with target...`;
      } else if (ev.type?.toUpperCase().includes("NARROW")) {
        const left = "left" in ev ? (ev as { left: number }).left : "?";
        const right = "right" in ev ? (ev as { right: number }).right : "?";
        statusMessage = language === "pl"
          ? `Zawężanie okna wyszukiwania do indeksów [${left} - ${right}]`
          : `Narrowing search window to indices [${left} - ${right}]`;
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-8 gap-8 bg-[#0a0e1a] rounded-xl shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-ice-blue/10 select-none">
      {/* ── 1. Top Section: Descriptive Info & Target value card ── */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full select-none border-b border-ice-blue/10 gap-2">
        <div className="flex flex-col">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
            {language === "pl" ? "Proces wyszukiwania" : "Searching Process"}
          </h2>
          <div className="text-lg font-bold font-sans mt-1">
            {isFound ? (
              <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-pulse">
                {statusMessage}
              </span>
            ) : statusMessage.toLowerCase().includes("error") ? (
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
            <span className="text-xs font-semibold text-pink-300 uppercase tracking-wide">
              {language === "pl" ? "Szukana" : "Target"}
            </span>
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
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex flex-nowrap items-center justify-center w-full max-w-full relative min-h-[160px] px-2 overflow-hidden">
          <AnimatePresence>
            {array
              .map((value, index) => ({ value, index }))
              .filter(({ index }) => index >= startIdx && index <= endIdx)
              .map(({ value, index }) => {
                const isActivePointer = activeIndices.includes(index);

                let gridBg = "bg-blue-400/10 border-blue-400/40 text-blue-200";
                if (isFound && isActivePointer) {
                  gridBg =
                    "bg-green-500 border-green-400 text-white shadow-[0_0_35px_rgba(34,197,94,0.6)] font-black ring-2 ring-green-300 animate-pulse";
                } else if (isActivePointer) {
                  gridBg =
                    "bg-purple-600 border-purple-400 text-white shadow-[0_0_25px_rgba(147,51,234,0.5)] font-black ring-2 ring-purple-400";
                }

                const isLinear =
                  activeSearchingAlgorithm &&
                  activeSearchingAlgorithm.toLowerCase().includes("linear");
                const isLow = !isLinear && index === startIdx;
                const isHigh = !isLinear && index === endIdx;
                const isMid = !isLinear && activeIndices.includes(index);

                // ── Dynamic Scaling Logic ──
                // array.length can be up to 50+. We need to fit them all.
                const count = endIdx - startIdx + 1;
                const baseWidth =
                  count > 30 ? 32 : count > 20 ? 44 : count > 12 ? 56 : 64;
                const baseGap =
                  count > 30 ? 1 : count > 20 ? 2 : count > 12 ? 4 : 12;
                const fontSize =
                  count > 30
                    ? "text-[10px]"
                    : count > 20
                      ? "text-xs"
                      : "text-lg";

                return (
                  <motion.div
                    key={value}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: 60,
                      scale: 0.7,
                      transition: { duration: 0.4 },
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    style={{
                      marginRight: `${baseGap}px`,
                      marginLeft: `${baseGap}px`,
                    }}
                    className="flex flex-col items-center group relative flex-shrink"
                  >
                    {/* Visual low/mid/high Pointer Labels Above elements */}
                    <div
                      className={`h-6 ${count > 25 ? "text-[8px]" : "text-xs"} font-mono font-bold tracking-tight select-none flex gap-1`}
                    >
                      {isLow && <span className="text-purple-300">L</span>}
                      {isMid && <span className="text-pink-300">M</span>}
                      {isHigh && <span className="text-purple-300">H</span>}
                    </div>

                    {/* Main value box */}
                    <motion.div
                      style={{
                        width: `${baseWidth}px`,
                        height: `${baseWidth}px`,
                      }}
                      className={`flex flex-col items-center justify-center rounded-lg border backdrop-blur-md select-none transition-all duration-300 cursor-default ${gridBg} relative overflow-visible shadow-lg shadow-black/20 hover:scale-110`}
                    >
                      <span
                        className={`${fontSize} font-sans font-bold tracking-tight`}
                      >
                        {value}
                      </span>
                    </motion.div>

                    {/* Scanning pointer label at the bottom */}
                    <div className="h-16 flex flex-col items-center justify-start mt-4">
                      {isActivePointer && !isFound && (
                        <motion.div
                          layoutId={`pointer-scanning-${index}`}
                          initial={{ opacity: 0, y: -10, scale: 0.5 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="flex flex-col items-center select-none"
                        >
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              ease: "easeInOut",
                            }}
                            className={`w-0 h-0 border-l-transparent border-r-transparent border-b-purple-400 mb-2 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] ${count > 20 ? "border-l-[5px] border-r-[5px] border-b-[8px]" : "border-l-[8px] border-r-[8px] border-b-[12px]"}`}
                          />
                          <div
                            className={`${count > 20 ? "text-[8px]" : "text-[10px]"} font-black bg-purple-600 border border-purple-300 text-white rounded-full px-2 py-0.5 tracking-tighter select-none shadow-lg shadow-purple-500/40 uppercase`}
                          >
                            {count > 25 ? (language === "pl" ? "S" : "S") : (language === "pl" ? "SKAN" : "SCAN")}
                          </div>
                        </motion.div>
                      )}
                      {isFound && isActivePointer && (
                        <motion.div
                          layoutId={`pointer-found-${index}`}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center select-none"
                        >
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className={`w-0 h-0 border-l-transparent border-r-transparent border-b-emerald-400 mb-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] ${count > 20 ? "border-l-[5px] border-r-[5px] border-b-[8px]" : "border-l-[8px] border-r-[8px] border-b-[12px]"}`}
                          />
                          <div
                            className={`${count > 20 ? "text-[8px]" : "text-[10px]"} font-black bg-emerald-500 border border-emerald-300 text-white rounded-full px-2 py-0.5 tracking-tighter select-none shadow-lg shadow-emerald-500/40 uppercase`}
                          >
                            {count > 25 ? (language === "pl" ? "Z" : "F") : (language === "pl" ? "ZNAJDZIONO" : "FOUND")}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
