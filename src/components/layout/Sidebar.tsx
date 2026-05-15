/**
 * @file Sidebar.tsx
 * @description Hierarchical sidebar navigation component for algorithm categories.
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useUIStore } from '../../store/uiStore';
import { useTreeStore, type TreeType } from '../../store/treeStore';
import { getTranslation } from '../../data/translations';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import { GRAPH_TEMPLATES } from '../../data/graphTemplates';
import {
  GitFork,
  GitMerge,
  Scale,
  Layers,
  Type,
  TrendingUp,
  Activity,
  Database,
  Search,
} from 'lucide-react';

export default function Sidebar(): React.ReactElement {
  const navigate = useNavigate();
  const { algoId } = useParams<{ algoId: string }>();
  const {
    activeMode,
    setActiveMode,
    activeSortingAlgorithm,
    activeSearchingAlgorithm,
    setActiveDPAlgorithm,
    activeGridAlgorithm,
    setCurrentGraph,
    currentGraph,
    language
  } = useUIStore();

  const t = getTranslation(language);
  const { activeTreeType, setTreeType } = useTreeStore();

  // Load algorithm definitions from the Catalog
  const sortingCategory = ALGORITHM_CATALOG.find((c) => c.id === 'sorting');
  const searchingCategory = ALGORITHM_CATALOG.find((c) => c.id === 'searching');
  const graphCategory = ALGORITHM_CATALOG.find((c) => c.id === 'graphs');
  const dpCategory = ALGORITHM_CATALOG.find((c) => c.id === 'dp');
  const gridCategory = ALGORITHM_CATALOG.find((c) => c.id === 'grid');

  const sortingAlgos = sortingCategory?.algorithms.filter((a) => a.available) || [];
  const searchingAlgos = searchingCategory?.algorithms.filter((a) => a.available) || [];
  const graphAlgos = graphCategory?.algorithms.filter((a) => a.available) || [];
  const dpAlgos = dpCategory?.algorithms.filter((a) => a.available) || [];
  const gridAlgos = gridCategory?.algorithms.filter((a) => a.available) || [];

  const getTreeIcon = (type: TreeType) => {
    switch (type) {
      case 'binary': return <GitMerge size={18} strokeWidth={2} className="text-amber-400" />;
      case 'bst': return <GitFork size={18} strokeWidth={2} className="text-cyan-400" />;
      case 'avl': return <Scale size={18} strokeWidth={2} className="text-emerald-400" />;
      case 'rbt': return <Layers size={18} strokeWidth={2} className="text-rose-400" />;
      case 'trie': return <Type size={18} strokeWidth={2} className="text-violet-400" />;
    }
  };

  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      className="w-72 h-[calc(100vh-140px)] glass-panel flex flex-col gap-5 p-4 overflow-y-auto shadow-xl"
    >
      {/* ── Mode Tabs ── */}
      <div className="flex flex-wrap rounded-xl overflow-hidden border border-glacier-border-bright bg-glacier-surface p-1 gap-0.5 justify-center">
        {(['sorting', 'searching', 'graph', 'tree', 'dp', 'grid'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setActiveMode(mode);
              if (mode === 'sorting') navigate('/algo/sorting/merge-sort');
              if (mode === 'searching') navigate('/algo/searching/binary-search');
              if (mode === 'graph') navigate('/algo/graphs/dijkstra');
              if (mode === 'tree') navigate('/algo/trees/bst');
              if (mode === 'dp') navigate('/algo/dp/knapsack');
              if (mode === 'grid') navigate('/algo/grid/a-star');
            }}
            className={`px-2 py-1.5 text-[8px] xl:text-[9px] font-bold uppercase tracking-wider transition-all rounded-lg shrink-0 ${
              activeMode === mode
                ? 'bg-cyan-500/15 text-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {mode === 'sorting' && t.categories.sorting}
            {mode === 'searching' && t.categories.searching}
            {mode === 'graph' && t.categories.graphs}
            {mode === 'tree' && t.categories.trees}
            {mode === 'dp' && t.categories.dp}
            {mode === 'grid' && t.categories.grid}
          </button>
        ))}
      </div>

      {/* ── Sorting Section ── */}
      {activeMode === 'sorting' && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sidebar.sorting}</h2>
          </div>
          <ul className="space-y-1.5">
            {sortingAlgos.map((algo) => (
              <motion.li
                key={algo.id}
                onClick={() => navigate(`/algo/sorting/${algo.id}`)}
                whileHover={{ x: 4 }}
                className={`px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 border text-xs font-medium flex items-center justify-between ${
                  activeSortingAlgorithm === algo.name
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-md'
                    : 'border-transparent text-slate-300 hover:bg-cyan-500/5 hover:border-cyan-500/10 hover:text-cyan-300'
                }`}
              >
                <span>{language === 'en' ? algo.name : algo.name_pl}</span>
                {activeSortingAlgorithm === algo.name && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Searching Section ── */}
      {activeMode === 'searching' && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Search size={16} className="text-violet-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sidebar.searching}</h2>
          </div>
          <ul className="space-y-1.5">
            {searchingAlgos.map((algo) => (
              <motion.li
                key={algo.id}
                onClick={() => navigate(`/algo/searching/${algo.id}`)}
                whileHover={{ x: 4 }}
                className={`px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 border text-xs font-medium flex items-center justify-between ${
                  activeSearchingAlgorithm === algo.name
                    ? 'bg-violet-500/10 border-violet-500/20 text-violet-400 shadow-md'
                    : 'border-transparent text-slate-300 hover:bg-violet-500/5 hover:border-violet-500/10 hover:text-violet-300'
                }`}
              >
                <span>{language === 'en' ? algo.name : algo.name_pl}</span>
                {activeSearchingAlgorithm === algo.name && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Graph Section ── */}
      {activeMode === 'graph' && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-emerald-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sidebar.graphs}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {graphAlgos.map((algo) => (
              <motion.button
                key={algo.id}
                onClick={() => navigate(`/algo/graphs/${algo.id}`)}
                whileHover={{ x: 4 }}
                className={`px-3 py-2 rounded-xl text-left text-xs transition-all duration-200 border font-medium flex items-center justify-between cursor-pointer ${
                  algoId === algo.id
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-md'
                    : 'border-transparent text-slate-300 hover:bg-emerald-500/5 hover:border-emerald-500/10 hover:text-emerald-300'
                }`}
              >
                <span>{language === 'en' ? algo.name : algo.name_pl}</span>
                {algoId === algo.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Database size={12} />
              <span>{t.sidebar.presets}</span>
            </label>
            {algoId && GRAPH_TEMPLATES[algoId] ? (
              <div className="flex flex-col gap-1.5">
                {GRAPH_TEMPLATES[algoId].map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setCurrentGraph(template.graph)}
                    className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] transition-all duration-200 border font-medium cursor-pointer ${
                      currentGraph?.nodes.length === template.graph.nodes.length && currentGraph?.edges.length === template.graph.edges.length
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'border-transparent text-slate-400 hover:bg-emerald-500/5 hover:border-emerald-500/10 hover:text-emerald-300'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">{t.sidebar.noPresets}</p>
            )}
          </div>
        </section>
      )}

      {/* ── Trees Section ── */}
      {activeMode === 'tree' && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <GitMerge size={16} className="text-amber-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sidebar.trees}</h2>
          </div>
          <ul className="space-y-1.5">
            {[
              { id: 'binary', name: 'Binary Tree', name_pl: 'Drzewo Binarne' },
              { id: 'bst', name: 'Binary Search Tree', name_pl: 'Binarne Drzewo Poszukiwań' },
              { id: 'avl', name: 'AVL Tree', name_pl: 'Drzewo AVL' },
              { id: 'rbt', name: 'Red-Black Tree', name_pl: 'Drzewo Czerwono-Czarne' },
              { id: 'trie', name: 'Trie Prefix Tree', name_pl: 'Drzewo Trie (Prefiksowe)' },
            ].map((tree) => (
              <motion.li
                key={tree.id}
                onClick={() => { setTreeType(tree.id as any); navigate(`/algo/trees/${tree.id}`); }}
                whileHover={{ x: 4 }}
                className={`px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border text-xs font-semibold flex items-center gap-3 ${
                  activeTreeType === tree.id
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 shadow-md'
                    : 'border-transparent text-slate-300 hover:bg-amber-500/5 hover:border-amber-500/10 hover:text-amber-300'
                }`}
              >
                <div className="shrink-0">{getTreeIcon(tree.id as any)}</div>
                <span className="truncate">{language === 'en' ? tree.name : tree.name_pl}</span>
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Dynamic Programming Section ── */}
      {activeMode === 'dp' && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={16} className="text-pink-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sidebar.dp}</h2>
          </div>
          <ul className="space-y-1.5">
            {dpAlgos.map((algo) => (
              <motion.li
                key={algo.id}
                onClick={() => { setActiveDPAlgorithm(algo.name); navigate(`/algo/dp/${algo.id}`); }}
                whileHover={{ x: 4 }}
                className={`px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 border text-xs font-medium flex items-center justify-between ${
                  algoId === algo.id
                    ? 'bg-pink-500/10 border-pink-500/20 text-pink-400 shadow-md'
                    : 'border-transparent text-slate-300 hover:bg-pink-500/5 hover:border-pink-500/10 hover:text-pink-300'
                }`}
              >
                <span>{language === 'en' ? algo.name : algo.name_pl}</span>
                {algoId === algo.id && <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />}
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Grid / Mazes Section ── */}
      {activeMode === 'grid' && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Database size={16} className="text-sky-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sidebar.grid}</h2>
          </div>
          <ul className="space-y-1.5">
            {gridAlgos.map((algo) => (
              <motion.li
                key={algo.id}
                onClick={() => navigate(`/algo/grid/${algo.id}`)}
                whileHover={{ x: 4 }}
                className={`px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 border text-xs font-medium flex items-center justify-between ${
                  activeGridAlgorithm === algo.name || algoId === algo.id
                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-400 shadow-md'
                    : 'border-transparent text-slate-300 hover:bg-sky-500/5 hover:border-sky-500/10 hover:text-sky-300'
                }`}
              >
                <span>{language === 'en' ? algo.name : algo.name_pl}</span>
                {(activeGridAlgorithm === algo.name || algoId === algo.id) && <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />}
              </motion.li>
            ))}
          </ul>
        </section>
      )}
    </motion.div>
  );
}
