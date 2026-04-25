import { useEffect, useState, useRef, useCallback } from 'react';
import Editor, { type Monaco, useMonaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { globalEventBus } from '../../core/EventBus';
import { useUIStore } from '../../store/uiStore';
import { Copy, Download, Check, Save, ChevronDown } from 'lucide-react';

// ─── Vite raw imports for real algorithm source files ─────────────────────────
const modules = import.meta.glob('../../algorithms/source/*.ts', { query: '?raw', import: 'default', eager: true });

// ─── Reference implementations in C++ and Python ─────────────────────────────
const REFERENCE_CODE: Record<string, { cpp: string; python: string }> = {
  'Merge Sort': {
    cpp: `#include <vector>
using namespace std;

void merge(vector<int>& arr, int l, int m, int r) {
  int n1 = m - l + 1, n2 = r - m;
  vector<int> left(arr.begin() + l, arr.begin() + m + 1);
  vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);
  int i = 0, j = 0, k = l;
  while (i < n1 && j < n2) {
    arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];
  }
  while (i < n1) arr[k++] = left[i++];
  while (j < n2) arr[k++] = right[j++];
}

void mergeSort(vector<int>& arr, int left, int right) {
  if (left < right) {
    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }
}`,
    python: `def merge(arr, l, m, r):
    left = arr[l:m+1]
    right = arr[m+1:r+1]
    i = j = 0
    k = l
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            arr[k] = left[i]
            i += 1
        else:
            arr[k] = right[j]
            j += 1
        k += 1
    arr[k:] = left[i:] + right[j:]

def merge_sort(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        merge_sort(arr, left, mid)
        merge_sort(arr, mid + 1, right)
        merge(arr, left, mid, right)`,
  },
  'Quick Sort': {
    cpp: `#include <algorithm>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
  int pivot = arr[high];
  int i = low - 1;
  for (int j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      swap(arr[i], arr[j]);
    }
  }
  swap(arr[i + 1], arr[high]);
  return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}`,
    python: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)`,
  },
  "Dijkstra's Path": {
    cpp: `#include <queue>
#include <climits>
#include <vector>
using namespace std;

void dijkstra(int src, vector<vector<pair<int,int>>>& graph) {
  int n = graph.size();
  vector<int> dist(n, INT_MAX);
  priority_queue<pair<int,int>,
    vector<pair<int,int>>,
    greater<pair<int,int>>> pq;
  dist[src] = 0;
  pq.push({0, src});
  while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d > dist[u]) continue;
    for (auto [v, w] : graph[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push({dist[v], v});
      }
    }
  }
}`,
    python: `import heapq

def dijkstra(src, graph):
    n = len(graph)
    dist = [float("inf")] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
  },
  "Kruskal's MST": {
    cpp: `#include <algorithm>
#include <numeric>
#include <vector>
using namespace std;

struct Edge { int u, v, w; };
bool cmp(Edge a, Edge b) { return a.w < b.w; }

int find(vector<int>& parent, int x) {
  if (parent[x] != x)
    parent[x] = find(parent, parent[x]);
  return parent[x];
}

void kruskal(vector<Edge>& edges, int n) {
  sort(edges.begin(), edges.end(), cmp);
  vector<int> parent(n);
  iota(parent.begin(), parent.end(), 0);
  int mst_weight = 0;
  for (auto& e : edges) {
    int pu = find(parent, e.u);
    int pv = find(parent, e.v);
    if (pu != pv) {
      parent[pu] = pv;
      mst_weight += e.w;
    }
  }
}`,
    python: `def find(parent, x):
    if parent[x] != x:
        parent[x] = find(parent, parent[x])
    return parent[x]

def kruskal(edges, n):
    edges.sort(key=lambda x: x[2])
    parent = list(range(n))
    mst_weight = 0
    for u, v, w in edges:
        pu, pv = find(parent, u), find(parent, v)
        if pu != pv:
            parent[pu] = pv
            mst_weight += w
    return mst_weight`,
  },
};

// ─── Language config ──────────────────────────────────────────────────────────
type Language = 'typescript' | 'python' | 'cpp';

const LANGUAGE_LABELS: Record<Language, string> = {
  typescript: 'TypeScript',
  python: 'Python',
  cpp: 'C++',
};

const LANGUAGE_MONACO_IDS: Record<Language, string> = {
  typescript: 'typescript',
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
  const globalAlgo = useUIStore(state =>
    state.activeMode === 'sorting' ? state.activeSortingAlgorithm : state.activeGraphAlgorithm
  );

  const [algoName, setAlgoName] = useState<string>(globalAlgo);
  const [language, setLanguage] = useState<Language>('typescript');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monaco = useMonaco();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync algorithm name from global state and event bus
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
    if (language === 'typescript') {
      // Map algorithm name to filename
      const algoIdToFilename: Record<string, string> = {
        'Merge Sort': 'merge-sort.ts',
        'Quick Sort': 'quick-sort.ts',
        "Dijkstra's Path": 'dijkstra.ts',
        "Kruskal's MST": 'kruskal.ts',
      };
      const filename = algoIdToFilename[algoName] || 'merge-sort.ts';
      return (modules[`../../algorithms/source/${filename}`] as string) || '// Source file not found';
    }

    // C++ / Python reference code
    const langKey = language === 'cpp' ? 'cpp' : 'python';
    return REFERENCE_CODE[algoName]?.[langKey] || '// No reference code available';
  }, [language, algoName]);

  // Update editor content whenever language or algorithm changes
  useEffect(() => {
    // Check localStorage for saved edits first
    const storageKey = `monaco-editor-${algoName}-${language}`;
    const savedCode = localStorage.getItem(storageKey);
    const code = savedCode || getSourceCode();
    setEditorContent(code);
  }, [language, algoName, getSourceCode]);

  // Define theme once Monaco is ready
  useEffect(() => {
    if (monaco) {
      defineGlacierDark(monaco);
    }
  }, [monaco]);

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Register Ctrl+S / Cmd+S save shortcut
    editor.addCommand(
      // eslint-disable-next-line no-bitwise
      monaco!.KeyMod.CtrlCmd | monaco!.KeyCode.KeyS,
      () => handleSave()
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
    const ext = language === 'typescript' ? '.ts' : language === 'python' ? '.py' : '.cpp';
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
    const storageKey = `monaco-editor-${algoName}-${language}`;
    localStorage.setItem(storageKey, code);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFormat = () => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  };

  return (
    <div
      id="monaco-code-editor"
      className="flex-1 flex flex-col font-mono text-sm text-slate-300 overflow-hidden rounded-lg border border-ice-blue/10 glass-panel"
    >
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-ice-blue/10 bg-slate-950/60 backdrop-blur-sm">
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
        </div>
      </div>

      {/* ── Monaco Editor ────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden bg-[#0a0e1a]">
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
