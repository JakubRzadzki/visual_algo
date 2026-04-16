import React, { useRef, useEffect } from 'react';

interface Point { x: number; y: number; vx: number; vy: number; }

export default function AmbientGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const points: Point[] = Array.from({ length: 65 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7
    }));

    let animationId: number;

    const draw = () => {
      // Clear with radial overlay color matching Glacier design
      ctx.clearRect(0, 0, width, height);

      // We add subtle glowing physics 
      ctx.fillStyle = '#7dd3fc';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce mechanics globally
        if (p1.x <= 0 || p1.x >= width) p1.vx *= -1;
        if (p1.y <= 0 || p1.y >= height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 1.2, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          
          if (dist < 140) {
            // Fading opacity based on distance from intersection limit
            const opacity = (1 - dist / 140) * 0.4;
            ctx.strokeStyle = `rgba(125, 211, 252, ${opacity})`;
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
    
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // z-index 0, fixed to entirely cover the background independently
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-50" />;
}
