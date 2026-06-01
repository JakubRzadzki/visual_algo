# Algorithm Visualizer EDVR

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://react.dev/)
[![Go](https://img.shields.io/badge/Go-1.21-00ADD8?logo=go&logoColor=white&style=for-the-badge)](https://go.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white&style=for-the-badge)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white&style=for-the-badge)](https://www.postgresql.org/)
[![Zustand](https://img.shields.io/badge/Zustand-State-orange?style=for-the-badge)](https://github.com/pmndrs/zustand)

A full-stack algorithm execution engine that compiles, runs, and visualizes user-submitted code in real-time. Built with a physics-driven canvas UI and encapsulated in a secure, sandboxed multi-container Docker ecosystem.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Supported Algorithms](#supported-algorithms)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)
6. [Engineering Details](#engineering-details)
7. [Design Patterns](#design-patterns)
8. [Project Structure](#project-structure)

---

## Overview

EDVR (Educational Digital Visualizer Engine) is a production-grade system for safely executing untrusted C++ and Python code, capturing structured execution traces, and replaying them with frame-accurate animations at 60 FPS.

The project has two operating modes:
- **Offline mode** -- algorithms run client-side via Web Worker plugins (no backend required).
- **Online mode** -- user code is compiled and executed inside ephemeral Docker containers with full network isolation, memory caps, and CPU limits.

Key properties:
- Sandbox isolation via Docker containers with `NetworkDisabled: true`, 256 MB memory cap, 0.5 CPU limit, 10s watchdog.
- Custom `AnimationEventBus` bypasses React re-renders entirely -- SVG nodes are updated imperatively via `useRef` + Framer Motion controls.
- Web Worker pool offloads trace parsing and force-directed graph layout off the main thread.
- Bilingual interface (Polish / English) with a full interactive tutorial system.

---

## Tech Stack

```
+------------------------------------------------------------------------+
|                         FRONTEND (SPA)                                 |
|          React 19  |  Zustand  |  Framer Motion  |  Vite  |  TailwindCSS  |
+------------------------------------+-----------------------------------+
                                     | Web Workers (WorkerPool)
                                     v
+------------------------------------------------------------------------+
|                         BACKEND API                                    |
|                      Go 1.21  |  Gin  |  GORM                         |
+------------------------------------+-----------------------------------+
                                     | Docker Daemon API
                                     v
+------------------------------------------------------------------------+
|                    SECURE EXECUTION SANDBOX                             |
|          Ephemeral Docker Containers (gcc:13 / python:3.10-slim)       |
|         Memory: 256 MB  |  Network: disabled  |  Timeout: 10s         |
+------------------------------------------------------------------------+
                                     |
                                     v
+------------------------------------------------------------------------+
|                         DATABASE                                       |
|                    PostgreSQL 15 (snapshots)                            |
+------------------------------------------------------------------------+
```

| Layer | Technology | Reason |
| :--- | :--- | :--- |
| Frontend | React 19 + Zustand | Lightweight global state without context re-render overhead |
| Animations | Framer Motion + SVG | Physics-based spring animations that bypass React reconciliation |
| Backend | Go / Gin | Low memory footprint, native goroutine concurrency, direct Docker daemon integration |
| Sandbox | Docker containers | Sub-50ms startup, cgroups/namespaces isolation, instant teardown |
| Database | PostgreSQL 15 | Snapshot persistence via GORM with in-memory fallback |

---

## Supported Algorithms

### Sorting
- Bubble Sort
- Merge Sort
- Quick Sort
- Heap Sort

### Graph
- BFS (Breadth-First Search)
- DFS (Depth-First Search)
- Dijkstra's Shortest Path
- Kruskal's MST
- Prim's MST
- Topological Sort

### Trees
- Binary Tree traversal
- Binary Search Tree (BST)
- AVL Tree (with rotations)
- Red-Black Tree
- Max Heap
- Trie
- Union-Find (Disjoint Set)

### Grid / Pathfinding
- A* Search
- Flood Fill

### Dynamic Programming
- 0/1 Knapsack
- Longest Common Subsequence (LCS)

### Searching
- Linear Search
- Binary Search

Each algorithm has implementations in three forms:
- **TypeScript plugin** (`src/core/plugins/`) -- runs client-side in Web Workers.
- **Python source** (`src/algorithms/python/`) -- runs in Docker sandbox.
- **C++ source** (`src/algorithms/cpp/`) -- runs in Docker sandbox.

---

## Architecture

> **System**: Algorithm Visualizer EDVR
> **Stack**: React 19 + Zustand + Vite (Frontend) · Go + Gin + GORM (Backend) · PostgreSQL + Docker (Infra)

---

### Class Diagram

```mermaid
classDiagram
    direction TB

    %% ── Core Types ──────────────────────────────────────────────────

    class BaseEvent {
        <<type>>
        +id: string
        +timestamp: number
        +step: number
        +eventSource: string
        +lineNumber: number
        +isReverse: boolean
    }

    class EventPayload {
        <<union>>
        +type: string
    }

    class VisualizationEvent {
        <<alias>>
    }

    class TraceMetadata {
        <<type>>
        +timeComplexity: string
        +spaceComplexity: string
        +executionTimeMs: number
        +nodeCount: number
        +algorithmName: string
        +initialState: any
    }

    class ExecutionTrace {
        <<type>>
        +events: list
        +metadata: TraceMetadata
    }

    %% ── Plugin Interface ────────────────────────────────────────────

    class AlgorithmPlugin {
        <<interface>>
        +id: string
        +name: string
        +category: string
        +execute(data: any): ExecutionTrace
    }

    %% ── Input / Data Types ──────────────────────────────────────────

    class GraphNode {
        <<interface>>
        +id: string
        +label: string
        +x: number
        +y: number
        +vx: number
        +vy: number
    }

    class GraphEdge {
        <<interface>>
        +id: string
        +from: string
        +to: string
        +weight: number
    }

    class GraphInput {
        <<interface>>
        +nodes: list
        +edges: list
        +startNodeId: string
    }

    class ArrayInput {
        <<interface>>
        +values: list
    }

    class GridInput {
        <<interface>>
        +width: number
        +height: number
        +walls: list
    }

    class MatrixInput {
        <<interface>>
        +rows: number
        +cols: number
        +values: list
    }

    class VisualizationData {
        <<union>>
    }

    %% ── Animation Core ──────────────────────────────────────────────

    class AnimationEventBus {
        -listeners: list
        +emit(event: VisualizationEvent): void
        +subscribe(listener: any): Function
        +clearSubscribers(): void
    }

    class AnimationEngine {
        -currentTrace: ExecutionTrace
        -currentStep: number
        -isPlaying: boolean
        -playbackSpeed: number
        -rafId: number
        -lastFrameTime: number
        -accumulatedTime: number
        #baseTickMs: number
        -activeAnimations: Map
        -animationIdCounter: number
        +generateTraceWithWatchdog(plugin: any, input: any, timeout: number): Promise
        +loadTrace(trace: ExecutionTrace): void
        +play(): void
        +pause(): void
        +stepForward(): void
        +stepBackward(): void
        +seekTo(stepIndex: number): void
        +setSpeed(multiplier: number): void
        +scheduleAnimation(duration: number, onUpdate: any, easing: any, onComplete: any): string
        +cancelAnimation(id: string): void
        +getState(): PlaybackState
        -updateAnimations(): void
        -emitPlaybackState(): void
        -animationLoop(currentTime: number): void
    }

    class Easing {
        <<module>>
        +linear(t: number): number
        +easeOut(t: number): number
        +easeInOut(t: number): number
        +easeOutQuad(t: number): number
        +easeInQuad(t: number): number
    }

    %% ── Worker Pool ─────────────────────────────────────────────────

    class WorkerPool {
        -pool: list
        -taskQueue: list
        -pending: Map
        #maxWorkers: number
        +run(algorithmId: string, payload: GraphInput): Promise
        +destroy(): void
        -spawnWorkers(): void
        -dispatch(pw: any, message: any, resolve: any, reject: any): void
        -handleWorkerMessage(pw: any, response: any): void
        -handleWorkerError(pw: any, error: any): void
        -drainQueue(pw: any): void
    }

    class WorkerMessage {
        <<interface>>
        +taskId: string
        +algorithmId: string
        +payload: GraphInput
    }

    class WorkerResponse {
        <<union>>
        +taskId: string
        +status: string
        +trace: ExecutionTrace
        +message: string
    }

    %% ── State Management ────────────────────────────────────────────

    class useUIStore {
        <<store>>
        +theme: string
        +animationSpeed: number
        +isSidebarOpen: boolean
        +isDebugVisible: boolean
        +activeCategory: string
        +activeSortingAlgorithm: string
        +activeGraphAlgorithm: string
        +activeMode: string
        +isAnimating: boolean
        +visualizationData: VisualizationData
        +currentGraph: GraphInput
        +isLoading: boolean
        +shareLink: string
        +setAnimationSpeed(speed: number): void
        +toggleSidebar(): void
        +toggleDebug(): void
        +setActiveCategory(cat: string): void
        +setActiveSortingAlgorithm(algo: string): void
        +setActiveGraphAlgorithm(algo: string): void
        +setActiveMode(mode: string): void
        +setIsAnimating(v: boolean): void
        +setVisualizationData(data: VisualizationData): void
        +setCurrentGraph(graph: GraphInput): void
        +setIsLoading(v: boolean): void
        +setShareLink(link: string): void
    }

    %% ── UI Components ───────────────────────────────────────────────

    class App {
        <<component>>
        +render(): JSX
    }

    class Dashboard {
        <<component>>
        +render(): JSX
    }

    class VisualizerPage {
        <<component>>
        +render(): JSX
    }

    class Navbar {
        <<component>>
    }

    class Sidebar {
        <<component>>
    }

    class VisualStage {
        <<component>>
    }

    class GraphStage {
        <<component>>
        +nodes: list
        +edges: list
    }

    class MonacoCodeEditor {
        <<component>>
    }

    class EventLog {
        <<component>>
    }

    class PlaybackDeck {
        <<component>>
    }

    class AmbientGraph {
        <<component>>
    }

    %% ── Algorithm Catalog ───────────────────────────────────────────

    class AlgorithmCatalog {
        <<module>>
        +ALGORITHM_CATALOG: list
        +findAlgorithm(categoryId: string, algoId: string): any
        +getAllAlgorithms(): list
    }

    class CategoryEntry {
        <<interface>>
        +id: string
        +label: string
        +iconImage: string
        +color: string
        +borderColor: string
        +glowColor: string
        +algorithms: list
    }

    class AlgorithmEntry {
        <<interface>>
        +id: string
        +name: string
        +shortName: string
        +description: string
        +timeComplexity: string
        +spaceComplexity: string
        +available: boolean
    }

    %% ── Plugin Implementations ──────────────────────────────────────

    class MergeSortPlugin {
        +id: string
        +name: string
        +category: string
        +execute(data: ArrayInput): ExecutionTrace
    }

    class QuickSortPlugin {
        +id: string
        +name: string
        +category: string
        +execute(data: ArrayInput): ExecutionTrace
    }

    class DijkstraPlugin {
        +id: string
        +name: string
        +category: string
        +execute(data: GraphInput): ExecutionTrace
    }

    class KruskalPlugin {
        +id: string
        +name: string
        +category: string
        +execute(data: GraphInput): ExecutionTrace
    }

    %% ── Backend ─────────────────────────────────────────────────────

    class GoBackend {
        <<server>>
        -db: DB
        +SaveSnapshot(): void
        +GetSnapshot(): void
        +RunCodeInSandbox(): void
    }

    class Snapshot {
        <<model>>
        +ID: string
        +Data: string
        +CreatedAt: Time
    }

    class RunRequest {
        <<struct>>
        +Code: string
        +Language: string
    }

    class RunResponse {
        <<struct>>
        +Trace: list
        +Error: string
        +Output: string
    }

    %% ── Infrastructure ──────────────────────────────────────────────

    class DockerCompose {
        <<infrastructure>>
        +frontend: string
        +api: string
        +db: string
    }

    class SandboxContainer {
        <<container>>
        +image: string
        +networkDisabled: boolean
        +memoryLimit: string
        +cpuLimit: string
        +timeout: string
    }

    %% ── Relationships ───────────────────────────────────────────────

    BaseEvent --> VisualizationEvent : composes
    EventPayload --> VisualizationEvent : composes
    VisualizationEvent --> ExecutionTrace : events
    TraceMetadata --> ExecutionTrace : metadata
    AlgorithmPlugin ..> ExecutionTrace : produces

    GraphNode --> GraphInput : nodes
    GraphEdge --> GraphInput : edges
    GraphInput --> VisualizationData
    ArrayInput --> VisualizationData
    GridInput --> VisualizationData
    MatrixInput --> VisualizationData

    AnimationEngine --> AnimationEventBus : emits via globalEventBus
    AnimationEngine --> ExecutionTrace : consumes
    AnimationEngine --> Easing : uses
    AnimationEngine --> AlgorithmPlugin : executes via watchdog
    WorkerPool --> WorkerMessage : sends to workers
    WorkerPool --> WorkerResponse : receives from workers
    WorkerPool --> ExecutionTrace : resolves promises with

    useUIStore --> VisualizationData : manages
    useUIStore --> GraphInput : legacy alias

    App --> Navbar : renders
    App --> Dashboard : route
    App --> VisualizerPage : route
    VisualizerPage --> Sidebar : renders if open
    VisualizerPage --> VisualStage : sorting mode
    VisualizerPage --> GraphStage : graph mode
    VisualizerPage --> MonacoCodeEditor : aside panel
    VisualizerPage --> EventLog : aside panel
    VisualizerPage --> PlaybackDeck : bottom bar
    VisualizerPage --> AmbientGraph : background

    VisualizerPage --> useUIStore : reads and writes
    MonacoCodeEditor --> useUIStore : reads activeMode and algorithm
    PlaybackDeck --> AnimationEngine : play/pause/seek
    VisualStage --> AnimationEventBus : subscribes
    GraphStage --> AnimationEventBus : subscribes

    AlgorithmEntry --> CategoryEntry : algorithms
    CategoryEntry --> AlgorithmCatalog : ALGORITHM_CATALOG
    Dashboard --> AlgorithmCatalog : reads
    VisualizerPage --> AlgorithmCatalog : findAlgorithm

    AlgorithmPlugin <|.. MergeSortPlugin : implements
    AlgorithmPlugin <|.. QuickSortPlugin : implements
    AlgorithmPlugin <|.. DijkstraPlugin : implements
    AlgorithmPlugin <|.. KruskalPlugin : implements

    GoBackend --> Snapshot : CRUD via GORM
    GoBackend --> RunRequest : binds from body
    GoBackend --> RunResponse : returns JSON

    DockerCompose --> GoBackend : hosts api
    GoBackend --> SandboxContainer : spawns
    DockerCompose --> Snapshot : hosts db
```

---

### Relationship Summary

| From | To | Relationship | Description |
|------|----|-------------|-------------|
| `App.tsx` | `WorkerPool` | uses (singleton) | Offloads algorithm execution to Web Workers |
| `WorkerPool` | `AlgorithmPlugin` | executes | Workers import plugin modules and call `.execute()` |
| `AnimationEngine` | `ExecutionTrace` | consumes | Loads trace and replays events via RAF loop |
| `AnimationEngine` | `AnimationEventBus` | emits | Publishes `VisualizationEvent` to all subscribers |
| `VisualStage` / `GraphStage` | `AnimationEventBus` | subscribes | Listens for events and updates canvas/DOM |
| `MonacoCodeEditor` | `useUIStore` | reads | Determines which algorithm source to display |
| `GoBackend` | `SandboxContainer` | spawns | Creates Docker containers for remote code execution |
| `GoBackend` | `Snapshot` | persists | Saves/loads visualization snapshots via PostgreSQL |

---

### Event Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as VisualizerPage
    participant Store as useUIStore
    participant Pool as WorkerPool
    participant Worker as algo.worker.ts
    participant Plugin as AlgorithmPlugin
    participant Engine as AnimationEngine
    participant Bus as AnimationEventBus
    participant Stage as VisualStage / GraphStage

    User->>UI: Selects algorithm & clicks Play
    UI->>Store: setActiveMode(), setAlgorithm()
    UI->>Pool: pool.run(algorithmId, inputData)
    Pool->>Worker: postMessage(WorkerMessage)
    Worker->>Plugin: plugin.execute(data)
    Plugin-->>Worker: ExecutionTrace
    Worker-->>Pool: WorkerResponse { status: ok, trace }
    Pool-->>UI: Promise resolves with ExecutionTrace
    UI->>Engine: engine.loadTrace(trace)
    UI->>Engine: engine.play()

    loop RAF Animation Loop
        Engine->>Engine: accumulate deltaTime
        Engine->>Engine: stepForward()
        Engine->>Bus: emit(VisualizationEvent)
        Bus->>Stage: listener callback
        Stage->>Stage: update canvas / DOM
    end
```

---

### File Mapping

| UML Class | File Path |
|-----------|-----------|
| `AlgorithmPlugin<T>` | `src/types.ts` |
| `ExecutionTrace` | `src/types.ts` |
| `VisualizationEvent` | `src/types.ts` |
| `GraphInput`, `ArrayInput`, etc. | `src/types.ts` |
| `AnimationEngine` | `src/core/AnimationEngine.ts` |
| `AnimationEventBus` | `src/core/EventBus.ts` |
| `WorkerPool` | `src/core/WorkerPool.ts` |
| `useUIStore` | `src/store/uiStore.ts` |
| `AlgorithmCatalog` | `src/data/algorithmCatalog.ts` |
| `MonacoCodeEditor` | `src/components/hud/MonacoCodeEditor.tsx` |
| `GoBackend` | `backend/main.go` |
| `DockerCompose` | `docker-compose.yml` |

---

## Getting Started

### Prerequisites

| Tool | Required for | Minimum version |
| :--- | :--- | :--- |
| Node.js | Frontend development | 18+ |
| npm | Package management | 9+ |
| Docker + Docker Compose | Full-stack deployment / sandbox execution | Docker 24+, Compose v2 |
| Go | Backend development (bare-metal only) | 1.21+ |

### Option A: Frontend only (no Docker)

This is the fastest way to start. The frontend runs standalone -- algorithms execute client-side in Web Workers. Code execution via Docker sandbox will not be available, but all visualizations work.

```bash
# 1. Clone the repository
git clone https://github.com/JakubRzadzki/visual_algo.git
cd visual_algo

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Option B: Full stack with Docker Compose (recommended)

This launches the complete multi-service stack: frontend (Nginx), Go API, and PostgreSQL.

```bash
# 1. Clone the repository
git clone https://github.com/JakubRzadzki/visual_algo.git
cd visual_algo

# 2. Build and start all services
docker-compose up -d --build
```

Once the containers are running:

| Service | URL | Description |
| :--- | :--- | :--- |
| Frontend | `http://localhost:80` | Main application |
| Go API | `http://localhost:8080` | Code execution + snapshot API |
| PostgreSQL | `localhost:5432` | Snapshot storage (user: `user`, password: `password`, db: `visual_algo`) |

To stop everything:

```bash
docker-compose down
```

To stop and also remove the database volume:

```bash
docker-compose down -v
```

### Option C: Backend bare-metal (without Docker Compose)

If you want to run the Go backend outside of Docker (for development), you still need Docker running on the host for the sandbox containers.

```bash
# Terminal 1 -- start the frontend
npm install --legacy-peer-deps
npm run dev

# Terminal 2 -- start the Go backend
cd backend
go mod tidy
go run main.go
```

The backend listens on port `8080`. The Vite dev server proxies `/api` requests to it automatically (configured in `vite.config.ts`).

### Running Tests

```bash
# Frontend unit tests (Vitest)
npm run test

# Backend tests
cd backend
go test ./...
```

### Building for Production

```bash
npm run build
```

Output goes to `dist/`. The Dockerfile uses this output with an Nginx container for production serving.

---

## Engineering Details

### Problem: React re-render trap at high event frequency

Visualizing algorithms like Quick Sort or Dijkstra produces hundreds of trace events per second. Standard React state bindings (`useState`, context) force full-tree re-renders, dropping frame rates to single digits.

**Solution**: A custom `AnimationEventBus` (pub-sub broker) bypasses React's render phase entirely:
1. UI components register mutable `useRef` handles pointing to native SVG DOM nodes.
2. The `AnimationEngine` emits state changes into the event bus via a `requestAnimationFrame` loop.
3. Subscribers call imperative Framer Motion `useAnimation` controls directly on the mutable refs -- no React reconciliation involved.

### Problem: Remote Code Execution security

Executing raw user-submitted C++ and Python opens the system to fork bombs, filesystem exploitation, memory exhaustion, and network abuse.

**Solution**: Ephemeral Docker containers with:
- `NetworkDisabled: true` -- no outbound or local socket access.
- Memory hard-capped at 256 MB via Linux cgroups.
- CPU throttled to 0.5 cores (`NanoCPUs: 500000000`).
- Go-routine watchdog kills the container after 10 seconds, returning `408 Request Timeout`.
- Containers are force-removed after execution regardless of outcome.

When Docker is unavailable, the backend falls back to direct host execution (development convenience only).

### Problem: Main thread blocking

Parsing large execution traces and computing force-directed graph layouts blocks the browser event loop.

**Solution**: A `WorkerPool` using HTML5 Web Workers handles all heavy computation off-thread. The main thread receives only computed state snapshots, preserving 60 FPS.

---

## Design Patterns

### Trace Protocol

Communication between backend and frontend follows a structured JSON trace protocol. During execution, the program writes JSON lines to stdout. The backend collects them into an `ExecutionTrace`:

```json
{
  "type": "ELEMENT_SWAP",
  "step": 42,
  "lineNumber": 15,
  "payload": {
    "indexA": 3,
    "indexB": 7,
    "currentValues": [12, 19, 24, 45, 99]
  }
}
```

### Strategy Pattern

New algorithms are added as isolated plugins implementing the `AlgorithmPlugin<T>` interface:

```typescript
export interface AlgorithmPlugin<T> {
  id: string;
  name: string;
  category: "sorting" | "graph" | "tree" | "dp";
  execute(data: T): ExecutionTrace;
}
```

Plugins register themselves with the `AlgorithmCatalog` without modifying core state machines or rendering stages.

---

## Project Structure

```
visual_algo/
├── backend/
│   ├── Dockerfile          # Go API container
│   ├── main.go             # Gin server, snapshot CRUD, Docker sandbox RCE
│   └── main_test.go
├── public/
│   └── images/categories/  # Dashboard category icons
├── src/
│   ├── algorithms/
│   │   ├── cpp/            # C++ algorithm sources (sandbox execution)
│   │   ├── python/         # Python algorithm sources (sandbox execution)
│   │   └── source/         # TypeScript reference sources (editor display)
│   ├── components/
│   │   ├── background/     # AmbientGraph animated background
│   │   ├── controls/       # Playback controls
│   │   ├── dashboard/      # Algorithm catalog grid
│   │   ├── hud/            # MonacoCodeEditor, EventLog, stats panels
│   │   ├── layout/         # Navbar, Sidebar
│   │   ├── presentation/   # Presentation/demo mode overlay
│   │   ├── tutorial/       # Interactive tutorial system
│   │   └── visualizer/     # Graph stage (Cytoscape), grid, DP matrix, tree renderers
│   ├── core/
│   │   ├── AnimationEngine.ts
│   │   ├── EventBus.ts
│   │   ├── WorkerPool.ts
│   │   ├── plugins/        # All algorithm plugin implementations (TS)
│   │   └── workers/        # Web Worker entry points
│   ├── data/               # Algorithm catalog, educational content, i18n
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # VisualizerPage, ShareLoader
│   ├── sorting/            # Standalone sorting visualizer module
│   ├── store/              # Zustand stores (uiStore, tutorialStore)
│   ├── types/              # TypeScript type definitions
│   ├── types.ts            # Core domain types
│   └── App.tsx             # Root component with routing
├── docker-compose.yml      # Multi-service orchestration
├── Dockerfile              # Frontend build (Vite -> Nginx)
├── nginx.conf              # SPA routing config
├── vite.config.ts
└── package.json
```

---

*EDVR -- Jakub Rzadzki*
