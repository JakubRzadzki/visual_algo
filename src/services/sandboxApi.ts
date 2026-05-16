import type { ExecutionTrace, VisualizationEvent, TraceMetadata, GraphInput } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by the Go backend's POST /api/run */
export interface RunResponse {
  trace: Record<string, unknown>[];
  output?: string;
  error?: string;
}

// ─── API Client ───────────────────────────────────────────────────────────────

const API_RUN_URL = '/api/run';

/**
 * Send user code to the Docker sandbox for execution.
 *
 * @param code     - The source code string from the Monaco Editor
 * @param language - One of 'python', 'cpp', or 'typescript'
 * @returns The raw RunResponse from the backend
 * @throws Error with a descriptive message on network/HTTP failure
 */
export async function executeInSandbox(
  code: string,
  language: string,
): Promise<RunResponse> {
  let res: Response;

  try {
    res = await fetch(API_RUN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
  } catch {
    throw new Error(
      'Network error — is the backend running? Check Docker Compose is up.',
    );
  }

  if (!res.ok) {
    // Try to extract a JSON error message from the backend
    let detail = `HTTP ${res.status}`;
    if (res.status === 502) {
      detail = 'HTTP 502: Go backend is unreachable. Please ensure the backend is running (e.g., "docker compose up").';
    } else {
      try {
        const body = await res.json();
        if (body?.error) detail = body.error;
      } catch {
        // body wasn't JSON, keep the HTTP status
      }
    }
    throw new Error(detail);
  }

  return res.json() as Promise<RunResponse>;
}

// ─── Trace Builder ────────────────────────────────────────────────────────────

/**
 * Transform the backend's raw JSON event array into a fully-typed
 * `ExecutionTrace` compatible with `globalEngine.loadTrace()`.
 *
 * The sandbox protocol emits JSON lines with at minimum a `type` field.
 * We generate synthetic `id`, `timestamp`, and `step` fields that the
 * AnimationEngine expects on every `VisualizationEvent`.
 *
 * @param response      - The raw RunResponse from the backend
 * @param algorithmName - Display name to embed in TraceMetadata
 * @param executionMs   - Measured round-trip time for metadata
 */
export function buildExecutionTrace(
  response: RunResponse,
  algorithmName: string,
  executionMs: number = 0,
): ExecutionTrace {
  const rawTrace = response.trace ?? [];
  let initialState: number[] | undefined;
  let initialGraph: GraphInput | undefined;

  const filtered = rawTrace.filter((raw) => {
    if (raw.type === 'INIT') {
      if (Array.isArray(raw.array)) initialState = raw.array as number[];
      if (raw.graph) initialGraph = raw.graph as GraphInput;
      return false; // Don't include INIT in playback events
    }
    return true;
  });

  const events: VisualizationEvent[] = filtered.map(
    (raw, index) => {
      return {
        id: crypto.randomUUID(),
        timestamp: Date.now() + index,
        step: index,
        ...raw,
      } as VisualizationEvent;
    },
  );

  const metadata: TraceMetadata = {
    algorithmName,
    timeComplexity: 'N/A (sandbox)',
    spaceComplexity: 'N/A (sandbox)',
    executionTimeMs: executionMs,
    nodeCount: events.length,
    initialState,
    initialGraph,
  } as TraceMetadata;

  return { events, metadata };
}

// ─── Persistence Subsystem (Step 4) ───────────────────────────────────────────

const API_SNAPSHOTS_URL = '/api/snapshots';

/**
 * Saves a visualization snapshot to the backend.
 * @param payload - The snapshot data (graph, code, language, algorithm)
 * @returns The generated UUID link for sharing
 */
export async function saveSnapshot(payload: Record<string, unknown>): Promise<string> {
  const res = await fetch(API_SNAPSHOTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to save snapshot: HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.id;
}

/**
 * Retrieves a visualization snapshot from the backend.
 * @param id - The UUID of the snapshot
 * @returns The parsed snapshot data
 */
export async function getSnapshot(id: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_SNAPSHOTS_URL}/${id}`);

  if (!res.ok) {
    throw new Error(`Failed to load snapshot: HTTP ${res.status}`);
  }

  return res.json();
}
