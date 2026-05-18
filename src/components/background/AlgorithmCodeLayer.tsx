/**
 * @file AlgorithmCodeLayer.tsx
 * @description Decorative drifting pseudo-code and formula fragments.
 *
 * Absolutely positioned text blocks (font-mono) containing algorithm snippets
 * and Big-O notations. Each block drifts slowly via Framer Motion infinite
 * animations. Gradient-masked to blend with the dark background.
 *
 * Hidden entirely on viewports < 1024px to avoid mobile clutter.
 * All elements are pointer-events-none and aria-hidden.
 */

import { motion } from "motion/react";

/** Algorithm code snippets with their fixed position offsets (in percentages). */
const CODE_FRAGMENTS = [
  { text: "dijkstra(graph, src)", x: "8%", y: "15%", opacity: 0.08 },
  { text: "O(V log V + E)", x: "78%", y: "12%", opacity: 0.07 },
  { text: "dp[i][j] = max(...)", x: "85%", y: "55%", opacity: 0.1 },
  { text: "while queue:", x: "5%", y: "68%", opacity: 0.06 },
  { text: "if dist[u] + w < dist[v]:", x: "12%", y: "42%", opacity: 0.09 },
  { text: "return visited", x: "72%", y: "78%", opacity: 0.07 },
  { text: "pivot = arr[hi]", x: "65%", y: "28%", opacity: 0.08 },
  { text: "O(n²)", x: "22%", y: "85%", opacity: 0.12 },
  { text: "heapify(arr, n, i)", x: "45%", y: "8%", opacity: 0.06 },
  { text: "MST ← ∅", x: "88%", y: "38%", opacity: 0.09 },
  { text: "f(n) = g(n) + h(n)", x: "35%", y: "92%", opacity: 0.07 },
  { text: "merge(left, right)", x: "55%", y: "65%", opacity: 0.06 },
] as const;

export default function AlgorithmCodeLayer() {
  return (
    <div
      className="fixed inset-0 z-[2] pointer-events-none hidden lg:block overflow-hidden"
      aria-hidden="true"
      /* Gradient mask to fade edges */
      style={{
        maskImage:
          "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)",
      }}
    >
      {CODE_FRAGMENTS.map((frag, i) => (
        <motion.span
          key={i}
          className="absolute font-mono text-xs md:text-sm text-cyan-300/80 select-none whitespace-nowrap"
          style={{
            left: frag.x,
            top: frag.y,
            opacity: frag.opacity,
            filter: "blur(0.5px)",
          }}
          animate={{
            x: [0, i % 2 === 0 ? 12 : -12, 0],
            y: [0, i % 3 === 0 ? -8 : 8, 0],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {frag.text}
        </motion.span>
      ))}
    </div>
  );
}
