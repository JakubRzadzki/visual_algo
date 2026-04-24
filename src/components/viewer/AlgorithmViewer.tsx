import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { findAlgorithmById } from '../../data/algorithmCatalog';
import Sidebar from '../layout/Sidebar';
import VisualStage from '../visualizer/VisualStage';
import GraphStage from '../visualizer/GraphStage';
import CodeSnippet from '../hud/CodeSnippet';
import SourceCodeViewer from '../hud/SourceCodeViewer';
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
 * AlgorithmViewer — the main visualisation page, routed at /algo/:category/:id
 * This was extracted from the original App.tsx layout so routing could be added.
 */
export default function AlgorithmViewer() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const { isSidebarOpen, activeMode, currentGraph, setActiveMode, setActiveSortingAlgorithm, setActiveGraphAlgorithm } = useUIStore();
  const graphToDisplay = currentGraph || DEMO_GRAPH;

  // Sync route params with store
  useEffect(() => {
    if (!category || !id) return;

    const match = findAlgorithmById(id);
    if (!match || !match.algo.available) {
      navigate('/', { replace: true });
      return;
    }

    // Set the correct mode and algorithm based on route
    if (category === 'sorting') {
      setActiveMode('sorting');
      if (id === 'merge-sort') setActiveSortingAlgorithm('Merge Sort');
      else if (id === 'quick-sort') setActiveSortingAlgorithm('Quick Sort');
    } else if (category === 'graphs') {
      setActiveMode('graph');
      if (id === 'dijkstra') setActiveGraphAlgorithm("Dijkstra's Path");
      else if (id === 'kruskal') setActiveGraphAlgorithm("Kruskal's MST");
    }
  }, [category, id, navigate, setActiveMode, setActiveSortingAlgorithm, setActiveGraphAlgorithm]);

  return (
    <>
      <div className="pt-20 pb-28 px-6 h-screen w-full flex gap-4 relative z-10 transition-all duration-300">
        {isSidebarOpen && <Sidebar />}

        <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden glass-panel-elevated shadow-2xl shadow-ice-blue/5 border border-ice-blue/10">
          {/* Switch between sorting bars and force-directed graph */}
          {activeMode === 'graph'
            ? <GraphStage nodes={graphToDisplay.nodes} edges={graphToDisplay.edges} />
            : <VisualStage />
          }
        </div>

        <aside className="w-[900px] hidden lg:flex flex-col gap-4 h-full">
          {/* Source Code Viewer (Step 2) — shows actual .ts implementation */}
          {id && <SourceCodeViewer algorithmId={id} />}
          {/* Original Code Snippet — C++/Python reference */}
          <CodeSnippet />
          <EventLog />
        </aside>
      </div>

      <PlaybackDeck />
    </>
  );
}
