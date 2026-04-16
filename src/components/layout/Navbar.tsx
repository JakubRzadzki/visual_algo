import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { Menu, Zap } from 'lucide-react';

export default function Navbar() {
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass-panel z-50 flex items-center px-6 justify-between border-b border-glacier-border">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <Menu className="w-5 h-5 text-ice-blue" />
        </button>
        <span className="font-bold text-lg luminous-text flex items-center gap-2">
          <Zap className="w-5 h-5" /> Algorithm Visualizer EDVR
        </span>
      </div>
    </nav>
  );
}
