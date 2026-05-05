import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { Menu, Zap, Home } from 'lucide-react';

export default function Navbar() {
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isVisualizer = location.pathname.startsWith('/algo');

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#070b19]/80 backdrop-blur-xl z-50 flex items-center px-6 justify-between border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-4">
        {isVisualizer && (
          <button 
            onClick={toggleSidebar} 
            className={`p-2 rounded-lg transition-all border ${
              isSidebarOpen 
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
                : 'border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="font-bold text-lg luminous-text flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Zap className="w-5 h-5 text-cyan-400 animate-pulse" /> 
          <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
            Algorithm Visualizer EDVR
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {isVisualizer && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </button>
        )}
      </div>
    </nav>
  );
}
