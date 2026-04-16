import { VisualizationEvent } from '../types';

type EventListener = (event: VisualizationEvent) => void;

export class AnimationEventBus {
  private listeners: EventListener[] = [];
  
  public emit(event: VisualizationEvent): void {
    // Synchronously dispatch to all listeners
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    // Return unsubscribe callback
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public clearSubscribers(): void {
    this.listeners = [];
  }
}

// Single Source of Truth globally
export const globalEventBus = new AnimationEventBus();
