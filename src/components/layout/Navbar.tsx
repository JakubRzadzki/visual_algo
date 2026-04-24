import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { Menu, Zap, Home } from 'lucide-react';

export default function Navbar() {
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const navigate = useNavigate();
  const location = useLocation();

  // Only show sidebar toggle on viewer pages (not on dashboard)
  const isViewerPage = location.pathname.startsWith('/algo/');

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass-panel z-50 flex items-center px-6 justify-between border-b border-glacier-border">
      <div className="flex items-center gap-4">
        {isViewerPage && (
          <button onClick={toggleSidebar} className="p-2 hover:bg-white/5 rounded-lg transition-colors" aria-label="Toggle sidebar">
            <Menu className="w-5 h-5 text-ice-blue" />
          </button>
        )}
        <button
          onClick={() => navigate('/')}
          className="font-bold text-lg luminous-text flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Go to dashboard"
        >
          <Zap className="w-5 h-5" />
          Algorithm Visualizer EDVR
        </button>
      </div>

      {isViewerPage && (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <Home className="w-4 h-4" />
          Catalog
        </button>
      )}
    </nav>
  );
}
