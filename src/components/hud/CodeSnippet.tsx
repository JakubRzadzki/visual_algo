import { useEffect, useState } from 'react';
import { globalEventBus } from '../../core/EventBus';
import { useUIStore } from '../../store/uiStore';

const ALGORITHMS: Record<string, string[]> = {
  'Quick Sort': [
    'function quickSort(low, high) {',
    '  if (low < high) {',
    '    const pi = partition(low, high);',
    '    quickSort(low, pi - 1);',
    '    quickSort(pi + 1, high);',
    '  }',
    '}'
  ],
  'Merge Sort': [
    'function mergeSort(start, end) {',
    '  if (start >= end) return;',
    '  const mid = Math.floor((start + end) / 2);',
    '  mergeSort(start, mid);',
    '  mergeSort(mid + 1, end);',
    '  merge(start, mid, end);',
    '}'
  ]
};

export default function CodeSnippet() {
  const globalAlgo = useUIStore(state => state.activeAlgorithm);
  const [algoName, setAlgoName] = useState<string>(globalAlgo);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Sync Snippet when user clicks specific algorithm in Sidebar
  useEffect(() => {
    setAlgoName(globalAlgo);
    setActiveLine(null);
  }, [globalAlgo]);

  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((e) => {
      if (e.type === 'TRACE_LOADED') {
        setAlgoName(e.metadata.algorithmName);
        setActiveLine(null);
      } else if (e.type === 'ARRAY_COMPARE' || e.type === 'ARRAY_SWAP' || e.type === 'ARRAY_SET') {
        setAlgoName(prev => {
          setActiveLine(prev === 'Quick Sort' ? 2 : 5);
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const lines = ALGORITHMS[algoName] || ['function solve(arr) {', '  const result = [];', '  return result;', '}'];

  return (
    <div className="flex-1 glass-panel p-4 flex flex-col font-mono text-xs text-slate-300 overflow-hidden">
      <h3 className="text-slate-400 font-sans text-sm mb-2 uppercase tracking-wide">Pseudocode</h3>
      <div className="space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-ice-blue/20">
        {lines.map((line, idx) => {
          const isActive = activeLine === idx;
          return (
            <div 
              key={idx} 
              className={`px-2 py-1 flex group transition-colors duration-200 ${isActive ? 'bg-ice-blue/20 text-ice-blue border-l-2 border-ice-blue' : 'border-l-2 border-transparent hover:bg-white/5'}`}
            >
              <span className={`w-6 ${isActive ? 'text-ice-blue/70' : 'text-slate-500'}`}>{idx + 1}</span>
              <span className="whitespace-pre">{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
