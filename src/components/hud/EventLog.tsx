import { useEffect, useState, useRef } from "react";
import { globalEventBus } from "../../core/EventBus";
import type { VisualizationEvent } from "../../types";
import { useUIStore } from "../../store/uiStore";
import { getTranslation } from "../../data/translations";
import { Terminal as TerminalIcon, Trash2 } from "lucide-react";

interface LogEntry {
  id: string;
  message: React.ReactNode;
}

export default function EventLog() {
  const language = useUIStore((state) => state.language);
  const t = getTranslation(language);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init",
      message: (
        <span className="text-emerald-400 font-medium">
          {t.terminal.initialized}
        </span>
      ),
    },
    {
      id: "wait",
      message: (
        <span className="text-slate-500 font-medium">{t.terminal.waiting}</span>
      ),
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const formatEvent = (e: VisualizationEvent): React.ReactNode | null => {
      switch (e.type) {
        case "SYSTEM_LOG": {
          const color =
            e.level === "ERROR"
              ? "text-rose-400 font-bold"
              : e.level === "WARN"
                ? "text-amber-400 font-semibold"
                : "text-cyan-400";
          return <span className={color}>[SYS] {e.message}</span>;
        }
        case "ARRAY_COMPARE":
          return (
            <span className="text-slate-400">
              [SORT] Compared elements at indices [{e.indices[0]},{" "}
              {e.indices[1]}]
            </span>
          );
        case "ARRAY_SWAP":
          return (
            <span className="text-ice-blue font-semibold">
              [SORT] Swapped values {e.values[0]} ⇄ {e.values[1]}
            </span>
          );
        case "ARRAY_SET":
          return (
            <span className="text-purple-400">
              [SORT] Set index {e.index} to {e.value}
            </span>
          );
        case "SEARCH_CHECK":
          return (
            <span className="text-amber-400 font-medium">
              [SEARCH] Comparing element {e.value} at index [{e.index}] with
              target {e.target}
            </span>
          );
        case "SEARCH_FOUND":
          return (
            <span className="text-emerald-400 font-bold">
              [SEARCH] Target element {e.value} found at index [{e.index}]!
            </span>
          );
        case "SEARCH_NOT_FOUND":
          return (
            <span className="text-rose-400 font-bold">
              [SEARCH] Element {e.target} was not found in the array.
            </span>
          );
        case "SEARCH_NARROW":
          return (
            <span className="text-cyan-400">
              [SEARCH] Narrowed bounds to [{e.left}, {e.right}] with middle
              index [{e.mid}]
            </span>
          );
        case "TRACE_LOADED":
          return (
            <span className="text-teal-300 font-semibold">
              [DATA] Trace for {e.metadata.algorithmName} loaded successfully.
            </span>
          );
        case "GRAPH_NODE_HIGHLIGHT":
          return (
            <span className="text-emerald-400">
              [GRAPH] Visiting node "{e.nodeId}"
            </span>
          );
        case "GRAPH_EDGE_HIGHLIGHT":
          return (
            <span className="text-amber-400">
              [GRAPH] Traversing edge "{e.edgeId}"
            </span>
          );
        default:
          return null;
      }
    };

    const unsubscribe = globalEventBus.subscribe((e) => {
      if (e.isReverse) return;
      const msg = formatEvent(e);
      if (msg) {
        setLogs((prev) => {
          const generateId = () =>
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(7);
          if (e.type === "TRACE_LOADED") {
            return [{ id: e.id || generateId(), message: msg }];
          }
          const newLogs = [...prev, { id: e.id || generateId(), message: msg }];
          return newLogs.length > 50
            ? newLogs.slice(newLogs.length - 50)
            : newLogs;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const clearLogs = () => {
    setLogs([
      {
        id: "cleared",
        message: (
          <span className="text-slate-500 italic">{t.terminal.cleared}</span>
        ),
      },
    ]);
  };

  return (
    <div className="h-48 glass-panel flex flex-col border border-glacier-border-bright rounded-2xl bg-glacier-bg overflow-hidden shadow-2xl shadow-black/50 group/panel">
      {/* Windows CMD Style Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-glacier-surface border-b border-glacier-border-bright select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <TerminalIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-sans font-medium text-slate-400 select-none">
              {t.terminal.header}
            </span>
          </div>
        </div>

        <button
          onClick={clearLogs}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          title="Clear console output"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="font-sans">cls</span>
        </button>
      </div>

      {/* Terminal Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 pr-2 scrollbar-thin scrollbar-thumb-white/10 bg-black/40">
        {logs.map((log) => (
          <div
            key={log.id}
            className="text-[12px] font-mono leading-tight tracking-normal select-text"
          >
            {log.message}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
