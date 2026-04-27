import { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { globalEventBus } from '../../core/EventBus';
import type { GraphInput } from '../../types';

export default function CytoscapeGraph({ 
  graph
}: { 
  graph: GraphInput;
}) {
  const cyRef = useRef<any>(null);
  const [elements, setElements] = useState<any[]>([]);
  const layoutRanRef = useRef(false);

  // Convert graph input to Cytoscape elements
  useEffect(() => {
    layoutRanRef.current = false;
    
    const nodeElements = graph.nodes.map((node: any) => ({
      data: {
        id: node.id,
        label: node.label,
      },
      position: { x: node.x, y: node.y },
    }));

    const edgeElements = graph.edges.map((edge: any) => ({
      data: {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        weight: edge.weight,
        label: `${edge.weight}`,
      },
    }));

    setElements([...nodeElements, ...edgeElements]);
  }, [graph]);

  // Handle visualization events (highlighting during algorithm execution)
  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((event: any) => {
      if (!cyRef.current) return;

      if (event.type === 'GRAPH_NODE_HIGHLIGHT') {
        const nodeId = event.nodeId;
        if (nodeId && cyRef.current.getElementById(nodeId).length > 0) {
          const node = cyRef.current.getElementById(nodeId);
          
          node.animate({
            style: {
              'background-color': '#10b981',
              'border-width': 3,
              'border-color': '#34d399',
            }
          }, { duration: 200 });

          // Nodes in Dijkstra/Kruskal stay highlighted to show they are visited/processed
          // So no timeout to revert them.
        }
      } else if (event.type === 'GRAPH_EDGE_HIGHLIGHT' || event.type === 'GRAPH_RELAX') {
        const edgeId = event.edgeId;
        if (edgeId && cyRef.current.getElementById(edgeId).length > 0) {
          const edge = cyRef.current.getElementById(edgeId);
          
          const highlightColor = event.type === 'GRAPH_RELAX' ? '#0ea5e9' : (event.accepted ? '#10b981' : '#f59e0b');

          edge.animate({
            style: {
              'line-color': highlightColor,
              'target-arrow-color': highlightColor,
              'width': 3,
            }
          }, { duration: 200 });

          // Only revert if it's an exploration that was rejected or just a transient visit
          const isPermanent = event.type === 'GRAPH_RELAX' || (event.type === 'GRAPH_EDGE_HIGHLIGHT' && event.accepted === true);
          if (!isPermanent) {
            setTimeout(() => {
              if (!cyRef.current || cyRef.current.destroyed()) return;
              edge.animate({
                style: {
                  'line-color': '#64748b',
                  'target-arrow-color': '#64748b',
                  'width': 2,
                }
              }, { duration: 300 });
            }, 500);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Re-run layout when elements change (only once per graph)
  useEffect(() => {
    if (!cyRef.current || elements.length === 0 || layoutRanRef.current) return;

    layoutRanRef.current = true;

    const layout = cyRef.current.layout({
      name: 'cose',
      directed: graph.isDirected ?? true,
      animate: true,
      animationDuration: 600,
      nodeDimensionsIncludeLabels: true,
      randomize: true,
      componentSpacing: 100,
      nodeSpacing: 60,
      gravity: 1.0,
      cooling: 0.96,
      coolingFactor: 0.999,
      edgeElasticity: 0.5,
      nodeRepulsion: 3000,
      numIter: 3000,
      initialTemp: 300,
      minTemp: 0.5,
    } as any);

    layout.run();
  }, [elements, graph.isDirected]);



  return (
    <div className="w-full h-full flex flex-col">
      <CytoscapeComponent
        elements={elements}
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0e1a',
        }}
        stylesheet={[
          {
            selector: 'node',
            style: {
              'background-color': '#06b6d4',
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'width': 45,
              'height': 45,
              'font-size': 12,
              'color': '#f1f5f9',
              'font-family': 'monospace',
              'font-weight': 'bold',
              'border-width': 2,
              'border-color': '#0891b2',
            } as any,
          },
          {
            selector: 'node:selected',
            style: {
              'background-color': '#0891b2',
              'border-width': 3,
              'border-color': '#06b6d4',
            } as any,
          },
          {
            selector: 'edge',
            style: {
              'target-arrow-color': '#64748b',
              'line-color': '#64748b',
              'width': 2,
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': 10,
              'color': '#94a3b8',
              'text-background-color': '#1e293b',
              'text-background-opacity': 0.8,
              'text-background-padding': '2px',
              'arrow-scale': 1.5,
              'target-arrow-shape': (graph.isDirected ?? true) ? 'triangle' : 'none',
            } as any,
          },
          // Highlight classes
          {
            selector: 'node.highlight-visited',
            style: {
              'background-color': '#10b981',
              'border-width': 3,
              'border-color': '#34d399',
            } as any,
          },
          {
            selector: 'edge.highlight-relax',
            style: {
              'line-color': '#0ea5e9',
              'target-arrow-color': '#0ea5e9',
              'width': 3,
            } as any,
          },
          {
            selector: 'edge.highlight-accept',
            style: {
              'line-color': '#10b981',
              'target-arrow-color': '#10b981',
              'width': 3,
            } as any,
          },
          {
            selector: 'edge.highlight-reject',
            style: {
              'line-color': '#f59e0b',
              'target-arrow-color': '#f59e0b',
              'width': 3,
            } as any,
          },
        ]}
        cy={(cy: any) => {
          cyRef.current = cy;
        }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-panel px-4 py-3 rounded-lg text-xs space-y-1 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <span>Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-3 bg-slate-500" />
          <span>Edge Weight</span>
        </div>
      </div>
    </div>
  );
}
