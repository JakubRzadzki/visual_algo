import React, { useEffect, useRef } from 'react';
import { GraphRenderer } from '../../core/GraphRenderer';
import type { GraphNode, GraphEdge } from '../../types';

interface GraphStageProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isAnimating?: boolean; // physics pauses while the engine is playing
}

/**
 * GraphStage
 * React wrapper that mounts GraphRenderer onto a <canvas>.
 * Mirrors the lifecycle pattern of VisualStage.tsx.
 */
export default function GraphStage({ nodes, edges, isAnimating = false }: GraphStageProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<GraphRenderer | null>(null);

  // Mount renderer once on first render
  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    const renderer = new GraphRenderer(canvasRef.current, nodes, edges);
    renderer.init();
    rendererRef.current = renderer;

    // Track container size changes — canvas must match its CSS size
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        rendererRef.current?.resize(width, height);
      }
    });
    ro.observe(wrapperRef.current);

    return () => {
      ro.disconnect();
      rendererRef.current?.destroy();
    };
    // Nodes + edges only passed once on mount; graph data updates are handled via WorkerPool results
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause / resume physics whenever animation playback state changes
  useEffect(() => {
    rendererRef.current?.setPhysicsActive(!isAnimating);
  }, [isAnimating]);

  return (
    <div className="flex-1 w-full h-full relative p-6">
      {/* Stage label */}
      <div className="absolute top-4 left-4 z-10 glass-panel px-4 py-2">
        <h3 className="font-medium text-slate-200">Stage: Graph</h3>
        <p className="text-xs text-slate-400">Renderer: Force-Directed Canvas · Worker Pool</p>
      </div>

      <div
        ref={wrapperRef}
        className="w-full h-full border border-dashed border-ice-blue/20 rounded-xl flex items-center justify-center overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
