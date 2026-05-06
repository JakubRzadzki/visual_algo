import { useEffect, useRef, useMemo, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { useParams } from 'react-router-dom';
import { globalEventBus } from '../../core/EventBus';
import { globalEngine } from '../../core/AnimationEngine';
import { useUIStore } from '../../store/uiStore';
import type { GraphInput, GraphNode, GraphEdge, VisualizationEvent } from '../../types';

cytoscape.use(dagre);

/**
 * CytoscapeGraph
 * 
 * Interactive force-directed graph canvas built using Cytoscape.js.
 * Fully customized colors, interactive state info panel, backwards playback scrubbing
 * and clear style resets upon different algorithm selections.
 * 
 * @param props - Graph properties containing nodes and edges.
 * @returns React component.
 */
export default function CytoscapeGraph({ 
  graph
}: { 
  graph: GraphInput;
}) {
  const { algoId } = useParams<{ algoId: string }>();
  const cyRef = useRef<cytoscape.Core | null>(null);
  const layoutRanRef = useRef(false);
  const activeGraphAlgorithm = useUIStore((state) => state.activeGraphAlgorithm);
  // Layout selector
  const [layoutName, setLayoutName] = useState<'preset' | 'cose' | 'dagre'>('cose');

  // Dynamic Info Sidebar states
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [indegree, setIndegree] = useState<Record<string, number>>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [mstEdges, setMstEdges] = useState<string[]>([]);
  const [msg, setMsg] = useState<string>('');

  // Derived algorithm state from trace playback events
  const syncStateWithEvents = (eventsSoFar: VisualizationEvent[]) => {
    const activeAlgo = algoId || activeGraphAlgorithm || 'dijkstra';
    
    // Initializing state
    const d: Record<string, number> = {};
    const ind: Record<string, number> = {};
    let q: string[] = [];
    const mst: string[] = [];
    let currentMsg = '';

    for (const n of graph.nodes) {
      d[n.id] = Infinity;
      ind[n.id] = 0;
    }
    for (const e of graph.edges) {
      ind[e.to] = (ind[e.to] || 0) + 1;
    }

    for (const ev of eventsSoFar) {
      if (ev.type === 'SYSTEM_LOG') {
        currentMsg = ev.message;
      } else if (ev.type === 'GRAPH_NODE_HIGHLIGHT' && ev.nodeId) {
        if (activeAlgo === 'bfs' || activeAlgo === 'dfs') {
          if (!q.includes(ev.nodeId)) q.push(ev.nodeId);
        }
        if (ev.distance !== undefined) {
          d[ev.nodeId] = ev.distance;
        }
      } else if (ev.type === 'GRAPH_EDGE_HIGHLIGHT' && ev.edgeId) {
        if (ev.accepted) {
          if (!mst.includes(ev.edgeId)) mst.push(ev.edgeId);
          const edge = graph.edges.find(e => e.id === ev.edgeId);
          if (edge) {
            ind[edge.to] = Math.max(0, (ind[edge.to] || 1) - 1);
            if (activeAlgo === 'bfs' || activeAlgo === 'dfs') {
              q = q.filter(el => el !== edge.from);
            }
          }
        }
      } else if (ev.type === 'GRAPH_RELAX' && ev.edgeId) {
        if (!mst.includes(ev.edgeId)) mst.push(ev.edgeId);
        const edge = graph.edges.find(e => e.id === ev.edgeId);
        if (edge) {
          d[edge.to] = ev.weight;
        }
      }
    }

    setDistances(d);
    setIndegree(ind);
    setQueue(q);
    setMstEdges(mst);
    setMsg(currentMsg);

    // Dynamic labels in Cytoscape based on algorithm type
    if (cyRef.current) {
      for (const n of graph.nodes) {
        const el = cyRef.current.getElementById(n.id);
        if (el.length > 0) {
          let lbl = n.label || n.id;
          if (activeAlgo === 'dijkstra') {
            const dist = d[n.id] === Infinity ? '∞' : d[n.id];
            lbl = `${lbl}\nd: ${dist}`;
          } else if (activeAlgo === 'topo-sort') {
            const val = ind[n.id] ?? 0;
            lbl = `${lbl}\nin: ${val}`;
          }
          el.data('label', lbl);
        }
      }
    }
  };

  const elements = useMemo(() => {
    const nodeElements = graph.nodes.map((node: GraphNode) => ({
      data: { id: node.id, label: node.label },
      position: { x: node.x, y: node.y },
      classes: node.hidden ? 'hidden-element' : '',
    }));

    const edgeElements = graph.edges.map((edge: GraphEdge) => ({
      data: {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        weight: edge.weight,
        label: `${edge.weight}`,
      },
      classes: edge.hidden ? 'hidden-element' : '',
    }));

    return [...nodeElements, ...edgeElements];
  }, [graph.nodes, graph.edges]);



  // Handle visualization events during traces
  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((event: VisualizationEvent) => {
      if (!cyRef.current) return;

      const trace = globalEngine.getTrace();
      if (trace) {
        const eventsSoFar = trace.events.slice(0, event.step + 1);
        syncStateWithEvents(eventsSoFar);
      }

      // Explicit event cleanup on TRACE_LOADED
      if (event.type === 'TRACE_LOADED') {
        cyRef.current.elements().removeStyle();
        cyRef.current.elements().removeClass('highlight-visited highlight-relax highlight-accept highlight-reject');
        layoutRanRef.current = false;
        syncStateWithEvents([]);
        return;
      }

      // Handle backwards scrubbing
      if (event.isReverse) {
        if (event.type === 'GRAPH_NODE_HIGHLIGHT' && event.nodeId) {
          const node = cyRef.current.getElementById(event.nodeId);
          if (node.length > 0) node.removeStyle();
        } else if ((event.type === 'GRAPH_EDGE_HIGHLIGHT' || event.type === 'GRAPH_RELAX') && event.edgeId) {
          const edge = cyRef.current.getElementById(event.edgeId);
          if (edge.length > 0) edge.removeStyle();
        } else if (event.type === 'GRAPH_NODE_ADD') {
          const node = cyRef.current.getElementById((event as any).nodeId);
          if (node.length > 0) node.addClass('hidden-element');
        } else if (event.type === 'GRAPH_EDGE_ADD') {
          const edge = cyRef.current.getElementById((event as any).edgeId);
          if (edge.length > 0) edge.addClass('hidden-element');
        }
        return;
      }

      if (event.type === 'GRAPH_NODE_ADD') {
        const nodeId = (event as any).nodeId;
        if (nodeId && cyRef.current.getElementById(nodeId).length > 0) {
          cyRef.current.getElementById(nodeId).removeClass('hidden-element');
        }
      } else if (event.type === 'GRAPH_EDGE_ADD') {
        const edgeId = (event as any).edgeId;
        if (edgeId && cyRef.current.getElementById(edgeId).length > 0) {
          cyRef.current.getElementById(edgeId).removeClass('hidden-element');
        }
      } else if (event.type === 'GRAPH_NODE_HIGHLIGHT') {
        const nodeId = event.nodeId;
        if (nodeId && cyRef.current.getElementById(nodeId).length > 0) {
          const node = cyRef.current.getElementById(nodeId);
          
          let bgColor = '#1f2937'; // Default Node color
          let borderColor = '#4b5563';

          if (event.status === 'start') {
            bgColor = '#22c55e'; // Start Node
            borderColor = '#34d399';
          } else if (event.status === 'queued') {
            bgColor = '#a855f7'; // Queued Node
            borderColor = '#c084fc';
          } else if (event.status === 'current') {
            bgColor = '#facc15'; // Active Node
            borderColor = '#fde047';
          } else if (event.status === 'path') {
            bgColor = '#ec4899'; // Final Path Node
            borderColor = '#f472b6';
          } else if (event.status === 'visited') {
            bgColor = '#3b82f6'; // Visited Node
            borderColor = '#60a5fa';
          }

          node.animate({
            style: {
              'background-color': bgColor,
              'border-width': 3,
              'border-color': borderColor,
            }
          }, { duration: 200 });
        }
      } else if (event.type === 'GRAPH_EDGE_HIGHLIGHT' || event.type === 'GRAPH_RELAX') {
        const edgeId = event.edgeId;
        if (edgeId && cyRef.current.getElementById(edgeId).length > 0) {
          const edge = cyRef.current.getElementById(edgeId);
          
          let highlightColor = '#22c55e'; // selectedEdge
          if (event.type === 'GRAPH_RELAX') {
            highlightColor = '#f97316'; // activeEdge
          } else if (event.status === 'path') {
            highlightColor = '#ec4899'; // finalPath
          } else if (event.status === 'backtrack') {
            highlightColor = '#ef4444'; // rejectedEdge
          } else {
            highlightColor = event.accepted ? '#22c55e' : '#ef4444';
          }

          edge.animate({
            style: {
              'line-color': highlightColor,
              'target-arrow-color': highlightColor,
              'width': 3,
            }
          }, { duration: 200 });

          const isPermanent = event.type === 'GRAPH_RELAX' || event.status === 'path' || (event.type === 'GRAPH_EDGE_HIGHLIGHT' && event.accepted === true);
          if (!isPermanent) {
            setTimeout(() => {
              if (!cyRef.current || cyRef.current.destroyed()) return;
              edge.animate({
                style: {
                  'line-color': event.status === 'backtrack' ? '#334155' : '#4b5563',
                  'target-arrow-color': event.status === 'backtrack' ? '#334155' : '#4b5563',
                  'width': 2,
                }
              }, { duration: 300 });
            }, 500);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [graph, algoId, activeGraphAlgorithm]);

  // Configure Dagre layout for trees
  const dagreLayoutConfig = useMemo(() => ({
    name: 'dagre',
    rankDir: 'TB',
    nodeSep: 60,
    edgeSep: 20,
    rankSep: 80,
    animate: true,
    animationDuration: 800,
    animationEasing: 'ease-out',
    fit: true,
    padding: 50,
  }), []);

  const layoutConfig = useMemo(() => {
    if (graph.layoutHint === 'dagre') return dagreLayoutConfig;
    return {
      name: 'cose',
      animate: true,
      animationDuration: 800,
      fit: true,
      padding: 60,
      randomize: false,
      nodeRepulsion: () => 4500,
      idealEdgeLength: () => 100,
      edgeElasticity: () => 100,
      nestingFactor: 1.2,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0,
    };
  }, [graph.layoutHint, dagreLayoutConfig]);

  // Fit bounds and layout nicely on graph elements or layout change
  useEffect(() => {
    if (!cyRef.current || elements.length === 0) return;

    const layout = cyRef.current.layout(layoutConfig as any);
    layout.run();
    cyRef.current.fit();
    cyRef.current.center();
  }, [elements, graph.isDirected, layoutConfig]);

  const activeAlgo = algoId || activeGraphAlgorithm || 'dijkstra';

  return (
    <div className="w-full h-full flex relative select-none">
      <div className="flex-1 h-full min-w-0 relative">
        {/* Layout selector toggle */}
        <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-md border border-white/10 p-1 rounded-xl z-20 flex gap-1">
          <button
            onClick={() => setLayoutName('cose')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
              layoutName === 'cose'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Auto (COSE)
          </button>
          <button
            onClick={() => setLayoutName('preset')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
              layoutName === 'preset'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Preset
          </button>
        </div>

        <CytoscapeComponent
          elements={elements}
          style={{
            width: '100%',
            height: '100%',
            background: '#030712',
          }}
          stylesheet={[
            {
              selector: 'node',
              style: {
                'background-color': '#1f2937',
                'label': 'data(label)',
                'text-valign': 'center',
                'text-halign': 'center',
                'text-wrap': 'wrap',
                'width': 45,
                'height': 45,
                'shape': 'ellipse',
                'font-size': 11,
                'color': '#f3f4f6',
                'font-family': 'monospace',
                'font-weight': 'bold',
                'border-width': 2,
                'border-color': '#4b5563',
              } as cytoscape.Css.Node,
            },
            {
              selector: 'node:selected',
              style: {
                'background-color': '#374151',
                'border-width': 3,
                'border-color': '#22c55e',
              } as cytoscape.Css.Node,
            },
            {
              selector: 'edge',
              style: {
                'target-arrow-color': '#4b5563',
                'line-color': '#4b5563',
                'width': 2,
                'curve-style': 'bezier',
                'source-distance': 0,
                'target-distance': 0,
                'label': 'data(label)',
                'font-size': 10,
                'color': '#9ca3af',
                'text-background-color': '#111827',
                'text-background-opacity': 0.8,
                'text-background-padding': '2px',
                'arrow-scale': 1.5,
                'target-arrow-shape': (graph.isDirected ?? true) ? 'triangle' : 'none',
              } as cytoscape.Css.Edge,
            },
            {
              selector: '.hidden-element',
              style: {
                opacity: 0
              }
            }
          ]}
          cy={(cy: cytoscape.Core) => {
            cyRef.current = cy;
          }}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-panel px-4 py-3 rounded-xl text-[10px] sm:text-xs space-y-1 bg-slate-900/40 backdrop-blur-md border border-white/10 text-slate-400 z-20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#1f2937] border border-[#4b5563]" />
            <span>Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-slate-600" />
            <span>Edge Weight</span>
          </div>
        </div>
      </div>

      {/* Modern Algorithm Sidebar Panel */}
      <div className="w-64 h-full border-l border-white/10 p-3 sm:p-4 flex flex-col gap-4 bg-[#0a0f1d]/70 backdrop-blur overflow-y-auto select-none z-10 text-slate-200">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Algorithm State</h4>
        
        {msg && (
          <div className="bg-ice-blue/10 border border-ice-blue/25 rounded-xl p-3 text-xs text-slate-300 font-medium leading-relaxed">
            {msg}
          </div>
        )}

        {/* Dijkstra Node Distances */}
        {activeAlgo === 'dijkstra' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">Tentative Distances</label>
            <div className="flex flex-col gap-1.5">
              {graph.nodes.map(n => {
                const dist = distances[n.id] === Infinity ? '∞' : distances[n.id];
                return (
                  <div key={n.id} className="flex justify-between items-center text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
                    <span className="font-mono text-slate-400">Node {n.label || n.id}</span>
                    <span className="font-bold text-ice-blue">{dist}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BFS & DFS Queue/Stack contents */}
        {(activeAlgo === 'bfs' || activeAlgo === 'dfs') && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">{activeAlgo === 'bfs' ? 'Queue' : 'Stack'} Buffer</label>
            <div className="flex flex-wrap gap-1.5">
              {queue.length > 0 ? (
                queue.map(id => {
                  const label = graph.nodes.find(n => n.id === id)?.label || id;
                  return (
                    <span key={id} className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs border border-purple-500/30">
                      {label}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-500 italic">Empty</span>
              )}
            </div>
          </div>
        )}

        {/* Kruskal's & Prim's edges in MST */}
        {(activeAlgo === 'kruskal' || activeAlgo === 'prim') && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">MST Selected Edges</label>
            <div className="flex flex-col gap-1.5">
              {mstEdges.length > 0 ? (
                mstEdges.map(id => {
                  const edge = graph.edges.find(e => e.id === id);
                  if (!edge) return null;
                  const uLabel = graph.nodes.find(n => n.id === edge.from)?.label || edge.from;
                  const vLabel = graph.nodes.find(n => n.id === edge.to)?.label || edge.to;
                  return (
                    <div key={id} className="flex justify-between items-center text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <span className="text-slate-300">{uLabel} ↔ {vLabel}</span>
                      <span className="font-bold text-emerald-400">wt: {edge.weight}</span>
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-slate-500 italic font-mono">No MST edges</span>
              )}
            </div>
          </div>
        )}

        {/* Kahn's Topological Sort - Node inDegree dependencies */}
        {activeAlgo === 'topo-sort' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400">In-Degrees</label>
            <div className="flex flex-col gap-1.5">
              {graph.nodes.map(n => (
                <div key={n.id} className="flex justify-between items-center text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
                  <span className="font-mono text-slate-400">Node {n.label || n.id}</span>
                  <span className="font-bold text-amber-400">{indegree[n.id] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
