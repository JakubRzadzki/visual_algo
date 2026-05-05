/**
 * @file SortingStage.tsx
 * @description Bridge component connecting the VisualizerPage route to the
 * new snapshot-based SortingVisualizer system.
 *
 * Reads the active sorting algorithm name from the Zustand UI store and
 * passes it through to SortingVisualizer, which handles all frame generation,
 * playback, and rendering internally.
 */

import { useUIStore } from '../../store/uiStore';
import SortingVisualizer from '../../sorting/components/SortingVisualizer';

export default function SortingStage() {
  const algorithmName = useUIStore(state => state.activeSortingAlgorithm);

  return <SortingVisualizer algorithmName={algorithmName} />;
}
