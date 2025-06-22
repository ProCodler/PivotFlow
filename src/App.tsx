import React, { useState, useEffect } from 'react';
import { ICPProvider, useICP } from './contexts/ICPContext';
import Header from './components/Header';
import Footer from './components/Footer';
import DashboardPage from './pages/DashboardPage';
import NftAlertsPage from './pages/NftAlertsPage';
import BlockchainFeesPage from './pages/BlockchainFeesPage';
import PortfolioPage from './pages/PortfolioPage';
import SettingsPage from './pages/SettingsPage';
import { Toaster as ShadcnToaster } from "./components/ui/Toaster"; // Placeholder

// Define view names
export type ViewName = 'Dashboard' | 'NFT Alerts' | 'Blockchain Fees' | 'Portfolio' | 'Settings';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewName>('Dashboard');
  const { isConnecting, isAuthenticated, login } = useICP();

  // Subtle background animation: Floating symbols
  // This is a simplified CSS-only version. More complex SVG/JS animations could be used.
  const renderFloatingSymbols = () => {
    const symbols = ['ICP', '₿', 'Ξ', '💎', '🚀', '✨', '🌠', '🌌'];
    return symbols.map((symbol, index) => (
      <div
        key={index}
        className="absolute text-2xl md:text-4xl opacity-5 animate-float"
        style={{
          left: `${Math.random() * 90}%`,
          top: `${Math.random() * 90}%`,
          animationDuration: `${15 + Math.random() * 15}s`,
          animationDelay: `${Math.random() * 5}s`,
          color: ['#00F0FF', '#FF00FF', '#00FF00'][index % 3] // Cycle through neon colors
        }}
      >
        {symbol}
      </div>
    ));
  };

  const renderView = () => {
    if (isConnecting) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
          <p className="mt-4 text-lg text-gray-300">Connecting to Internet Identity...</p>
        </div>
      );
    }

    if (!isAuthenticated && currentView !== 'Dashboard') { // Allow dashboard view even if not logged in (can show generic data)
        // Or redirect to dashboard if preferred:
        // setCurrentView('Dashboard');
        // return <DashboardPage />;
    }

    switch (currentView) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'NFT Alerts':
        return isAuthenticated ? <NftAlertsPage /> : <AuthRequiredPlaceholder onLogin={login} />;
      case 'Blockchain Fees':
        return <BlockchainFeesPage />; // Some parts might be public, some auth-gated within the page
      case 'Portfolio':
        return isAuthenticated ? <PortfolioPage /> : <AuthRequiredPlaceholder onLogin={login} />;
      case 'Settings':
        return isAuthenticated ? <SettingsPage /> : <AuthRequiredPlaceholder onLogin={login} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0D0D1A] to-[#1A0A2D] text-gray-200 relative overflow-hidden">
      {/* Background Animation: Stars/Nebula (CSS Gradient Animation) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="stars-bg"></div> {/* CSS defined in index.css */}
        {renderFloatingSymbols()}
      </div>

      <Header currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-grow flex flex-col items-center justify-start p-4 md:p-6 z-10 w-full">
        {/* Main Content Container with Morphy UI */}
        <div className="bg-gradient-to-br from-purple-900/50 via-indigo-900/40 to-blue-900/50 backdrop-blur-md shadow-2xl shadow-cyan-500/20 rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto transition-all duration-500 ease-in-out">
          {renderView()}
        </div>
      </main>

      <Footer />
      <ShadcnToaster /> {/* For shadcn/ui toasts */}
    </div>
  );
};

const AuthRequiredPlaceholder: React.FC<{onLogin: () => void}> = ({ onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl bg-black/30 shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock-keyhole text-cyan-400 mb-4"><circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/></svg>
      <h2 className="text-2xl font-semibold text-white mb-2">Authentication Required</h2>
      <p className="text-gray-400 mb-6">Please connect your Internet Identity to access this feature.</p>
      <button
        onClick={onLogin}
        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-300"
      >
        Connect Internet Identity
      </button>
    </div>
  );
};

const App: React.FC = () => {
  // Firebase Stub Initialization (as per instructions for Canvas environment)
  useEffect(() => {
    const initializeFirebaseStub = async () => {
      try {
        // console.log("Attempting Firebase stub initialization...");
        // In a real Firebase app, you'd import and initialize Firebase here.
        // e.g., import { initializeApp } from 'firebase/app';
        // e.g., import { getAuth, signInAnonymously } from 'firebase/auth';

        // const firebaseConfig = { apiKey: "...", authDomain: "...", ... };
        // const app = initializeApp(firebaseConfig);
        // const auth = getAuth(app);
        // await signInAnonymously(auth);
        console.log("Firebase stub: Anonymous sign-in successful (simulated).");
      } catch (error) {
        console.error("Firebase stub: Error during initialization/sign-in (simulated):", error);
      }
    };

    if (typeof window !== 'undefined') { // Ensure this runs only in the browser
        initializeFirebaseStub();
    }
  }, []);


  return (
    <ICPProvider>
      <AppContent />
    </ICPProvider>
  );
};

export default App;
