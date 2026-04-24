import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Zap, ArrowRight, Lock, ChevronRight } from 'lucide-react';
import { ALGORITHM_CATALOG, getAllAlgorithms } from '../../data/algorithmCatalog';
import type { CategoryEntry, AlgorithmEntry } from '../../data/algorithmCatalog';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const allAlgorithms = useMemo(() => getAllAlgorithms(), []);

  // Filter algorithms based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allAlgorithms.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.category.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
    );
  }, [searchQuery, allAlgorithms]);

  const handleAlgoClick = (algo: AlgorithmEntry, category: CategoryEntry) => {
    if (!algo.available) return;
    navigate(`/algo/${category.id}/${algo.id}`);
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pt-28 pb-8 px-6 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Zap className="w-8 h-8 text-ice-blue" />
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-ice-blue via-sky-300 to-ice-lavender bg-clip-text text-transparent">
            Algorithm Visualizer
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
          Interactive visualizations for sorting, searching, graphs, trees, DP, and pathfinding algorithms.
          Watch every step come to life.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            id="dashboard-search"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search algorithms… (e.g. Dijkstra, Quick Sort, A*)"
            className="w-full pl-12 pr-4 py-4 bg-glacier-surface-elevated backdrop-blur-xl border border-glacier-border-bright rounded-2xl text-slate-200 text-base placeholder:text-slate-500 focus:outline-none focus:border-ice-blue/40 focus:shadow-[0_0_20px_rgba(125,211,252,0.12)] transition-all"
          />
        </div>
      </motion.section>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {filteredResults && filteredResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-xl mx-auto px-6 -mt-2 mb-6 relative z-20"
          >
            <div className="glass-panel-elevated p-2 space-y-1 shadow-2xl shadow-black/40">
              {filteredResults.map(result => (
                <button
                  key={`${result.category.id}-${result.id}`}
                  onClick={() => handleAlgoClick(result, result.category)}
                  disabled={!result.available}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    result.available
                      ? 'hover:bg-white/5 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <span className="text-lg">{result.category.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${result.category.color}`}>{result.name}</span>
                      {!result.available && <Lock className="w-3 h-3 text-slate-600" />}
                    </div>
                    <span className="text-xs text-slate-500 truncate block">{result.description}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-mono">{result.timeComplexity}</span>
                  {result.available && <ChevronRight className="w-4 h-4 text-slate-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredResults && filteredResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-xl mx-auto px-6 -mt-2 mb-6 text-center"
        >
          <div className="glass-panel p-6 text-slate-500 text-sm">
            No algorithms found for "<span className="text-slate-300">{searchQuery}</span>"
          </div>
        </motion.div>
      )}

      {/* Category Cards Grid */}
      <section className="flex-1 px-6 pb-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALGORITHM_CATALOG.map((category, catIdx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: catIdx * 0.08 }}
            >
              <CategoryCard
                category={category}
                onAlgoClick={algo => handleAlgoClick(algo, category)}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <span>
              <span className="text-ice-blue font-bold">{allAlgorithms.filter(a => a.available).length}</span> algorithms available
            </span>
            <span className="w-px h-4 bg-slate-700" />
            <span>
              <span className="text-slate-400 font-bold">{allAlgorithms.length}</span> total planned
            </span>
            <span className="w-px h-4 bg-slate-700" />
            <span>
              <span className="text-violet-400 font-bold">{ALGORITHM_CATALOG.length}</span> categories
            </span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

/* ─── Category Card ─────────────────────────────────────────────────────────── */

function CategoryCard({
  category,
  onAlgoClick,
}: {
  category: CategoryEntry;
  onAlgoClick: (algo: AlgorithmEntry) => void;
}) {
  const availableCount = category.algorithms.filter(a => a.available).length;

  return (
    <div
      className={`glass-panel-elevated p-5 flex flex-col gap-4 group hover:border-ice-blue/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/20`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-md ${category.bgColor} ${category.color} tracking-wider`}
              >
                {category.letter}
              </span>
              <h2 className="font-bold text-slate-200 text-base">{category.name}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {availableCount}/{category.algorithms.length} available
            </p>
          </div>
        </div>
      </div>

      {/* Algorithm Pills */}
      <div className="flex flex-wrap gap-2">
        {category.algorithms.map(algo => (
          <button
            key={algo.id}
            onClick={() => onAlgoClick(algo)}
            disabled={!algo.available}
            className={`group/pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
              algo.available
                ? `${category.bgColor} ${category.borderColor} ${category.color} hover:brightness-125 hover:scale-105 active:scale-95 cursor-pointer`
                : 'bg-slate-800/40 border-slate-700/30 text-slate-600 cursor-not-allowed'
            }`}
          >
            {algo.name}
            {algo.available ? (
              <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover/pill:opacity-100 group-hover/pill:ml-0 transition-all duration-200" />
            ) : (
              <Lock className="w-3 h-3 opacity-50" />
            )}
          </button>
        ))}
      </div>

      {/* Complexity mini-info for available algorithms */}
      {availableCount > 0 && (
        <div className="mt-auto pt-2 border-t border-white/5">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {category.algorithms
              .filter(a => a.available)
              .map(algo => (
                <span key={algo.id} className="text-[10px] text-slate-600 font-mono">
                  {algo.name}: {algo.timeComplexity}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
