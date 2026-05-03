import { useEffect, useState, useRef, useCallback } from 'react';
import Editor, { type Monaco, useMonaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { globalEventBus } from '../../core/EventBus';
import { globalEngine } from '../../core/AnimationEngine';
import { useUIStore } from '../../store/uiStore';
import { globalWorkerPool } from '../../core/WorkerPool';
import { executeInSandbox, buildExecutionTrace, saveSnapshot } from '../../services/sandboxApi';
import { useToast } from './Toast';
import { Copy, Download, Check, Save, ChevronDown, Play, Loader2, Share2 } from 'lucide-react';

// ─── Vite raw imports for real algorithm source files ─────────────────────────
const pyModules = import.meta.glob('../../algorithms/python/*.py', { query: '?raw', import: 'default', eager: true });
const cppModules = import.meta.glob('../../algorithms/cpp/*.cpp', { query: '?raw', import: 'default', eager: true });

// ─── Language config ──────────────────────────────────────────────────────────
type Language = 'python' | 'cpp';

const LANGUAGE_LABELS: Record<Language, string> = {
  python: 'Python',
  cpp: 'C++',
};

const LANGUAGE_MONACO_IDS: Record<Language, string> = {
  python: 'python',
  cpp: 'cpp',
};

/** Map language selector values to the backend's expected language identifiers */
const LANGUAGE_TO_BACKEND: Record<Language, string> = {
  python: 'python',
  cpp: 'cpp',
};

// ─── GlacierDark Theme ───────────────────────────────────────────────────────
function defineGlacierDark(monaco: Monaco) {
  monaco.editor.defineTheme('GlacierDark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Keywords: cyan
      { token: 'keyword', foreground: '06b6d4', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: '06b6d4', fontStyle: 'bold' },
      { token: 'storage.type', foreground: '06b6d4' },

      // Strings: emerald
      { token: 'string', foreground: '10b981' },
      { token: 'string.quoted', foreground: '10b981' },

      // Comments: muted slate
      { token: 'comment', foreground: '475569', fontStyle: 'italic' },

      // Numbers: amber
      { token: 'number', foreground: 'f59e0b' },
      { token: 'constant.numeric', foreground: 'f59e0b' },

      // Functions: sky
      { token: 'entity.name.function', foreground: '38bdf8' },
      { token: 'support.function', foreground: '38bdf8' },

      // Types: lavender
      { token: 'entity.name.type', foreground: 'c8a0f0' },
      { token: 'support.type', foreground: 'c8a0f0' },
      { token: 'type', foreground: 'c8a0f0' },

      // Variables
      { token: 'variable', foreground: 'cbd5e1' },
      { token: 'variable.parameter', foreground: 'cbd5e1' },

      // Operators
      { token: 'keyword.operator', foreground: '94a3b8' },

      // Punctuation
      { token: 'delimiter', foreground: '64748b' },
      { token: 'delimiter.bracket', foreground: '94a3b8' },

      // Default text
      { token: '', foreground: 'e2e8f0' },
    ],
    colors: {
      'editor.background': '#0a0e1a',
      'editor.foreground': '#e2e8f0',
      'editor.lineHighlightBackground': '#1e293b40',
      'editor.selectionBackground': '#7dd3fc30',
      'editor.inactiveSelectionBackground': '#7dd3fc15',
      'editorLineNumber.foreground': '#334155',
      'editorLineNumber.activeForeground': '#7dd3fc',
      'editorCursor.foreground': '#7dd3fc',
      'editor.selectionHighlightBackground': '#7dd3fc15',
      'editorIndentGuide.background': '#1e293b',
      'editorIndentGuide.activeBackground': '#334155',
      'editorBracketMatch.background': '#7dd3fc20',
      'editorBracketMatch.border': '#7dd3fc40',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#7dd3fc15',
      'scrollbarSlider.hoverBackground': '#7dd3fc25',
      'scrollbarSlider.activeBackground': '#7dd3fc35',
      'editorWidget.background': '#0f1524',
      'editorWidget.border': '#1e293b',
      'editorSuggestWidget.background': '#0f1524',
      'editorSuggestWidget.border': '#1e293b',
      'editorSuggestWidget.selectedBackground': '#1e293b',
      'minimap.background': '#0a0e1a',
    },
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MonacoCodeEditor() {
  const activeMode = useUIStore(state => state.activeMode);
  const globalAlgo = useUIStore(state => {
    if (state.activeMode === 'sorting') return state.activeSortingAlgorithm;
    if (state.activeMode === 'searching') return state.activeSearchingAlgorithm;
    if (state.activeMode === 'graph') return state.activeGraphAlgorithm;
    return state.activeSortingAlgorithm;
  });
  const setIsAnimating = useUIStore(state => state.setIsAnimating);
  const currentGraph = useUIStore(state => state.currentGraph);

  const [algoName, setAlgoName] = useState<string>(globalAlgo);
  const [language, setLanguage] = useState<Language>('python');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [useLocalRunner, setUseLocalRunner] = useState<boolean>(true);
  
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monaco = useMonaco();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Sync algorithm name from global state and event bus
  useEffect(() => {
    setAlgoName(globalAlgo);
  }, [globalAlgo]);

  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((e) => {
      if (e.type === 'TRACE_LOADED') {
        setAlgoName(e.metadata.algorithmName);
        setActiveLine(null);
      } else if (['ARRAY_COMPARE', 'ARRAY_SWAP', 'SEARCH_CHECK', 'SEARCH_FOUND', 'SEARCH_NARROW'].includes(e.type)) {
        // Bonus: Highlight the currently executing line using heuristic pattern matching
        if (!editorRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;
        const lines = model.getLinesContent();
        
        let targetPattern = '';
        if (e.type === 'ARRAY_COMPARE') targetPattern = 'if ';
        else if (e.type === 'ARRAY_SWAP') targetPattern = 'temp';
        else if (e.type === 'SEARCH_CHECK') targetPattern = '==';
        else if (e.type === 'SEARCH_FOUND') targetPattern = 'return';
        else if (e.type === 'SEARCH_NARROW') targetPattern = 'mid';
        
        if (targetPattern) {
          const idx = lines.findIndex(l => l.toLowerCase().includes(targetPattern));
          if (idx !== -1) setActiveLine(idx + 1);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Apply monaco decorations for active line highlighting
  useEffect(() => {
    if (!editorRef.current || !activeLine || !monaco) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const decorationId = editorRef.current.deltaDecorations([], [
      {
        range: new monaco.Range(activeLine, 1, activeLine, 1),
        options: {
          isWholeLine: true,
          className: 'bg-cyan-500/20 border-l-4 border-cyan-400',
        }
      }
    ]);
    
    return () => { editorRef.current?.deltaDecorations(decorationId, []); };
  }, [activeLine, monaco, editorContent]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Resolve source code based on language and algorithm
  const getSourceCode = useCallback((): string => {
    const algoIdToFilename: Record<string, string> = {
      'Merge Sort': 'merge-sort',
      'Quick Sort': 'quick-sort',
      'Bubble Sort': 'bubble-sort',
      'Heap Sort': 'heap-sort',
      'Binary Search': 'binary-search',
      'Linear Search': 'linear-search',
      "Dijkstra's Path": 'dijkstra',
      "Dijkstra's Shortest Path": 'dijkstra',
      "Kruskal's MST": 'kruskal',
      'Breadth-First Search': 'bfs',
      'Depth-First Search': 'dfs',
      "Prim's MST": 'prim',
      'Topological Sort': 'topo-sort',
    };
    const filename = algoIdToFilename[algoName] || 'merge-sort';

    if (language === 'python') {
      return (pyModules[`../../algorithms/python/${filename}.py`] as string) || '# Source file not found';
    } else if (language === 'cpp') {
      return (cppModules[`../../algorithms/cpp/${filename}.cpp`] as string) || '// Source file not found';
    }
    return '';
  }, [language, algoName]);

  // Update editor content whenever language, algorithm, or graph template changes
  useEffect(() => {
    const graphId = currentGraph ? `${currentGraph.nodes.length}-${currentGraph.edges.length}-${currentGraph.edges.map(e => e.id).join('')}` : 'default';
    const storageKey = `monaco-editor-${algoName}-${language}-${graphId}`;
    const savedCode = localStorage.getItem(storageKey);
    let code = savedCode || getSourceCode();

    if (activeMode === 'graph' && currentGraph && language === 'python') {
      const isEdgeList = /^    edges\s*=\s*\[[\s\S]*?^    \]/m.test(code);
      const isAdjList = /^    graph\s*=\s*\[[\s\S]*?^    \]/m.test(code);

      if (isEdgeList) {
        const edgeStrings = currentGraph.edges.map(e => {
          const u = e.from.replace('n','');
          const v = e.to.replace('n','');
          return `        (${u}, ${v}, "${e.id}", ${e.weight})`;
        });
        const block = `    edges = [\n${edgeStrings.join(',\n')}\n    ]`;
        code = code.replace(/^    edges\s*=\s*\[[\s\S]*?^    \]/m, block);
        code = code.replace(/^    nodes\s*=\s*\d+/m, `    nodes = ${currentGraph.nodes.length}`);
      } else if (isAdjList) {
        const numNodes = currentGraph.nodes.length;
        const adj: [number, number, string][][] = Array.from({ length: numNodes }, () => []);
        currentGraph.edges.forEach(e => {
          const u = parseInt(e.from.replace('n', ''), 10);
          const v = parseInt(e.to.replace('n', ''), 10);
          if (!isNaN(u) && !isNaN(v)) {
            adj[u].push([v, e.weight, e.id]);
          }
        });
        let block = `    graph = [\n`;
        adj.forEach(neighbors => {
          const neighborStrs = neighbors.map(n => `(${n[0]}, ${n[1]}, "${n[2]}")`);
          block += `        [${neighborStrs.join(', ')}],\n`;
        });
        block += `    ]`;
        code = code.replace(/^    graph\s*=\s*\[[\s\S]*?^    \]/m, block);
      }
    }

    setEditorContent(code);
  }, [language, algoName, getSourceCode, activeMode, currentGraph]);

  // Sync the array in the editor to the visualization canvas directly
  useEffect(() => {
    if (activeMode !== 'sorting' && activeMode !== 'searching') return;
    if (useUIStore.getState().isAnimating) return;
    
    const timeout = setTimeout(() => {
      let match = null;
      if (language === 'python') {
        const regex = /arr\s*=\s*\[([\d\s,]+)\]/;
        match = editorContent.match(regex);
      } else if (language === 'cpp') {
        const regex = /(?:std::)?vector<int>\s+arr\s*=\s*\{([\d\s,]+)\};/;
        match = editorContent.match(regex);
      }
      
      if (match && match[1]) {
        const arr = match[1].split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
        if (arr.length > 0) {
          useUIStore.getState().setVisualizationData({ values: arr });
        }
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [editorContent, language, activeMode]);


  // Define theme once Monaco is ready
  useEffect(() => {
    if (monaco) {
      defineGlacierDark(monaco);
    }
  }, [monaco]);

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
    editorRef.current = editor;

    // Register Ctrl+S / Cmd+S save shortcut
    editor.addCommand(
       
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => handleSave()
    );

    // Register Ctrl+Enter / Cmd+Enter run shortcut
    editor.addCommand(
       
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => handleRunCode()
    );
  };

  const handleCopy = async () => {
    const code = editorRef.current?.getValue() || editorContent;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const code = editorRef.current?.getValue() || editorContent;
    const ext = language === 'python' ? '.py' : '.cpp';
    const safeAlgoName = algoName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${safeAlgoName}${ext}`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    const code = editorRef.current?.getValue() || editorContent;
    const graphId = currentGraph ? `${currentGraph.nodes.length}-${currentGraph.edges.length}-${currentGraph.edges.map(e => e.id).join('')}` : 'default';
    const storageKey = `monaco-editor-${algoName}-${language}-${graphId}`;
    localStorage.setItem(storageKey, code);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFormat = () => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  };

  const handleShare = async () => {
    if (isSharing) return;
    const code = editorRef.current?.getValue() || editorContent;
    
    setIsSharing(true);
    try {
      const payload = {
        globalAlgo,
        language,
        code,
        currentGraph
      };
      const id = await saveSnapshot(payload);
      const url = `${window.location.origin}/share/${id}`;
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success', 'You can now share this visualization.');
    } catch (err) {
      showToast('Failed to share', 'error', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSharing(false);
    }
  };

  // ─── Run Code in Sandbox ──────────────────────────────────────────────────
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;

    const code = editorRef.current?.getValue() || editorContent;
    if (!code.trim()) {
      showToast('Editor is empty', 'error', 'Write some code before running.');
      return;
    }

    const algoIdMap: Record<string, string> = {
      'Merge Sort': 'merge-sort',
      'Quick Sort': 'quick-sort',
      'Bubble Sort': 'bubble-sort',
      'Heap Sort': 'heap-sort',
      'Binary Search': 'binary-search',
      'Linear Search': 'linear-search',
      "Dijkstra's Path": 'dijkstra',
      "Dijkstra's Shortest Path": 'dijkstra',
      "Kruskal's MST": 'kruskal',
      'Breadth-First Search': 'bfs',
      'Depth-First Search': 'dfs',
      "Prim's MST": 'prim',
      'Topological Sort': 'topo-sort',
    };
    const mappedAlgoId = algoIdMap[globalAlgo] || 'dijkstra';

    if (useLocalRunner) {
      setIsRunning(true);
      const startTime = performance.now();
      try {
        const trace = await globalWorkerPool.run(mappedAlgoId, currentGraph || { nodes: [], edges: [] });
        const elapsedMs = Math.round(performance.now() - startTime);

        globalEngine.loadTrace(trace);
        globalEngine.setSpeed(1.0);
        setIsAnimating(true);
        globalEngine.play();

        showToast(
          `Trace loaded via Browser — ${trace.events.length} steps`,
          'success',
          `Executed locally in ${elapsedMs}ms`,
        );
      } catch (err) {
        showToast('Local execution failed', 'error', err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsRunning(false);
      }
      return;
    }

    const backendLang = LANGUAGE_TO_BACKEND[language];
    setIsRunning(true);
    const startTime = performance.now();

    try {
      const response = await executeInSandbox(code, backendLang);
      const elapsedMs = Math.round(performance.now() - startTime);

      // Check for stderr errors from the sandbox
      if (response.error && response.error.trim().length > 0) {
        showToast(
          'Execution completed with errors',
          'error',
          response.error.trim().slice(0, 300),
        );
      }

      // Build and load trace if events were produced
      if (response.trace && response.trace.length > 0) {
        const trace = buildExecutionTrace(response, algoName, elapsedMs);
        globalEngine.loadTrace(trace);
        globalEngine.setSpeed(1.0);
        setIsAnimating(true);
        globalEngine.play();
        
        showToast(
          `Trace loaded — ${trace.events.length} steps`,
          'success',
          `Executed in ${elapsedMs}ms via Docker sandbox`,
        );
      } else if (!response.error || response.error.trim().length === 0) {
        // No trace events and no error — the script ran but produced no events
        showToast(
          'No trace events produced',
          'info',
          response.output
            ? `Output: ${response.output.trim().slice(0, 200)}`
            : 'Your code ran successfully but did not emit any trace JSON events.',
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast('Sandbox execution failed', 'error', message);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, editorContent, language, algoName, showToast, setIsAnimating, useLocalRunner, globalAlgo, currentGraph]);

  return (
    <div
      id="monaco-code-editor"
      className={`flex-1 flex flex-col font-mono text-sm text-slate-300 rounded-lg border glass-panel transition-all duration-300 ${
        isRunning
          ? 'border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
          : 'border-ice-blue/10'
      }`}
    >
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="relative z-[100] flex justify-between items-center px-4 py-3 border-b border-ice-blue/10 bg-slate-950/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* IDE icon + title */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
            <h3 className="text-slate-300 font-sans text-sm uppercase tracking-wider font-bold">
              Source Code
            </h3>
          </div>
          <span className="text-slate-600 text-xs">·</span>
          <span className="text-slate-500 text-xs">{algoName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Local / Docker Switch */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 cursor-pointer hover:border-cyan-400/30 transition text-xs select-none">
            <input
              type="checkbox"
              checked={useLocalRunner}
              onChange={(e) => setUseLocalRunner(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0 cursor-pointer"
            />
            <span className="text-slate-300 font-medium">Browser</span>
          </label>

          {/* ▶ Run Code Button */}
          <button
            id="run-code-btn"
            onClick={handleRunCode}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              isRunning
                ? 'bg-cyan-500/10 text-cyan-300/60 border border-cyan-500/20 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30 hover:from-cyan-500/30 hover:to-emerald-500/30 hover:text-cyan-200 hover:border-cyan-400/40 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] active:scale-[0.97]'
            }`}
            title="Run code (Ctrl+Enter)"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" style={{ fill: 'currentColor' }} />
                Run
              </>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-700/50 mx-1" />

          {/* Language Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="language-selector"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:border-ice-blue/30 hover:text-ice-blue transition-all duration-200"
            >
              {LANGUAGE_LABELS[language]}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1 py-1 w-36 rounded-lg bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/40 z-50">
                {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    id={`lang-option-${lang}`}
                    onClick={() => {
                      setLanguage(lang);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-all duration-150 ${
                      language === lang
                        ? 'text-ice-blue bg-ice-blue/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-700/50 mx-1" />

          {/* Format button */}
          <button
            id="format-code-btn"
            onClick={handleFormat}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-ice-blue hover:bg-white/5 transition-all duration-200"
            title="Format Code"
          >
            Format
          </button>

          {/* Save button */}
          <button
            id="save-code-btn"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/5 transition-all duration-200"
            title="Save to localStorage (Ctrl+S)"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved' : 'Save'}
          </button>

          {/* Reset button */}
          <button
            id="reset-code-btn"
            onClick={() => {
              if (confirm('Are you sure you want to reset the code to the default template? This will erase your changes.')) {
                const storageKey = `monaco-editor-${algoName}-${language}`;
                localStorage.removeItem(storageKey);
                setEditorContent(getSourceCode());
                showToast('Code reset', 'info', 'Restored default algorithm template.');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200"
            title="Reset to default template"
          >
            Reset
          </button>

          {/* Copy button */}
          <button
            id="copy-code-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-ice-blue hover:bg-white/5 transition-all duration-200"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Download button */}
          <button
            id="download-code-btn"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-ice-blue hover:bg-white/5 transition-all duration-200"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Share button */}
          <button
            id="share-code-btn"
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-purple-400 hover:bg-purple-400/5 transition-all duration-200"
            title="Share visualization"
          >
            {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
            Share
          </button>
        </div>
      </div>

      {/* ── Monaco Editor ────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden rounded-b-lg bg-[#0a0e1a] relative z-0">
        {/* Running overlay pulse */}
        {isRunning && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-0 bg-cyan-400/[0.03] animate-pulse" />
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 text-xs text-cyan-300 z-20">
              <Loader2 className="w-3 h-3 animate-spin" />
              Executing in sandbox…
            </div>
          </div>
        )}
        <Editor
          height="100%"
          language={LANGUAGE_MONACO_IDS[language]}
          value={editorContent}
          theme="GlacierDark"
          onChange={(value) => setEditorContent(value || '')}
          onMount={handleEditorMount}
          loading={
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-ice-blue/30 border-t-ice-blue rounded-full animate-spin" />
                Loading editor...
              </div>
            </div>
          }
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            fontLigatures: true,
            lineHeight: 22,
            letterSpacing: 0.3,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              useShadows: false,
            },
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'line',
            renderLineHighlightOnlyWhenFocus: false,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            tabSize: 2,
            wordWrap: 'off',
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            contextmenu: true,
            suggest: {
              showIcons: true,
              showStatusBar: true,
            },
            readOnly: false,
          }}
        />
      </div>
    </div>
  );
}
