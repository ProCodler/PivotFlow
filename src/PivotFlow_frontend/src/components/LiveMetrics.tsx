import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MetricCard } from './ui/MetricCard';
// import { SectionCard } from './ui/SectionCard';
import { Activity, TrendingUp, Zap, Bell, DollarSign } from 'lucide-react';

export const LiveMetrics: React.FC = React.memo(() => {
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
        // Reduced update frequency from 5s to 10s for better performance
        const interval = setInterval(updateMetrics, 10000);

        return () => clearInterval(interval);
    }, [nftAlerts, gasAlerts, canisterCycles]);

    const formatCycles = useMemo(() => (cycles: number) => {
        if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(1)}T`;
        if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(1)}B`;
        if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
        if (cycles >= 1e3) return `${(cycles / 1e3).toFixed(1)}K`;
        return cycles.toString();
    }, []);

    const recentActivityItems = useMemo(() =>
        recentActivity.slice(0, 6) // Reduced from 8 to 6 items for better performance
        , [recentActivity]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="card-glow rounded-2xl p-6">
                        <div className="h-4 bg-muted/50 rounded mb-4"></div>
                        <div className="h-8 bg-muted/50 rounded mb-2"></div>
                        <div className="h-3 bg-muted/50 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-sky-500 flex items-center">
                    <Activity className="w-6 h-6 mr-2 text-sky-500" />
                    <span className="text-sky-400">Live Metrics</span>
                </h2>
                <div className="flex items-center space-x-2 glass-effect px-3 py-1 rounded-full border-glow">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-400">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="card-glow rounded-2xl p-6 transition-all duration-150">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-sky-400">Real-time Activity</h3>
                    <div className="flex items-center space-x-2 glass-effect px-3 py-1 rounded-full border border-sky-500/30">
                        <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-sky-400">Updates every 10s</span>
                    </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentActivityItems.map((activity, index) => (
                        <div
                            key={activity.id}
                            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-150 ${index === 0 ? 'bg-sky-500/10 border border-sky-500/30' : 'glass-effect border-glow'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${activity.type === 'nft_alert' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                                    activity.type === 'cycles_alert' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    }`}>
                                    {activity.type === 'nft_alert' && <Bell size={14} />}
                                    {activity.type === 'cycles_alert' && <Zap size={14} />}
                                    {activity.type === 'portfolio_update' && <DollarSign size={14} />}
                                </div>
                                <div>
                                    <p className="text-sm text-foreground font-medium">{activity.message}</p>
                                    {activity.blockchain && (
                                        <p className="text-xs text-muted-foreground">{activity.blockchain}</p>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

LiveMetrics.displayName = 'LiveMetrics';
