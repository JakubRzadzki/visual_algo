/**
 * @file useSortingPlayback.ts
 * @description React hook managing playback over pre-computed SortFrame snapshots.
 *
 * Provides Play/Pause/Step-Forward/Step-Backward/Reset/Speed control
 * by iterating through an immutable array of frames. Uses requestAnimationFrame
 * with deltaTime accumulation for frame-rate independent, smooth playback.
 *
 * Guarantees:
 * - No "state update on unmounted component" — RAF is cancelled on cleanup.
 * - No memory leaks — all references are cleared on unmount.
 * - Speed changes take effect instantly without resetting playback.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { SortFrame } from '../types';

/** Base interval between frames at 1x speed (milliseconds). */
const BASE_TICK_MS = 400;

/** Return type of the useSortingPlayback hook. */
export interface PlaybackControls {
  /** The current frame being displayed. Null if no frames loaded. */
  currentFrame: SortFrame | null;

  /** Zero-based index of the current frame. */
  frameIndex: number;

  /** Total number of frames in the sequence. */
  totalFrames: number;

  /** Whether playback is currently active. */
  isPlaying: boolean;

  /** Current playback speed multiplier (1–10). */
  speed: number;

  /** Start or resume playback. */
  play: () => void;

  /** Pause playback. */
  pause: () => void;

  /** Toggle between play and pause. */
  togglePlayPause: () => void;

  /** Advance by one frame (while paused). */
  stepForward: () => void;

  /** Go back by one frame (while paused). */
  stepBackward: () => void;

  /** Jump to the beginning. */
  reset: () => void;

  /** Set the playback speed multiplier (1–10). */
  setSpeed: (speed: number) => void;

  /** Load a new set of frames, resetting playback to frame 0. */
  loadFrames: (frames: SortFrame[]) => void;
}

/**
 * Hook that manages sorted-frame playback with full transport controls.
 *
 * @returns PlaybackControls — an object with all playback state and methods.
 *
 * @example
 * const playback = useSortingPlayback();
 * playback.loadFrames(result.frames);
 * playback.play();
 */
export function useSortingPlayback(): PlaybackControls {
  const [frames, setFrames] = useState<SortFrame[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);

  // Refs for RAF loop (avoids stale closures)
  const framesRef = useRef<SortFrame[]>([]);
  const indexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const accumulatedRef = useRef(0);
  const mountedRef = useRef(true);

  // Keep refs in sync with state
  useEffect(() => { framesRef.current = frames; }, [frames]);
  useEffect(() => { indexRef.current = frameIndex; }, [frameIndex]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Cleanup on unmount — cancel RAF and prevent state updates
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  /** RAF-based animation loop with deltaTime accumulation. */
  const tick = useCallback((timestamp: number) => {
    if (!isPlayingRef.current || !mountedRef.current) return;

    const delta = lastTimeRef.current ? timestamp - lastTimeRef.current : 0;
    lastTimeRef.current = timestamp;
    accumulatedRef.current += delta;

    const interval = BASE_TICK_MS / speedRef.current;

    while (accumulatedRef.current >= interval && isPlayingRef.current) {
      const nextIndex = indexRef.current + 1;

      if (nextIndex >= framesRef.current.length) {
        // Reached the end — stop playback
        isPlayingRef.current = false;
        if (mountedRef.current) setIsPlaying(false);
        accumulatedRef.current = 0;
        return;
      }

      indexRef.current = nextIndex;
      if (mountedRef.current) setFrameIndex(nextIndex);
      accumulatedRef.current -= interval;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  /** Start the RAF loop. */
  const startLoop = useCallback(() => {
    lastTimeRef.current = 0;
    accumulatedRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  /** Stop the RAF loop. */
  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (framesRef.current.length === 0) return;
    // If at end, restart from beginning
    if (indexRef.current >= framesRef.current.length - 1) {
      indexRef.current = 0;
      setFrameIndex(0);
    }
    isPlayingRef.current = true;
    setIsPlaying(true);
    startLoop();
  }, [startLoop]);

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    stopLoop();
  }, [stopLoop]);

  const togglePlayPause = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const stepForward = useCallback(() => {
    if (isPlayingRef.current) return;
    const next = indexRef.current + 1;
    if (next < framesRef.current.length) {
      indexRef.current = next;
      setFrameIndex(next);
    }
  }, []);

  const stepBackward = useCallback(() => {
    if (isPlayingRef.current) return;
    const prev = indexRef.current - 1;
    if (prev >= 0) {
      indexRef.current = prev;
      setFrameIndex(prev);
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    indexRef.current = 0;
    setFrameIndex(0);
  }, [pause]);

  const setSpeed = useCallback((s: number) => {
    const clamped = Math.max(1, Math.min(s, 10));
    speedRef.current = clamped;
    setSpeedState(clamped);
  }, []);

  const loadFrames = useCallback((newFrames: SortFrame[]) => {
    pause();
    framesRef.current = newFrames;
    setFrames(newFrames);
    indexRef.current = 0;
    setFrameIndex(0);
  }, [pause]);

  const currentFrame = frames.length > 0 ? frames[frameIndex] ?? null : null;

  return {
    currentFrame,
    frameIndex,
    totalFrames: frames.length,
    isPlaying,
    speed,
    play,
    pause,
    togglePlayPause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    loadFrames,
  };
}
