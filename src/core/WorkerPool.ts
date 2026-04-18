import type { GraphInput, ExecutionTrace, WorkerMessage, WorkerResponse } from '../types';

type WorkerState = 'idle' | 'busy';

interface PoolWorker {
  worker: Worker;
  state: WorkerState;
}

interface PendingTask {
  taskId: string;
  resolve: (trace: ExecutionTrace) => void;
  reject: (err: Error) => void;
}

/**
 * WorkerPool
 * Manages a fixed pool of Web Workers (≤ maxWorkers).
 * Tasks are queued when all workers are busy and dispatched FIFO when one becomes free.
 */
export class WorkerPool {
  private pool: PoolWorker[] = [];
  private taskQueue: (WorkerMessage & { resolve: PendingTask['resolve']; reject: PendingTask['reject'] })[] = [];
  // Map taskId → pending promise handlers for in-flight tasks
  private pending: Map<string, PendingTask> = new Map();

  constructor(private readonly maxWorkers = 3) {
    // Pre-spawn the worker pool on construction
    this.spawnWorkers();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Schedule an algorithm run on the next available worker.
   * Returns a Promise that resolves with the completed ExecutionTrace.
   */
  public run(algorithmId: string, payload: GraphInput): Promise<ExecutionTrace> {
    return new Promise((resolve, reject) => {
      const taskId = crypto.randomUUID();
      const message: WorkerMessage = { taskId, algorithmId, payload };

      // Find an idle worker to hand off to immediately
      const idle = this.pool.find(pw => pw.state === 'idle');

      if (idle) {
        this.dispatch(idle, message, resolve, reject);
      } else {
        // All workers busy — push into queue for later
        this.taskQueue.push({ ...message, resolve, reject });
      }
    });
  }

  /** Terminate all workers — call this on component unmount. */
  public destroy(): void {
    for (const pw of this.pool) pw.worker.terminate();
    this.pool = [];
    this.taskQueue = [];
    this.pending.clear();
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private spawnWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      // Vite resolves ?worker suffix as a Worker module URL at build time
      const worker = new Worker(new URL('./workers/algo.worker.ts', import.meta.url), { type: 'module' });
      const pw: PoolWorker = { worker, state: 'idle' };

      worker.addEventListener('message', (e: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(pw, e.data);
      });

      worker.addEventListener('error', (e) => {
        this.handleWorkerError(pw, e);
      });

      this.pool.push(pw);
    }
  }

  /** Send a task to a specific worker and mark it busy. */
  private dispatch(
    pw: PoolWorker,
    message: WorkerMessage,
    resolve: PendingTask['resolve'],
    reject: PendingTask['reject'],
  ): void {
    pw.state = 'busy';
    this.pending.set(message.taskId, { taskId: message.taskId, resolve, reject });
    pw.worker.postMessage(message);
  }

  /** Called when a worker posts a response. */
  private handleWorkerMessage(pw: PoolWorker, response: WorkerResponse): void {
    const task = this.pending.get(response.taskId);
    if (!task) return;

    this.pending.delete(response.taskId);

    if (response.status === 'ok') {
      task.resolve(response.trace);
    } else {
      task.reject(new Error(response.message));
    }

    // Mark worker idle and process any queued tasks
    pw.state = 'idle';
    this.drainQueue(pw);
  }

  /** Called when a worker throws an uncaught error. */
  private handleWorkerError(pw: PoolWorker, e: ErrorEvent): void {
    // Reject ALL pending tasks routed to this worker
    for (const [taskId, task] of this.pending.entries()) {
      task.reject(new Error(`[WorkerPool] Worker error: ${e.message}`));
      this.pending.delete(taskId);
    }
    pw.state = 'idle';
    this.drainQueue(pw);
  }

  /** Hand off the next queued task to a freshly-idle worker. */
  private drainQueue(pw: PoolWorker): void {
    if (this.taskQueue.length === 0) return;
    const next = this.taskQueue.shift()!;
    const { resolve, reject, ...message } = next;
    this.dispatch(pw, message, resolve, reject);
  }
}

// Singleton instance shared across the app (lazy — only created when first imported)
export const globalWorkerPool = new WorkerPool(3);
