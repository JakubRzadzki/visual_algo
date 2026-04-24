import { useEffect, useState } from 'react';
import { globalEventBus } from '../../core/EventBus';
import { useUIStore } from '../../store/uiStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, Check } from 'lucide-react';

// Use Vite's raw imports to load the real .ts files at build time
const modules = import.meta.glob('../../algorithms/source/*.ts', { query: '?raw', import: 'default', eager: true });

export default function SourceCodeViewer() {
  const globalAlgo = useUIStore(state => state.activeMode === 'sorting' ? state.activeSortingAlgorithm : state.activeGraphAlgorithm);
  const [algoName, setAlgoName] = useState<string>(globalAlgo);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAlgoName(globalAlgo);
  }, [globalAlgo]);

  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((e) => {
      if (e.type === 'TRACE_LOADED') {
        setAlgoName(e.metadata.algorithmName);
      }
    });
    return () => unsubscribe();
  }, []);

  // Map algorithm name to filename
  const algoIdToFilename: Record<string, string> = {
    'Merge Sort': 'merge-sort.ts',
    'Quick Sort': 'quick-sort.ts',
    "Dijkstra's Path": 'dijkstra.ts',
    "Kruskal's MST": 'kruskal.ts',
  };

  const filename = algoIdToFilename[algoName] || 'merge-sort.ts';
  const rawCode = (modules[`../../algorithms/source/${filename}`] as string) || '// Code not found';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([rawCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 glass-panel p-0 flex flex-col font-mono text-sm text-slate-300 overflow-hidden rounded-lg border border-ice-blue/10">
      {/* Header with Download & Copy Buttons */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-ice-blue/10 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <h3 className="text-slate-300 font-sans text-sm uppercase tracking-wider font-bold">
            💻 Source Code
          </h3>
          <div className="text-slate-500 text-sm">{filename}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold text-slate-400 hover:text-ice-blue hover:bg-white/5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold text-slate-400 hover:text-ice-blue hover:bg-white/5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Code Display with Syntax Highlighting */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-ice-blue/20 scrollbar-track-transparent bg-slate-950/80 p-0 m-0">
        <SyntaxHighlighter
          language="typescript"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.85rem',
            lineHeight: '1.5',
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: '#475569',
            textAlign: 'right',
          }}
        >
          {rawCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
