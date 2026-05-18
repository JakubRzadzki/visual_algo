import React, { useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useTreeStore } from "../../store/treeStore";
import { TreeCanvas } from "./TreeCanvas";
import { TreeControlPanel } from "./TreeControlPanel";
import { Info } from "lucide-react";

export default function TreeVisualizer(): React.ReactElement {
  const { isPlaying, currentStepIndex, steps, nextStep, speed, pause } =
    useTreeStore();

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIndex >= steps.length - 1 && steps.length > 0) {
      pause();
      return;
    }

    const timer = setTimeout(() => {
      nextStep();
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, speed, steps, nextStep, pause]);

  return (
    <div className="flex-1 w-full h-full flex flex-col relative overflow-hidden bg-slate-950/40">
      <div className="absolute top-4 left-4 z-10">
        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5 shadow-lg">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-200">
              Tree Visualizer
            </h3>
            <p className="text-[10px] text-slate-400">
              Drag to Pan • Scroll to Zoom
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full select-none cursor-grab active:cursor-grabbing">
        <TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
          centerOnInit={true}
          minScale={0.4}
          maxScale={2}
        >
          {() => (
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full"
            >
              <TreeCanvas />
            </TransformComponent>
          )}
        </TransformWrapper>
      </div>

      <TreeControlPanel />

      {steps[currentStepIndex] && (
        <div className="absolute top-4 right-4 z-10 glass-panel px-4 py-2.5 rounded-xl border border-white/5 text-slate-300 text-sm max-w-sm">
          {steps[currentStepIndex].description}
        </div>
      )}
    </div>
  );
}
