import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { GraphInput } from '../types';
import { getSnapshot } from '../services/sandboxApi';
import { useUIStore } from '../store/uiStore';
import { findAlgorithmByName } from '../data/algorithmCatalog';
import { useToast } from '../components/hud/Toast';
import { Loader2 } from 'lucide-react';

export default function ShareLoader() {
  const { snapshotId } = useParams<{ snapshotId: string }>();
  const navigate = useNavigate();
  const setCurrentGraph = useUIStore(state => state.setCurrentGraph);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadSnapshot() {
      if (!snapshotId) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const data = await getSnapshot(snapshotId);

        // Expecting data to contain: globalAlgo, language, code, currentGraph
        if (!data || !data.globalAlgo) {
          throw new Error('Invalid snapshot data format');
        }

        const globalAlgo = data.globalAlgo as string;
        const language = data.language as string;
        const code = data.code as string;

        // Restore graph if present
        if (data.currentGraph) {
          setCurrentGraph(data.currentGraph as GraphInput);
        }

        // Restore code to localStorage for MonacoCodeEditor
        if (code && language) {
          const storageKey = `monaco-editor-${globalAlgo}-${language}`;
          localStorage.setItem(storageKey, code);
        }

        // Determine where to route based on the global algorithm name
        const algoMatch = findAlgorithmByName(globalAlgo);
        if (algoMatch) {
          showToast('Success', 'success', 'Successfully loaded shared visualization!');
          navigate(`/algo/${algoMatch.category.id}/${algoMatch.algorithm.id}`, { replace: true });
        } else {
          throw new Error(`Algorithm '${globalAlgo}' not found in catalog`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error loading snapshot';
        showToast('Error', 'error', msg);
        navigate('/', { replace: true });
      }
    }

    loadSnapshot();
  }, [snapshotId, navigate, setCurrentGraph, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-glacier-bg">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-ice-blue" />
        <p className="text-slate-300 font-medium">Loading shared visualization...</p>
      </div>
    </div>
  );
}
