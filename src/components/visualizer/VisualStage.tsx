import { useEffect, useRef, useState } from 'react';
import { CanvasRenderer } from '../../core/CanvasRenderer';
import { globalEventBus } from '../../core/EventBus';
import { useUIStore } from '../../store/uiStore';
import { globalEngine } from '../../core/AnimationEngine';
import { MergeSortPlugin } from '../../core/plugins/sorting/MergeSortPlugin';
import { QuickSortPlugin } from '../../core/plugins/sorting/QuickSortPlugin';

export default function VisualStage() {
  const { activeAlgorithm, setIsAnimating } = useUIStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  const [arrayInput, setArrayInput] = useState<string>('42, 15, 8, 93, 27, 61, 39, 10, 55, 33');
  const [status, setStatus] = useState<string>('Ready for input');
  const [arraySize, setArraySize] = useState<number>(10);
  const [running, setRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    // Initialize
    rendererRef.current = new CanvasRenderer(canvasRef.current);
    rendererRef.current?.init();

    // Handle responsive resizes gracefully without triggering React loops
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        rendererRef.current?.resize(width, height);
      }
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
      rendererRef.current?.destroy();
    };
  }, []);

  const handleSetArray = () => {
    try {
      // Parse array input: support comma-separated or space-separated values
      const values = arrayInput
        .split(/[,\s]+/)
        .filter(v => v.trim() !== '')
        .map(v => {
          const num = parseInt(v.trim(), 10);
          if (isNaN(num)) throw new Error(`Invalid number: ${v}`);
          return num;
        });

      if (values.length === 0) {
        setStatus('❌ Empty array');
        return;
      }

      if (values.length > 100) {
        setStatus('❌ Array too large (max 100)');
        return;
      }

      // Fire TRACE_LOADED event with initial array
      globalEventBus.emit({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        step: 0,
        type: 'TRACE_LOADED',
        metadata: {
          algorithmName: 'Custom Sort',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(n)',
          executionTimeMs: 0,
          nodeCount: values.length,
          initialState: values
        }
      } as any);

      setArraySize(values.length);
      setStatus(`✓ Loaded ${values.length} values`);
    } catch (error) {
      setStatus(`❌ ${(error as Error).message}`);
    }
  };

  const handleRandomArray = () => {
    const size = Math.floor(Math.random() * 40) + 10; // 10-50 random values
    const values = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    setArrayInput(values.join(', '));
    setArraySize(size);
  };

  const handleClear = () => {
    setArrayInput('');
    setStatus('Ready for input');
  };

  const handleRunAlgorithm = async () => {
    try {
      // Parse current array
      const values = arrayInput
        .split(/[,\s]+/)
        .filter(v => v.trim() !== '')
        .map(v => {
          const num = parseInt(v.trim(), 10);
          if (isNaN(num)) throw new Error(`Invalid number: ${v}`);
          return num;
        });

      if (values.length === 0) {
        setStatus('❌ Empty array');
        return;
      }

      setRunning(true);
      setStatus('Running...');

      // Get the appropriate plugin based on active algorithm
      const plugin = activeAlgorithm === 'Merge Sort' ? new MergeSortPlugin() : new QuickSortPlugin();
      const trace = await globalEngine.generateTraceWithWatchdog(plugin, values);

      globalEngine.loadTrace(trace);
      globalEngine.setSpeed(1.0);
      setIsAnimating(true);
      globalEngine.play();

      setStatus(`✓ Done — ${trace.events.length} events`);
    } catch (error) {
      setStatus(`❌ ${(error as Error).message}`);
    } finally {
      setRunning(false);
      setTimeout(() => setIsAnimating(false), 3000);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col gap-3 p-6">
      {/* Array Input Panel - Wider */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="font-semibold text-slate-200 text-base uppercase tracking-wide">📊 Array Input</h3>

        <textarea
          value={arrayInput}
          onChange={(e) => setArrayInput(e.target.value)}
          placeholder="Enter values: 42, 15, 8, 93..."
          className="w-full px-4 py-3 bg-slate-900/50 border border-ice-blue/20 rounded text-slate-200 text-sm font-mono focus:outline-none focus:border-ice-blue/60 resize-none h-20"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSetArray}
            className="flex-1 px-4 py-2.5 bg-ice-blue/20 hover:bg-ice-blue/30 text-ice-blue rounded font-semibold text-sm transition-all"
          >
            Load Array ({arraySize})
          </button>
          <button
            onClick={handleRandomArray}
            className="px-4 py-2.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded font-semibold text-sm transition-all"
          >
            Random
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded font-semibold text-sm transition-all"
          >
            Clear
          </button>
        </div>

        <button
          onClick={handleRunAlgorithm}
          disabled={running || arraySize === 0}
          className={`w-full px-4 py-3 rounded font-bold text-base transition-all ${
            running || arraySize === 0
              ? 'bg-emerald-600/20 text-emerald-400/50 cursor-not-allowed'
              : 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 shadow-lg shadow-emerald-600/20 active:scale-95'
          }`}
        >
          {running ? '⏳ Running...' : `▶ Run ${activeAlgorithm}`}
        </button>

        <div className={`text-sm px-3 py-2 rounded font-medium ${status.includes('✓') ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
          {status}
        </div>
      </div>

      {/* Canvas Visualization - Takes full remaining space */}
      <div ref={wrapperRef} className="flex-1 border-2 border-dashed border-ice-blue/20 rounded-xl flex items-center justify-center overflow-hidden bg-slate-950/30 shadow-lg">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Info Footer */}
      <div className="glass-panel px-5 py-3 text-sm text-slate-400">
        <p>💡 Tip: Paste values separated by commas or spaces. Example: <code className="bg-slate-900/50 px-2 py-1 rounded text-slate-300">10 20 30</code></p>
      </div>
    </div>
  );
}
