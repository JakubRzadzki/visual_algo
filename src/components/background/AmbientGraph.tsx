/**
 * @file AmbientGraph.tsx
 * @description Floating particle mesh background — adapts colors based on theme.
 *
 * Reads --star-color CSS variable for particle/line color so both dark and
 * light modes look polished without hardcoded RGBA values.
 */

import { useRef, useEffect } from "react";
import { useUIStore } from "../../store/uiStore";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulse: number;
  pulseDir: number;
}

interface Bit {
  x: number;
  y: number;
  val: string;
  speed: number;
  opacity: number;
}

/**
 * Reads the --star-color CSS variable from the root element.
 * Falls back to a sensible default if not set.
 */
function getStarColor(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue("--star-color")
    .trim() || "rgba(255, 255, 255, 0.6)";
}

export default function AmbientGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const points: Point[] = Array.from({ length: 100 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      pulse: Math.random(),
      pulseDir: Math.random() > 0.5 ? 0.005 : -0.005,
    }));

    const bits: Bit[] = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      val: Math.random() > 0.5 ? "1" : "0",
      speed: 0.3 + Math.random() * 1.5,
      opacity: Math.random() * 0.5,
    }));

    let animationId: number;

    /** Parse the star-color into r,g,b for alpha manipulation */
    const starColorRaw = getStarColor();
    // Extract rgba values — support both rgba() and plain color formats
    const rgbaMatch = starColorRaw.match(/[\d.]+/g);
    const sr = rgbaMatch ? parseFloat(rgbaMatch[0]) : 125;
    const sg = rgbaMatch ? parseFloat(rgbaMatch[1]) : 211;
    const sb = rgbaMatch ? parseFloat(rgbaMatch[2]) : 252;
    const baseAlpha = rgbaMatch && rgbaMatch[3] ? parseFloat(rgbaMatch[3]) : 0.6;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Binary Streams (Matrix-like but very subtle)
      ctx.font = "10px monospace";
      bits.forEach((bit) => {
        bit.y += bit.speed;
        if (bit.y > height) {
          bit.y = -20;
          bit.x = Math.random() * width;
        }
        ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${bit.opacity * baseAlpha})`;
        ctx.fillText(bit.val, bit.x, bit.y);
      });

      // 2. Draw Neural Connections
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        p1.x += p1.vx;
        p1.y += p1.vy;
        p1.pulse += p1.pulseDir;
        if (p1.pulse > 1 || p1.pulse < 0) p1.pulseDir *= -1;

        if (p1.x <= 0 || p1.x >= width) p1.vx *= -1;
        if (p1.y <= 0 || p1.y >= height) p1.vy *= -1;

        // Draw Pulsing Node
        const size = 1 + p1.pulse * 1.5;
        const glow = p1.pulse * 5;
        ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${(0.2 + p1.pulse * 0.3) * baseAlpha})`;
        ctx.shadowBlur = glow;
        ctx.shadowColor = `rgba(${sr}, ${sg}, ${sb}, ${baseAlpha})`;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 40000) {
            // 200 squared
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / 200) * 0.3 * baseAlpha;
            ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]); // Re-init canvas when theme changes to pick up new star-color

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-[1] pointer-events-none transition-opacity duration-500 ${theme === "dark" ? "opacity-60" : "opacity-40"}`}
      style={{ willChange: "transform", mixBlendMode: theme === "dark" ? "screen" : "multiply" }}
    />
  );
}
