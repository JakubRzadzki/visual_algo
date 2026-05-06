/**
 * algo.worker.ts
 * Runs inside a DedicatedWorkerGlobalScope — no access to the DOM.
 * Receives a WorkerMessage, executes the requested algorithm, and replies
 * with a WorkerResponse. Transferable Objects (ArrayBuffer) are NOT used
 * for ExecutionTrace because traces contain Sets/class instances; however
 * the worker boundary already isolates memory from the main thread.
 */

import type { WorkerMessage, WorkerResponse, AlgorithmPlugin } from '../../types';

import { DijkstraPlugin } from '../plugins/graph/DijkstraPlugin';
import { KruskalPlugin } from '../plugins/graph/KruskalPlugin';
import { BFSPlugin } from '../plugins/graph/BFSPlugin';
import { DFSPlugin } from '../plugins/graph/DFSPlugin';
import { PrimPlugin } from '../plugins/graph/PrimPlugin';
import { TopoSortPlugin } from '../plugins/graph/TopoSortPlugin';

import { BubbleSortPlugin } from '../plugins/sorting/BubbleSortPlugin';
import { HeapSortPlugin } from '../plugins/sorting/HeapSortPlugin';
import { MergeSortPlugin } from '../plugins/sorting/MergeSortPlugin';
import { QuickSortPlugin } from '../plugins/sorting/QuickSortPlugin';

import { BinarySearchPlugin } from '../plugins/searching/BinarySearchPlugin';
import { LinearSearchPlugin } from '../plugins/searching/LinearSearchPlugin';

import { BSTPlugin } from '../plugins/trees/BSTPlugin';
import { AVLTreePlugin } from '../plugins/trees/AVLTreePlugin';
import { MaxHeapPlugin } from '../plugins/trees/MaxHeapPlugin';
import { UnionFindPlugin } from '../plugins/trees/UnionFindPlugin';

// Registry: algorithm id → plugin instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PLUGINS: Record<string, AlgorithmPlugin<any>> = {
  dijkstra:        new DijkstraPlugin(),
  kruskal:         new KruskalPlugin(),
  bfs:             new BFSPlugin(),
  dfs:             new DFSPlugin(),
  prim:            new PrimPlugin(),
  'topo-sort':     new TopoSortPlugin(),

  'bubble-sort':   new BubbleSortPlugin(),
  'heap-sort':     new HeapSortPlugin(),
  'merge-sort':    new MergeSortPlugin(),
  'quick-sort':    new QuickSortPlugin(),

  'binary-search': new BinarySearchPlugin(),
  'linear-search': new LinearSearchPlugin(),

  'bst':           new BSTPlugin(),
  'avl':           new AVLTreePlugin(),
  'max-heap':      new MaxHeapPlugin(),
  'union-find':    new UnionFindPlugin(),
};

// Listen for tasks from the WorkerPool
self.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
  const { taskId, algorithmId, payload } = e.data;

  const plugin = PLUGINS[algorithmId];

  if (!plugin) {
    // Unknown algorithm — return an error response
    const err: WorkerResponse = { taskId, status: 'error', message: `Unknown algorithm: "${algorithmId}"` };
    self.postMessage(err);
    return;
  }

  try {
    const trace = plugin.execute(payload);
    const ok: WorkerResponse = { taskId, status: 'ok', trace };
    // Post result back — no Transferable needed for JSON-serialisable trace
    self.postMessage(ok);
  } catch (err) {
    const fail: WorkerResponse = { taskId, status: 'error', message: String(err) };
    self.postMessage(fail);
  }
});
