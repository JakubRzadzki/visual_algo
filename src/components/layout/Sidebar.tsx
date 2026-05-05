import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { globalWorkerPool } from '../../core/WorkerPool';
import { globalEngine } from '../../core/AnimationEngine';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import { GRAPH_TEMPLATES } from '../../data/graphTemplates';

export default function Sidebar() {
  const navigate = useNavigate();
  const { algoId } = useParams();
  const { 
    activeMode, setActiveMode, setIsAnimating, 
    activeSortingAlgorithm, activeSearchingAlgorithm,
    setCurrentGraph, currentGraph
  } = useUIStore();
  
  const [running, setRunning]           = useState(false);
  const [status, setStatus]             = useState('');

  // Load algorithm definitions from the Catalog dynamically
  const sortingCategory = ALGORITHM_CATALOG.find(c => c.id === 'sorting');
  const searchingCategory = ALGORITHM_CATALOG.find(c => c.id === 'searching');
  const graphCategory = ALGORITHM_CATALOG.find(c => c.id === 'graphs');

  const sortingAlgos = sortingCategory?.algorithms.filter(a => a.available) || [];
  const searchingAlgos = searchingCategory?.algorithms.filter(a => a.available) || [];
  const graphAlgos = graphCategory?.algorithms.filter(a => a.available) || [];

  // When algoId changes, set the first template immediately
  useEffect(() => {
    if (activeMode === 'graph' && algoId && GRAPH_TEMPLATES[algoId]) {
      const templates = GRAPH_TEMPLATES[algoId];
      if (templates && templates.length > 0) {
        setCurrentGraph(templates[0].graph);
      }
    }
  }, [algoId, activeMode]);

  const handleRunGraphAlgo = async () => {
    if (!currentGraph) {
      setStatus('[ERROR] Choose or select a graph variation first');
      return;
    }
    if (!algoId) return;

    setRunning(true);
    setStatus(`Running ${algoId}…`);

    try {
      const trace = await globalWorkerPool.run(algoId, currentGraph);

      globalEngine.loadTrace(trace);
      globalEngine.setSpeed(1.0);
      setIsAnimating(true);
      globalEngine.play();

      setStatus(`[DONE] Trace generated: ${trace.events.length} events`);
    } catch (err) {
      setStatus(`[ERROR] ${String(err)}`);
    } finally {
      setRunning(false);
      setTimeout(() => setIsAnimating(false), 3000);
    }
  };

  return (
    <div className="w-72 glass-panel flex flex-col gap-5 p-4 overflow-y-auto">

      {/* ── Mode Tabs ── */}
      <div className="flex rounded-lg overflow-hidden border border-ice-blue/20 flex-wrap">
        {(['sorting', 'searching', 'graph'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => {
              setActiveMode(mode);
              if (mode === 'sorting') navigate('/algo/sorting/merge-sort');
              if (mode === 'searching') navigate('/algo/searching/binary-search');
              if (mode === 'graph') navigate('/algo/graphs/dijkstra');
            }}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide transition-colors ${
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
               const isActive = activeSortingAlgorithm === algo.name;
               return (
                 <li
                   key={algo.id}
                   onClick={() => navigate(`/algo/sorting/${algo.id}`)}
                   className={`px-3 py-2 rounded-lg cursor-pointer transition border ${isActive ? 'bg-ice-blue/10 border-ice-blue/30 text-ice-blue' : 'hover:bg-white/5 border-transparent text-slate-300'} text-sm`}
                 >
                   {algo.name}
                 </li>
               );
            })}
          </ul>

          <div className="text-xs text-slate-500 px-2 py-2 bg-slate-900/30 rounded">
            Run the code in the editor to start sorting
          </div>
        </section>
      )}

      {/* ── Searching Section ── */}
      {activeMode === 'searching' && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Searching Algorithms</h2>
          <ul className="space-y-1.5">
            {searchingAlgos.map(algo => {
               const isActive = activeSearchingAlgorithm === algo.name;
               return (
                 <li
                   key={algo.id}
                   onClick={() => navigate(`/algo/searching/${algo.id}`)}
                   className={`px-3 py-2 rounded-lg cursor-pointer transition border ${isActive ? 'bg-ice-blue/10 border-ice-blue/30 text-ice-blue' : 'hover:bg-white/5 border-transparent text-slate-300'} text-sm`}
                 >
                   {algo.name}
                 </li>
               );
            })}
          </ul>

          <div className="text-xs text-slate-500 px-2 py-2 bg-slate-900/30 rounded">
            Run the code in the editor to start searching
          </div>
        </section>
      )}

      {/* ── Graph Section ── */}
      {activeMode === 'graph' && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Graph Algorithms</h2>

          {/* Algorithm picker as a list of buttons */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">Algorithm</label>
            <div className="flex flex-col gap-1.5">
              {graphAlgos.map(algo => {
                const isActive = algoId === algo.id;
                return (
                  <button
                    key={algo.id}
                    onClick={() => navigate(`/algo/graphs/${algo.id}`)}
                    className={`px-3 py-2 rounded-lg text-left text-xs transition border ${
                      isActive
                        ? 'bg-ice-blue/15 border-ice-blue/40 text-ice-blue font-bold shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                        : 'bg-white/5 border-transparent text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {algo.name}
                  </button>
                );
              })}
            </div>
          </div>


          {/* Preset Graph Variations */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Variations (Preset Graphs)</label>
            {algoId && GRAPH_TEMPLATES[algoId] ? (
              <div className="flex flex-col gap-2">
                {GRAPH_TEMPLATES[algoId].map((template) => {
                  const isSelected = currentGraph?.nodes.length === template.graph.nodes.length &&
                                   currentGraph?.edges.length === template.graph.edges.length;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setCurrentGraph(template.graph)}
                      className={`px-3 py-2 rounded-lg text-left text-xs transition border ${
                        isSelected
                          ? 'bg-ice-blue/15 border-ice-blue/40 text-ice-blue font-bold shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                          : 'bg-white/5 border-transparent text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {template.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No variations available</p>
            )}
          </div>

          {/* Run button */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleRunGraphAlgo}
              disabled={running || !currentGraph}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-600/30 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/40 transition-all"
            >
              Run Algorithm
            </button>
          </div>
          {status && <p className="text-xs text-slate-400 text-center">{status}</p>}
        </section>
      )}
    </div>
  );
}
