import React from 'react';
import { useICP } from '../contexts/ICPContext';
import { ViewName } from '../App'; // Assuming ViewName is exported from App.tsx
import { Button } from './ui/Button'; // Placeholder
import { Tabs, TabsList, TabsTrigger } from "./ui/Tabs"; // Placeholder
import { LogIn, LogOut, UserCircle, Settings, LayoutDashboard, BellRing, BarChart3, Wallet } from 'lucide-react'; // Example icons

interface HeaderProps {
  currentView: ViewName;
  setCurrentView: (view: ViewName) => void;
}

const navItems: { name: ViewName; icon: React.ElementType }[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'NFT Alerts', icon: BellRing },
  { name: 'Blockchain Fees', icon: BarChart3 },
  { name: 'Portfolio', icon: Wallet },
  { name: 'Settings', icon: Settings },
];

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { isAuthenticated, principal, login, logout, isConnecting } = useICP();

  const truncatePrincipal = (p: string | undefined | null, startChars = 6, endChars = 4) => {
    if (!p) return '';
    return `${p.substring(0, startChars)}...${p.substring(p.length - endChars)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-[#1A0A2D]/80 to-[#0D0D1A]/50 backdrop-blur-lg shadow-2xl shadow-purple-500/30 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Project Title */}
        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-text-glow">
          PivotFlow
        </h1>

        {/* Navigation Menu - Centered for larger screens */}
        <nav className="hidden lg:flex flex-grow justify-center">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewName)} className="w-auto">
            <TabsList className="bg-purple-800/30 border border-purple-700/50 rounded-xl p-1">
              {navItems.map((item) => (
                <TabsTrigger
                  key={item.name}
                  value={item.name}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 hover:bg-purple-700/40"
                  onClick={() => setCurrentView(item.name)}
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  {item.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </nav>

        {/* Mobile Navigation (Hamburger Menu) - Placeholder */}
        <div className="lg:hidden">
          {/* Implement a dropdown or sheet for mobile navigation if needed */}
          {/* For now, we'll keep it simple and rely on users having wider screens or fewer nav items */}
        </div>


        {/* User Identity & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isConnecting ? (
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-purple-700/50 animate-pulse">
              <div className="w-5 h-5 rounded-full bg-purple-500/70"></div>
              <span className="text-sm text-gray-400">Connecting...</span>
            </div>
          ) : isAuthenticated && principal ? (
            <>
              <div className="group relative flex items-center p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-cyan-700/50 to-purple-700/50 hover:from-cyan-600/70 hover:to-purple-600/70 transition-all duration-200 shadow-md">
                <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300 group-hover:text-cyan-100 transition-colors" />
                <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium text-gray-200 group-hover:text-white transition-colors hidden md:inline">
                  {truncatePrincipal(principal.toText())}
                </span>
                {/* Full principal on hover tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none break-all z-50">
                  {principal.toText()}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="p-1.5 sm:p-2 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </>
          ) : (
            <Button
              onClick={login}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-300 text-sm sm:text-base"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              Connect II
            </Button>
          )}
        </div>
      </div>

      {/* Navigation for smaller screens (below lg breakpoint) */}
      <nav className="lg:hidden mt-3">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewName)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 bg-purple-800/30 border border-purple-700/50 rounded-xl p-1">
              {navItems.map((item) => (
                <TabsTrigger
                  key={item.name}
                  value={item.name}
                  className="flex flex-col sm:flex-row items-center justify-center px-1 py-1.5 sm:px-2 sm:py-2 text-xs sm:text-sm text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 hover:bg-purple-700/40"
                  onClick={() => setCurrentView(item.name)}
                >
                  <item.icon className="w-4 h-4 mb-0.5 sm:mb-0 sm:mr-1.5" />
                  <span className="truncate">{item.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </nav>
    </header>
  );
};

export default Header;
