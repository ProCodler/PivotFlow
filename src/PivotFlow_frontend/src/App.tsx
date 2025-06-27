import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { CosmicBackground } from './components/CosmicBackground';
import { ErrorToast } from './components/ErrorToast';
import { NotificationCenter } from './components/NotificationCenter';
import { LoginPage } from './components/LoginPage';
import { UserProfile } from './components/UserProfile';
import { PivotFlowLogo } from './components/PivotFlowLogo';
import { DashboardPage } from './components/pages/DashboardPage';
import { NftAlertsPage } from './components/pages/NftAlertsPage';
import { BlockchainFeesPage } from './components/pages/BlockchainFeesPage';
import { PortfolioPage } from './components/pages/PortfolioPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { BarChart3, Bell, Zap, Eye, Settings } from 'lucide-react';
import './advanced-effects.css';

const Navigation: React.FC = () => {
  const { currentView, setCurrentView } = useAppContext();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'nft-alerts', label: 'NFT Alerts', icon: Bell },
    { id: 'blockchain-fees', label: 'Blockchain Fees', icon: Zap },
    { id: 'portfolio', label: 'Portfolio', icon: Eye },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="mb-8">
      <div className="flex flex-wrap justify-center gap-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${currentView === id
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
              : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/70 border border-slate-700/50'
              }`}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentView } = useAppContext();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'nft-alerts':
        return <NftAlertsPage />;
      case 'blockchain-fees':
        return <BlockchainFeesPage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <CosmicBackground />
      <ErrorToast />

      <div className="min-h-screen relative z-10 flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center justify-between">
            <PivotFlowLogo size="lg" />
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center border-t border-slate-700/50">
          <p className="text-slate-500 text-sm">
            © 2025 PivotFlow • Powered by Internet Computer Protocol
          </p>
        </footer>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;