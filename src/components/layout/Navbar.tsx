import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { Menu, Zap, Home, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);
  const theme = useUIStore(state => state.theme);
  const toggleTheme = useUIStore(state => state.toggleTheme);
  const language = useUIStore(state => state.language);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isVisualizer = location.pathname.startsWith('/algo');

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-glacier-surface backdrop-blur-xl z-50 flex items-center px-6 justify-between border-b border-glacier-border-bright shadow-xl transition-all duration-500">
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
        <Link to="/" data-tutorial-step="navbar-home" className="font-bold text-lg luminous-text flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Zap className="w-5 h-5 text-cyan-400 animate-pulse" /> 
          <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
            {language === 'en' ? 'Algorithm Visualizer EDVR' : 'Wizualizator Algorytmów EDVR'}
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
            <span>{language === 'en' ? 'Catalog' : 'Katalog'}</span>
          </button>
        )}

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 ml-2">
          {/* Creative Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={toggleTheme}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer overflow-hidden group"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ y: 20, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors" />
          </motion.button>

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => useUIStore.getState().setLanguage('en')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                language === 'en'
                  ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => useUIStore.getState().setLanguage('pl')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                language === 'pl'
                  ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              PL
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
