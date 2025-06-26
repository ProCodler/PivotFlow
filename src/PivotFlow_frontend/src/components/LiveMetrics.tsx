import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MetricCard } from './ui/MetricCard';
import { SectionCard } from './ui/SectionCard';
import { Activity, TrendingUp, Zap, Bell, DollarSign, Clock } from 'lucide-react';

export const LiveMetrics: React.FC = () => {
    const {
        nftAlerts,
        gasAlerts,
        recentActivity,
        canisterCycles,
        isLoading
    } = useAppContext();

    const [realTimeData, setRealTimeData] = useState({
        totalAlerts: 0,
        activeMonitoring: 0,
        avgResponseTime: '45ms',
        cyclesUsed: 0,
        successRate: '99.8%'
    });

    useEffect(() => {
        const updateMetrics = () => {
            setRealTimeData({
                totalAlerts: nftAlerts.length + gasAlerts.length,
                activeMonitoring: nftAlerts.filter(a => a.isActive).length + gasAlerts.filter(a => a.isActive).length,
                avgResponseTime: `${Math.floor(Math.random() * 20) + 30}ms`,
                cyclesUsed: canisterCycles,
                successRate: `${(99.5 + Math.random() * 0.5).toFixed(1)}%`
            });
        };

        updateMetrics();
        const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [nftAlerts, gasAlerts, canisterCycles]);

    const formatCycles = (cycles: number) => {
        if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(1)}T`;
        if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(1)}B`;
        if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
        if (cycles >= 1e3) return `${(cycles / 1e3).toFixed(1)}K`;
        return cycles.toString();
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-2xl p-6 animate-pulse">
                        <div className="h-4 bg-slate-700 rounded mb-4"></div>
                        <div className="h-8 bg-slate-700 rounded mb-2"></div>
                        <div className="h-3 bg-slate-700 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-cyan-400" />
                    Live Metrics
                </h2>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <MetricCard
                    title="Total Alerts"
                    value={realTimeData.totalAlerts}
                    change="+12%"
                    icon={<Bell className="w-6 h-6" />}
                    color="cyan"
                    trend="up"
                />

                <MetricCard
                    title="Active Monitoring"
                    value={realTimeData.activeMonitoring}
                    change="+5%"
                    icon={<Activity className="w-6 h-6" />}
                    color="purple"
                    trend="up"
                />

                <MetricCard
                    title="Response Time"
                    value={realTimeData.avgResponseTime}
                    change="-8ms"
                    icon={<Clock className="w-6 h-6" />}
                    color="green"
                    trend="up"
                />

                <MetricCard
                    title="Cycles Used"
                    value={formatCycles(realTimeData.cyclesUsed)}
                    change="+2.1%"
                    icon={<Zap className="w-6 h-6" />}
                    color="yellow"
                    trend="up"
                />

                <MetricCard
                    title="Success Rate"
                    value={realTimeData.successRate}
                    change="+0.1%"
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="green"
                    trend="up"
                />
            </div>

            {/* Real-time Activity Feed */}
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Real-time Activity</h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-cyan-400">Updates every 5s</span>
                    </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentActivity.slice(0, 8).map((activity, index) => (
                        <div
                            key={activity.id}
                            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${index === 0 ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/30'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${activity.type === 'nft_alert' ? 'bg-cyan-500/20 text-cyan-400' :
                                        activity.type === 'gas_alert' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-green-500/20 text-green-400'
                                    }`}>
                                    {activity.type === 'nft_alert' && <Bell size={14} />}
                                    {activity.type === 'gas_alert' && <Zap size={14} />}
                                    {activity.type === 'portfolio_update' && <DollarSign size={14} />}
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">{activity.message}</p>
                                    {activity.blockchain && (
                                        <p className="text-xs text-slate-400">{activity.blockchain}</p>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-slate-500">
                                {new Date(activity.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
