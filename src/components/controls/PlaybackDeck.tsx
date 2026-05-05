import { useEffect, useState } from 'react';
import { globalEventBus } from '../../core/EventBus';
import { globalEngine } from '../../core/AnimationEngine';
import type { VisualizationEvent } from '../../types';

import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

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



  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-panel-elevated px-8 py-3 flex items-center gap-6 z-50 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 scale-90 sm:scale-100">
      <div className="flex items-center gap-4 border-r border-ice-blue/20 pr-6">
        <button 
          onClick={() => globalEngine.stepBackward()}
          disabled={currentStep === 0 || isPlaying}
          className="text-slate-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Step Backward"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button 
          onClick={handlePlayPause}
          disabled={totalSteps === 0}
          className="w-12 h-12 rounded-full bg-ice-blue/20 border border-ice-blue text-ice-blue flex items-center justify-center luminous-border hover:bg-ice-blue/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>
        <button 
          onClick={() => globalEngine.stepForward()}
          disabled={currentStep >= totalSteps || isPlaying}
          className="text-slate-300 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Step Forward"
        >
          <SkipForward className="w-5 h-5" />
        </button>
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
