import { useUIStore } from '../../store/uiStore';
import type { AlgorithmType } from '../../store/uiStore';

const ALGORITHM_LIST: AlgorithmType[] = ['Merge Sort', 'Quick Sort', "Dijkstra's Path"];

export default function Sidebar() {
  const activeAlgorithm = useUIStore(state => state.activeAlgorithm);
  const setActiveAlgorithm = useUIStore(state => state.setActiveAlgorithm);

  return (
    <div className="w-64 glass-panel flex flex-col gap-4 p-4">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Algorithms</h2>
      <ul className="space-y-2">
        {ALGORITHM_LIST.map(algo => {
           const isActive = activeAlgorithm === algo;
           return (
             <li 
               key={algo}
               onClick={() => setActiveAlgorithm(algo)}
               className={`px-3 py-2 rounded-lg cursor-pointer transition border ${isActive ? 'bg-ice-blue/10 border-ice-blue/30 text-ice-blue' : 'hover:bg-white/5 border-transparent text-slate-300'}`}
             >
               {algo}
             </li>
           );
        })}
      </ul>
    </div>
  );
}
