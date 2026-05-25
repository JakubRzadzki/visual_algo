import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "../../store/uiStore";
import { getTranslation } from "../../data/translations";
import { BookOpen, GraduationCap, Code } from "lucide-react";
import type { TranslatedEducation } from "../../data/algorithmEducation";

/**
 * Props for the AlgorithmInfoPanel component.
 */
interface AlgorithmInfoPanelProps {
  /** The educational data for the current algorithm. */
  data: TranslatedEducation;
}

/**
 * AlgorithmInfoPanel Component
 *
 * Renders a deeply educational side-panel explaining the active algorithm.
 * Uses a tabbed interface to separate formal theory, real-world analogies, and pseudocode.
 */
export default function AlgorithmInfoPanel({ data }: AlgorithmInfoPanelProps) {
  const language = useUIStore((state) => state.language);
  const theme = useUIStore((state) => state.theme);
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<
    "theory" | "dummies" | "pseudocode"
  >("theory");

  return (
    <div className="flex-1 min-h-0 glass-panel flex flex-col border border-glacier-border-bright rounded-2xl overflow-hidden shadow-2xl shadow-black/50 group/panel">
      {/* Tab Navigation */}
      <div className="flex bg-glacier-surface p-1.5 border-b border-glacier-border-bright gap-1">
        {(["theory", "dummies", "pseudocode"] as const).map((tabId) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
              activeTab === tabId
                ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-cyan-500/20"
                : "border border-transparent"
            }`}
            style={activeTab !== tabId ? { color: 'var(--text-muted)' } : undefined}
          >
            {tabId === "theory" && <BookOpen className="w-3.5 h-3.5" />}
            {tabId === "dummies" && <GraduationCap className="w-3.5 h-3.5" />}
            {tabId === "pseudocode" && <Code className="w-3.5 h-3.5" />}
            <span>
              {tabId === "theory" && t.theory}
              {tabId === "dummies" && t.forDummies}
              {tabId === "pseudocode" && t.pseudocode}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar" style={{ backgroundColor: theme === 'dark' ? 'rgba(15,23,42,0.2)' : 'rgba(255,255,255,0.3)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {activeTab === "theory" && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-ice-blue font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    {t.formalDescription}
                  </h4>
                  <p className="leading-relaxed text-sm whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                    {data.theory}
                  </p>
                </div>

                {data.history && (
                  <div className="space-y-3 pt-4 border-t border-ice-blue/5">
                    <h4 className="text-cyan-400/80 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                      <motion.span
                        initial={{ rotate: -20 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        ⏳
                      </motion.span>
                      {t.originsHistory}
                    </h4>
                    <p
                      className="leading-relaxed text-xs italic p-3 rounded-lg whitespace-pre-line"
                      style={{
                        color: 'var(--text-muted)',
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {data.history}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "dummies" && (
              <div className="space-y-4">
                <h4 className="text-cyan-400 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  {t.theAnalogy}
                </h4>
                <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <GraduationCap className="w-12 h-12 text-cyan-400" />
                  </div>
                  <p className="italic leading-relaxed text-sm relative z-10 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                    "{data.forDummies}"
                  </p>
                </div>
              </div>
            )}

            {activeTab === "pseudocode" && (
              <div className="space-y-4 h-full flex flex-col">
                <h4 className="text-amber-400 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Code className="w-4 h-4" />
                  {t.logicBlueprint}
                </h4>
                <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700/50 p-4 overflow-hidden flex flex-col min-h-[200px]">
                  <pre className="text-[11px] font-mono text-emerald-400/90 leading-relaxed overflow-y-auto custom-scrollbar flex-1 whitespace-pre-wrap">
                    <code>{data.pseudocode}</code>
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle bottom decoration */}
      <div className="h-1 bg-gradient-to-r from-transparent via-ice-blue/20 to-transparent opacity-50" />
    </div>
  );
}
