/**
 * @file SortingVisualizer.tsx
 * @description Main orchestrator component for the snapshot-based sorting visualization.
 *
 * Composes the bar visualization, HUD stats, and playback controls into a single
 * self-contained visualizer. Manages array generation, algorithm selection (via prop),
 * and frame lifecycle.
 *
 * Architecture:
 * 1. Synchronizes with the Monaco Editor and underlying Python/C++ source code templates.
 * 2. When the editor parses a new array, this component eagerly updates and pre-computes frames.
 * 3. Integrates with the Monaco editor "Run" button by automatically playing/pausing local
 *    playback when the global `isAnimating` state changes.
 * 4. Synchronizes local playback speed with the global engine to speed up terminal logs and editor highlights.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSortingPlayback } from '../hooks/useSortingPlayback';
import { ALGORITHM_REGISTRY, resolveAlgorithmId } from '../algorithms/registry';
import type { SortAlgorithmInfo } from '../types';
import SortingBars from './SortingBars';
import AlgorithmStats from './AlgorithmStats';
import SortingPlaybackControls from './SortingPlaybackControls';
import { useUIStore } from '../../store/uiStore';
import { globalEngine } from '../../core/AnimationEngine';
import type { ArrayInput } from '../../types';

/** Default array size for initial render. */
const DEFAULT_ARRAY_SIZE = 25;

/** Minimum value in generated arrays. */
const MIN_VALUE = 5;

/** Maximum value in generated arrays. */
const MAX_VALUE = 100;

interface SortingVisualizerProps {
  /** Algorithm display name (e.g., "Bubble Sort"). Resolved to a frame generator. */
  algorithmName: string;
}

/**
 * Generates a random array of the given size with values between MIN_VALUE and MAX_VALUE.
 *
 * @param size - Number of elements.
 * @returns Array of random integers.
 */
function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
}

export default function SortingVisualizer({ algorithmName }: SortingVisualizerProps) {
  const [arraySize, setArraySize] = useState(DEFAULT_ARRAY_SIZE);
  const [algorithmInfo, setAlgorithmInfo] = useState<SortAlgorithmInfo | null>(null);
  const playback = useSortingPlayback();

  // Get parsed array values from global store (synced by Monaco from source files)
  const visualizationData = useUIStore(state => state.visualizationData);
  const isAnimating = useUIStore(state => state.isAnimating);

  /** Resolve the algorithm ID from the display name. */
  const algorithmId = useMemo(() => resolveAlgorithmId(algorithmName), [algorithmName]);

  // Extract values if available
  const parsedValues = useMemo(() => {
    if (visualizationData && 'values' in visualizationData) {
      return (visualizationData as ArrayInput).values;
    }
    return null;
  }, [visualizationData]);

  // Prevent recursive trigger loops using a ref
  const lastLoadedArrayRef = useRef<string>('');

  /** Eagerly compute frames for a specific array. */
  const loadArrayForSorting = useCallback((arr: number[]) => {
    if (!algorithmId || !(algorithmId in ALGORITHM_REGISTRY)) return;

    const arrayKey = `${algorithmId}-${arr.join(',')}`;
    if (lastLoadedArrayRef.current === arrayKey) return;
    lastLoadedArrayRef.current = arrayKey;

    const generator = ALGORITHM_REGISTRY[algorithmId];
    const result = generator(arr);

    setAlgorithmInfo(result.info);
    playback.loadFrames(result.frames);
    setArraySize(arr.length);
  }, [algorithmId, playback]);

  // Sync with parsed array from editor/source files
  useEffect(() => {
    if (parsedValues && parsedValues.length > 0 && !isAnimating) {
      loadArrayForSorting(parsedValues);
    }
  }, [parsedValues, isAnimating, loadArrayForSorting]);

  // Fallback initial load if no parsed values exist
  useEffect(() => {
    if (!parsedValues && algorithmId) {
      const arr = generateRandomArray(arraySize);
      loadArrayForSorting(arr);
    }
  }, [algorithmId, parsedValues, arraySize, loadArrayForSorting]);

  // Sync playback with global isAnimating state (triggered by Monaco "Run" button)
  useEffect(() => {
    if (isAnimating && !playback.isPlaying) {
      playback.play();
    } else if (!isAnimating && playback.isPlaying) {
      playback.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating]);

  // Sync local play/pause with global isAnimating state and globalEngine (so terminal/logs pause/play in sync!)
  const localIsPlaying = playback.isPlaying;
  useEffect(() => {
    if (useUIStore.getState().isAnimating !== localIsPlaying) {
      useUIStore.getState().setIsAnimating(localIsPlaying);
    }
    if (localIsPlaying) {
      globalEngine.play();
    } else {
      globalEngine.pause();
    }
  }, [localIsPlaying]);

  // Sync local speed changes with globalEngine speed so terminal/logs speed up instantly to match!
  const localSpeed = playback.speed;
  useEffect(() => {
    globalEngine.setSpeed(localSpeed);
  }, [localSpeed]);

  // Fallback if algorithm not found
  if (!algorithmId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 italic">
        Unknown sorting algorithm: {algorithmName}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#050816] rounded-xl">
      {/* ── HUD Stats ── */}
      <AlgorithmStats frame={playback.currentFrame} info={algorithmInfo} />

      {/* ── Operation description ── */}
      {playback.currentFrame && (
        <div className="px-4 py-1.5 text-xs font-mono text-slate-400 bg-slate-900/30 border-b border-white/[0.03] truncate">
          {playback.currentFrame.description}
        </div>
      )}

      {/* ── Bar Visualization ── */}
      {playback.currentFrame ? (
        <SortingBars frame={playback.currentFrame} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 italic">
          Generating frames…
        </div>
      )}

      {/* ── Playback Controls ── */}
      <SortingPlaybackControls playback={playback} />
    </div>
  );
}
