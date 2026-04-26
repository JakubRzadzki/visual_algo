import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import type { AlgorithmType } from '../../store/uiStore';
import { globalWorkerPool } from '../../core/WorkerPool';
import { globalEngine } from '../../core/AnimationEngine';
import type { GraphInput } from '../../types';
import { GraphGenerator } from '../../core/GraphVisualization';

const ALGORITHM_LIST: AlgorithmType[] = ['Merge Sort', 'Quick Sort', "Dijkstra's Path", "Kruskal's MST"];

export default function Sidebar() {
  const navigate = useNavigate();
  const { algoId } = useParams();
  const { activeMode, setActiveMode, setIsAnimating, activeSortingAlgorithm, setCurrentGraph } = useUIStore();
  const [selectedAlgo]                  = useState<'dijkstra' | 'kruskal'>('dijkstra');
  const [nodeCount, setNodeCount]       = useState(8);
  const [running, setRunning]           = useState(false);
  const [generating, setGenerating]     = useState(false);
  const [status, setStatus]             = useState('');
  const [graphType, setGraphType]       = useState<'random' | 'complete' | 'sparse' | 'tree' | 'grid' | 'scalefree'>('random');
  const [generatedGraph, setGeneratedGraph] = useState<GraphInput | null>(null);

  // Generate graph based on selected type
  const handleGenerate = async () => {
    setGenerating(true);
    setStatus('Generating graph…');

    try {
      let graphInput: GraphInput;

      switch (graphType) {
        case 'complete':
          graphInput = GraphGenerator.generateCompleteGraph(Math.min(nodeCount, 8));
          break;
        case 'sparse':
          graphInput = GraphGenerator.generateSparseGraph(nodeCount);
          break;
        case 'tree':
          graphInput = GraphGenerator.generateTreeGraph(nodeCount);
          break;
        case 'grid':
          graphInput = GraphGenerator.generateGridGraph(Math.floor(Math.sqrt(nodeCount)), Math.floor(Math.sqrt(nodeCount)));
          break;
        case 'scalefree':
          graphInput = GraphGenerator.generateScaleFreeGraph(nodeCount);
          break;
        default:
          graphInput = GraphGenerator.generateRandomGraph(nodeCount, 0.4);
      }

      // Update the graph display in the UI
      setCurrentGraph(graphInput);
      setGeneratedGraph(graphInput);
      setStatus(`✓ Graph generated — ${graphInput.nodes.length} nodes`);
    } catch (err) {
      setStatus(`❌ ${String(err)}`);
    } finally {
      setGenerating(false);
    }
  };

  // Run algorithm on generated graph
  const handleRun = async () => {
    if (!generatedGraph) {
      setStatus('❌ Generate a graph first');
      return;
    }

    setRunning(true);
    setStatus(`Running ${selectedAlgo}…`);

    try {
      const trace = await globalWorkerPool.run(selectedAlgo, generatedGraph);

      globalEngine.loadTrace(trace);
      globalEngine.setSpeed(1.0);
      setIsAnimating(true);
      globalEngine.play();

      setStatus(`✓ Done — ${trace.events.length} events`);
    } catch (err) {
      setStatus(`❌ ${String(err)}`);
    } finally {
      setRunning(false);
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
            onClick={() => {
              setActiveMode(mode);
              if (mode === 'sorting') navigate('/algo/sorting/merge-sort');
              if (mode === 'graph') navigate('/algo/graphs/dijkstra');
            }}
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
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sorting Algorithms</h2>
          <ul className="space-y-1.5">
            {sortingAlgos.map(algo => {
               const isActive = activeSortingAlgorithm === algo;
               const pathId = algo === 'Quick Sort' ? 'quick-sort' : 'merge-sort';
               return (
                 <li
                   key={algo}
                   onClick={() => navigate(`/algo/sorting/${pathId}`)}
                   className={`px-3 py-2 rounded-lg cursor-pointer transition border ${isActive ? 'bg-ice-blue/10 border-ice-blue/30 text-ice-blue' : 'hover:bg-white/5 border-transparent text-slate-300'} text-sm`}
                 >
                   {algo}
                 </li>
               );
            })}
          </ul>

          <div className="text-xs text-slate-500 px-2 py-2 bg-slate-900/30 rounded">
            Load array values above to start sorting
          </div>
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
              value={algoId === 'kruskal' ? 'kruskal' : 'dijkstra'}
              onChange={e => {
                navigate(`/algo/graphs/${e.target.value}`);
              }}
              className="bg-white/5 border border-ice-blue/20 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-ice-blue/60"
            >
              <optgroup label="Directed Graphs">
                <option value="dijkstra">Dijkstra — Shortest Path</option>
              </optgroup>
              <optgroup label="Undirected Graphs">
                <option value="kruskal">Kruskal — Minimum Spanning Tree</option>
              </optgroup>
            </select>
          </div>

          {/* Graph type selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Graph Type</label>
            <select
              value={graphType}
              onChange={e => setGraphType(e.target.value as any)}
              className="bg-white/5 border border-ice-blue/20 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-ice-blue/60"
            >
              <option value="random">Random (Erdős–Rényi)</option>
              <option value="complete">Complete Graph</option>
              <option value="sparse">Sparse Graph</option>
              <option value="tree">Tree Structure</option>
              <option value="grid">Grid Graph</option>
              <option value="scalefree">Scale-Free (Barabási–Albert)</option>
            </select>
          </div>

          {/* Node count slider */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              Nodes — <span className="text-ice-blue font-semibold">{nodeCount}</span>
            </label>
            <input
              type="range" min={4} max={20} value={nodeCount}
              onChange={e => {
                const newCount = Number(e.target.value);
                setNodeCount(newCount);
              }}
              className="accent-sky-400 w-full"
            />
          </div>

          {/* Generate and Run buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                generating
                  ? 'bg-sky-600/20 text-sky-400/50 cursor-not-allowed'
                  : 'bg-sky-600/30 border border-sky-600/40 text-sky-300 hover:bg-sky-600/40 shadow-lg shadow-sky-600/10 active:scale-95'
              }`}
            >
              {generating ? 'Generating...' : `Generate`}
            </button>
            <button
              onClick={handleRun}
              disabled={running || !generatedGraph}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                running || !generatedGraph
                  ? 'bg-emerald-600/20 text-emerald-400/50 cursor-not-allowed'
                  : 'bg-emerald-600/30 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/40 shadow-lg shadow-emerald-600/10 active:scale-95'
              }`}
            >
              {running ? 'Running...' : `Run`}
            </button>
          </div>

          {/* Status message */}
          {status && (
            <p className="text-xs text-slate-400 text-center">{status}</p>
          )}

          {/* Graph info */}
          <div className="mt-1 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 space-y-1">
            <div>Cytoscape.js Visualization</div>
            <div>Force-Directed Layout</div>
          </div>
        </section>
      )}
    </div>
  );
}
