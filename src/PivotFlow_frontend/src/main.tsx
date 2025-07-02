import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { initPerformanceOptimizations } from './lib/performance';

// Initialize performance optimizations
initPerformanceOptimizations();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
