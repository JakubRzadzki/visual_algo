/**
 * algo.worker.ts
 * Runs inside a DedicatedWorkerGlobalScope — no access to the DOM.
 * Receives a WorkerMessage, executes the requested algorithm, and replies
 * with a WorkerResponse. Transferable Objects (ArrayBuffer) are NOT used
 * for ExecutionTrace because traces contain Sets/class instances; however
 * the worker boundary already isolates memory from the main thread.
 */

import type { WorkerMessage, WorkerResponse } from '../../types';
import { DijkstraPlugin } from '../plugins/graph/DijkstraPlugin';
import { KruskalPlugin } from '../plugins/graph/KruskalPlugin';

// Registry: algorithm id → plugin instance
const PLUGINS: Record<string, { execute: (d: any) => any }> = {
  dijkstra: new DijkstraPlugin(),
  kruskal:  new KruskalPlugin(),
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
