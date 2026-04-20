import { useEffect, useState, useRef } from 'react';
import { globalEventBus } from '../../core/EventBus';
import type { VisualizationEvent } from '../../types';

interface LogEntry {
  id: string;
  message: React.ReactNode;
}

export default function EventLog() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'init', message: <span className="text-green-400">[SYS] Engine initialized.</span> },
    { id: 'wait', message: <span className="text-slate-500">[ACT] Waiting for trace payload...</span> }
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const formatEvent = (e: VisualizationEvent): React.ReactNode | null => {
      switch (e.type) {
        case 'SYSTEM_LOG':
          const color = e.level === 'ERROR' ? 'text-red-400' : e.level === 'WARN' ? 'text-yellow-400' : 'text-green-400';
          return <span className={color}>[SYS] {e.message}</span>;
        case 'ARRAY_COMPARE':
          return <span className="text-slate-400">[ACT] Compared elements at index {e.indices[0]} and {e.indices[1]}</span>;
        case 'ARRAY_SWAP':
          return <span className="text-ice-blue">[ACT] Swapped values {e.values[0]} and {e.values[1]}</span>;
        case 'ARRAY_SET':
          return <span className="text-purple-400">[ACT] Set index {e.index} to {e.value}</span>;
        case 'TRACE_LOADED':
          return <span className="text-teal-400">[SYS] Data for {e.metadata.algorithmName} loaded.</span>;
        case 'GRAPH_NODE_HIGHLIGHT':
          return <span className="text-emerald-400">[GRAPH] Visiting node {e.nodeId}</span>;
        case 'GRAPH_EDGE_HIGHLIGHT':
          return <span className="text-amber-400">[GRAPH] Exploring edge {e.edgeId}</span>;
        default:
          return null;
      }
    };

    const unsubscribe = globalEventBus.subscribe((e) => {
      if (e.isReverse) return;
      const msg = formatEvent(e);
      if (msg) {
        setLogs(prev => {
          const newLogs = [...prev, { id: e.id || crypto.randomUUID(), message: msg }];
          return newLogs.length > 30 ? newLogs.slice(newLogs.length - 30) : newLogs;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-48 glass-panel p-4 flex flex-col text-xs font-mono">
      <h3 className="text-slate-400 font-sans text-sm mb-2 uppercase tracking-wide">Terminal</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-ice-blue/20">
        {logs.map((log) => (
          <div key={log.id}>{log.message}</div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
