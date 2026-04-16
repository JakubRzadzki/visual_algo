import React from 'react';

export default function CodeSnippet() {
  return (
    <div className="flex-1 glass-panel p-4 flex flex-col font-mono text-xs text-slate-300 overflow-hidden">
      <h3 className="text-slate-400 font-sans text-sm mb-2 uppercase tracking-wide">Pseudocode</h3>
      <div className="space-y-1 overflow-y-auto">
        <div className="px-2 py-1 flex group"><span className="text-slate-500 w-6">1</span><span>function solve(arr) &#123;</span></div>
        <div className="px-2 py-1 flex bg-ice-blue/20 text-ice-blue border-l-2 border-ice-blue"><span className="text-slate-500 w-6">2</span><span>  const result = [];</span></div>
        <div className="px-2 py-1 flex group"><span className="text-slate-500 w-6">3</span><span>  return result;</span></div>
        <div className="px-2 py-1 flex group"><span className="text-slate-500 w-6">4</span><span>&#125;</span></div>
      </div>
    </div>
  );
}
