import { VisualizationEvent } from '../types';
import { globalEventBus } from './EventBus';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  
  // For standard mock arrays right now
  private array: number[] = [];
  
  private unsubscribe: (() => void) | null = null;
  private targetEvents: VisualizationEvent[] = []; // simple event queue for batch rendering
  private rafId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!; // alpha: false for pure rendering perf if bg is solid
    this.width = canvas.width;
    this.height = canvas.height;

    // Load initial random state for testing
    this.array = Array.from({ length: 50 }, () => Math.floor(Math.random() * 80) + 10);
  }

  public init() {
    this.unsubscribe = globalEventBus.subscribe(this.handleEvent);
    this.renderLoop();
  }

  public destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.render(); // Immediate draw on resize to avoid flicker
  }

  private handleEvent = (event: VisualizationEvent) => {
    // We queue events for the RAF loop to process
    this.targetEvents.push(event);
  };

  private applyEvents() {
    if (this.targetEvents.length === 0) return;
    // Process events (e.g. ARRAY_SWAP)
    for (const event of this.targetEvents) {
      if (event.type === 'ARRAY_SWAP') {
        const [i, j] = event.indices;
        const temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
      } else if (event.type === 'ARRAY_SET') {
        this.array[event.index] = event.value;
      }
    }
    this.targetEvents = [];
  }

  private render() {
    // Pure Canvas High Perf Rendering 
    this.ctx.fillStyle = '#0a0e1a'; // Match glacier bg (since it's on foreground)
    // Wait, if it's on foreground and needs glass effect, we must use clearRect
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw columns
    const barWidth = (this.width / this.array.length) * 0.8;
    const spacing = (this.width / this.array.length) * 0.2;
    const maxHeight = this.height * 0.8;

    this.ctx.fillStyle = '#7dd3fc'; // ice-blue

    this.array.forEach((val, i) => {
      // Normalize height (assuming max val is around 100)
      const h = (val / 100) * maxHeight;
      const x = i * (barWidth + spacing) + spacing / 2;
      const y = this.height - h - 10;
      
      this.ctx.fillRect(x, y, barWidth, h);
    });
  }

  private renderLoop = () => {
    this.applyEvents();
    this.render();
    this.rafId = requestAnimationFrame(this.renderLoop);
  };
}
