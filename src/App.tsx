import React from 'react';
import { useUIStore } from './store/uiStore';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import VisualStage from './components/visualizer/VisualStage';
import CodeSnippet from './components/hud/CodeSnippet';
import EventLog from './components/hud/EventLog';
import PlaybackDeck from './components/controls/PlaybackDeck';
import AmbientGraph from './components/background/AmbientGraph';

export default function App() {
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);

  return (
    <div className="relative min-h-screen bg-glacier-bg text-slate-200 selection:bg-ice-blue/30 selection:text-ice-blue overflow-hidden cursor-default">
      {/* Dynamic Floating Mesh */}
      <AmbientGraph />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0e1a]/80 via-[#0f1524]/60 to-[#0a0e1a]/80 pointer-events-none" />

      <Navbar />

      <div className="pt-20 pb-28 px-6 h-screen w-full flex gap-4 relative z-10 transition-all duration-300">
        {isSidebarOpen && <Sidebar />}
        
        <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden glass-panel-elevated shadow-2xl shadow-ice-blue/5 border border-ice-blue/10">
           <VisualStage />
        </div>

        <aside className="w-80 hidden md:flex flex-col gap-4 h-full">
           <CodeSnippet />
           <EventLog />
        </aside>
      </div>

      <PlaybackDeck />
    </div>
  );
}
