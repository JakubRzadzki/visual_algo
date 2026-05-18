/**
 * @file PresentationOverlay.tsx
 * @description Full-screen cinematic presentation mode overlay.
 *
 * Renders an immersive bottom HUD bar showing the current algorithm info,
 * source code language badge, step progress, countdown timer, and navigation
 * controls. Automatically navigates between algorithms and triggers execution
 * via the sandbox API or local worker pool.
 */

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Monitor,
  Timer,
  Code2,
} from "lucide-react";
import { usePresentationStore } from "../../store/presentationStore";
import { globalEventBus } from "../../core/EventBus";

/** Seconds to display each completed algorithm before moving to the next. */
const SLIDE_DISPLAY_SECONDS = 12;
/** Delay before auto-running the code after navigation (ms). */
const RUN_DELAY_MS = 2000;

/**
 * Renders the presentation mode cinematic overlay.
 *
 * When active, it drives navigation, code execution, and auto-advancement
 * through every algorithm in the catalog, alternating Python and C++ on each slide.
 */
export const PresentationOverlay: React.FC = () => {
  const {
    isActive,
    playlist,
    currentIndex,
    slidePhase,
    isPaused,
    countdownSeconds,
    nextSlide,
    prevSlide,
    togglePause,
    stopPresentation,
    setSlidePhase,
    setCountdown,
  } = usePresentationStore();

  const navigate = useNavigate();
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRunRef = useRef<boolean>(false);

  const currentItem = playlist[currentIndex];

  // Phase 1: Navigate to the algorithm route when a new slide becomes active
  useEffect(() => {
    if (!isActive || !currentItem) return;

    hasRunRef.current = false;
    setSlidePhase("navigating");

    // Navigate to the algorithm page
    navigate(currentItem.route);

    // Short delay to let the route mount, then transition to loading phase
    const navTimer = setTimeout(() => {
      setSlidePhase("loading-code");
    }, 800);

    return () => clearTimeout(navTimer);
  }, [isActive, currentIndex, currentItem?.route]);

  // Phase 2: Auto-run the code after the editor has loaded
  useEffect(() => {
    if (
      !isActive ||
      slidePhase !== "loading-code" ||
      !currentItem ||
      hasRunRef.current
    )
      return;

    hasRunRef.current = true;

    runTimeoutRef.current = setTimeout(() => {
      setSlidePhase("running");

      // Click the Run button programmatically
      const runBtn = document.getElementById(
        "run-code-btn",
      ) as HTMLButtonElement | null;
      if (runBtn && !runBtn.disabled) {
        runBtn.click();
      }

      // Also switch the language selector to the presentation language
      const langSelector = document.getElementById(
        "language-selector",
      ) as HTMLButtonElement | null;
      if (langSelector) {
        // We need to set language through the Monaco editor component
        // The language switching is handled by clicking the dropdown option
        langSelector.click();
        setTimeout(() => {
          const langOption = document.getElementById(
            `lang-option-${currentItem.language}`,
          );
          if (langOption) {
            langOption.click();
          }
        }, 200);
      }

      setSlidePhase("animating");
    }, RUN_DELAY_MS);

    return () => {
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
    };
  }, [isActive, slidePhase, currentItem?.language]);

  // Phase 3: Listen for playback completion and start countdown to next slide
  useEffect(() => {
    if (!isActive || slidePhase !== "animating") return;

    const unsub = globalEventBus.subscribe((e) => {
      if (e.type === "SYSTEM_PLAYBACK_STATE") {
        const state = e as any;
        // Animation finished when not playing and current step reached total
        if (
          !state.isPlaying &&
          state.currentStep >= state.totalSteps &&
          state.totalSteps > 0
        ) {
          setSlidePhase("done");
          setCountdown(SLIDE_DISPLAY_SECONDS);
        }
      }
    });

    // Also start countdown after a max wait of 30 seconds (for algorithms without sandbox)
    const maxWaitTimer = setTimeout(() => {
      if (usePresentationStore.getState().slidePhase === "animating") {
        setSlidePhase("done");
        setCountdown(SLIDE_DISPLAY_SECONDS);
      }
    }, 30000);

    return () => {
      unsub();
      clearTimeout(maxWaitTimer);
    };
  }, [isActive, slidePhase]);

  // Phase 4: Countdown timer for auto-advancing to next slide
  useEffect(() => {
    if (!isActive || slidePhase !== "done" || isPaused) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    countdownRef.current = setInterval(() => {
      const current = usePresentationStore.getState().countdownSeconds;
      if (current <= 1) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        nextSlide();
      } else {
        setCountdown(current - 1);
      }
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [isActive, slidePhase, isPaused]);

  // Keyboard shortcuts for presentation mode
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          stopPresentation();
          break;
        case "ArrowRight":
        case "Right":
          e.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
        case "Left":
          e.preventDefault();
          prevSlide();
          break;
        case " ":
          e.preventDefault();
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextSlide, prevSlide, togglePause, stopPresentation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
    };
  }, []);

  if (!isActive || !currentItem) return null;

  const totalSlides = playlist.length;
  const progress = ((currentIndex + 1) / totalSlides) * 100;
  const langLabel = currentItem.language === "python" ? "Python" : "C++";
  const langColor =
    currentItem.language === "python" ? "text-yellow-400" : "text-blue-400";
  const langBg =
    currentItem.language === "python"
      ? "bg-yellow-500/15 border-yellow-500/30"
      : "bg-blue-500/15 border-blue-500/30";

  const phaseLabel = {
    navigating: "Navigating...",
    "loading-code": "Loading code...",
    running: "Executing...",
    animating: "Animating...",
    done: isPaused ? "Paused" : `Next in ${countdownSeconds}s`,
  }[slidePhase];

  const content = (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="presentation-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-[9990] pointer-events-none"
        >
          {/* Top progress bar */}
          <div className="fixed top-16 left-0 right-0 h-1 bg-slate-900/50 pointer-events-none z-[9991]">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>

          {/* Top-right presentation badge */}
          <div className="fixed top-[76px] right-6 z-[9991] pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-lg">
              <Monitor className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Presentation Mode
              </span>
              <button
                onClick={stopPresentation}
                className="ml-1 p-0.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Exit Presentation"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bottom cinematic HUD bar */}
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="pointer-events-auto mx-4 mb-4 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-slate-700/40 shadow-[0_-8px_40px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Slide progress dots */}
            <div className="px-6 pt-3 flex gap-0.5 flex-wrap max-h-3">
              {playlist.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-[3px] rounded-full transition-all duration-500 cursor-pointer ${
                    idx === currentIndex
                      ? "w-6 bg-cyan-400"
                      : idx < currentIndex
                        ? "w-2 bg-cyan-600/60"
                        : "w-1.5 bg-slate-700/60"
                  }`}
                  onClick={() =>
                    usePresentationStore.getState().jumpToSlide(idx)
                  }
                />
              ))}
            </div>

            {/* Main content row */}
            <div className="flex items-center justify-between px-6 py-3.5 gap-6">
              {/* Left: Algorithm info */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Category + Algorithm name */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    {currentItem.category.label}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">
                    {currentItem.algorithm.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 truncate">
                    {currentItem.algorithm.description}
                  </span>
                </div>

                {/* Complexity badges */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {currentItem.algorithm.timeComplexity}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    {currentItem.algorithm.spaceComplexity}
                  </span>
                </div>
              </div>

              {/* Center: Language badge + Phase */}
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${langBg}`}
                >
                  <Code2 className={`w-3.5 h-3.5 ${langColor}`} />
                  <span className={`text-xs font-bold ${langColor}`}>
                    {langLabel}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40">
                  <Timer className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-300">
                    {phaseLabel}
                  </span>
                </div>
              </div>

              {/* Right: Navigation controls */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-500 font-mono mr-1">
                  {currentIndex + 1}/{totalSlides}
                </span>

                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Previous (←)"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePause}
                  className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/25 hover:text-cyan-300 transition-all active:scale-95"
                  title={isPaused ? "Resume (Space)" : "Pause (Space)"}
                >
                  {isPaused ? (
                    <Play className="w-4 h-4 fill-current" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={nextSlide}
                  disabled={currentIndex >= totalSlides - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Next (→)"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-slate-700/50 mx-1" />

                <button
                  onClick={stopPresentation}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Exit (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default PresentationOverlay;
