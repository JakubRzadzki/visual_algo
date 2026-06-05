/**
 * @file AmbientGraph.tsx
 * @description Floating particle mesh background — adapts colors based on theme.
 *
 * Reads --star-color CSS variable for particle/line color so both dark and
 * light modes look polished without hardcoded RGBA values.
 *
 * Interactive: particles are gently attracted to the cursor and link to it with
 * connection lines, while clicks push nearby particles outward in a burst.
 * Pointer events are captured on `window` because the canvas itself is
 * `pointer-events-none` (so it never blocks the UI underneath).
 */

import { useRef, useEffect } from "react";
import { useUIStore } from "../../store/uiStore";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Resting drift velocity the particle eases back toward between interactions. */
  bvx: number;
  bvy: number;
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

// Interaction tuning constants
const MOUSE_RADIUS = 190; // px — cursor influence/connection range
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
const CLICK_RADIUS = 220; // px — shockwave impulse range
const MAX_SPEED = 3.2; // px/frame — velocity clamp so impulses stay tasteful

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

    const points: Point[] = Array.from({ length: 100 }).map(() => {
      const vx = (Math.random() - 0.5) * 0.4;
      const vy = (Math.random() - 0.5) * 0.4;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        bvx: vx,
        bvy: vy,
        pulse: Math.random(),
        pulseDir: Math.random() > 0.5 ? 0.005 : -0.005,
      };
    });

    const bits: Bit[] = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      val: Math.random() > 0.5 ? "1" : "0",
      speed: 0.3 + Math.random() * 1.5,
      opacity: Math.random() * 0.5,
    }));

    // ── Interactive pointer state ──────────────────────────────────────────
    const mouse = { x: -9999, y: -9999, active: false };

    const handlePointerMove = (clientX: number, clientY: number) => {
      mouse.x = clientX;
      mouse.y = clientY;
      mouse.active = true;
    };

    const handlePointerDown = (clientX: number, clientY: number) => {
      // Kick nearby particles outward for a satisfying burst.
      for (const p of points) {
        const dx = p.x - clientX;
        const dy = p.y - clientY;
        const d = Math.hypot(dx, dy);
        if (d < CLICK_RADIUS && d > 0.01) {
          const force = (1 - d / CLICK_RADIUS) * 5.5;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseDown = (e: MouseEvent) => handlePointerDown(e.clientX, e.clientY);
    const onMouseLeave = () => {
      mouse.active = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handlePointerMove(t.clientX, t.clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        handlePointerMove(t.clientX, t.clientY);
        handlePointerDown(t.clientX, t.clientY);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    let animationId: number;

    /** Parse the star-color into r,g,b for alpha manipulation */
    const starColorRaw = getStarColor();
    // Extract rgba values — support both rgba() and plain color formats
    const rgbaMatch = starColorRaw.match(/[\d.]+/g);
    const sr = rgbaMatch ? parseFloat(rgbaMatch[0]) : 125;
    const sg = rgbaMatch ? parseFloat(rgbaMatch[1]) : 211;
    const sb = rgbaMatch ? parseFloat(rgbaMatch[2]) : 252;
    const baseAlpha = rgbaMatch && rgbaMatch[3] ? parseFloat(rgbaMatch[3]) : 0.6;
    const rgba = (a: number) => `rgba(${sr}, ${sg}, ${sb}, ${a})`;

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
        ctx.fillStyle = rgba(bit.opacity * baseAlpha);
        ctx.fillText(bit.val, bit.x, bit.y);
      });

      // 2. Draw Neural Connections
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];

        // Ease velocity back toward its resting drift so the field self-calms.
        p1.vx += (p1.bvx - p1.vx) * 0.02;
        p1.vy += (p1.bvy - p1.vy) * 0.02;

        // Cursor attraction + connection line.
        if (mouse.active) {
          const mdx = mouse.x - p1.x;
          const mdy = mouse.y - p1.y;
          const md2 = mdx * mdx + mdy * mdy;
          if (md2 < MOUSE_RADIUS_SQ && md2 > 1) {
            const md = Math.sqrt(md2);
            const pull = (1 - md / MOUSE_RADIUS) * 0.45;
            p1.vx += (mdx / md) * pull;
            p1.vy += (mdy / md) * pull;

            const lineAlpha = (1 - md / MOUSE_RADIUS) * 0.5 * baseAlpha;
            ctx.strokeStyle = rgba(lineAlpha);
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // Clamp speed so click impulses stay graceful.
        const sp = Math.hypot(p1.vx, p1.vy);
        if (sp > MAX_SPEED) {
          p1.vx = (p1.vx / sp) * MAX_SPEED;
          p1.vy = (p1.vy / sp) * MAX_SPEED;
        }

        p1.x += p1.vx;
        p1.y += p1.vy;
        p1.pulse += p1.pulseDir;
        if (p1.pulse > 1 || p1.pulse < 0) p1.pulseDir *= -1;

        if (p1.x <= 0 || p1.x >= width) p1.vx *= -1;
        if (p1.y <= 0 || p1.y >= height) p1.vy *= -1;
        // Keep particles on-screen after strong impulses.
        p1.x = Math.max(0, Math.min(width, p1.x));
        p1.y = Math.max(0, Math.min(height, p1.y));

        // Draw Pulsing Node
        const size = 1 + p1.pulse * 1.5;
        const glow = p1.pulse * 5;
        ctx.fillStyle = rgba((0.2 + p1.pulse * 0.3) * baseAlpha);
        ctx.shadowBlur = glow;
        ctx.shadowColor = rgba(baseAlpha);
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
            ctx.strokeStyle = rgba(opacity);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 3. Soft glow at the cursor itself for tactile feedback
      if (mouse.active) {
        ctx.fillStyle = rgba(0.5 * baseAlpha);
        ctx.shadowBlur = 12;
        ctx.shadowColor = rgba(baseAlpha);
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
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
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, [theme]); // Re-init canvas when theme changes to pick up new star-color

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-[2] pointer-events-none transition-opacity duration-500 ${theme === "dark" ? "opacity-90" : "opacity-50"}`}
      style={{
        willChange: "transform",
        // `multiply` darkens light backgrounds (light mode); in dark mode we use
        // plain compositing so the bright particles/lines stay clearly visible
        // (the previous `screen` blend washed them out almost entirely).
        mixBlendMode: theme === "light" ? "multiply" : "normal",
      }}
    />
  );
}
