import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { findAlgorithm } from '../../data/algorithmCatalog';
import { globalEngine } from '../../core/AnimationEngine';
import Sidebar from '../layout/Sidebar';

import GraphStage from '../visualizer/GraphStage';
import SortingStage from '../visualizer/SortingStage';
import SearchingStage from '../visualizer/SearchingStage';
import MatrixStage from '../visualizer/MatrixStage';
import MonacoCodeEditor from '../hud/MonacoCodeEditor';
import EventLog from '../hud/EventLog';
import PlaybackDeck from '../controls/PlaybackDeck';
import type { GraphInput } from '../../types';

// Demo graph nodes / edges — will be replaced when user generates a new graph
const DEMO_NODES = Array.from({ length: 8 }, (_, i) => ({
  id: `n${i}`, label: String(i), x: Math.cos((i / 8) * Math.PI * 2) * 150, y: Math.sin((i / 8) * Math.PI * 2) * 150, vx: 0, vy: 0,
}));
const DEMO_EDGES = DEMO_NODES.map((_, i) => ({
  id: `e${i}`, from: `n${i}`, to: `n${(i + 1) % DEMO_NODES.length}`,
  weight: Math.floor(Math.random() * 15) + 1,
}));
const DEMO_GRAPH: GraphInput = { nodes: DEMO_NODES, edges: DEMO_EDGES, startNodeId: 'n0' };

/**
 * AlgorithmViewer handles the main visualization layout and routing
 */
export default function AlgorithmViewer() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const { 
    isSidebarOpen, 
    activeMode, 
    currentGraph, 
    activeGraphAlgorithm, 
    setActiveMode, 
    setActiveSortingAlgorithm, 
    setActiveSearchingAlgorithm,
    setActiveGraphAlgorithm 
  } = useUIStore();
  
  const graphToDisplay = currentGraph || DEMO_GRAPH;

  useEffect(() => {
    if (!category || !id) return;

    const match = findAlgorithm(category, id);
    if (!match || !match.algorithm.available) {
      navigate('/', { replace: true });
      return;
    }

    if (globalEngine.reset) {
      globalEngine.reset();
    } else {
      globalEngine.pause();
    }
    useUIStore.getState().setIsAnimating(false);

    if (category === 'sorting') {
      setActiveMode('sorting');
      setActiveSortingAlgorithm(match.algorithm.name);
    } else if (category === 'searching') {
      setActiveMode('searching');
      setActiveSearchingAlgorithm(match.algorithm.name);
    } else if (category === 'graphs') {
      setActiveMode('graph');
      setActiveGraphAlgorithm(match.algorithm.name);
    } else if (category === 'dp') {
      setActiveMode('dp');
    } else {
      setActiveMode('grid');
    }
  }, [category, id, navigate, setActiveMode, setActiveSortingAlgorithm, setActiveSearchingAlgorithm, setActiveGraphAlgorithm]);

  // Determine which stage to render based on the active mode
  const renderStage = () => {
    switch (activeMode) {
      case 'graph':
        return (
          <GraphStage 
            key={id}
            nodes={graphToDisplay.nodes} 
            edges={graphToDisplay.edges} 
            isDirected={graphToDisplay.isDirected !== undefined ? graphToDisplay.isDirected : activeGraphAlgorithm !== "Kruskal's MST" && activeGraphAlgorithm !== "Prim's MST"} 
          />
        );
      case 'sorting':
        return <SortingStage key={id} />;
      case 'searching':
        return <SearchingStage key={id} />;
      case 'dp':
        return <MatrixStage key={id} />;
      default:
        return <div className="flex-1 flex items-center justify-center text-slate-500 italic">Select an algorithm to begin</div>;
    }
  };

  return (
    <div className="pt-20 pb-8 px-6 h-screen w-full flex gap-4 relative z-10 transition-all duration-300">
      {isSidebarOpen && <Sidebar />}

      <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden glass-panel-elevated border border-white/10 shadow-2xl">
        {renderStage()}
      </div>

      <aside className="w-[900px] hidden lg:flex flex-col gap-4 h-full">
        <MonacoCodeEditor />
        <EventLog />
      </aside>

      {/* Global Playback Controls (Only rendered if NOT in sorting mode) */}
      {activeMode !== 'sorting' && <PlaybackDeck />}
    </div>
  );
}
