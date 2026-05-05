/**
 * @file AlgorithmStats.tsx
 * @description HUD statistics overlay displaying real-time algorithm metrics.
 *
 * Shows comparisons, array accesses, algorithm name, and complexity info.
 * Uses glassmorphism with neon accents for a premium cyberpunk look.
 * Compact horizontal layout on desktop, stacked on mobile.
 */

import { Activity, Layers, Cpu, Zap } from 'lucide-react';
import type { SortFrame, SortAlgorithmInfo } from '../types';

interface AlgorithmStatsProps {
  /** Current frame snapshot (null if not loaded). */
  frame: SortFrame | null;

  /** Algorithm metadata. */
  info: SortAlgorithmInfo | null;
}

/** Single stat tile with icon, label, and value. */
function StatTile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-white/[0.05]">
      <div className={`${color}`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider leading-none">{label}</span>
        <span className="text-sm font-bold text-slate-200 font-mono">{value}</span>
      </div>
    </div>
  );
}

export default function AlgorithmStats({ frame, info }: AlgorithmStatsProps) {
  if (!info) return null;

  return (
    <div className="w-full flex flex-wrap items-center gap-2 px-3 sm:px-5 py-2.5 bg-slate-900/40 backdrop-blur-md border-b border-white/[0.04]">
      {/* Algorithm name */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-400/15 mr-2">
        <Cpu className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-bold text-cyan-300">{info.name}</span>
      </div>

      {/* Complexity badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-400/15 text-xs font-mono text-violet-300">
        <Zap className="w-3 h-3" />
        {info.timeComplexity} · {info.spaceComplexity}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Live stats */}
      {frame && (
        <div className="flex items-center gap-2 flex-wrap">
          <StatTile
            icon={<Activity className="w-3.5 h-3.5" />}
            label="Comparisons"
            value={frame.comparisons}
            color="text-fuchsia-400"
          />
          <StatTile
            icon={<Layers className="w-3.5 h-3.5" />}
            label="Array Accesses"
            value={frame.arrayAccesses}
            color="text-cyan-400"
          />
        </div>
      )}
    </div>
  );
}
