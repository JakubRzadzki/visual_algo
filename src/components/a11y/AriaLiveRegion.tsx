import { useEffect, useState } from "react";
import { globalEventBus } from "../../core/EventBus";
import type { VisualizationEvent } from "../../types";

export default function AriaLiveRegion() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const textifyEvent = (e: VisualizationEvent): string | null => {
      switch (e.type) {
        case "SYSTEM_LOG":
          return `System message: ${e.message}`;
        case "ARRAY_COMPARE":
          return `Comparing array elements at indices ${e.indices[0]} and ${e.indices[1]}`;
        case "ARRAY_SWAP":
          return `Swapping array values ${e.values[0]} and ${e.values[1]}`;
        case "ARRAY_SET":
          return `Setting array index ${e.index} to ${e.value}`;
        case "TRACE_LOADED":
          return `Algorithm data loaded for ${e.metadata.algorithmName}`;
        default:
          return null;
      }
    };

    const unsubscribe = globalEventBus.subscribe((e) => {
      const msg = textifyEvent(e);
      if (msg) {
        setMessages((prev) => {
          // Keep only the latest few messages to prevent massive DOM growth
          const updated = [...prev, msg];
          return updated.length > 5
            ? updated.slice(updated.length - 5)
            : updated;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="sr-only" aria-live="assertive" aria-atomic="true">
      {messages.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
}
