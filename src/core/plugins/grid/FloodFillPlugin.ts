/**
 * @file FloodFillPlugin.ts
 * @description Web Worker plugin implementing the Flood Fill region-filling algorithm.
 *
 * Implements AlgorithmPlugin<GridInput> and emits discrete cell highlighting
 * events to visualize iterative breadth-first region expansion from a starting
 * coordinate while successfully avoiding pre-configured wall enclosures.
 *
 * Time Complexity:  O(V) where V is the number of accessible grid cells
 * Space Complexity: O(V) auxiliary queue memory storage
 */

import type {
  AlgorithmPlugin,
  ExecutionTrace,
  VisualizationEvent,
  GridInput,
  EventPayload,
} from "../../../types";

/**
 * FloodFillPlugin — Generates deterministic simulation events for area expansion.
 */
export class FloodFillPlugin implements AlgorithmPlugin<GridInput> {
  id = "flood-fill";
  name = "Flood Fill";
  category = "grid" as const;

  /**
   * Helper to serialize node positions into unique look-up string keys.
   *
   * @param x - Horizontal coordinate.
   * @param y - Vertical coordinate.
   * @returns Comma-separated identifier string.
   */
  private toKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  /**
   * Executes the Flood Fill simulation across the matrix boundary constraints.
   *
   * @param input - Grid shape configuration containing boundaries, obstacles, and start point.
   * @returns Complete trace consumed sequentially by the visualization engine.
   */
  execute(input: GridInput): ExecutionTrace {
    const width = input?.width > 0 ? input.width : 20;
    const height = input?.height > 0 ? input.height : 20;
    const start = input?.start ?? { x: 0, y: 0 };

    // Prevent propagation of out-of-bounds start coordinates
    if (start.x < 0 || start.x >= width || start.y < 0 || start.y >= height) {
      return {
        events: [],
        metadata: {
          timeComplexity: "O(V)",
          spaceComplexity: "O(V)",
          executionTimeMs: 0,
          nodeCount: width * height,
          algorithmName: this.name,
        },
      };
    }

    const walls = new Set(input?.walls?.map((w) => this.toKey(w.x, w.y)) || []);
    const events: VisualizationEvent[] = [];
    let step = 0;
    const startTime = performance.now();

    /** Factory for sequential visualization events */
    const pushEvent = (payload: EventPayload) => {
      events.push({
        ...payload,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++,
      } as VisualizationEvent);
    };

    // Phase 1: Verify valid start parameters
    pushEvent({
      type: "SYSTEM_LOG",
      message: `Initiating Flood Fill starting from cell (${start.x},${start.y}) on a ${width}x${height} matrix.`,
      level: "INFO",
    });

    const startKey = this.toKey(start.x, start.y);

    // If starting directly inside a wall, abort fill early
    if (walls.has(startKey)) {
      pushEvent({
        type: "SYSTEM_LOG",
        message: `Start coordinate (${start.x},${start.y}) is blocked by a wall boundary. Terminating fill expansion.`,
        level: "WARN",
      });
      return {
        events,
        metadata: {
          timeComplexity: "O(1)",
          spaceComplexity: "O(1)",
          executionTimeMs: performance.now() - startTime,
          nodeCount: width * height,
          algorithmName: this.name,
        },
      };
    }

    // Phase 2: Breadth-First exploration queue initialization
    const queue: { x: number; y: number }[] = [start];
    const visited = new Set<string>();
    visited.add(startKey);

    // Highlight starting origin immediately
    pushEvent({
      type: "MATRIX_CELL_HIGHLIGHT",
      row: start.y,
      col: start.x,
      color: "#3b82f6", // Rich oceanic blue for flood source
    });

    // Phase 3: Iterative orthogonal traversal loop
    while (queue.length > 0) {
      const current = queue.shift()!;

      const directions = [
        { x: 0, y: -1 }, // North
        { x: 1, y: 0 }, // East
        { x: 0, y: 1 }, // South
        { x: -1, y: 0 }, // West
      ];

      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const nKey = this.toKey(nx, ny);

        // Filter standard enclosed boundary cells and previously filled components
        if (
          nx >= 0 &&
          nx < width &&
          ny >= 0 &&
          ny < height &&
          !walls.has(nKey) &&
          !visited.has(nKey)
        ) {
          visited.add(nKey);
          queue.push({ x: nx, y: ny });

          // Emits discrete step events driving individual visual color updates
          pushEvent({
            type: "MATRIX_CELL_HIGHLIGHT",
            row: ny,
            col: nx,
            color: "#0ea5e9", // Vibrant sky blue water propagation accent
          });
        }
      }
    }

    pushEvent({
      type: "SYSTEM_LOG",
      message: `Flood Fill completed successfully. Total flooded area span: ${visited.size} cells.`,
      level: "INFO",
    });

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: "O(V)",
        spaceComplexity: "O(V)",
        executionTimeMs: endTime - startTime,
        nodeCount: width * height,
        algorithmName: this.name,
      },
    };
  }
}
