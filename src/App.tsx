import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AmbientGraph from './components/background/AmbientGraph';
import AriaLiveRegion from './components/a11y/AriaLiveRegion';
import Dashboard from './components/dashboard/Dashboard';
import AlgorithmViewer from './components/viewer/AlgorithmViewer';

export default function App() {
  return (
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
      </Routes>
    </div>
  );
}
