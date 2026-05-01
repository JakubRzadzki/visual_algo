import { useEffect, useRef } from 'react';
import { CanvasRenderer } from '../../core/CanvasRenderer';

export default function VisualStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    // Initialize
    rendererRef.current = new CanvasRenderer(canvasRef.current);
    rendererRef.current?.init();

    // Handle responsive resizes gracefully without triggering React loops
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
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
    <div className="flex-1 w-full h-full flex flex-col gap-4 p-6">
      {/* Canvas Visualization - Takes full remaining space */}
      <div ref={wrapperRef} className="flex-1 rounded-xl flex items-center justify-center overflow-hidden bg-[#0a0e1a] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
