import { useState, useMemo } from 'react';
import { Copy, Download, Check, FileCode } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { findAlgorithmById } from '../../data/algorithmCatalog';

// ─── Vite Raw Imports ──────────────────────────────────────────────────────────
// Load all .ts files from the algorithms/source directory as raw strings at
// build time. No network requests are made at runtime.
const sourceModules = import.meta.glob(
  '../../algorithms/source/*.ts',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

// Build a clean lookup: "merge-sort" → raw source string
const sourceMap: Record<string, string> = {};
for (const [path, raw] of Object.entries(sourceModules)) {
  // path looks like "../../algorithms/source/merge-sort.ts"
  const fileName = path.split('/').pop()?.replace('.ts', '') ?? '';
  sourceMap[fileName] = raw;
}

interface SourceCodeViewerProps {
  algorithmId: string;
}

export default function SourceCodeViewer({ algorithmId }: SourceCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const source = sourceMap[algorithmId] ?? '';
  const algoInfo = useMemo(() => findAlgorithmById(algorithmId), [algorithmId]);
  const displayName = algoInfo?.algo.name ?? algorithmId;

  const handleCopy = async () => {
    if (!source) return;
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = source;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!source) return;
    const blob = new Blob([source], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${algorithmId}.ts`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Custom style overrides to match glacier theme
  const customStyle: Record<string, React.CSSProperties> = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...(vscDarkPlus['pre[class*="language-"]'] as React.CSSProperties),
      background: 'transparent',
      margin: 0,
      padding: '1.25rem',
      fontSize: '0.8125rem',
      lineHeight: '1.7',
    },
    'code[class*="language-"]': {
      ...(vscDarkPlus['code[class*="language-"]'] as React.CSSProperties),
      background: 'transparent',
    },
  };

  if (!source) {
    return (
      <div className="flex-1 glass-panel flex flex-col items-center justify-center gap-3 p-8">
        <FileCode className="w-10 h-10 text-slate-600" />
        <p className="text-slate-500 text-sm text-center">
          Source code not available for <span className="text-slate-300 font-semibold">{displayName}</span>
        </p>
        <p className="text-slate-600 text-xs">This algorithm hasn't been implemented yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 glass-panel p-0 flex flex-col font-mono text-sm text-slate-300 overflow-hidden rounded-lg border border-ice-blue/10">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3.5 border-b border-ice-blue/10 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <FileCode className="w-4 h-4 text-ice-blue" />
          <h3 className="text-slate-300 font-sans text-sm uppercase tracking-wider font-bold">
            Source Code
          </h3>
          <span className="text-slate-500 text-xs font-sans">{displayName}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Download .ts
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-y-auto bg-slate-950/80 scrollbar-hide">
        <SyntaxHighlighter
          language="typescript"
          style={customStyle}
          showLineNumbers
          lineNumberStyle={{
            color: 'rgb(71, 85, 105)',
            fontSize: '0.75rem',
            minWidth: '2.5rem',
            paddingRight: '1rem',
            userSelect: 'none',
          }}
          wrapLines
          customStyle={{
            background: 'transparent',
            margin: 0,
          }}
        >
          {source}
        </SyntaxHighlighter>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-ice-blue/10 bg-slate-950/50 text-xs text-slate-500 flex justify-between font-sans">
        <span>{source.split('\n').length} lines</span>
        {algoInfo && (
          <span>
            Time: {algoInfo.algo.timeComplexity} | Space: {algoInfo.algo.spaceComplexity}
          </span>
        )}
      </div>
    </div>
  );
}
