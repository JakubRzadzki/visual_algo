/**
 * @file BackgroundGrid.tsx
 * @description Cyber grid layer providing technological depth to the background.
 *
 * Renders three visual layers:
 * 1. A subtle repeating SVG grid pattern (64px cells, ultra-low opacity).
 * 2. Radial gradient glows (cyan top-center, violet right, blue bottom) for depth.
 * 3. A vignette overlay darkening the viewport edges.
 *
 * All layers are fixed, pointer-events-none, and aria-hidden.
 */

export default function BackgroundGrid() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* === Grid Pattern === */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cyber-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="rgba(125, 211, 252, 0.04)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyber-grid)" />
      </svg>

      {/* === Radial Glow: Cyan — behind header area === */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[600px] md:w-[1200px] md:h-[800px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.06) 0%, transparent 70%)',
        }}
      />

      {/* === Radial Glow: Violet — right side === */}
      <div
        className="absolute top-1/3 right-0 translate-x-1/4 w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.05) 0%, transparent 70%)',
        }}
      />

      {/* === Radial Glow: Blue — bottom === */}
      <div
        className="absolute bottom-0 left-1/3 translate-y-1/4 w-[700px] h-[500px] md:w-[1000px] md:h-[700px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%)',
        }}
      />

      {/* === Vignette Overlay === */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(2,6,23,0.6) 100%)',
        }}
      />
    </div>
  );
}
