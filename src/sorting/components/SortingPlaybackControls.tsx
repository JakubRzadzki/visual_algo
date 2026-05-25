/**
 * @file SortingPlaybackControls.tsx
 * @description Clean, compact, glassmorphic floating playback control panel
 * for the snapshot-based sorting visualizer.
 *
 * Renders Play/Pause, Step Forward/Back, Reset controls, and a speed slider.
 */

import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import type { PlaybackControls } from "../hooks/useSortingPlayback";
import { useUIStore } from "../../store/uiStore";

interface SortingPlaybackControlsProps {
  /** All playback controls from the useSortingPlayback hook. */
  playback: PlaybackControls;
}

export default function SortingPlaybackControls({
  playback,
}: SortingPlaybackControlsProps) {
  const { isPlaying, frameIndex, totalFrames, speed } = playback;
  const progress = totalFrames > 0 ? (frameIndex / (totalFrames - 1)) * 100 : 0;
  const language = useUIStore((state) => state.language);

  // Localized strings
  const labels = {
    reset: language === "pl" ? "Resetuj" : "Reset",
    prev: language === "pl" ? "Poprzedni krok" : "Step Backward",
    play: language === "pl" ? "Uruchom" : "Play",
    pause: language === "pl" ? "Pauza" : "Pause",
    next: language === "pl" ? "Następny krok" : "Step Forward",
    speed: language === "pl" ? "Prędkość odtwarzania" : "Playback speed",
  };

  return (
    <div className="w-full bg-slate-900/70 backdrop-blur-xl border-t border-white/[0.06] px-3 sm:px-6 py-3 sm:py-4 z-50">
      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* ── Transport Controls ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reset */}
          <button
            onClick={playback.reset}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            title={labels.reset}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Backward */}
          <button
            onClick={playback.stepBackward}
            disabled={frameIndex === 0 || isPlaying}
            className="p-2 text-slate-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white/5"
            title={labels.prev}
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Play/Pause — large glowing button */}
          <button
            onClick={playback.togglePlayPause}
            disabled={totalFrames === 0}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
              bg-cyan-500/15 border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/25 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)]"
            title={isPlaying ? labels.pause : labels.play}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={playback.stepForward}
            disabled={frameIndex >= totalFrames - 1 || isPlaying}
            className="p-2 text-slate-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-white/5"
            title={labels.next}
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Frame counter */}
          <span className="text-xs text-slate-500 font-mono ml-1 hidden sm:inline">
            {frameIndex + 1} / {totalFrames}
          </span>
        </div>

        {/* ── Speed Slider ── */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono w-8 text-right">
            {speed}x
          </span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={speed}
            onChange={(e) => playback.setSpeed(parseInt(e.target.value))}
            className="cyber-range w-24 sm:w-36 accent-cyan-400"
            title={labels.speed}
          />
        </div>
      </div>
    </div>
  );
}

