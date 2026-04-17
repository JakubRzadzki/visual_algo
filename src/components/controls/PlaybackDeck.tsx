

export default function PlaybackDeck() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-panel-elevated px-8 py-4 flex items-center gap-6 z-50">
      <button className="text-slate-300 hover:text-white transition">⏮</button>
      <button className="w-12 h-12 rounded-full bg-ice-blue/20 border border-ice-blue text-ice-blue flex items-center justify-center luminous-border hover:bg-ice-blue/30 transition">▶</button>
      <button className="text-slate-300 hover:text-white transition">⏭</button>
      
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 bottom-0 bg-ice-blue w-0"></div>
      </div>
    </div>
  );
}
