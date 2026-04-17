import { useEffect, useState } from 'react';
import { globalEventBus } from '../../core/EventBus';
import { globalEngine } from '../../core/AnimationEngine';
import type { VisualizationEvent } from '../../types';

export default function PlaybackDeck() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((e: VisualizationEvent) => {
      if (e.type === 'SYSTEM_PLAYBACK_STATE') {
        setIsPlaying(e.isPlaying);
        setCurrentStep(e.currentStep);
        setTotalSteps(e.totalSteps);
        setSpeed(e.speed);
      } else if (e.type === 'TRACE_LOADED') {
        // Assume loaded implies ready but not playing yet, step 0
        setCurrentStep(0);
        setIsPlaying(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      globalEngine.pause();
    } else {
      globalEngine.play();
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseInt(e.target.value, 10);
    globalEngine.seekTo(target);
  };



  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-panel-elevated px-8 py-4 flex items-center gap-6 z-50 transition-all duration-300">
      <div className="flex items-center gap-4 border-r border-ice-blue/20 pr-6">
        <button 
          onClick={() => globalEngine.stepBackward()}
          disabled={currentStep === 0 || isPlaying}
          className="text-slate-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Step Backward"
        >
          ⏮
        </button>
        <button 
          onClick={handlePlayPause}
          disabled={totalSteps === 0}
          className="w-12 h-12 rounded-full bg-ice-blue/20 border border-ice-blue text-ice-blue flex items-center justify-center luminous-border hover:bg-ice-blue/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button 
          onClick={() => globalEngine.stepForward()}
          disabled={currentStep >= totalSteps || isPlaying}
          className="text-slate-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Step Forward"
        >
          ⏭
        </button>
      </div>
      
      <div className="flex flex-col gap-1">
        <input 
          type="range" 
          min="0" 
          max={totalSteps} 
          value={currentStep} 
          onChange={handleScrub}
          className="w-64 accent-ice-blue h-1 outline-none bg-white/10 rounded-full cursor-pointer appearance-none"
          disabled={totalSteps === 0 || isPlaying}
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>{currentStep}</span>
          <span>{totalSteps}</span>
        </div>
      </div>

      <div className="border-l border-ice-blue/20 pl-6">
        <select 
          value={speed}
          onChange={(e) => globalEngine.setSpeed(parseFloat(e.target.value))}
          className="bg-transparent text-sm text-slate-300 outline-none border border-ice-blue/20 rounded px-2 py-1 cursor-pointer"
        >
          <option value="0.5">0.5x</option>
          <option value="1.0">1.0x</option>
          <option value="2.0">2.0x</option>
          <option value="4.0">4.0x</option>
        </select>
      </div>
    </div>
  );
}
