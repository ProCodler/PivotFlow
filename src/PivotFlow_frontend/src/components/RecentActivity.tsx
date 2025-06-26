import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Activity, Bell, Zap, Wallet, TrendingUp } from 'lucide-react';

export const RecentActivity: React.FC = () => {
    const { recentActivity, isLoading } = useAppContext();

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

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'nft_alert':
                return <Bell className="w-4 h-4" />;
            case 'cycles_alert':
                return <Zap className="w-4 h-4" />;
            case 'portfolio_update':
                return <Wallet className="w-4 h-4" />;
            case 'price_change':
                return <TrendingUp className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'nft_alert':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'cycles_alert':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'portfolio_update':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'price_change':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3 p-4 bg-slate-800/30 rounded-xl">
                            <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                            </div>
                            <div className="h-3 bg-slate-700 rounded w-16"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!recentActivity || recentActivity.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold text-white mb-2">No Recent Activity</h3>
                <p className="text-slate-400">Your alerts are standing by. Create some alerts to see activity here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {recentActivity.slice(0, 10).map((activity) => (
                <div
                    key={activity.id}
                    className="group flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
                >
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg border ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                                {activity.message}
                            </p>
                            {activity.blockchain && (
                                <p className="text-sm text-slate-400 mt-1">
                                    {activity.blockchain}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-sm text-slate-500">{formatTimeAgo(activity.timestamp)}</p>
                        <div className="w-2 h-2 bg-cyan-400/50 rounded-full group-hover:bg-cyan-400 transition-colors mt-1"></div>
                    </div>
                </div>
            ))}

            {recentActivity.length > 10 && (
                <div className="text-center pt-4">
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                        View All Activity
                    </button>
                </div>
            )}
        </div>
    );
};
