import type { ExecutionTrace, VisualizationEvent, TraceMetadata } from '../types';

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
  } catch (networkErr) {
    throw new Error(
      'Network error — is the backend running? Check Docker Compose is up.',
    );
  }

  if (!res.ok) {
    // Try to extract a JSON error message from the backend
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {
      // body wasn't JSON, keep the HTTP status
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
  const events: VisualizationEvent[] = (response.trace ?? []).map(
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
    initialState: undefined,
  };

  return { events, metadata };
}
