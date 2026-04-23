import { useEffect, useState } from 'react';
import { globalEventBus } from '../../core/EventBus';
import { useUIStore } from '../../store/uiStore';

// Real implementation code in C++ and Python for each algorithm
const ALGORITHMS: Record<string, { cpp: string[]; python: string[] }> = {
  'Quick Sort': {
    cpp: [
      '#include <algorithm>',
      'void quickSort(vector<int>& arr, int low, int high) {',
      '  if (low < high) {',
      '    int pi = partition(arr, low, high);',
      '    quickSort(arr, low, pi - 1);',
      '    quickSort(arr, pi + 1, high);',
      '  }',
      '}',
      'int partition(vector<int>& arr, int low, int high) {',
      '  int pivot = arr[high];',
      '  int i = low - 1;',
      '  for (int j = low; j < high; j++) {',
      '    if (arr[j] < pivot) {',
      '      i++;',
      '      swap(arr[i], arr[j]);',
      '    }',
      '  }',
      '  swap(arr[i + 1], arr[high]);',
      '  return i + 1;',
      '}'
    ],
    python: [
      'def quick_sort(arr, low, high):',
      '    if low < high:',
      '        pi = partition(arr, low, high)',
      '        quick_sort(arr, low, pi - 1)',
      '        quick_sort(arr, pi + 1, high)',
      '',
      'def partition(arr, low, high):',
      '    pivot = arr[high]',
      '    i = low - 1',
      '    for j in range(low, high):',
      '        if arr[j] < pivot:',
      '            i += 1',
      '            arr[i], arr[j] = arr[j], arr[i]',
      '    arr[i + 1], arr[high] = arr[high], arr[i + 1]',
      '    return i + 1'
    ]
  },
  'Merge Sort': {
    cpp: [
      'void mergeSort(vector<int>& arr, int left, int right) {',
      '  if (left < right) {',
      '    int mid = left + (right - left) / 2;',
      '    mergeSort(arr, left, mid);',
      '    mergeSort(arr, mid + 1, right);',
      '    merge(arr, left, mid, right);',
      '  }',
      '}',
      'void merge(vector<int>& arr, int l, int m, int r) {',
      '  int n1 = m - l + 1, n2 = r - m;',
      '  vector<int> left(arr.begin() + l, arr.begin() + m + 1);',
      '  vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);',
      '  int i = 0, j = 0, k = l;',
      '  while (i < n1 && j < n2) {',
      '    arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];',
      '  }',
      '  while (i < n1) arr[k++] = left[i++];',
      '  while (j < n2) arr[k++] = right[j++];',
      '}'
    ],
    python: [
      'def merge_sort(arr, left, right):',
      '    if left < right:',
      '        mid = (left + right) // 2',
      '        merge_sort(arr, left, mid)',
      '        merge_sort(arr, mid + 1, right)',
      '        merge(arr, left, mid, right)',
      '',
      'def merge(arr, l, m, r):',
      '    left = arr[l:m+1]',
      '    right = arr[m+1:r+1]',
      '    i = j = 0',
      '    k = l',
      '    while i < len(left) and j < len(right):',
      '        if left[i] <= right[j]:',
      '            arr[k] = left[i]',
      '            i += 1',
      '        else:',
      '            arr[k] = right[j]',
      '            j += 1',
      '        k += 1',
      '    arr[k:] = left[i:] + right[j:]'
    ]
  },
  'Dijkstra\'s Path': {
    cpp: [
      '#include <queue>',
      '#include <limits.h>',
      'void dijkstra(int src, vector<vector<pair<int,int>>>& graph) {',
      '  int n = graph.size();',
      '  vector<int> dist(n, INT_MAX);',
      '  priority_queue<pair<int,int>,',
      '    vector<pair<int,int>>,',
      '    greater<pair<int,int>>> pq;',
      '  dist[src] = 0;',
      '  pq.push({0, src});',
      '  while (!pq.empty()) {',
      '    auto [d, u] = pq.top();',
      '    pq.pop();',
      '    if (d > dist[u]) continue;',
      '    for (auto [v, w] : graph[u]) {',
      '      if (dist[u] + w < dist[v]) {',
      '        dist[v] = dist[u] + w;',
      '        pq.push({dist[v], v});',
      '      }',
      '    }',
      '  }',
      '}'
    ],
    python: [
      'import heapq',
      'def dijkstra(src, graph):',
      '    n = len(graph)',
      '    dist = [float("inf")] * n',
      '    dist[src] = 0',
      '    pq = [(0, src)]',
      '    while pq:',
      '        d, u = heapq.heappop(pq)',
      '        if d > dist[u]:',
      '            continue',
      '        for v, w in graph[u]:',
      '            if dist[u] + w < dist[v]:',
      '                dist[v] = dist[u] + w',
      '                heapq.heappush(pq, (dist[v], v))',
      '    return dist'
    ]
  },
  'Kruskal\'s MST': {
    cpp: [
      'struct Edge { int u, v, w; };',
      'bool cmp(Edge a, Edge b) { return a.w < b.w; }',
      'int find(vector<int>& parent, int x) {',
      '  if (parent[x] != x)',
      '    parent[x] = find(parent, parent[x]);',
      '  return parent[x];',
      '}',
      'void kruskal(vector<Edge>& edges, int n) {',
      '  sort(edges.begin(), edges.end(), cmp);',
      '  vector<int> parent(n);',
      '  iota(parent.begin(), parent.end(), 0);',
      '  int mst_weight = 0;',
      '  for (auto& e : edges) {',
      '    int pu = find(parent, e.u);',
      '    int pv = find(parent, e.v);',
      '    if (pu != pv) {',
      '      parent[pu] = pv;',
      '      mst_weight += e.w;',
      '    }',
      '  }',
      '}'
    ],
    python: [
      'def find(parent, x):',
      '    if parent[x] != x:',
      '        parent[x] = find(parent, parent[x])',
      '    return parent[x]',
      '',
      'def kruskal(edges, n):',
      '    edges.sort(key=lambda x: x[2])',
      '    parent = list(range(n))',
      '    mst_weight = 0',
      '    for u, v, w in edges:',
      '        pu, pv = find(parent, u), find(parent, v)',
      '        if pu != pv:',
      '            parent[pu] = pv',
      '            mst_weight += w',
      '    return mst_weight'
    ]
  }
};

// Syntax highlighting for C++ and Python
const syntaxColors = {
  cpp: {
    keywords: ['void', 'int', 'if', 'for', 'while', 'return', 'struct', 'bool', 'auto', 'include', 'vector', 'sort', 'swap', 'push', 'pop', 'continue', 'iota'],
    functions: ['partition', 'quickSort', 'mergeSort', 'merge', 'dijkstra', 'find', 'cmp', 'kruskal', 'heappop', 'heappush']
  },
  python: {
    keywords: ['def', 'if', 'for', 'while', 'return', 'import', 'in', 'range', 'lambda', 'continue', 'else'],
    functions: ['partition', 'quick_sort', 'merge_sort', 'merge', 'dijkstra', 'find', 'kruskal', 'heappop', 'heappush', 'sort', 'len']
  }
};

// Color constants for syntax highlighting
const COLORS = {
  keyword: '#38bdf8',     // sky-400
  function: '#34d399',    // emerald-400
  number: '#fb923c',      // orange-400
  string: '#fcd34d',      // yellow-300
  comment: '#64748b'      // slate-500
};

// Tokenize and render code with proper React elements instead of dangerouslySetInnerHTML
function tokenizeLine(line: string, lang: 'cpp' | 'python'): React.ReactNode[] {
  const colors = syntaxColors[lang];
  let result: React.ReactNode[] = [];
  let remaining = line;
  let tokenId = 0;

  while (remaining.length > 0) {
    let matched = false;

    // Check for comments first (highest priority)
    const commentMatch = remaining.match(/^(\/\/.*|#.*)/);
    if (commentMatch) {
      result.push(
        <span key={`comment-${tokenId++}`} style={{ color: COLORS.comment, fontStyle: 'italic' }}>
          {commentMatch[1]}
        </span>
      );
      remaining = remaining.slice(commentMatch[1].length);
      matched = true;
    }

    // Check for strings
    if (!matched) {
      const stringMatch = remaining.match(/^"[^"]*"/);
      if (stringMatch) {
        result.push(
          <span key={`string-${tokenId++}`} style={{ color: COLORS.string }}>
            {stringMatch[0]}
          </span>
        );
        remaining = remaining.slice(stringMatch[0].length);
        matched = true;
      }
    }

    // Check for keywords
    if (!matched) {
      const keywordMatch = remaining.match(new RegExp(`^\\b(${colors.keywords.join('|')})\\b`));
      if (keywordMatch) {
        result.push(
          <span key={`keyword-${tokenId++}`} style={{ color: COLORS.keyword, fontWeight: '500' }}>
            {keywordMatch[1]}
          </span>
        );
        remaining = remaining.slice(keywordMatch[1].length);
        matched = true;
      }
    }

    // Check for functions
    if (!matched) {
      const functionMatch = remaining.match(new RegExp(`^\\b(${colors.functions.join('|')})\\b`));
      if (functionMatch) {
        result.push(
          <span key={`function-${tokenId++}`} style={{ color: COLORS.function, fontWeight: '500' }}>
            {functionMatch[1]}
          </span>
        );
        remaining = remaining.slice(functionMatch[1].length);
        matched = true;
      }
    }

    // Check for numbers
    if (!matched) {
      const numberMatch = remaining.match(/^\d+/);
      if (numberMatch) {
        result.push(
          <span key={`number-${tokenId++}`} style={{ color: COLORS.number }}>
            {numberMatch[0]}
          </span>
        );
        remaining = remaining.slice(numberMatch[0].length);
        matched = true;
      }
    }

    // Default: consume single character
    if (!matched) {
      result.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return result;
}

export default function CodeSnippet() {
  const globalAlgo = useUIStore(state => state.activeMode === 'sorting' ? state.activeSortingAlgorithm : state.activeGraphAlgorithm);
  const [algoName, setAlgoName] = useState<string>(globalAlgo);
  const [language, setLanguage] = useState<'cpp' | 'python'>('cpp');

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

  const langKey = language as keyof typeof ALGORITHMS[string];
  const code = ALGORITHMS[algoName]?.[langKey] || ALGORITHMS['Merge Sort'][langKey];

  return (
    <div className="flex-1 glass-panel p-0 flex flex-col font-mono text-sm text-slate-300 overflow-hidden rounded-lg border border-ice-blue/10">
      {/* Header with Language Tabs */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-ice-blue/10 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <h3 className="text-slate-300 font-sans text-sm uppercase tracking-wider font-bold">
            💻 Implementation
          </h3>
          <div className="text-slate-500 text-sm">{algoName}</div>
        </div>
        <div className="flex gap-2">
          {(['cpp', 'python'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded text-sm font-semibold transition-all ${
                language === lang
                  ? 'bg-ice-blue/30 text-ice-blue shadow-lg shadow-ice-blue/20'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {lang === 'cpp' ? 'C++' : 'Python'}
            </button>
          ))}
        </div>
      </div>

      {/* Code Display with Syntax Highlighting */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-ice-blue/20 scrollbar-track-transparent bg-slate-950/80">
        <div className="p-6 space-y-0">
          {code.map((line, idx) => (
            <div
              key={idx}
              className="flex gap-4 group hover:bg-slate-900/50 transition-colors py-1 px-3 rounded"
            >
              {/* Line Numbers */}
              <span className="text-slate-600 select-none w-8 text-right font-medium flex-shrink-0">
                {idx + 1}
              </span>

              {/* Code with Syntax Highlighting via React tokenization */}
              <span className="text-slate-200 flex-1 whitespace-pre-wrap break-words leading-relaxed">
                {tokenizeLine(line, language)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-ice-blue/10 bg-slate-950/50 text-sm text-slate-500 flex justify-between">
        <span>{code.length} lines</span>
        <span>Time: O(n log n) | Space: O(n)</span>
      </div>
    </div>
  );
}
