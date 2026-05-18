import { useRef, useEffect } from "react";

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

export default function AmbientGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        ctx.fillStyle = `rgba(125, 211, 252, ${bit.opacity})`;
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
        ctx.fillStyle = `rgba(125, 211, 252, ${0.2 + p1.pulse * 0.3})`;
        ctx.shadowBlur = glow;
        ctx.shadowColor = "#7dd3fc";
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
            const opacity = (1 - dist / 200) * 0.3;
            ctx.strokeStyle = `rgba(125, 211, 252, ${opacity})`;
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none opacity-60 mix-blend-screen"
      style={{ willChange: "transform" }}
    />
  );
}
