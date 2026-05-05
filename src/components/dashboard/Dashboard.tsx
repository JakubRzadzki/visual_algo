import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Zap, ArrowRight, Clock, HardDrive } from 'lucide-react';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import type { CategoryEntry, AlgorithmEntry } from '../../data/algorithmCatalog';


export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredAlgo, setHoveredAlgo] = useState<string | null>(null);

  // Filter categories & algorithms based on search
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return ALGORITHM_CATALOG;
    const q = searchQuery.toLowerCase();
    return ALGORITHM_CATALOG
      .map(cat => ({
        ...cat,
        algorithms: cat.algorithms.filter(
          algo =>
            algo.name.toLowerCase().includes(q) ||
            algo.shortName.toLowerCase().includes(q) ||
            algo.description.toLowerCase().includes(q) ||
            cat.label.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.algorithms.length > 0);
  }, [searchQuery]);

  const totalAlgorithms = ALGORITHM_CATALOG.reduce((sum, c) => sum + c.algorithms.length, 0);
  const availableCount = ALGORITHM_CATALOG.reduce(
    (sum, c) => sum + c.algorithms.filter(a => a.available).length,
    0
  );

  const handleAlgoClick = (cat: CategoryEntry, algo: AlgorithmEntry) => {
    if (!algo.available) return;
    navigate(`/algo/${cat.id}/${algo.id}`);
  };

  return (
    <div className="relative min-h-screen bg-glacier-bg text-slate-200 overflow-y-auto overflow-x-hidden">
      {/* Background */}

      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0e1a]/80 via-[#0f1524]/60 to-[#0a0e1a]/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-ice-blue/20 to-ice-lavender/20 border border-ice-blue/20">
              <Zap className="w-8 h-8 text-ice-blue" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-ice-blue via-sky-300 to-ice-lavender bg-clip-text text-transparent">
              Algorithm Visualizer
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Explore {totalAlgorithms} algorithms across {ALGORITHM_CATALOG.length} categories.{' '}
            <span className="text-ice-blue font-medium">{availableCount} ready to visualize</span>, more coming soon.
          </p>
        </motion.header>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-14"
        >
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-ice-blue transition-colors" />
            <input
              id="dashboard-search"
              type="text"
              placeholder="Search algorithms… (e.g. Dijkstra, Quick Sort, A*)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-glacier-surface-elevated backdrop-blur-xl border border-glacier-border-bright text-slate-200 text-base placeholder:text-slate-500 focus:outline-none focus:border-ice-blue/40 focus:shadow-[0_0_30px_rgba(125,211,252,0.1)] transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Grid */}
        <AnimatePresence mode="popLayout">
          {filteredCatalog.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-20"
            >
              <p className="text-slate-500 text-lg">No algorithms found for "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="mt-4 text-ice-blue hover:underline text-sm">
                Clear search
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              layout
            >
              {filteredCatalog.map((cat, catIdx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, delay: catIdx * 0.08 }}
                  layout
                  className={`group relative rounded-2xl border ${cat.borderColor} bg-gradient-to-br ${cat.color} backdrop-blur-lg p-6 hover:shadow-xl ${cat.glowColor} transition-all duration-300 hover:scale-[1.01] hover:border-opacity-60`}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src={cat.iconImage}
                      alt={cat.label}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <h2 className="text-lg font-bold text-slate-200 tracking-wide">{cat.label}</h2>
                    <span className="ml-auto text-xs text-slate-500 bg-white/5 px-2.5 py-1 rounded-full">
                      {cat.algorithms.length} algo{cat.algorithms.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Algorithm Pills */}
                  <div className="flex flex-wrap gap-2">
                    {cat.algorithms.map(algo => {
                      const isHovered = hoveredAlgo === `${cat.id}-${algo.id}`;
                      return (
                        <motion.button
                          key={algo.id}
                          onMouseEnter={() => setHoveredAlgo(`${cat.id}-${algo.id}`)}
                          onMouseLeave={() => setHoveredAlgo(null)}
                          onClick={() => handleAlgoClick(cat, algo)}
                          disabled={!algo.available}
                          whileHover={algo.available ? { scale: 1.05 } : {}}
                          whileTap={algo.available ? { scale: 0.97 } : {}}
                          className={`relative px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                            algo.available
                              ? `${cat.borderColor} text-slate-200 hover:bg-white/10 hover:border-white/30 cursor-pointer`
                              : 'border-white/5 text-slate-500 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {algo.shortName}
                            {algo.available && (
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                            )}
                            {!algo.available && (
                              <span className="text-[10px] text-slate-600">soon</span>
                            )}
                          </span>

                          {/* Hover Tooltip */}
                          <AnimatePresence>
                            {isHovered && algo.available && (
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-ice-blue/20 shadow-2xl shadow-black/40 pointer-events-none"
                              >
                                <p className="font-bold text-slate-200 text-sm mb-1">{algo.name}</p>
                                <p className="text-slate-400 text-xs mb-3">{algo.description}</p>
                                <div className="flex gap-4 text-[11px]">
                                  <span className="flex items-center gap-1 text-sky-400">
                                    <Clock className="w-3 h-3" /> {algo.timeComplexity}
                                  </span>
                                  <span className="flex items-center gap-1 text-violet-400">
                                    <HardDrive className="w-3 h-3" /> {algo.spaceComplexity}
                                  </span>
                                </div>
                                {/* Arrow */}
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/95 border-r border-b border-ice-blue/20 rotate-45" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 pb-8 text-slate-600 text-sm"
        >
          <p>
            Algorithm Visualizer EDVR • Event-Driven Visualization Runtime
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
