import { useMemo } from 'react';
import CytoscapeGraph from './CytoscapeGraph';
import type { GraphNode, GraphEdge, GraphInput } from '../../types';

interface GraphStageProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * GraphStage
 * React wrapper that mounts CytoscapeGraph for better graph visualization
 * Shows algorithms like Dijkstra and Kruskal elegantly on force-directed layouts
 */
export default function GraphStage({ nodes, edges }: GraphStageProps) {
  // Memoize graph input to prevent unnecessary re-renders
  const graph: GraphInput = useMemo(() => ({
    nodes,
    edges,
    startNodeId: nodes.length > 0 ? nodes[0].id : undefined,
  }), [nodes, edges]);

  return (
    <div className="flex-1 w-full h-full relative">
      {/* Stage label */}
      <div className="absolute top-4 left-4 z-10 glass-panel px-4 py-2 rounded-lg">
        <h3 className="font-medium text-slate-200">Graph Visualization</h3>
        <p className="text-xs text-slate-400">Powered by Cytoscape.js</p>
      </div>

      {/* Cytoscape Graph */}
      <CytoscapeGraph graph={graph} />
    </div>
  );
}
