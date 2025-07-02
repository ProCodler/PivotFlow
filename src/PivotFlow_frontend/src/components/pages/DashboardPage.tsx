import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { LiveMetrics } from '../LiveMetrics';
import { SystemStatus } from '../SystemStatus';
import { SectionCard } from '../ui/SectionCard';
import {
  Bell,
  Zap,
  Wallet,
  TrendingUp,
  Activity,
  Globe,
  Shield,
  Sparkles,
  Target,
  Rocket,
  Crown,
  Flame,
  Star,
  ArrowUp,
  Eye,
  RefreshCw
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    nftAlerts,
    gasAlerts,
    canisterCycles,
    isLoading,
    setCurrentView,
    refreshPortfolio,
    networkFees,
    nftPortfolio
  } = useAppContext();

  const [liveTime, setLiveTime] = useState(new Date());

  const activeNftAlerts = nftAlerts.filter(alert => alert.isActive);
  const activeGasAlerts = gasAlerts.filter(alert => alert.isActive);

  // Live time update
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCycles = (cycles: number) => {
    if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(1)}T`;
    if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(1)}B`;
    if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
    return cycles.toString();
  };

  const getTotalPortfolioValue = () => {
    return nftPortfolio.reduce((sum, nft) => sum + nft.floorPrice, 0);
  };

  const getAverageGasCost = () => {
    if (networkFees.length === 0) return 0;
    return networkFees.reduce((sum, fee) => sum + fee.transactionCost.usd, 0) / networkFees.length;
  };

  const getSystemHealthScore = () => {
    const cyclesHealth = canisterCycles > 1e12 ? 100 : (canisterCycles / 1e12) * 100;
    const alertsHealth = Math.max(0, 100 - (activeNftAlerts.length + activeGasAlerts.length) * 10);
    return Math.round((cyclesHealth + alertsHealth) / 2);
  };

  const healthScore = getSystemHealthScore();
  const portfolioValue = getTotalPortfolioValue();
  const avgGasCost = getAverageGasCost();


  return (
    <div className="space-y-6">
      {/* Hero Header with Live Elements */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left space-y-4">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="relative">
                  <Rocket className="w-12 h-12 text-cyan-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    PivotFlow
                  </h1>
                  <p className="text-slate-400 text-lg">Mission Control Dashboard</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-slate-400">Live Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Multi-Chain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-400">Decentralized</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-400">AI-Powered</span>
                </div>
              </div>
            </div>

            {/* Live Stats Panel */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 min-w-fit">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{activeNftAlerts.length}</div>
                  <div className="text-xs text-slate-400">Active Alerts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{formatCycles(canisterCycles)}</div>
                  <div className="text-xs text-slate-400">Cycles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{portfolioValue.toFixed(1)}</div>
                  <div className="text-xs text-slate-400">Portfolio ETH</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{healthScore}%</div>
                  <div className="text-xs text-slate-400">Health Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* NFT Alerts with Trend */}
        <div className="group bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 hover:shadow-cyan-500/20 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">+12%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">{activeNftAlerts.length}</div>
            <div className="text-slate-400 text-sm">NFT Price Alerts</div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((activeNftAlerts.length / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gas Alerts with Animation */}
        <div className="group bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:shadow-purple-500/20 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">{activeGasAlerts.length}</div>
            <div className="text-slate-400 text-sm">Gas Price Monitors</div>
            <div className="text-xs text-purple-400">Avg: ${avgGasCost.toFixed(4)}</div>
          </div>
        </div>

        {/* Portfolio Performance */}
        <div className="group bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:shadow-green-500/20 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-green-400 text-sm">Live</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">{portfolioValue.toFixed(2)}</div>
            <div className="text-slate-400 text-sm">Portfolio Value (ETH)</div>
            <div className="text-xs text-green-400">{nftPortfolio.length} NFTs tracked</div>
          </div>
        </div>

        {/* System Health */}
        <div className="group bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6 hover:shadow-yellow-500/20 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-1">
              <Crown className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">{healthScore}%</div>
            <div className="text-slate-400 text-sm">System Health</div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${healthScore > 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    healthScore > 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Feed */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Live Activity</h3>
                  <p className="text-slate-400 text-sm">Real-time system events</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400">{liveTime.toLocaleTimeString()}</span>
              </div>
            </div>

            <LiveMetrics />
          </div>
        </div>

        {/* Quick Actions with Gamification */}
        <div className="space-y-6">
          {/* Action Panel */}
          <SectionCard
            title="Power Actions"
            subtitle="Level up your monitoring"
            variant="highlight"
          >
            <div className="space-y-3">
              <button
                onClick={() => setCurrentView('nft-alerts')}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 rounded-xl p-4 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Bell className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">NFT Alerts</div>
                      <div className="text-xs text-slate-400">Monitor floor prices</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full group-hover:animate-pulse" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('blockchain-fees')}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 rounded-xl p-4 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">Gas Tracker</div>
                      <div className="text-xs text-slate-400">Optimize costs</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:animate-pulse" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => refreshPortfolio()}
                disabled={isLoading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/30 rounded-xl p-4 transition-all duration-300 disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform">
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 text-green-400 animate-spin" />
                      ) : (
                        <Wallet className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">Portfolio Sync</div>
                      <div className="text-xs text-slate-400">Refresh data</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-green-400" />
                    <div className="w-2 h-2 bg-green-400 rounded-full group-hover:animate-pulse" />
                  </div>
                </div>
              </button>
            </div>
          </SectionCard>

          {/* Achievement Panel */}
          <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Crown className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Achievement</h3>
                <p className="text-slate-400 text-sm">Power User Status</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Active Monitoring</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">Expert</span>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
        <SystemStatus />
      </div>
    </div>
  );
};

export default DashboardPage;