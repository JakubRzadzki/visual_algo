import type { VisualizationEvent } from '../types';
import { globalEventBus } from './EventBus';
import { globalEngine, Easing } from './AnimationEngine';

/**
 * Bar state for smooth animation tracking
 */
interface BarState {
  currentValue: number;
  targetValue: number;
  animationId?: string;
  isAnimating: boolean; // Track if currently animating
}

/**
 * Queued event to be applied after current animations complete
 */
interface QueuedEvent {
  event: VisualizationEvent;
  timestamp: number;
}

/**
 * CanvasRenderer
 * High-performance canvas renderer for sorting/array visualizations
 * Uses RAF for smooth frame-rate independent rendering
 * Implements smooth interpolation for array operations (swap, set, insert, remove)
 * Queues events during animations to prevent value switching mid-animation
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  // Array and animation state
  private array: number[] = [];
  private barStates: Map<number, BarState> = new Map(); // Index -> animated value
  private comparisonIndices: Set<number> = new Set(); // Currently compared indices
  private comparisonTimeout: number | null = null; // Clear comparisons after delay

  // Event queuing to prevent mid-animation interruptions
  private eventQueue: QueuedEvent[] = []; // Events to process after animations
  private activeAnimationCount: number = 0; // Track how many animations are active

  private unsubscribe: (() => void) | null = null;
  private rafId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.width = canvas.width;
    this.height = canvas.height;

    // Load initial random state for testing
    this.array = Array.from({ length: 50 }, () => Math.floor(Math.random() * 80) + 10);
    // Initialize bar states with current values
    this.array.forEach((val, i) => {
      this.barStates.set(i, { currentValue: val, targetValue: val, isAnimating: false });
    });
  }

  /**
   * Initialize renderer and subscribe to events
   */
  public init() {
    this.unsubscribe = globalEventBus.subscribe(this.handleEvent);
    this.rafId = requestAnimationFrame(this.renderLoop);
  }

  /**
   * Cleanup and unsubscribe
   */
  public destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.comparisonTimeout !== null) {
      clearTimeout(this.comparisonTimeout);
    }
    // Cancel all pending animations
    for (const state of this.barStates.values()) {
      if (state.animationId) {
        globalEngine.cancelAnimation(state.animationId);
      }
    }
  }

  /**
   * Handle canvas resize
   */
  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.render(); // Immediate draw on resize to avoid flicker
  }

  /**
   * Handle visualization events
   * Queues events that occur during animations to prevent interruptions
   */
  private handleEvent = (event: VisualizationEvent) => {
    // If animations are active, queue the event instead of applying it immediately
    if (this.activeAnimationCount > 0) {
      this.eventQueue.push({ event, timestamp: performance.now() });
      return;
    }

    this.processEvent(event);
  };

  /**
   * Process a single event (called from handleEvent or processQueue)
   */
  private processEvent(event: VisualizationEvent): void {
    if (event.type === 'TRACE_LOADED' && event.metadata.initialState) {
      // Reset to beginning of trace
      this.array = [...event.metadata.initialState];
      this.barStates.clear();
      this.array.forEach((val, i) => {
        this.barStates.set(i, { currentValue: val, targetValue: val, isAnimating: false });
      });
      this.comparisonIndices.clear();
      if (this.comparisonTimeout !== null) {
        clearTimeout(this.comparisonTimeout);
        this.comparisonTimeout = null;
      }
    } else if (event.type === 'ARRAY_COMPARE') {
      // Highlight compared indices with delay to clear after 150ms
      const [i, j] = event.indices;
      this.comparisonIndices.add(i);
      this.comparisonIndices.add(j);

      // Clear comparison highlight after a short delay for visual feedback
      if (this.comparisonTimeout !== null) {
        clearTimeout(this.comparisonTimeout);
      }
      this.comparisonTimeout = window.setTimeout(() => {
        this.comparisonIndices.clear();
        this.comparisonTimeout = null;
      }, 150);
    } else if (event.type === 'ARRAY_SWAP') {
      // Swap array values and animate smoothly
      const [i, j] = event.indices;
      const temp = this.array[i];
      this.array[i] = this.array[j];
      this.array[j] = temp;

      // Animate both bars to their new positions
      this.animateBarValue(i, this.array[i]);
      this.animateBarValue(j, this.array[j]);

      this.comparisonIndices.clear();
      if (this.comparisonTimeout !== null) {
        clearTimeout(this.comparisonTimeout);
        this.comparisonTimeout = null;
      }
    } else if (event.type === 'ARRAY_SET') {
      // Set array value and animate smoothly
      if (event.isReverse && event.previousValue !== undefined) {
        this.array[event.index] = event.previousValue;
      } else {
        this.array[event.index] = event.value;
      }

      this.animateBarValue(event.index, this.array[event.index]);
      this.comparisonIndices.clear();
      if (this.comparisonTimeout !== null) {
        clearTimeout(this.comparisonTimeout);
        this.comparisonTimeout = null;
      }
    } else if (event.type === 'ARRAY_INSERT') {
      // Insert a new value at specified index, shifting all subsequent indices
      this.array.splice(event.index, 0, event.value);

      // Shift all bar state indices after insertion point
      const newBarStates = new Map<number, BarState>();
      for (const [idx, state] of this.barStates.entries()) {
        if (idx >= event.index) {
          // Shift indices after insertion
          newBarStates.set(idx + 1, state);
        } else {
          // Keep indices before insertion
          newBarStates.set(idx, state);
        }
      }

      // Create new bar state for inserted value
      newBarStates.set(event.index, { currentValue: 0, targetValue: event.value, isAnimating: false });
      this.barStates = newBarStates;

      // Animate the inserted bar from 0 to its value
      this.animateBarValue(event.index, event.value);
      this.comparisonIndices.clear();
    } else if (event.type === 'ARRAY_REMOVE') {
      // Remove value at specified index, shifting subsequent indices back
      if (event.index < this.array.length) {
        this.array.splice(event.index, 1);

        // Shift bar state indices after removal point
        const newBarStates = new Map<number, BarState>();
        for (const [idx, state] of this.barStates.entries()) {
          if (idx < event.index) {
            // Keep indices before removal
            newBarStates.set(idx, state);
          } else if (idx > event.index) {
            // Shift indices after removal
            newBarStates.set(idx - 1, state);
          }
          // Remove the index that was deleted
        }

        this.barStates = newBarStates;
      }

      this.comparisonIndices.clear();
    }
  }

  /**
   * Process all queued events after animations complete
   */
  private processQueuedEvents(): void {
    // Only process if no animations are active
    if (this.activeAnimationCount > 0) return;

    while (this.eventQueue.length > 0) {
      const queued = this.eventQueue.shift();
      if (queued) {
        this.processEvent(queued.event);
        // Check again if new animations were started
        if (this.activeAnimationCount > 0) break;
      }
    }
  }

  /**
   * Animate a bar from its current value to a target value
   * Uses smooth easing interpolation with adaptive duration based on value change
   * Prevents interruption of this animation by queuing new events
   */
  private animateBarValue(index: number, targetValue: number, durationMs: number = 250): void {
    // Get or create bar state
    let state = this.barStates.get(index);
    if (!state) {
      state = { currentValue: targetValue, targetValue, isAnimating: false };
      this.barStates.set(index, state);
    }

    // Cancel existing animation for this bar
    if (state.animationId) {
      globalEngine.cancelAnimation(state.animationId);
    }

    // Store start value for interpolation
    const startValue = state.currentValue;
    state.targetValue = targetValue;
    state.isAnimating = true;
    this.activeAnimationCount++;

    // Adaptive duration based on value difference for more natural feel
    const valueDiff = Math.abs(targetValue - startValue);
    const adaptiveDuration = Math.max(150, Math.min(durationMs, 150 + valueDiff * 2));

    // Schedule smooth animation with better easing
    const animId = globalEngine.scheduleAnimation(
      adaptiveDuration,
      (progress: number) => {
        // Use easeInOut for smoother overall feel
        const eased = Easing.easeInOut(progress);
        state!.currentValue = startValue + (targetValue - startValue) * eased;
      },
      Easing.easeInOut,
      () => {
        // Animation complete callbacks
        state!.isAnimating = false;
        state!.currentValue = targetValue; // Ensure exact final value
        this.activeAnimationCount--;

        // Process any queued events now that this animation is done
        this.processQueuedEvents();
      }
    );

    state.animationId = animId;
  }

  /**
   * Main render loop
   */
  private renderLoop = () => {
    this.render();
    this.rafId = requestAnimationFrame(this.renderLoop);
  };

  /**
   * Render the sorting visualization with smooth bar animations
   */
  private render() {
    // Clear canvas with background
    this.ctx.fillStyle = '#0a0e1a';
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw bars
    const barCount = this.array.length;
    const barWidth = Math.max(2, (this.width / barCount) * 0.85); // Min width for small arrays
    const spacing = (this.width / barCount) * 0.15;
    const maxHeight = this.height * 0.85;
    const baselineY = this.height - 15;

    for (let i = 0; i < barCount; i++) {
      // Get animated value or actual value
      const state = this.barStates.get(i);
      const displayValue = state?.currentValue ?? this.array[i];

      // Calculate bar dimensions
      const h = Math.max(2, (displayValue / 100) * maxHeight);
      const x = i * (barWidth + spacing) + spacing / 2;
      const y = baselineY - h;

      // Determine bar color based on state
      let baseColor = '#06b6d4'; // Cyan base
      let opacity = 0.9;
      
      if (this.comparisonIndices.has(i)) {
        baseColor = '#ef4444'; // Red for compared
        opacity = 0.95;
      }

      // Draw shadow for depth
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      this.ctx.fillRect(x + 1, y + 1, barWidth, h);

      // Draw main bar with gradient
      const gradient = this.ctx.createLinearGradient(x, y, x, baselineY);
      gradient.addColorStop(0, this.lighten(baseColor, 30));
      gradient.addColorStop(0.5, baseColor);
      gradient.addColorStop(1, this.darken(baseColor, 25));

      this.ctx.fillStyle = gradient;
      this.ctx.globalAlpha = opacity;
      this.ctx.fillRect(x, y, barWidth, h);
      this.ctx.globalAlpha = 1.0;

      // Add edge highlight
      this.ctx.strokeStyle = this.lighten(baseColor, 50);
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, barWidth, h);
    }
  }

  /**
   * Lighten a color by increasing brightness
   */
  private lighten(color: string, percent: number): string {
    if (!color.startsWith('#')) return color;
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min(((num >> 8) & 0x00ff) + amt, 255);
    const B = Math.min((num & 0x0000ff) + amt, 255);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  /**
   * Darken a color by decreasing brightness
   */
  private darken(color: string, percent: number): string {
    if (!color.startsWith('#')) return color;
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max(((num >> 8) & 0x00ff) - amt, 0);
    const B = Math.max((num & 0x0000ff) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
}
