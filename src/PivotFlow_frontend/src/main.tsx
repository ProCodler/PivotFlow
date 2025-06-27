import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 PivotFlow loading with full App...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ Full PivotFlow App loaded successfully');
} catch (error) {
  console.error('❌ Error loading full app:', error);
  
  // Fallback to simple version
  const SimpleApp = () => (
    <div style={{ 
      background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2D 50%, #2E0A4E 100%)',
      color: 'white',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <h1 style={{ color: '#6366f1' }}>🚀 PivotFlow - Error Recovery</h1>
      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '10px', padding: '20px' }}>
        <h2>Error Details:</h2>
        <pre style={{ color: '#fbbf24', fontSize: '14px' }}>{error?.toString()}</pre>
      </div>
    </div>
  );
  
  createRoot(rootElement).render(<StrictMode><SimpleApp /></StrictMode>);
}
