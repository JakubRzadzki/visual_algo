import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Dashboard from './components/dashboard/Dashboard'
import VisualizerPage from './pages/VisualizerPage'
import { ToastProvider } from './components/hud/Toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/algo/:category/:algoId" element={<VisualizerPage />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)

