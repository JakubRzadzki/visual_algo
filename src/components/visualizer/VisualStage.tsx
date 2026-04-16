import React, { useEffect, useRef } from 'react';
import { CanvasRenderer } from '../../core/CanvasRenderer';

export default function VisualStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    // Initialize 
    rendererRef.current = new CanvasRenderer(canvasRef.current);
    rendererRef.current.init();

    // Handle responsive resizes gracefully without triggering React loops
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        rendererRef.current?.resize(width, height);
      }
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
      rendererRef.current?.destroy();
    };
  }, []);

  return (
    <div className="flex-1 w-full h-full relative p-6">
      <div className="absolute top-4 left-4 z-10 glass-panel px-4 py-2">
        <h3 className="font-medium text-slate-200">Stage: Idle</h3>
        <p className="text-xs text-slate-400">Renderer: High-Perf Canvas API</p>
      </div>
      
      <div ref={wrapperRef} className="w-full h-full border border-dashed border-ice-blue/20 rounded-xl flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
