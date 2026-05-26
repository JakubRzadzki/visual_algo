import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUIStore } from "../../store/uiStore";
import { useTreeStore } from "../../store/treeStore";
import { findAlgorithm } from "../../data/algorithmCatalog";
import { globalEngine } from "../../core/AnimationEngine";
import { globalEventBus } from "../../core/EventBus";
import Sidebar from "../layout/Sidebar";
import { globalWorkerPool } from "../../core/WorkerPool";

import GraphStage from "../visualizer/GraphStage";
import SortingStage from "../visualizer/SortingStage";
import SearchingStage from "../visualizer/SearchingStage";
import MatrixStage from "../visualizer/MatrixStage";
import GridStage from "../visualizer/GridStage";
import MonacoCodeEditor from "../hud/MonacoCodeEditor";
import EventLog from "../hud/EventLog";
import AlgorithmInfoPanel from "../hud/AlgorithmInfoPanel";
import PlaybackDeck from "../controls/PlaybackDeck";
import { getAlgorithmEducation } from "../../data/algorithmEducation";
import type { GraphInput } from "../../types";

// Demo graph nodes / edges — will be replaced when user generates a new graph
const DEMO_NODES = Array.from({ length: 8 }, (_, i) => ({
  id: `n${i}`,
  label: String(i),
  x: Math.cos((i / 8) * Math.PI * 2) * 150,
  y: Math.sin((i / 8) * Math.PI * 2) * 150,
  vx: 0,
  vy: 0,
}));
const DEMO_EDGES = DEMO_NODES.map((_, i) => ({
  id: `e${i}`,
  from: `n${i}`,
  to: `n${(i + 1) % DEMO_NODES.length}`,
  weight: Math.floor(Math.random() * 15) + 1,
}));
const DEMO_GRAPH: GraphInput = {
  nodes: DEMO_NODES,
  edges: DEMO_EDGES,
  startNodeId: "n0",
};

/** Default width of the Monaco editor panel in pixels. */
const DEFAULT_EDITOR_WIDTH = 700;

/** Minimum allowed width of the Monaco editor panel in pixels. */
const MIN_EDITOR_WIDTH = 320;

/** Maximum allowed width of the Monaco editor panel in pixels. */
const MAX_EDITOR_WIDTH = 1400;

/**
 * AlgorithmViewer handles the main visualization layout and routing.
 *
 * It manages the split-pane layout between the visualization stage
 * and the right panel holding the code editor and event log.
 * The panel is resizable, with custom dragging logic and persistence.
 *
 * @returns The main layout containing stages, editor, logs, and playback controls.
 */
export default function AlgorithmViewer(): React.ReactElement {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const {
    isSidebarOpen,
    activeMode,
    currentGraph,
    activeGraphAlgorithm,
    setActiveMode,
    setActiveSortingAlgorithm,
    setActiveSearchingAlgorithm,
    setActiveGraphAlgorithm,
    setActiveGridAlgorithm,
  } = useUIStore();
  const language = useUIStore((state) => state.language);
  const educationData = getAlgorithmEducation(id || "", language);

  const graphToDisplay = currentGraph || DEMO_GRAPH;

  // Resizable Monaco Code Editor layout state
  const [editorWidth, setEditorWidth] = useState<number>(() => {
    const saved = localStorage.getItem("visual-algo-editor-width");
    return saved ? parseInt(saved, 10) : DEFAULT_EDITOR_WIDTH;
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  /**
   * Initiates the resizing interaction on mouse down.
   * Prevents default text selection during drag operations.
   *
   * @param e - The mouse event triggered on the divider handle.
   */
  const startResize = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setIsDragging(true);
    },
    [],
  );

  // Sync route params with visualizer active mode and algorithm selection
  useEffect(() => {
    console.log(
      "AlgorithmViewer useEffect running for category:",
      category,
      "id:",
      id,
    );
    if (!category || !id) return;

    let match;

    // Skip catalog enforcement for trees as their state is managed by 'useTreeStore'
    if (category !== "trees") {
      match = findAlgorithm(category, id);
      if (!match || !match.algorithm.available) {
        navigate("/", { replace: true });
        return;
      }
    }

    if (globalEngine.reset) {
      globalEngine.reset();
    } else {
      globalEngine.pause();
    }
    useUIStore.getState().setIsAnimating(false);

    if (category === "sorting") {
      setActiveMode("sorting");
      setActiveSortingAlgorithm(match?.algorithm.name || "");
    } else if (category === "searching") {
      setActiveMode("searching");
      setActiveSearchingAlgorithm(match?.algorithm.name || "");
    } else if (category === "graphs") {
      setActiveMode("graph");
      setActiveGraphAlgorithm(match?.algorithm.name || "");
    } else if (category === "trees") {
      setActiveMode("tree");
      useTreeStore.getState().setTreeType(id as any);
      
      // Auto-populate tree graph and load the default trace immediately
      (async () => {
        try {
          const algoId = id === "rbt" ? "rbt" : id === "trie" ? "trie" : id || "";
          const defaultValues = id === "trie" ? ["cat", "car", "dog"] : [15, 10, 20, 8, 12, 17, 25];
          const trace = await globalWorkerPool.run(algoId, { values: defaultValues } as any);
          if (trace && trace.metadata && trace.metadata.initialGraph) {
            useUIStore.getState().setCurrentGraph(trace.metadata.initialGraph);
            globalEngine.loadTrace(trace);
          }
        } catch (e) {
          console.error("Failed to pre-populate tree layout:", e);
        }
      })();
    } else if (category === "dp") {
      setActiveMode("dp");
    } else {
      setActiveMode("grid");
      setActiveGridAlgorithm(match?.algorithm.name || "");
    }
  }, [
    category,
    id,
    navigate,
    setActiveMode,
    setActiveSortingAlgorithm,
    setActiveSearchingAlgorithm,
    setActiveGraphAlgorithm,
  ]);

  // Listen for graph updates from the sandbox
  useEffect(() => {
    const unsub = globalEventBus.subscribe((e: any) => {
      if (e.type === "TRACE_LOADED" && e.metadata && e.metadata.initialGraph) {
        useUIStore.getState().setCurrentGraph(e.metadata.initialGraph);
      }
    });
    return () => unsub();
  }, []);

  // Handle dragging mouse move and mouse up globally
  useEffect(() => {
    if (!isDragging) return;

    /**
     * Updates the editor panel width dynamically based on cursor position.
     *
     * @param e - Global mouse move event.
     */
    const handleMouseMove = (e: MouseEvent): void => {
      // Calculate new width relative to the right edge of the viewport
      const newWidth = window.innerWidth - e.clientX - 24; // 24px matches layout padding (px-6)

      // Enforce minimum and maximum constraints
      const maxAllowedWidth = Math.min(
        window.innerWidth * 0.75,
        MAX_EDITOR_WIDTH,
      );
      if (newWidth >= MIN_EDITOR_WIDTH && newWidth <= maxAllowedWidth) {
        setEditorWidth(newWidth);
      }
    };

    /**
     * Concludes the resizing interaction and persists the preferred width.
     */
    const handleMouseUp = (): void => {
      setIsDragging(false);
      localStorage.setItem("visual-algo-editor-width", editorWidth.toString());
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, editorWidth]);

  /**
   * Determine which stage to render based on the active mode.
   *
   * @returns React element representing the visualization stage.
   */
  const renderStage = (): React.ReactElement => {
    console.log(
      "renderStage called. activeMode:",
      activeMode,
      "category:",
      category,
      "id:",
      id,
    );
    switch (activeMode) {
      case "graph":
        return (
          <GraphStage
            key={id}
            nodes={graphToDisplay.nodes}
            edges={graphToDisplay.edges}
            isDirected={
              graphToDisplay.isDirected !== undefined
                ? graphToDisplay.isDirected
                : activeGraphAlgorithm !== "Kruskal's MST" &&
                  activeGraphAlgorithm !== "Prim's MST"
            }
            layoutHint={graphToDisplay.layoutHint}
          />
        );
      case "sorting":
        return <SortingStage key={id} />;
      case "searching":
        return <SearchingStage key={id} />;
      case "dp":
        return <MatrixStage key={id} />;
      case "tree":
        return (
          <GraphStage
            key={id}
            nodes={graphToDisplay.nodes}
            edges={graphToDisplay.edges}
            isDirected={true}
            layoutHint={graphToDisplay.layoutHint}
          />
        );
      case "grid":
        return <GridStage key={id} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-slate-500 italic">
            Select an algorithm to begin
          </div>
        );
    }
  };

  return (
    <div className="pt-20 pb-8 px-6 h-screen w-full flex gap-4 relative z-10 transition-all duration-300">
      {/* Dragging global overlay to absorb mouse movements across frames/editors */}
      {isDragging && (
        <div className="fixed inset-0 z-[9999] cursor-col-resize select-none pointer-events-auto" />
      )}

      {isSidebarOpen && <Sidebar />}

      <div
        data-tutorial-step="algorithm-viewer"
        className="flex-1 flex flex-col relative rounded-2xl overflow-hidden glass-panel-elevated border border-glacier-border-bright shadow-2xl"
      >
        {renderStage()}
      </div>

      {/* Resizable Divider Handle */}
      <div
        onMouseDown={startResize}
        className={`hidden lg:flex items-center justify-center w-2 h-full cursor-col-resize select-none group relative transition-colors ${
          isDragging ? "bg-cyan-500/10" : "hover:bg-cyan-500/5"
        }`}
      >
        <div
          className={`w-[2px] h-12 rounded-full transition-all duration-200 ${
            isDragging
              ? "bg-cyan-400 h-24 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              : "bg-slate-700/50 group-hover:bg-cyan-400 group-hover:h-16"
          }`}
        />
      </div>

      <aside
        style={{ width: `${editorWidth}px` }}
        className="hidden lg:flex flex-col gap-4 h-full shrink-0 overflow-hidden pb-4"
      >
        <MonacoCodeEditor />
        <AlgorithmInfoPanel data={educationData} />
        <EventLog />
      </aside>

      {/* Global Playback Controls (Only rendered if NOT in sorting mode) */}
      {activeMode !== "sorting" && <PlaybackDeck />}
    </div>
  );
}
