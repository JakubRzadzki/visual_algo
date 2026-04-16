import React from 'react';

export default function Sidebar() {
  return (
    <div className="w-64 glass-panel flex flex-col gap-4 p-4">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Algorithms</h2>
      <ul className="space-y-2">
        <li className="px-3 py-2 bg-ice-blue/10 border border-ice-blue/30 rounded-lg text-ice-blue cursor-pointer">Merge Sort</li>
        <li className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition text-slate-300">Quick Sort</li>
        <li className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition text-slate-300">Dijkstra's Path</li>
      </ul>
    </div>
  );
}
