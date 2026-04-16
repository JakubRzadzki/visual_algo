import React from 'react';

export default function EventLog() {
  return (
    <div className="h-48 glass-panel p-4 flex flex-col text-xs font-mono">
      <h3 className="text-slate-400 font-sans text-sm mb-2 uppercase tracking-wide">Terminal</h3>
      <div className="flex-1 overflow-y-auto space-y-2">
        <div className="text-green-400">[SYS] Engine initialized.</div>
        <div className="text-slate-300">[ACT] Waiting for trace payload...</div>
      </div>
    </div>
  );
}
