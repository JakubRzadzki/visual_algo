/**
 * @file ChartDecorations.tsx
 * @description Decorative SVG charts in the lower portion of the screen.
 *
 * Renders three visual elements:
 * 1. A time-complexity curve (O(n log n) shape) drawn with dash animation.
 * 2. A descending loss/convergence curve.
 * 3. Mini sorting bars with pulsing height and opacity.
 *
 * Uses emerald, cyan, blue palette. All elements are heavily muted and serve
 * purely as ambient decoration. Responsive viewBox dimensions.
 */

import { motion } from "motion/react";

export default function ChartDecorations() {
  return (
    <div
      className="fixed inset-0 z-[2] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* === Time Complexity Curve (bottom-left) === */}
      <svg
        className="absolute bottom-4 left-4 md:bottom-12 md:left-16"
        width="200"
        height="100"
        viewBox="0 0 200 100"
        fill="none"
        style={{ opacity: 0.1 }}
      >
        {/* Axis lines */}
        <line
          x1="20"
          y1="85"
          x2="190"
          y2="85"
          stroke="#3b82f6"
          strokeWidth="0.5"
        />
        <line
          x1="20"
          y1="85"
          x2="20"
          y2="10"
          stroke="#3b82f6"
          strokeWidth="0.5"
        />

        {/* O(n log n) curve */}
        <motion.path
          d="M 20 80 Q 60 65 90 50 Q 130 30 170 15"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="200"
          initial={{ strokeDashoffset: 200 }}
          animate={{ strokeDashoffset: [200, 0, 200] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* O(n²) curve for comparison */}
        <motion.path
          d="M 20 80 Q 80 75 120 55 Q 155 30 175 5"
          stroke="#22d3ee"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="200"
          initial={{ strokeDashoffset: 200 }}
          animate={{ strokeDashoffset: [200, 0, 200] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Labels */}
        <text
          x="175"
          y="20"
          fill="#10b981"
          fontSize="6"
          opacity="0.6"
          fontFamily="monospace"
        >
          n log n
        </text>
        <text
          x="178"
          y="8"
          fill="#22d3ee"
          fontSize="6"
          opacity="0.6"
          fontFamily="monospace"
        >
          n²
        </text>
      </svg>

      {/* === Loss Curve (bottom-center on desktop) === */}
      <svg
        className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:block"
        width="180"
        height="80"
        viewBox="0 0 180 80"
        fill="none"
        style={{ opacity: 0.08 }}
      >
        <motion.path
          d="M 10 15 Q 30 40 50 50 Q 80 60 120 65 L 170 68"
          stroke="#8b5cf6"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="200"
          initial={{ strokeDashoffset: 200 }}
          animate={{ strokeDashoffset: [200, 0, 200] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <text
          x="140"
          y="60"
          fill="#8b5cf6"
          fontSize="6"
          opacity="0.5"
          fontFamily="monospace"
        >
          loss
        </text>
      </svg>

      {/* === Mini Sorting Bars (bottom-right, small screens and up) === */}
      <svg
        className="absolute bottom-6 right-4 md:bottom-12 md:right-1/4"
        width="120"
        height="60"
        viewBox="0 0 120 60"
        fill="none"
        style={{ opacity: 0.12 }}
      >
        {[35, 50, 20, 45, 30, 55, 25, 40, 15, 48].map((h, i) => (
          <motion.rect
            key={i}
            x={i * 12}
            y={60 - h}
            width="8"
            height={h}
            rx="1"
            fill={i % 3 === 0 ? "#22d3ee" : i % 3 === 1 ? "#3b82f6" : "#10b981"}
            initial={{ opacity: 0.4 }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              height: [h, h + 4, h],
              y: [60 - h, 60 - h - 4, 60 - h],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
