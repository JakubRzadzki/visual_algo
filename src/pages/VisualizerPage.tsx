import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { findAlgorithm } from '../data/algorithmCatalog';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import VisualStage from '../components/visualizer/VisualStage';
import GraphStage from '../components/visualizer/GraphStage';
import SourceCodeViewer from '../components/hud/SourceCodeViewer';
import EventLog from '../components/hud/EventLog';
import PlaybackDeck from '../components/controls/PlaybackDeck';
import AmbientGraph from '../components/background/AmbientGraph';
import AriaLiveRegion from '../components/a11y/AriaLiveRegion';
import { ArrowLeft } from 'lucide-react';
import type { GraphNode } from '../types';

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
  const { isSidebarOpen, activeMode, currentGraph, setActiveMode, setActiveSortingAlgorithm, setActiveGraphAlgorithm } = useUIStore();
  const graphToDisplay = currentGraph || DEMO_GRAPH;

  // Sync the UI store with the route params
  useEffect(() => {
    if (!category || !algoId) return;
    const found = findAlgorithm(category, algoId);
    if (!found || !found.algorithm.available) {
      navigate('/', { replace: true });
      return;
    }

    // Set the correct mode and algorithm based on the route
    if (category === 'sorting') {
      setActiveMode('sorting');
      if (algoId === 'merge-sort') setActiveSortingAlgorithm('Merge Sort');
      else if (algoId === 'quick-sort') setActiveSortingAlgorithm('Quick Sort');
    } else if (category === 'graphs') {
      setActiveMode('graph');
      if (algoId === 'dijkstra') setActiveGraphAlgorithm("Dijkstra's Path");
      else if (algoId === 'kruskal') setActiveGraphAlgorithm("Kruskal's MST");
    }
  }, [category, algoId, navigate, setActiveMode, setActiveSortingAlgorithm, setActiveGraphAlgorithm]);

  const found = category && algoId ? findAlgorithm(category, algoId) : null;

  return (
    <div className="relative min-h-screen bg-glacier-bg text-slate-200 selection:bg-ice-blue/30 selection:text-ice-blue overflow-hidden cursor-default">
      <AriaLiveRegion />
      {/* Dynamic Floating Mesh */}
      <AmbientGraph />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0e1a]/80 via-[#0f1524]/60 to-[#0a0e1a]/80 pointer-events-none" />

      <Navbar />

      <div className="pt-20 pb-28 px-6 h-screen w-full flex gap-4 relative z-10 transition-all duration-300">
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
          {/* Switch between sorting bars and force-directed graph */}
          {activeMode === 'graph'
            ? <GraphStage nodes={graphToDisplay.nodes} edges={graphToDisplay.edges} />
            : <VisualStage />
          }
        </div>

        <aside className="w-[900px] hidden lg:flex flex-col gap-4 h-full">
           <SourceCodeViewer />
           <EventLog />
        </aside>
      </div>

      <PlaybackDeck />
    </div>
  );
}
