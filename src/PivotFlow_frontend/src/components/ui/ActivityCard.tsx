import React from 'react';
import { Bell, Zap, Wallet, Activity } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'nft_alert' | 'cycles_alert' | 'chain_fusion' | 'portfolio_update';
  message: string;
  blockchain?: string;
  timestamp: string;
}

interface ActivityCardProps {
  activity: ActivityItem;
  formatTimeAgo: (timestamp: string) => string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, formatTimeAgo }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'nft_alert':
        return <Bell size={16} />;
      case 'cycles_alert':
        return <Zap size={16} />;
      case 'chain_fusion':
        return <Activity size={16} />;
      case 'portfolio_update':
        return <Wallet size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getActivityStyle = (type: ActivityItem['type']) => {
    switch (type) {
      case 'nft_alert':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'cycles_alert':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'chain_fusion':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'portfolio_update':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="group flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300">
      <div className="flex items-start space-x-3 flex-1">
        <div className={`p-2.5 rounded-lg ${getActivityStyle(activity.type)} group-hover:scale-110 transition-transform duration-200`}>
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium leading-snug group-hover:text-white/90 transition-colors">
            {activity.message}
          </p>
          {activity.blockchain && (
            <div className="flex items-center mt-1">
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-2" />
              <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                {activity.blockchain}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end ml-4">
        <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors whitespace-nowrap">
          {formatTimeAgo(activity.timestamp)}
        </p>
        <div className="w-1 h-1 bg-slate-600 rounded-full mt-1 group-hover:bg-slate-500 transition-colors" />
      </div>
    </div>
  );
};
