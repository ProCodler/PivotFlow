import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Zap, RefreshCw, Clock, TrendingUp, TrendingDown, AlertTriangle, Plus, Bell, Info } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';

export const BlockchainFeesPage: React.FC = () => {
  const {
    networkFees,
    refreshNetworkFees,
    gasAlerts,
    addGasAlert,
    removeGasAlert,
    isLoading,
    addActivity,
    setError
  } = useAppContext();

  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    blockchain: 'Internet Computer',
    maxCycles: 50000000,
    operationType: 'transaction' as 'transaction' | 'chain_fusion' | 'canister_call'
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    // Auto-refresh fees every 60 seconds
    const interval = setInterval(async () => {
      try {
        await refreshNetworkFees();
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Failed to refresh network fees:', error);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshNetworkFees]);

  const handleRefresh = async () => {
    try {
      await refreshNetworkFees();
      setLastRefresh(new Date());
      addActivity({
        type: 'portfolio_update',
        message: 'Network fees refreshed',
        timestamp: new Date().toISOString(),
        blockchain: 'All Networks'
      });
    } catch (error) {
      setError('Failed to refresh network fees');
    }
  };

  const handleCreateAlert = () => {
    addGasAlert(newAlert);
    setShowCreateAlert(false);
    setNewAlert({
      blockchain: 'Internet Computer',
      maxCycles: 50000000,
      operationType: 'transaction'
    });
    addActivity({
      type: 'cycles_alert',
      message: `New gas alert created for ${newAlert.blockchain}`,
      timestamp: new Date().toISOString(),
      blockchain: newAlert.blockchain,
      cyclesCost: newAlert.maxCycles
    });
  };

  const formatCycles = (cycles: number) => {
    if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(1)}T`;
    if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(1)}B`;
    if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
    if (cycles >= 1e3) return `${(cycles / 1e3).toFixed(1)}K`;
    return cycles.toString();
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const getCostTrend = (cost: number) => {
    // Simulate trend based on cost (lower costs tend to be trending down)
    return cost < 0.01 ? 'down' : 'up';
  };

  const getCostColor = (cost: number) => {
    if (cost < 0.005) return 'text-green-400';
    if (cost < 0.02) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Blockchain Network Fees
        </h1>
        <p className="text-slate-400">
          Monitor real-time transaction costs across multiple blockchains
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <RefreshCw size={20} />}
            <span>Refresh Fees</span>
          </button>

          <button
            onClick={() => setShowCreateAlert(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus size={20} />
            <span>Create Alert</span>
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-2 border border-slate-700/50">
          <Clock size={16} className="text-slate-400" />
          <span className="text-slate-400 text-sm">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Network Fees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {networkFees.map((fee, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{fee.icon}</div>
                <div>
                  <h3 className="text-white font-semibold">{fee.blockchain}</h3>
                  <p className="text-slate-400 text-sm">Network Fees</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {getCostTrend(fee.transactionCost.usd) === 'down' ? (
                  <TrendingDown size={16} className="text-green-400" />
                ) : (
                  <TrendingUp size={16} className="text-red-400" />
                )}
              </div>
            </div>

            {/* Transaction Cost */}
            <div className="space-y-4">
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm font-medium">Transaction Cost</span>
                  <Zap size={14} className="text-yellow-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-bold text-lg">
                    {formatCycles(fee.transactionCost.cycles)} cycles
                  </p>
                  <p className={`text-sm font-medium ${getCostColor(fee.transactionCost.usd)}`}>
                    {formatUSD(fee.transactionCost.usd)}
                  </p>
                </div>
              </div>

              {/* Chain Fusion Cost (if available) */}
              {fee.chainFusionCost && (
                <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm font-medium">Chain Fusion</span>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg">
                      {formatCycles(fee.chainFusionCost.cycles)} cycles
                    </p>
                    <p className={`text-sm font-medium ${getCostColor(fee.chainFusionCost.usd)}`}>
                      {formatUSD(fee.chainFusionCost.usd)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Active Gas Alerts */}
      {gasAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Bell className="text-cyan-400" />
            <span>Active Gas Alerts</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gasAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-700/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="text-orange-400" size={20} />
                    <div>
                      <p className="text-white font-medium">{alert.blockchain}</p>
                      <p className="text-slate-400 text-sm capitalize">{alert.operationType}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeGasAlert(alert.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-700/30">
                  <p className="text-slate-300 text-sm">
                    Alert when cost exceeds: <span className="text-orange-400 font-bold">
                      {formatCycles(alert.maxCycles)} cycles
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create Gas Alert</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Blockchain
                </label>
                <select
                  value={newAlert.blockchain}
                  onChange={(e) => setNewAlert({ ...newAlert, blockchain: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                >
                  <option value="Internet Computer">Internet Computer</option>
                  <option value="Bitcoin (via Chain Fusion)">Bitcoin (via Chain Fusion)</option>
                  <option value="Ethereum (via Chain Fusion)">Ethereum (via Chain Fusion)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Operation Type
                </label>
                <select
                  value={newAlert.operationType}
                  onChange={(e) => setNewAlert({ ...newAlert, operationType: e.target.value as any })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                >
                  <option value="transaction">Transaction</option>
                  <option value="chain_fusion">Chain Fusion</option>
                  <option value="canister_call">Canister Call</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Max Cycles Cost
                </label>
                <input
                  type="number"
                  value={newAlert.maxCycles}
                  onChange={(e) => setNewAlert({ ...newAlert, maxCycles: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                  placeholder="50000000"
                />
                <p className="text-xs text-slate-500 mt-1">
                  You'll be alerted when costs exceed this amount
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateAlert}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300"
              >
                Create Alert
              </button>
              <button
                onClick={() => setShowCreateAlert(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="text-blue-400 mt-1" size={20} />
          <div>
            <h3 className="text-blue-400 font-semibold mb-2">About Network Fees</h3>
            <div className="text-slate-300 text-sm space-y-2">
              <p>• <strong>Cycles:</strong> The native unit of computation on the Internet Computer</p>
              <p>• <strong>Chain Fusion:</strong> Cross-chain operations that interact with Bitcoin/Ethereum</p>
              <p>• <strong>Transaction Cost:</strong> Standard operations within the IC ecosystem</p>
              <p>• Gas alerts help you monitor when transaction costs exceed your preferred limits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
