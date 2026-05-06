import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { findAlgorithm } from '../data/algorithmCatalog';
import { globalEventBus } from '../core/EventBus';
import { globalEngine } from '../core/AnimationEngine';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

import GraphStage from '../components/visualizer/GraphStage';
import GridStage from '../components/visualizer/GridStage';
import MatrixStage from '../components/visualizer/MatrixStage';
import SortingStage from '../components/visualizer/SortingStage';
import SearchingStage from '../components/visualizer/SearchingStage';
import PlaybackDeck from '../components/controls/PlaybackDeck';



import MonacoCodeEditor from '../components/hud/MonacoCodeEditor';
import EventLog from '../components/hud/EventLog';
import AriaLiveRegion from '../components/a11y/AriaLiveRegion';
import { ArrowLeft } from 'lucide-react';
import type { GraphNode, GraphInput } from '../types';

// Demo graph nodes / edges — will be replaced when user generates a new graph
const DEMO_NODES: GraphNode[] = Array.from({ length: 8 }, (_, i) => ({
  id: `n${i}`, label: String(i),
  x: Math.cos((i / 8) * Math.PI * 2) * 150,
  y: Math.sin((i / 8) * Math.PI * 2) * 150,
  vx: 0, vy: 0,
}));
const DEMO_EDGES = DEMO_NODES.map((_, i) => ({
  id: `e${i}`, from: `n${i}`, to: `n${(i + 1) % DEMO_NODES.length}`,
  weight: Math.floor(Math.random() * 15) + 1,
}));
const DEMO_GRAPH = { nodes: DEMO_NODES, edges: DEMO_EDGES, startNodeId: 'n0' };

export default function VisualizerPage() {
  const { category, algoId } = useParams<{ category: string; algoId: string }>();
  const navigate = useNavigate();
  const { 
    isSidebarOpen, activeMode, currentGraph, 
    setActiveMode, setActiveSortingAlgorithm, setActiveSearchingAlgorithm, setActiveGraphAlgorithm, setActiveGridAlgorithm 
  } = useUIStore();
  const graphToDisplay = currentGraph || DEMO_GRAPH;

  // Sync the UI store with the route params
  useEffect(() => {
    if (!category || !algoId) return;
    const found = findAlgorithm(category, algoId);
    if (!found || !found.algorithm.available) {
      navigate('/', { replace: true });
      return;
    }

    // Reset previous trace and animations when switching algorithms
    globalEngine.reset();
    useUIStore.getState().setIsAnimating(false);

    // Set the correct mode based on the category
    if (category === 'sorting') {
      setActiveMode('sorting');
      setActiveSortingAlgorithm(found.algorithm.name);
    } else if (category === 'searching') {
      setActiveMode('searching');
      setActiveSearchingAlgorithm(found.algorithm.name);
    } else if (category === 'graphs' || category === 'trees') {
      setActiveMode('graph');
      setActiveGraphAlgorithm(found.algorithm.name);
    } else if (category === 'grid') {
      setActiveMode('grid');
      setActiveGridAlgorithm(found.algorithm.name);
    } else if (category === 'dp') {
      setActiveMode('dp');
    }
  }, [category, algoId, navigate, setActiveMode, setActiveSortingAlgorithm, setActiveSearchingAlgorithm, setActiveGraphAlgorithm, setActiveGridAlgorithm]);



  // Listen for graph updates from the sandbox
  useEffect(() => {
    const unsub = globalEventBus.subscribe((e) => {
      if (e.type === 'TRACE_LOADED' && e.metadata && e.metadata.initialGraph) {
        const newGraph = e.metadata.initialGraph as GraphInput;
        const current = useUIStore.getState().currentGraph;
        
        // Merge coordinates from current graph to preserve beautiful layouts
        if (current && current.nodes && current.nodes.length > 0) {
          newGraph.nodes = newGraph.nodes.map(node => {
            const existingNode = current.nodes.find(n => n.id === node.id);
            if (existingNode) {
              return { ...node, x: existingNode.x, y: existingNode.y };
            }
            // Fallback for completely new nodes added in code
            return { 
              ...node, 
              x: typeof node.x === 'number' ? node.x : Math.random() * 400, 
              y: typeof node.y === 'number' ? node.y : Math.random() * 400 
            };
          });
        }
        
        useUIStore.getState().setCurrentGraph(newGraph);
      }
    });
    return () => unsub();
  }, []);


  return (
    <div className="relative h-screen bg-glacier-bg text-slate-200 selection:bg-ice-blue/30 selection:text-ice-blue overflow-hidden cursor-default">
      <AriaLiveRegion />
      {/* Dynamic Floating Mesh */}

      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0e1a]/80 via-[#0f1524]/60 to-[#0a0e1a]/80 pointer-events-none" />

      <Navbar />

      <div className="pt-20 px-6 h-screen w-full flex gap-4 relative z-10 transition-all duration-300">
        {/* Back Button + Sidebar */}
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-sm text-slate-400 hover:text-ice-blue hover:border-ice-blue/20 transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Catalog</span>
          </Link>



          {isSidebarOpen && <Sidebar />}
        </div>

        <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden glass-panel-elevated shadow-2xl shadow-ice-blue/5 border border-ice-blue/10">
          {/* Switch between sorting bars, force-directed graph, and css grid */}
          {activeMode === 'graph'
            ? <GraphStage key={`${algoId}-${currentGraph?.nodes.length}-${currentGraph?.edges.length}`} nodes={graphToDisplay.nodes} edges={graphToDisplay.edges} isDirected={(graphToDisplay as GraphInput).isDirected !== undefined ? (graphToDisplay as GraphInput).isDirected : !['kruskal', 'prim'].includes(algoId || '')} />
            : activeMode === 'grid'
            ? <GridStage />
            : activeMode === 'dp'
            ? <MatrixStage />
            : activeMode === 'searching'
            ? <SearchingStage key={algoId} />
            : activeMode === 'sorting'
            ? <SortingStage key={algoId} />
            : <div className="flex-1 flex items-center justify-center text-slate-500 italic">Select an algorithm to begin</div>
          }

          {/* Controls are now scoped to the visual stage */}
          {activeMode !== 'sorting' && <PlaybackDeck />}
        </div>

        <aside className="w-[350px] lg:w-[400px] xl:w-[420px] 2xl:w-[450px] min-w-0 hidden lg:flex flex-col gap-4 h-full">
           <MonacoCodeEditor />
           <EventLog />
        </aside>
      </div>
    </div>
  );
}
