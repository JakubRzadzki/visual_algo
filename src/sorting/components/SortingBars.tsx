/**
 * @file SortingBars.tsx
 * @description Premium cyberpunk-themed bar visualization for sorting algorithms.
 *
 * Renders the current SortFrame as vertical bars with:
 * - Neon color coding: default (deep blue), comparing (magenta), swapping (cyan), sorted (emerald), pivot (violet).
 * - Framer Motion `layout` animations for smooth position swaps (disabled for >50 elements).
 * - Dynamic bar width calculation based on container and array size.
 * - Fully responsive: narrower bars and reduced gaps on mobile.
 */

import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { SortFrame, BarStatus } from '../types';

/** Performance threshold: disable Framer Motion layout animations above this count. */
const LAYOUT_ANIM_THRESHOLD = 50;

interface SortingBarsProps {
  /** The current frame snapshot to render. */
  frame: SortFrame;
}

/**
 * Determines the visual status of a bar at a given index within the frame.
 *
 * @param frame - Current sort frame snapshot.
 * @param index - Index of the bar in the array.
 * @returns The BarStatus determining its color and glow.
 */
function getBarStatus(frame: SortFrame, index: number): BarStatus {
  if (frame.swapping.includes(index)) return 'swapping';
  if (frame.comparing.includes(index)) return 'comparing';
  if (frame.pivot === index) return 'pivot';
  if (frame.sorted.includes(index)) return 'sorted';
  return 'default';
}

/** Color mappings for each bar status — gradient, glow shadow, and ring. */
const BAR_STYLES: Record<BarStatus, { bg: string; shadow: string; ring: string }> = {
  default: {
    bg: 'bg-gradient-to-t from-slate-700 to-slate-500',
    shadow: '',
    ring: '',
  },
  comparing: {
    bg: 'bg-gradient-to-t from-fuchsia-600 to-fuchsia-400',
    shadow: 'shadow-[0_0_20px_rgba(217,70,239,0.6)]',
    ring: 'ring-2 ring-fuchsia-400/60',
  },
  swapping: {
    bg: 'bg-gradient-to-t from-cyan-500 to-cyan-300',
    shadow: 'shadow-[0_0_25px_rgba(34,211,238,0.7)]',
    ring: 'ring-2 ring-cyan-300/60',
  },
  sorted: {
    bg: 'bg-gradient-to-t from-emerald-600 to-emerald-400',
    shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    ring: 'ring-1 ring-emerald-400/40',
  },
  pivot: {
    bg: 'bg-gradient-to-t from-violet-600 to-violet-400',
    shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.6)]',
    ring: 'ring-2 ring-violet-400/60',
  },
};

export default function SortingBars({ frame }: SortingBarsProps) {
  const arr = frame.array;
  const maxValue = useMemo(() => Math.max(...arr, 1), [arr]);
  const count = arr.length;
  const useLayoutAnim = count <= LAYOUT_ANIM_THRESHOLD;

  return (
    <div
      className="flex-1 w-full flex items-end justify-center px-2 sm:px-4 pb-4 gap-px sm:gap-0.5 md:gap-1 overflow-hidden"
      role="img"
      aria-label={`Sorting visualization: ${count} bars`}
    >
      {arr.map((value, index) => {
        const heightPercent = (value / maxValue) * 95 + 5; // min 5% height
        const status = getBarStatus(frame, index);
        const styles = BAR_STYLES[status];

        // Base bar element (conditional Framer Motion wrapper)
        const barContent = (
          <div
            className={`w-full rounded-t-md transition-colors duration-150 ${styles.bg} ${styles.shadow} ${styles.ring}`}
            style={{ height: `${heightPercent}%` }}
          />
        );

        if (useLayoutAnim) {
          return (
            <motion.div
              key={`bar-${value}-${index}`}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center justify-end h-full"
              style={{
                flex: `1 1 0%`,
                maxWidth: `${Math.max(100 / count, 2)}%`,
                willChange: 'transform',
              }}
            >
              {barContent}
              {/* Value label — only show for small arrays */}
              {count <= 30 && (
                <span className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-mono select-none truncate">
                  {value}
                </span>
              )}
            </motion.div>
          );
        }

        // CSS-only path for large arrays (>50 elements) — no Framer Motion overhead
        return (
          <div
            key={`bar-${index}`}
            className="flex flex-col items-center justify-end h-full transition-all duration-100"
            style={{
              flex: `1 1 0%`,
              maxWidth: `${Math.max(100 / count, 1)}%`,
            }}
          >
            {barContent}
          </div>
        );
      })}
    </div>
  );
}
