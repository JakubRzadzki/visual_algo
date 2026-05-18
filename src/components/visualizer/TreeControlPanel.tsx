import React from "react";
import { useTreeStore } from "../../store/treeStore";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

export const TreeControlPanel: React.FC = () => {
  const { isPlaying, play, pause, nextStep, prevStep, reset, speed, setSpeed } =
    useTreeStore();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 glass-panel p-3 rounded-2xl border border-white/10 bg-[#070b16]/90 shadow-xl flex gap-4 items-center justify-center min-w-[300px]">
      <div className="flex gap-2">
        <button
          onClick={prevStep}
          className="p-2 bg-white/5 rounded-lg text-slate-300 hover:text-white"
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={isPlaying ? pause : play}
          className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 hover:bg-cyan-500/30"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={nextStep}
          className="p-2 bg-white/5 rounded-lg text-slate-300 hover:text-white"
        >
          <SkipForward size={16} />
        </button>
        <button
          onClick={reset}
          className="p-2 bg-white/5 rounded-lg text-slate-300 hover:text-white"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 mx-2" />

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-24"
        />
        <span className="w-12">{speed}ms</span>
      </div>
    </div>
  );
};
