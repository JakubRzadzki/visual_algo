import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUIStore } from './store/uiStore';
import Navbar from './components/layout/Navbar';
import AmbientGraph from './components/background/AmbientGraph';
import AriaLiveRegion from './components/a11y/AriaLiveRegion';
import Dashboard from './components/dashboard/Dashboard';
import AlgorithmViewer from './components/viewer/AlgorithmViewer';
import { ToastProvider } from './components/hud/Toast';
import ShareLoader from './pages/ShareLoader';

export default function App() {
  const theme = useUIStore(state => state.theme);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-glacier-bg text-slate-200 selection:bg-ice-blue/30 selection:text-ice-blue cursor-default">
        <AriaLiveRegion />
        {/* Dynamic Floating Mesh */}
        <AmbientGraph />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0e1a]/80 via-[#0f1524]/60 to-[#0a0e1a]/80 pointer-events-none" />

        <Navbar />

        <Routes>
          {/* Landing page — Algorithm Catalog */}
          <Route path="/" element={<Dashboard />} />
          {/* Algorithm Viewer — full visualisation workspace */}
          <Route path="/algo/:category/:id" element={<AlgorithmViewer />} />
          {/* Shared Snapshot Loader */}
          <Route path="/share/:snapshotId" element={<ShareLoader />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}
