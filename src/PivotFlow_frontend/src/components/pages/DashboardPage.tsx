import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { LoadingSpinner, LoadingSkeleton } from '../LoadingSpinner';
import { LiveMetrics } from '../LiveMetrics';
import { SystemStatus } from '../SystemStatus';
import { RecentActivity } from '../RecentActivity';
import { MetricCard } from '../ui/MetricCard';
import { ActivityCard } from '../ui/ActivityCard';
import { SectionCard } from '../ui/SectionCard';
import { Activity, Bell, Zap, Wallet, TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    nftAlerts,
    gasAlerts,
    recentActivity,
    canisterCycles,
    isOperator,
    isLoading,
    setCurrentView,
    refreshPortfolio
  } = useAppContext();

  const activeNftAlerts = nftAlerts.filter(alert => alert.isActive);
  const activeGasAlerts = gasAlerts.filter(alert => alert.isActive);

  const formatCycles = (cycles: number) => {
    if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(1)}T`;
    if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(1)}B`;
    if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
    return cycles.toString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Mission Control
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-slate-400 text-lg">Monitor your NFT alerts and cycles costs from the Internet Computer</p>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-1000" />
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-center space-x-6 pt-2">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            <span className="text-sm text-slate-500">NFT Monitoring</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span className="text-sm text-slate-500">Cycles Tracking</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-500">Real-time</span>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <LiveMetrics />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active NFT Alerts */}
        <MetricCard
          title="NFT Alerts"
          value={activeNftAlerts.length}
          icon={<Bell className="w-6 h-6" />}
          color="cyan"
          showProgress={true}
          progressValue={activeNftAlerts.length}
          progressMax={10}
          subtitle="Active monitoring"
        />

        {/* Active Cycles Alerts */}
        <MetricCard
          title="Cycles Alerts"
          value={activeGasAlerts.length}
          icon={<Zap className="w-6 h-6" />}
          color="purple"
          showProgress={true}
          progressValue={activeGasAlerts.length}
          progressMax={5}
          subtitle="Cost monitoring"
        />

        {/* Portfolio Status */}
        <MetricCard
          title="Portfolio"
          value="--"
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          subtitle="Monitoring Active"
        />

        {/* Canister Cycles (Operator Only) */}
        {isOperator && (
          <MetricCard
            title="Cycles"
            value={formatCycles(canisterCycles)}
            icon={<Wallet className="w-6 h-6" />}
            color="yellow"
            subtitle="Normal"
          />
        )}
      </div>

      {/* Recent Activity */}
      <SectionCard
        title="Recent Activity"
        icon={<Activity className="w-5 h-5 text-cyan-400" />}
        headerAction={<div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />}
      >
        <RecentActivity />
      </SectionCard>

      {/* System Status and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SystemStatus />
        </div>

        <SectionCard
          title="Quick Actions"
          subtitle="Common tasks"
          variant="highlight"
        >
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('nft-alerts')}
              className="w-full group flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all duration-300 text-slate-300 hover:text-white border border-slate-600/30 hover:border-slate-500/50"
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Create NFT Alert</span>
              </div>
              <div className="w-2 h-2 bg-cyan-400/50 rounded-full group-hover:bg-cyan-400 transition-colors" />
            </button>

            <button
              onClick={() => setCurrentView('blockchain-fees')}
              className="w-full group flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all duration-300 text-slate-300 hover:text-white border border-slate-600/30 hover:border-slate-500/50"
            >
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Set Cycles Alert</span>
              </div>
              <div className="w-2 h-2 bg-purple-400/50 rounded-full group-hover:bg-purple-400 transition-colors" />
            </button>

            <button
              onClick={() => refreshPortfolio()}
              disabled={isLoading}
              className="w-full group flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all duration-300 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/30 hover:border-slate-500/50"
            >
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Refresh Portfolio</span>
              </div>
              <div className="w-2 h-2 bg-green-400/50 rounded-full group-hover:bg-green-400 transition-colors" />
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};