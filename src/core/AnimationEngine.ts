import type { ExecutionTrace, AlgorithmPlugin } from '../types';
import { globalEventBus } from './EventBus';

/**
 * Easing function types for smooth animation curves
 *
 * @param t - Normalized time (0-1 where 0=start, 1=end)
 * @returns Eased progress (0-1, can overshoot/undershoot with some curves)
 */
type EasingFunction = (t: number) => number;

/**
 * Standard easing functions for animations
 * Used for smooth transitions in visual feedback and edge highlights
 */
export const Easing = {
  /**
   * Linear interpolation — no acceleration or deceleration
   * Use for: constant-speed animations
   */
  linear: (t: number): number => t,

  /**
   * Cubic ease-out — starts fast, ends slow
   * Use for: edge highlight fades (visually natural)
   */
  easeOut: (t: number): number => 1 - Math.pow(1 - t, 3),

  /**
   * Cubic ease-in-out — slow start and end, fast middle
   * Use for: physics settling and smooth node transitions
   */
  easeInOut: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  /**
   * Quadratic ease-out — gentler than cubic, good for short animations
   * Use for: quick visual feedback
   */
  easeOutQuad: (t: number): number => 1 - (1 - t) * (1 - t),

  /**
   * Quadratic ease-in — acceleration from rest
   * Use for: entering animations
   */
  easeInQuad: (t: number): number => t * t,
};

/**
 * Animation state for a single active animation
 * Tracks progress and timing for smooth frame-independent interpolation
 */
interface ActiveAnimation {
  id: string;
  startTime: number;
  duration: number;
  easing: EasingFunction;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

/**
 * AnimationEngine
 * Orchestrates algorithm execution with precise timing and smooth animations
 * Uses RequestAnimationFrame for frame-rate independent timing
 * Manages playback speed, animation scheduling, and event emission
 */
export class AnimationEngine {
  private currentTrace: ExecutionTrace | null = null;
  private currentStep: number = 0;
  private isPlaying: boolean = false;
  private playbackSpeed: number = 1.0;

  // RAF-based timing ensures frame-rate independence (60fps, 120fps, etc.)
  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private accumulatedTime: number = 0; // Accumulates deltaTime for precise tick scheduling
  private readonly baseTickMs = 500; // 500ms at 1.0x speed

  // Central animation state manager for all active animations
  private activeAnimations: Map<string, ActiveAnimation> = new Map();
  private animationIdCounter: number = 0;

  /**
   * Orchestrates execution of a plugin with Watchdog protection.
   * If the plugin execution blocks for > 5000ms, it's manually flagged or prevented (in Worker environments)
   */
  public generateTraceWithWatchdog<T>(plugin: AlgorithmPlugin<T>, input: T, timeoutMs: number = 5000): Promise<ExecutionTrace> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();

      // In a purely synchronous environment, we can't kill a hanging while(true) block easily
      // without Web Workers. For this Engine stub, we execute directly, but track execution time.
      // Full worker pool scaling is mapped to Step 7.
      try {
        const trace = plugin.execute(input);
        const elapsed = performance.now() - startTime;

        if (elapsed > timeoutMs) {
          console.warn(`[Watchdog] Plugin ${plugin.name} exceeded ${timeoutMs}ms limit! (${Math.round(elapsed)}ms)`);
        }
        resolve(trace);
      } catch (err) {
        reject(new Error(`[Watchdog] Execution failed: ${err}`));
      }
    });
  }

  public loadTrace(trace: ExecutionTrace): void {
    this.pause();
    this.currentTrace = trace;
    this.currentStep = 0;

    globalEventBus.emit({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      step: 0,
      type: 'TRACE_LOADED',
      metadata: trace.metadata
    });

    globalEventBus.emit({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      step: 0,
      type: 'SYSTEM_LOG',
      level: 'INFO',
      message: `Loaded trace for ${trace.metadata.algorithmName} with ${trace.events.length} steps.`
    });

    this.emitPlaybackState();
  }

  /**
   * Start playback using RAF for smooth timing
   */
  public play(): void {
    if (
      !this.currentTrace ||
      this.isPlaying ||
      this.currentStep >= this.currentTrace.events.length
    )
      return;

    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.accumulatedTime = 0;
    this.emitPlaybackState();

    // Start RAF loop
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.animationLoop);
    }
  }

  /**
   * Pause playback and cancel RAF loop
   */
  public pause(): void {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.emitPlaybackState();
  }

  /**
   * Advance to the next algorithm step
   */
  public stepForward(): void {
    if (!this.currentTrace || this.currentStep >= this.currentTrace.events.length)
      return;

    const event = this.currentTrace.events[this.currentStep];
    globalEventBus.emit(event);
    this.currentStep++;
    this.emitPlaybackState();
  }

  /**
   * Go back one algorithm step
   */
  public stepBackward(): void {
    if (!this.currentTrace || this.currentStep <= 0) return;

    this.currentStep--;
    const event = { ...this.currentTrace.events[this.currentStep], isReverse: true };
    globalEventBus.emit(event);
    this.emitPlaybackState();
  }

  /**
   * Jump to a specific step index
   */
  public seekTo(stepIndex: number): void {
    if (!this.currentTrace) return;

    const target = Math.max(0, Math.min(stepIndex, this.currentTrace.events.length));

    this.pause();

    if (target < this.currentStep) {
      // Step backwards
      for (let i = this.currentStep - 1; i >= target; i--) {
        const event = { ...this.currentTrace.events[i], isReverse: true };
        globalEventBus.emit(event);
      }
    } else if (target > this.currentStep) {
      // Step forwards
      for (let i = this.currentStep; i < target; i++) {
        globalEventBus.emit(this.currentTrace.events[i]);
      }
    }

    this.currentStep = target;
    this.emitPlaybackState();
  }

  /**
   * Set playback speed (multiplier: 0.25x - 4.0x)
   */
  public setSpeed(multiplier: number): void {
    this.playbackSpeed = Math.max(0.25, Math.min(multiplier, 4.0));
    this.emitPlaybackState();
  }

  /**
   * Schedule a smooth animation with precise timing and easing
   *
   * @param duration - Animation duration in milliseconds
   * @param onUpdate - Callback that receives progress (0-1) each frame
   * @param easing - Easing function to use (default: easeInOut)
   * @param onComplete - Optional callback when animation finishes
   * @returns Animation ID (can be cancelled with cancelAnimation)
   */
  public scheduleAnimation(
    duration: number,
    onUpdate: (progress: number) => void,
    easing: EasingFunction = Easing.easeInOut,
    onComplete?: () => void
  ): string {
    const id = `anim-${++this.animationIdCounter}`;
    this.activeAnimations.set(id, {
      id,
      startTime: performance.now(),
      duration,
      easing,
      onUpdate,
      onComplete,
    });
    return id;
  }

  /**
   * Cancel an active animation by ID
   */
  public cancelAnimation(id: string): void {
    this.activeAnimations.delete(id);
  }

  /**
   * Get current playback state for UI display
   */
  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentStep: this.currentStep,
      totalSteps: this.currentTrace?.events.length || 0,
      speed: this.playbackSpeed,
    };
  }

  /**
   * Process all active animations, updating their state each frame
   * Called automatically from animationLoop
   */
  private updateAnimations(): void {
    const now = performance.now();
    const completedIds: string[] = [];

    for (const [id, anim] of this.activeAnimations.entries()) {
      const elapsed = now - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1.0);
      const easedProgress = anim.easing(progress);

      anim.onUpdate(easedProgress);

      if (progress >= 1.0) {
        anim.onComplete?.();
        completedIds.push(id);
      }
    }

    // Clean up completed animations
    completedIds.forEach((id) => this.activeAnimations.delete(id));
  }

  /**
   * Emit current playback state to event bus
   */
  private emitPlaybackState() {
    globalEventBus.emit({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      step: this.currentStep,
      type: 'SYSTEM_PLAYBACK_STATE',
      isPlaying: this.isPlaying,
      currentStep: this.currentStep,
      totalSteps: this.currentTrace ? this.currentTrace.events.length : 0,
      speed: this.playbackSpeed,
      deltaTime: 16, // Approximate ms per frame at 60fps
    } as any);
  }

  /**
   * RAF-based animation loop using deltaTime accumulation for frame-rate independence
   * Ensures smooth timing regardless of browser/monitor refresh rate
   */
  private animationLoop = (currentTime: number) => {
    if (!this.isPlaying) return;

    // Calculate precise deltaTime since last frame
    const deltaTime = this.lastFrameTime ? currentTime - this.lastFrameTime : 16;
    this.lastFrameTime = currentTime;

    // Accumulate time for algorithm step scheduling
    this.accumulatedTime += deltaTime;

    // Calculate adjusted tick interval based on current playback speed
    const adjustedTickMs = this.baseTickMs / this.playbackSpeed;

    // Process algorithm steps when enough time has accumulated
    while (this.accumulatedTime >= adjustedTickMs && this.isPlaying) {
      this.stepForward();
      this.accumulatedTime -= adjustedTickMs;
    }

    // Update all active animations (edge highlights, transitions, etc.)
    this.updateAnimations();

    // Emit frame event with precise deltaTime for subscribers
    globalEventBus.emit({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      step: this.currentStep,
      type: 'ANIMATION_FRAME',
      deltaTime,
      speed: this.playbackSpeed,
    } as any);

    // Continue loop if still playing
    if (this.isPlaying) {
      this.rafId = requestAnimationFrame(this.animationLoop);
    }
  };
}

export const globalEngine = new AnimationEngine();
