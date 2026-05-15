/**
 * @file Dashboard.tsx
 * @description Premium dark-futuristic landing page for Algorithm Visualizer EDVR.
 *
 * Renders:
 * - Animated gradient header with glowing icon and title.
 * - Glassmorphic search input with focus ring animation.
 * - Staggered, responsive category cards with hover shine effect.
 * - All decorative background layers composed at this level.
 *
 * Fully responsive: 1-column mobile → 2-column tablet → 3-column desktop.
 * Respects prefers-reduced-motion for all entrance/hover animations.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Zap,
  ArrowRight,
  Clock,
  HardDrive,
  BarChart2,
  Network,
  GitMerge,
  Layers,
  Grid,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { getTranslation } from '../../data/translations';
import { ALGORITHM_CATALOG } from '../../data/algorithmCatalog';
import type { CategoryEntry, AlgorithmEntry } from '../../data/algorithmCatalog';

import NeuralNetworkBackground from '../background/NeuralNetworkBackground';
import BackgroundGrid from '../background/BackgroundGrid';
import GraphDecorations from '../background/GraphDecorations';
import AlgorithmCodeLayer from '../background/AlgorithmCodeLayer';
import ChartDecorations from '../background/ChartDecorations';

/**
 * Stagger timing for card entrance animations.
 * Each card enters 80ms after the previous one.
 */
const STAGGER_DELAY = 0.08;

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredAlgo, setHoveredAlgo] = useState<string | null>(null);

  const language = useUIStore(state => state.language);
  const t = getTranslation(language);

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
            algo.name_pl.toLowerCase().includes(q) ||
            algo.shortName.toLowerCase().includes(q) ||
            algo.description.toLowerCase().includes(q) ||
            algo.description_pl.toLowerCase().includes(q) ||
            cat.label.toLowerCase().includes(q) ||
            cat.label_pl.toLowerCase().includes(q)
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
      {/* ──────── Background Layers (z-0 through z-2) ──────── */}
      <BackgroundGrid />
      <NeuralNetworkBackground />
      <GraphDecorations />
      <AlgorithmCodeLayer />
      <ChartDecorations />

      {/* Overlay gradient for depth */}
      <div
        className="fixed inset-0 z-[3] pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(135deg, rgba(2,6,23,0.5) 0%, rgba(3,7,18,0.3) 50%, rgba(5,8,22,0.5) 100%)',
        }}
      />

      {/* ──────── Main Content (z-10) ──────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8 sm:mb-10"
        >
          {/* Glowing Icon */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <motion.div
              className="relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-cyan-400/20"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(34,211,238,0.15), inset 0 0 20px rgba(34,211,238,0.05)',
                  '0 0 35px rgba(34,211,238,0.25), inset 0 0 30px rgba(34,211,238,0.08)',
                  '0 0 20px rgba(34,211,238,0.15), inset 0 0 20px rgba(34,211,238,0.05)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
            </motion.div>
          </div>

          {/* Animated Gradient Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span
              className="bg-clip-text text-transparent animate-gradient-shift"
              style={{
                backgroundImage: 'linear-gradient(90deg, #22d3ee, #3b82f6, #8b5cf6, #6366f1, #22d3ee)',
                backgroundSize: '300% 100%',
              }}
            >
              Algorithm Visualizer
            </span>
          </h1>

          {/* Glow behind title */}
          <div
            className="absolute left-1/2 top-16 sm:top-20 -translate-x-1/2 w-[300px] sm:w-[500px] h-[80px] sm:h-[120px] pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.12) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {language === 'en' ? (
              <>Explore {totalAlgorithms} algorithms across {ALGORITHM_CATALOG.length} categories.</>
            ) : (
              <>Odkryj {totalAlgorithms} algorytmów w {ALGORITHM_CATALOG.length} kategoriach.</>
            )}
            {' '}
            <span className="text-cyan-400 font-semibold">{availableCount} {language === 'en' ? 'ready to visualize' : 'gotowych do wizualizacji'}</span>, {t.comingSoon}.
          </p>
        </motion.header>

        {/* ── Search Bar (Glassmorphic) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto mb-10 sm:mb-12"
        >
          <div className="relative group">
            {/* Animated glow behind input on focus */}
            <div
              className="absolute -inset-0.5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              }}
              aria-hidden="true"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-10" />
            <input
              id="dashboard-search"
              type="text"
              placeholder={language === 'en' ? "Search algorithms… (e.g. Dijkstra, Quick Sort, A*)" : "Szukaj algorytmów… (np. Dijkstra, Sortowanie, A*)"}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="relative w-full pl-14 pr-6 py-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] text-slate-200 text-base placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/30 focus:shadow-[0_0_40px_rgba(34,211,238,0.08)] transition-all duration-300 z-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-sm z-10"
              >
                {language === 'en' ? 'Clear' : 'Wyczyść'}
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Category Card Grid ── */}
        <AnimatePresence mode="popLayout">
          {filteredCatalog.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-20"
            >
              <p className="text-slate-500 text-lg">
                {language === 'en' 
                  ? `No algorithms found for "${searchQuery}"` 
                  : `Nie znaleziono algorytmów dla frazy "${searchQuery}"`}
              </p>
              <button onClick={() => setSearchQuery('')} className="mt-4 text-cyan-400 hover:underline text-sm">
                {language === 'en' ? 'Clear search' : 'Wyczyść wyszukiwanie'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              layout
            >
              {filteredCatalog.map((cat, catIdx) => (
                <AnimatedCategoryCard
                  key={cat.id}
                  cat={cat}
                  catIdx={catIdx}
                  hoveredAlgo={hoveredAlgo}
                  setHoveredAlgo={setHoveredAlgo}
                  onAlgoClick={handleAlgoClick}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-14 sm:mt-20 pb-8 text-slate-600 text-sm"
        >
          <p>
            Algorithm Visualizer EDVR • Event-Driven Visualization Runtime
          </p>
        </motion.footer>
      </div>
    </div>
  );
}


/* ──────────────────────────────────────────────────────────────────────
 * AnimatedCategoryCard
 * ────────────────────────────────────────────────────────────────────── */

interface AnimatedCategoryCardProps {
  cat: CategoryEntry;
  catIdx: number;
  hoveredAlgo: string | null;
  setHoveredAlgo: (id: string | null) => void;
  onAlgoClick: (cat: CategoryEntry, algo: AlgorithmEntry) => void;
}

/**
 * A single algorithm category card with glassmorphism, staggered entrance,
 * and premium hover effects (shine sweep, border glow, elevation).
 *
 * Hover effects are gated behind `@media (hover: hover)` via the CSS class
 * `.hover-card` defined in index.css.
 */
/**
 * Maps a category ID to its corresponding Lucide React Icon component.
 *
 * @param id - The unique category identifier.
 * @returns A beautifully styled Lucide Icon element matching the category theme.
 */
const getCategoryIcon = (id: string): React.ReactElement => {
  switch (id) {
    case 'sorting':
      return <BarChart2 className="w-5 h-5 text-sky-400" />;
    case 'searching':
      return <Search className="w-5 h-5 text-violet-400" />;
    case 'graphs':
      return <Network className="w-5 h-5 text-emerald-400" />;
    case 'trees':
      return <GitMerge className="w-5 h-5 text-amber-400" />;
    case 'dp':
      return <Layers className="w-5 h-5 text-rose-400" />;
    case 'grid':
      return <Grid className="w-5 h-5 text-indigo-400" />;
    default:
      return <Zap className="w-5 h-5 text-cyan-400" />;
  }
};

/**
 * Returns custom hover border and shadow classes tailored to each category color.
 *
 * @param id - The unique category identifier.
 * @returns Tailwind CSS classes for custom hover borders and glow shadows.
 */
const getCategoryHoverClasses = (id: string): string => {
  switch (id) {
    case 'sorting':
      return 'hover:border-sky-500/35 hover:shadow-[0_0_30px_rgba(14,165,233,0.12)]';
    case 'searching':
      return 'hover:border-violet-500/35 hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]';
    case 'graphs':
      return 'hover:border-emerald-500/35 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]';
    case 'trees':
      return 'hover:border-amber-500/35 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]';
    case 'dp':
      return 'hover:border-rose-500/35 hover:shadow-[0_0_30px_rgba(244,63,94,0.12)]';
    case 'grid':
      return 'hover:border-indigo-500/35 hover:shadow-[0_0_30px_rgba(99,102,241,0.12)]';
    default:
      return 'hover:border-cyan-500/35 hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]';
  }
};

/**
 * Provides custom hover backgrounds, borders, text, and shadow classes for algorithm pills.
 *
 * @param categoryId - The unique identifier of the parent category.
 * @returns Tailwind CSS classes for active hover styling.
 */
const getPillHoverStyles = (categoryId: string): string => {
  switch (categoryId) {
    case 'sorting':
      return 'hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-300';
    case 'searching':
      return 'hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300';
    case 'graphs':
      return 'hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300';
    case 'trees':
      return 'hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300';
    case 'dp':
      return 'hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300';
    case 'grid':
      return 'hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300';
    default:
      return 'hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300';
  }
};

function AnimatedCategoryCard({
  cat,
  catIdx,
  hoveredAlgo,
  setHoveredAlgo,
  onAlgoClick,
}: AnimatedCategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.96, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.5,
        delay: catIdx * STAGGER_DELAY,
        ease: [0.22, 1, 0.36, 1],
      }}
      layout
      className={`hover-card group relative rounded-2xl glacier-border glass-panel p-4 sm:p-5 transition-all duration-300 overflow-visible h-full flex flex-col justify-between ${getCategoryHoverClasses(
        cat.id
      )}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Gradient top-border accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${cat.color}`}
        aria-hidden="true"
      />

      {/* Shine sweep on hover */}
      <div
        className="shine-sweep absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
          backgroundSize: '200% 100%',
          backgroundPosition: '200% 0',
        }}
      />

      {/* Inner shadow for depth */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        aria-hidden="true"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -1px 2px rgba(0,0,0,0.3)',
        }}
      />

      <div className="h-full flex flex-col justify-between">
        {/* Category Header */}
        <div className="relative flex items-center gap-3 mb-5">
          <div
            className={`p-2 rounded-xl bg-gradient-to-br ${cat.color} border border-white/[0.08] flex items-center justify-center text-slate-200`}
            aria-hidden="true"
          >
            {getCategoryIcon(cat.id)}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-200 tracking-wide">
            {useUIStore.getState().language === 'en' ? cat.label : cat.label_pl}
          </h2>
          <span className="ml-auto text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {cat.algorithms.length} {useUIStore.getState().language === 'en' ? 'algo' : 'algorytm'}{cat.algorithms.length !== 1 ? (useUIStore.getState().language === 'en' ? 's' : 'ów') : ''}
          </span>
        </div>

        {/* Algorithm Pills */}
        <div className="relative flex flex-wrap gap-2 content-start flex-grow">
          {cat.algorithms.map(algo => {
            const isHovered = hoveredAlgo === `${cat.id}-${algo.id}`;
            return (
              <motion.button
                key={algo.id}
                onMouseEnter={() => setHoveredAlgo(`${cat.id}-${algo.id}`)}
                onMouseLeave={() => setHoveredAlgo(null)}
                onClick={() => onAlgoClick(cat, algo)}
                disabled={!algo.available}
                whileHover={algo.available ? { scale: 1.05 } : {}}
                whileTap={algo.available ? { scale: 0.97 } : {}}
                className={`relative px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  algo.available
                    ? `border-white/[0.08] text-slate-200 cursor-pointer ${getPillHoverStyles(
                        cat.id
                      )}`
                    : 'border-white/[0.03] text-slate-500 cursor-not-allowed opacity-50'
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
                      className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-cyan-400/15 shadow-2xl shadow-black/50 pointer-events-none"
                    >
                      <p className="font-bold text-slate-200 text-sm mb-1">
                        {useUIStore.getState().language === 'en' ? algo.name : algo.name_pl}
                      </p>
                      <p className="text-slate-400 text-xs mb-3">
                        {useUIStore.getState().language === 'en' ? algo.description : algo.description_pl}
                      </p>
                      <div className="flex gap-4 text-[11px]">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Clock className="w-3 h-3" /> {algo.timeComplexity}
                        </span>
                        <span className="flex items-center gap-1 text-violet-400">
                          <HardDrive className="w-3 h-3" /> {algo.spaceComplexity}
                        </span>
                      </div>
                      {/* Arrow */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/95 border-r border-b border-cyan-400/15 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
