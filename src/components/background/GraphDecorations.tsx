/**
 * @file GraphDecorations.tsx
 * @description Decorative animated SVG graphs rendered in the background.
 *
 * Renders two algorithmic graph structures:
 * - A Dijkstra/BFS-style graph (bottom-right) with highlighted shortest path.
 * - A tree structure (left side) with pulsing nodes and animated edges.
 *
 * All elements use low opacity (0.08–0.22), pointer-events-none, aria-hidden,
 * and are hidden on screens < 768px to avoid visual clutter on mobile.
 */

import { motion } from "motion/react";

/** Reusable pulsing node circle. */
function PulsingNode({
  cx,
  cy,
  r = 4,
  color = "#22d3ee",
  delay = 0,
}: {
  cx: number;
  cy: number;
  r?: number;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color}
      initial={{ opacity: 0.3, scale: 1 }}
      animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
      transition={{ duration: 3, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

/** Animated edge with dash animation simulating path computation. */
function AnimatedEdge({
  x1,
  y1,
  x2,
  y2,
  color = "#3b82f6",
  duration = 4,
  delay = 0,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray="6 4"
      initial={{ strokeDashoffset: 0 }}
      animate={{ strokeDashoffset: -40 }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay }}
    />
  );
}

export default function GraphDecorations() {
  return (
    <div
      className="fixed inset-0 z-[2] pointer-events-none hidden md:block overflow-hidden"
      aria-hidden="true"
    >
      {/* === Bottom-right Dijkstra / BFS graph === */}
      <svg
        className="absolute bottom-8 right-8 lg:bottom-12 lg:right-12"
        width="280"
        height="220"
        viewBox="0 0 280 220"
        fill="none"
        style={{ opacity: 0.12 }}
      >
        {/* Regular edges */}
        <AnimatedEdge
          x1={40}
          y1={40}
          x2={120}
          y2={30}
          color="#6366f1"
          duration={5}
        />
        <AnimatedEdge
          x1={120}
          y1={30}
          x2={200}
          y2={60}
          color="#6366f1"
          duration={6}
          delay={0.5}
        />
        <AnimatedEdge
          x1={40}
          y1={40}
          x2={80}
          y2={120}
          color="#3b82f6"
          duration={4}
          delay={1}
        />
        <AnimatedEdge
          x1={80}
          y1={120}
          x2={160}
          y2={140}
          color="#3b82f6"
          duration={5}
          delay={0.8}
        />
        <AnimatedEdge
          x1={200}
          y1={60}
          x2={240}
          y2={140}
          color="#6366f1"
          duration={4.5}
          delay={0.3}
        />
        <AnimatedEdge
          x1={160}
          y1={140}
          x2={240}
          y2={140}
          color="#3b82f6"
          duration={5}
          delay={1.2}
        />
        <AnimatedEdge
          x1={240}
          y1={140}
          x2={220}
          y2={200}
          color="#6366f1"
          duration={4}
          delay={0.6}
        />

        {/* Highlighted shortest path — cyan/violet */}
        <AnimatedEdge
          x1={40}
          y1={40}
          x2={120}
          y2={30}
          color="#22d3ee"
          duration={3}
        />
        <AnimatedEdge
          x1={120}
          y1={30}
          x2={200}
          y2={60}
          color="#8b5cf6"
          duration={3}
          delay={0.3}
        />
        <AnimatedEdge
          x1={200}
          y1={60}
          x2={240}
          y2={140}
          color="#22d3ee"
          duration={3}
          delay={0.6}
        />
        <AnimatedEdge
          x1={240}
          y1={140}
          x2={220}
          y2={200}
          color="#8b5cf6"
          duration={3}
          delay={0.9}
        />

        {/* Nodes */}
        <PulsingNode cx={40} cy={40} color="#22d3ee" delay={0} />
        <PulsingNode cx={120} cy={30} color="#8b5cf6" delay={0.4} />
        <PulsingNode cx={200} cy={60} color="#22d3ee" delay={0.8} />
        <PulsingNode cx={80} cy={120} color="#6366f1" delay={1.2} />
        <PulsingNode cx={160} cy={140} color="#3b82f6" delay={0.6} />
        <PulsingNode cx={240} cy={140} color="#8b5cf6" delay={1.0} />
        <PulsingNode cx={220} cy={200} color="#22d3ee" delay={1.5} r={5} />
      </svg>

      {/* === Left-side tree structure === */}
      <svg
        className="absolute top-1/4 left-6 lg:left-12"
        width="200"
        height="240"
        viewBox="0 0 200 240"
        fill="none"
        style={{ opacity: 0.1 }}
      >
        {/* Tree edges */}
        <AnimatedEdge
          x1={100}
          y1={20}
          x2={50}
          y2={80}
          color="#8b5cf6"
          duration={4}
        />
        <AnimatedEdge
          x1={100}
          y1={20}
          x2={150}
          y2={80}
          color="#8b5cf6"
          duration={4}
          delay={0.5}
        />
        <AnimatedEdge
          x1={50}
          y1={80}
          x2={25}
          y2={150}
          color="#6366f1"
          duration={5}
          delay={1}
        />
        <AnimatedEdge
          x1={50}
          y1={80}
          x2={75}
          y2={150}
          color="#6366f1"
          duration={5}
          delay={0.8}
        />
        <AnimatedEdge
          x1={150}
          y1={80}
          x2={125}
          y2={150}
          color="#3b82f6"
          duration={5}
          delay={1.2}
        />
        <AnimatedEdge
          x1={150}
          y1={80}
          x2={175}
          y2={150}
          color="#3b82f6"
          duration={5}
          delay={0.6}
        />
        <AnimatedEdge
          x1={25}
          y1={150}
          x2={12}
          y2={220}
          color="#22d3ee"
          duration={4}
          delay={1.5}
        />
        <AnimatedEdge
          x1={25}
          y1={150}
          x2={38}
          y2={220}
          color="#22d3ee"
          duration={4}
          delay={1.8}
        />

        {/* Tree nodes */}
        <PulsingNode cx={100} cy={20} color="#8b5cf6" r={5} delay={0} />
        <PulsingNode cx={50} cy={80} color="#6366f1" delay={0.3} />
        <PulsingNode cx={150} cy={80} color="#6366f1" delay={0.6} />
        <PulsingNode cx={25} cy={150} color="#3b82f6" delay={0.9} />
        <PulsingNode cx={75} cy={150} color="#3b82f6" delay={1.2} />
        <PulsingNode cx={125} cy={150} color="#22d3ee" delay={1.5} />
        <PulsingNode cx={175} cy={150} color="#22d3ee" delay={1.8} />
        <PulsingNode cx={12} cy={220} color="#22d3ee" r={3} delay={2.0} />
        <PulsingNode cx={38} cy={220} color="#22d3ee" r={3} delay={2.2} />
      </svg>
    </div>
  );
}
