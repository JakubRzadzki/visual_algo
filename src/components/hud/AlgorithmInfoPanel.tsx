import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, Code } from 'lucide-react';
import type { AlgorithmEducation } from '../../data/algorithmEducation';

/**
 * Props for the AlgorithmInfoPanel component.
 */
interface AlgorithmInfoPanelProps {
  /** The educational data for the current algorithm. */
  data: AlgorithmEducation;
}

/**
 * Tab types for the info panel.
 */
type TabId = 'theory' | 'dummies' | 'pseudocode';

/**
 * AlgorithmInfoPanel Component
 * 
 * Renders a deeply educational side-panel explaining the active algorithm.
 * Uses a tabbed interface to separate formal theory, real-world analogies, and pseudocode.
 *
 * @param props - Component props containing the algorithm data.
 */
const AlgorithmInfoPanel: React.FC<AlgorithmInfoPanelProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<TabId>('theory');

  const tabs = [
    { id: 'theory', label: 'Theory', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'dummies', label: 'For Dummies 🦧', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'pseudocode', label: 'Pseudocode', icon: <Code className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="flex-1 flex flex-col glass-panel overflow-hidden border border-ice-blue/10 rounded-xl bg-slate-900/40 min-h-0">
      {/* Tab Navigation */}
      <div className="flex border-b border-ice-blue/10 bg-slate-950/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 text-sm font-semibold transition-all relative ${
              activeTab === tab.id
                ? 'text-ice-blue'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-ice-blue shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-ice-blue/20 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'theory' && (
              <div className="space-y-4">
                <h4 className="text-ice-blue font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Formal Description
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {data.theory}
                </p>
              </div>
            )}

            {activeTab === 'dummies' && (
              <div className="space-y-4">
                <h4 className="text-ice-blue font-bold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  The Analogy
                </h4>
                <div className="p-4 rounded-lg bg-ice-blue/5 border border-ice-blue/10 italic text-slate-300 text-sm leading-relaxed">
                  "{data.forDummies}"
                </div>
              </div>
            )}

            {activeTab === 'pseudocode' && (
              <div className="space-y-4 h-full flex flex-col">
                <h4 className="text-ice-blue font-bold flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Logic Blueprint
                </h4>
                <pre className="flex-1 p-4 rounded-lg bg-slate-950/80 border border-ice-blue/5 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                  <code>{data.pseudocode}</code>
                </pre>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle bottom decoration */}
      <div className="h-1 bg-gradient-to-r from-transparent via-ice-blue/20 to-transparent opacity-50" />
    </div>
  );
};

export default AlgorithmInfoPanel;
