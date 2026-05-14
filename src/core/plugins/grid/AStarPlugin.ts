/**
 * @file AStarPlugin.ts
 * @description Web Worker plugin implementing the A* Search pathfinding algorithm.
 *
 * Implements AlgorithmPlugin<GridInput> and emits discrete matrix cell updates
 * and highlight events to demonstrate open set expansion, closed set evaluation,
 * heuristic prioritization, and final path reconstruction on a 2D grid.
 *
 * Time Complexity:  O(E) where E is the number of valid grid transitions
 * Space Complexity: O(V) where V is the number of grid cells
 */

import type {
  AlgorithmPlugin,
  ExecutionTrace,
  VisualizationEvent,
  GridInput,
  EventPayload,
} from '../../../types';

/**
 * Internal interface representing a grid coordinate and its associated pathfinding costs.
 */
interface AStarNode {
  x: number;
  y: number;
  /** Cost from the start node to this node. */
  gScore: number;
  /** Estimated total cost from start to target through this node (gScore + hScore). */
  fScore: number;
  /** Parent coordinate string key used for path reconstruction. */
  parentKey: string | null;
}

/**
 * AStarPlugin — Encapsulates the deterministic execution and tracing of the A* algorithm.
 */
export class AStarPlugin implements AlgorithmPlugin<GridInput> {
  id = 'a-star';
  name = 'A* Search';
  category = 'grid' as const;

  /**
   * Computes the Manhattan distance heuristic between two grid coordinates.
   *
   * @param x1 - Source X coordinate.
   * @param y1 - Source Y coordinate.
   * @param x2 - Target X coordinate.
   * @param y2 - Target Y coordinate.
   * @returns The estimated distance cost.
   */
  private manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  /**
   * Converts a 2D grid coordinate into a serialized string key for map lookups.
   *
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns Comma-separated string representation.
   */
  private toKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  /**
   * Executes the A* pathfinding algorithm on the provided grid environment.
   *
   * @param input - Grid configuration including dimensions, obstacles, start, and target coordinates.
   * @returns An ExecutionTrace driving the GridStage playback visualization.
   */
  execute(input: GridInput): ExecutionTrace {
    const width = input?.width > 0 ? input.width : 20;
    const height = input?.height > 0 ? input.height : 20;

    // Use explicit defaults if start or target are omitted
    const start = input?.start ?? { x: 0, y: 0 };
    const target = input?.target ?? { x: width - 1, y: height - 1 };

    // Validate bounds to prevent propagation of malformed inputs
    if (
      start.x < 0 || start.x >= width || start.y < 0 || start.y >= height ||
      target.x < 0 || target.x >= width || target.y < 0 || target.y >= height
    ) {
      return {
        events: [],
        metadata: {
          timeComplexity: 'O(E)',
          spaceComplexity: 'O(V)',
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

    /** Uniform event factory helper */
    const pushEvent = (payload: EventPayload) => {
      events.push({
        ...payload,
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        step: step++,
      } as VisualizationEvent);
    };

    // Phase 1: Initialize open and closed sets, base costs
    pushEvent({
      type: 'SYSTEM_LOG',
      message: `Initializing A* Search on ${width}x${height} grid. Start: (${start.x},${start.y}), Target: (${target.x},${target.y}).`,
      level: 'INFO',
    });

    const openSet = new Map<string, AStarNode>();
    const closedSet = new Set<string>();
    const allNodes = new Map<string, AStarNode>();

    const startKey = this.toKey(start.x, start.y);
    const startH = this.manhattanDistance(start.x, start.y, target.x, target.y);

    const startNode: AStarNode = {
      x: start.x,
      y: start.y,
      gScore: 0,
      fScore: startH,
      parentKey: null,
    };

    openSet.set(startKey, startNode);
    allNodes.set(startKey, startNode);

    // Initial highlight for start node
    pushEvent({
      type: 'MATRIX_CELL_UPDATE',
      row: start.y,
      col: start.x,
      value: startH,
      dependencies: [],
    });

    let targetReachedNode: AStarNode | null = null;

    // Phase 2: Main A* Search loop — extract node with lowest fScore
    while (openSet.size > 0) {
      // Find node in openSet with the lowest fScore
      let currentKey = '';
      let lowestF = Infinity;

      for (const [key, node] of openSet.entries()) {
        if (node.fScore < lowestF) {
          lowestF = node.fScore;
          currentKey = key;
        }
      }

      const current = openSet.get(currentKey)!;
      openSet.delete(currentKey);
      closedSet.add(currentKey);

      // Highlight currently evaluated node
      if (current.x !== start.x || current.y !== start.y) {
        pushEvent({
          type: 'MATRIX_CELL_HIGHLIGHT',
          row: current.y,
          col: current.x,
          color: '#06b6d4', // Cyan expansion highlight
        });
      }

      pushEvent({
        type: 'SYSTEM_LOG',
        message: `Evaluating cell (${current.x},${current.y}) with fScore = ${current.fScore} (g=${current.gScore}, h=${current.fScore - current.gScore}).`,
        level: 'INFO',
      });

      // Check if we reached the destination
      if (current.x === target.x && current.y === target.y) {
        targetReachedNode = current;
        pushEvent({
          type: 'SYSTEM_LOG',
          message: `Target (${target.x},${target.y}) successfully reached! Total path cost: ${current.gScore}.`,
          level: 'INFO',
        });
        break;
      }

      // Generate valid orthogonal neighbor transitions
      const directions = [
        { x: 0, y: -1 }, // Up
        { x: 1, y: 0 },  // Right
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }, // Left
      ];

      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const neighborKey = this.toKey(nx, ny);

        // Filter out-of-bounds, walls, and already finalized closed-set nodes
        if (
          nx < 0 || nx >= width || ny < 0 || ny >= height ||
          walls.has(neighborKey) || closedSet.has(neighborKey)
        ) {
          continue;
        }

        // Uniform cost of 1 per grid step
        const tentativeGScore = current.gScore + 1;
        let neighbor = allNodes.get(neighborKey);

        if (!neighbor || tentativeGScore < neighbor.gScore) {
          const hScore = this.manhattanDistance(nx, ny, target.x, target.y);
          neighbor = {
            x: nx,
            y: ny,
            gScore: tentativeGScore,
            fScore: tentativeGScore + hScore,
            parentKey: currentKey,
          };

          allNodes.set(neighborKey, neighbor);
          openSet.set(neighborKey, neighbor);

          // Emit visual notification of discovered or relaxed neighbor costs
          pushEvent({
            type: 'MATRIX_CELL_UPDATE',
            row: ny,
            col: nx,
            value: neighbor.fScore,
            dependencies: [[current.y, current.x]],
          });
        }
      }
    }

    // Phase 3: Reconstruct optimal path from target to start via backtracking
    if (targetReachedNode) {
      let curr: AStarNode | null = targetReachedNode;
      const pathCoords: [number, number][] = [];

      while (curr) {
        pathCoords.push([curr.x, curr.y]);
        // Highlight optimal path cells in bright yellow/emerald
        if ((curr.x !== start.x || curr.y !== start.y) && (curr.x !== target.x || curr.y !== target.y)) {
          pushEvent({
            type: 'MATRIX_CELL_HIGHLIGHT',
            row: curr.y,
            col: curr.x,
            color: '#eab308', // Premium golden yellow path accent
          });
        }
        curr = curr.parentKey ? allNodes.get(curr.parentKey) || null : null;
      }

      pushEvent({
        type: 'SYSTEM_LOG',
        message: `Optimal path successfully reconstructed. Length: ${pathCoords.length} steps.`,
        level: 'INFO',
      });
    } else {
      pushEvent({
        type: 'SYSTEM_LOG',
        message: `Search exhausted. Target (${target.x},${target.y}) is unreachable due to boundary enclosures.`,
        level: 'WARN',
      });
    }

    const endTime = performance.now();

    return {
      events,
      metadata: {
        timeComplexity: 'O(E)',
        spaceComplexity: 'O(V)',
        executionTimeMs: endTime - startTime,
        nodeCount: width * height,
        algorithmName: this.name,
      },
    };
  }
}
