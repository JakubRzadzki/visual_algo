import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import type { AlgorithmType } from '../../store/uiStore';
import { globalWorkerPool } from '../../core/WorkerPool';
import { AnimationEngine } from '../../core/AnimationEngine';
import type { GraphInput, GraphNode, GraphEdge } from '../../types';

const ALGORITHM_LIST: AlgorithmType[] = ['Merge Sort', 'Quick Sort', "Dijkstra's Path", "Kruskal's MST"];

// Shared engine instance for trace playback
const engine = new AnimationEngine();

// Build a small demo graph used when "Run" is clicked
function buildDemoGraph(nodeCount: number): GraphInput {
  const nodes: GraphNode[] = Array.from({ length: nodeCount }, (_, i) => ({
    id: `n${i}`,
    label: String(i),
    x: 0, y: 0, vx: 0, vy: 0,
  }));

  // Generate a random connected graph with weighted edges
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const j = (i + 1) % nodeCount;                    // ring topology ensures connectivity
    edges.push({ id: `e${i}-${j}`, from: `n${i}`, to: `n${j}`, weight: Math.floor(Math.random() * 20) + 1 });
  }
  // Add some extra random cross-edges for visual interest
  for (let k = 0; k < Math.floor(nodeCount / 2); k++) {
    const a = Math.floor(Math.random() * nodeCount);
    const b = Math.floor(Math.random() * nodeCount);
    if (a !== b) {
      edges.push({ id: `ex${k}`, from: `n${a}`, to: `n${b}`, weight: Math.floor(Math.random() * 30) + 1 });
    }
  }

  return { nodes, edges, startNodeId: 'n0' };
}

export default function Sidebar() {
  const { activeMode, setActiveMode, setIsAnimating, activeAlgorithm, setActiveAlgorithm } = useUIStore();
  const [selectedAlgo, setSelectedAlgo] = useState<'dijkstra' | 'kruskal'>('dijkstra');
  const [nodeCount, setNodeCount]       = useState(8);
  const [running, setRunning]           = useState(false);
  const [status, setStatus]             = useState('');

  // Dispatch graph algorithm to the Worker Pool
  const handleRunGraph = async () => {
    setRunning(true);
    setStatus('Dispatching to worker…');

    try {
      const graphInput = buildDemoGraph(nodeCount);
      const trace      = await globalWorkerPool.run(selectedAlgo, graphInput);

      engine.loadTrace(trace);
      engine.setSpeed(1.0);
      setIsAnimating(true);
      engine.play();

      setStatus(`Done — ${trace.events.length} events`);
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    } finally {
      setRunning(false);
      // Reset animating flag after playback finishes (approximate via event count * speed)
      setTimeout(() => setIsAnimating(false), 3000);
    }
  };

  const sortingAlgos = ALGORITHM_LIST.filter(a => a === 'Merge Sort' || a === 'Quick Sort');

  return (
    <div className="w-64 glass-panel flex flex-col gap-5 p-4 overflow-y-auto">

      {/* ── Mode Tabs ── */}
      <div className="flex rounded-lg overflow-hidden border border-ice-blue/20">
        {(['sorting', 'graph'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
              activeMode === mode
                ? 'bg-ice-blue/20 text-ice-blue'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* ── Sorting Section ── */}
      {activeMode === 'sorting' && (
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sorting Algorithms</h2>
          <ul className="space-y-1.5">
            {sortingAlgos.map(algo => {
               const isActive = activeAlgorithm === algo;
               return (
                 <li 
                   key={algo}
                   onClick={() => setActiveAlgorithm(algo)}
                   className={`px-3 py-2 rounded-lg cursor-pointer transition border ${isActive ? 'bg-ice-blue/10 border-ice-blue/30 text-ice-blue' : 'hover:bg-white/5 border-transparent text-slate-300'} text-sm`}
                 >
                   {algo}
                 </li>
               );
            })}
          </ul>
        </section>
      )}

      {/* ── Graph Section ── */}
      {activeMode === 'graph' && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Graph Algorithms</h2>

          {/* Algorithm picker */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Algorithm</label>
            <select
              value={selectedAlgo}
              onChange={e => {
                setSelectedAlgo(e.target.value as 'dijkstra' | 'kruskal');
                setActiveAlgorithm(e.target.value === 'dijkstra' ? "Dijkstra's Path" : "Kruskal's MST");
              }}
              className="bg-white/5 border border-ice-blue/20 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-ice-blue/60"
            >
              <option value="dijkstra">Dijkstra — Shortest Path</option>
              <option value="kruskal">Kruskal — Minimum Spanning Tree</option>
            </select>
          </div>

          {/* Node count slider */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              Nodes — <span className="text-ice-blue font-semibold">{nodeCount}</span>
            </label>
            <input
              type="range" min={4} max={20} value={nodeCount}
              onChange={e => setNodeCount(Number(e.target.value))}
              className="accent-sky-400 w-full"
            />
          </div>

          {/* Run button */}
          <button
            onClick={handleRunGraph}
            disabled={running}
            className={`mt-1 w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
              running
                ? 'bg-ice-blue/10 text-ice-blue/40 cursor-not-allowed'
                : 'bg-ice-blue/20 border border-ice-blue/40 text-ice-blue hover:bg-ice-blue/30 hover:shadow-lg hover:shadow-ice-blue/10 active:scale-95'
            }`}
          >
            {running ? 'Running…' : `▶ Run via Worker Pool`}
          </button>

          {/* Status line */}
          {status && (
            <p className="text-xs text-slate-400 text-center">{status}</p>
          )}

          {/* Worker pool info badge */}
          <div className="mt-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            ⚡ Pool: 3 threads · Transferable Objects
          </div>
        </section>
      )}
    </div>
  );
}
