/**
 * @file NeuralNetworkBackground.tsx
 * @description Full-screen canvas overlay rendering a dynamic neural network mesh.
 *
 * Draws drifting nodes with pulsing glow connected by distance-based edges.
 * Uses a curated palette (cyan, blue, indigo, violet) for a premium dark-futuristic feel.
 * Particle count adapts to viewport width (70–100 on desktop, 35–50 on mobile).
 * Respects `prefers-reduced-motion` by disabling animation entirely.
 */

import { useRef, useEffect, useCallback } from "react";
import { useUIStore } from "../../store/uiStore";

/** Node palette in light mode — curated cyan/blue/indigo/violet. */
const NODE_COLORS_LIGHT = [
  { r: 34, g: 211, b: 238 }, // cyan  #22d3ee
  { r: 59, g: 130, b: 246 }, // blue  #3b82f6
  { r: 99, g: 102, b: 241 }, // indigo #6366f1
  { r: 139, g: 92, b: 246 }, // violet #8b5cf6
] as const;

/** Node palette in dark mode — monochrome white/grey for a cleaner mesh. */
const NODE_COLORS_DARK = [
  { r: 255, g: 255, b: 255 }, // white
  { r: 226, g: 232, b: 240 }, // slate-200
  { r: 203, g: 213, b: 225 }, // slate-300
  { r: 148, g: 163, b: 184 }, // slate-400
] as const;

/** Maximum distance² between nodes for edge drawing (180px radius). */
const CONNECTION_DIST_SQ = 32400;

/** Maximum connection distance (square root of CONNECTION_DIST_SQ). */
const CONNECTION_DIST = 180;

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Oscillating pulse value 0..1 driving glow intensity. */
  pulse: number;
  /** Pulse oscillation direction. */
  pulseDir: number;
  /** Index into NODE_COLORS. */
  colorIdx: number;
}

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useUIStore((s) => s.theme);

  /** Determine if reduced motion is preferred. Safe for SSR — guarded by window check. */
  const prefersReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White/grey mesh in dark mode, coloured mesh in light mode.
    const NODE_COLORS = theme === "dark" ? NODE_COLORS_DARK : NODE_COLORS_LIGHT;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setCanvasSize();

    // Adaptive particle count: fewer on mobile for performance
    const isMobile = width < 768;
    const nodeCount = isMobile ? 40 : 85;

    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      pulse: Math.random(),
      pulseDir:
        (Math.random() > 0.5 ? 1 : -1) * (0.003 + Math.random() * 0.004),
      colorIdx: Math.floor(Math.random() * NODE_COLORS.length),
    }));

    let animationId = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Update position
        n.x += n.vx;
        n.y += n.vy;

        // Bounce off edges
        if (n.x <= 0 || n.x >= width) n.vx *= -1;
        if (n.y <= 0 || n.y >= height) n.vy *= -1;

        // Update pulse
        n.pulse += n.pulseDir;
        if (n.pulse > 1 || n.pulse < 0) n.pulseDir *= -1;

        const c = NODE_COLORS[n.colorIdx];
        const alpha = 0.15 + n.pulse * 0.35;
        const radius = 1.2 + n.pulse * 1.8;
        const glowRadius = 3 + n.pulse * 6;

        // Draw glow
        ctx.shadowBlur = glowRadius;
        ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha * 0.6})`;
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw edges to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < CONNECTION_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            const edgeAlpha = (1 - dist / CONNECTION_DIST) * 0.18;

            // Blend colors between the two connected nodes
            const c2 = NODE_COLORS[m.colorIdx];
            const mr = (c.r + c2.r) >> 1;
            const mg = (c.g + c2.g) >> 1;
            const mb = (c.b + c2.b) >> 1;

            ctx.strokeStyle = `rgba(${mr}, ${mg}, ${mb}, ${edgeAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => setCanvasSize();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [prefersReducedMotion, theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ willChange: "transform", opacity: 0.7 }}
    />
  );
}
