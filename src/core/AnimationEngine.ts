import { ExecutionTrace, AlgorithmPlugin } from '../types';
import { globalEventBus } from './EventBus';

export class AnimationEngine {
  private currentTrace: ExecutionTrace | null = null;
  private currentStep: number = 0;
  private isPlaying: boolean = false;
  private playbackSpeed: number = 1.0;
  private tickInterval: number | null = null;
  private readonly baseTickMs = 500; // 500ms at 1.0x speed

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
      type: 'SYSTEM_LOG',
      level: 'INFO',
      message: `Loaded trace for ${trace.metadata.algorithmName} with ${trace.events.length} steps.`
    });
  }

  public play(): void {
    if (!this.currentTrace || this.isPlaying || this.currentStep >= this.currentTrace.events.length) return;
    this.isPlaying = true;
    this.scheduleNextTick();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.tickInterval) {
      clearTimeout(this.tickInterval);
      this.tickInterval = null;
    }
  }

  public stepForward(): void {
    if (!this.currentTrace || this.currentStep >= this.currentTrace.events.length) return;
    const event = this.currentTrace.events[this.currentStep];
    globalEventBus.emit(event);
    this.currentStep++;
  }

  public seekTo(stepIndex: number): void {
    if (!this.currentTrace) return;
    const target = Math.max(0, Math.min(stepIndex, this.currentTrace.events.length));
    
    // In advanced systems, we either re-apply diffs tracking forwards from 0
    // or use reverse payload interpolation mapped for Step 6.
    this.currentStep = target;
    this.pause();
  }

  public setSpeed(multiplier: number): void {
    this.playbackSpeed = Math.max(0.25, Math.min(multiplier, 4.0));
  }

  private scheduleNextTick = () => {
    if (!this.isPlaying) return;
    
    this.stepForward();
    
    if (this.currentTrace && this.currentStep < this.currentTrace.events.length) {
      const waitTime = this.baseTickMs / this.playbackSpeed;
      this.tickInterval = window.setTimeout(this.scheduleNextTick, waitTime);
    } else {
      this.pause();
    }
  };
}
