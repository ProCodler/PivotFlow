import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Clock, RefreshCw, MessageSquare } from 'lucide-react';

interface TelegramNotification {
  id: string;
  type: 'cycles_alert' | 'nft_alert' | 'portfolio_update' | 'chain_fusion_alert';
  title: string;
  message: string;
  blockchain?: string;
  amount?: number;
  currency?: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  success: boolean;
}

export const NotificationHistory: React.FC = () => {
  const [notifications, setNotifications] = useState<TelegramNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock notification data for demo
  const mockNotifications: TelegramNotification[] = [
    {
      id: '1',
      type: 'cycles_alert',
      title: 'Cycles Threshold Exceeded',
      message: 'Operation "Canister Call" cost 1,200,000 cycles, exceeding your threshold of 1,000,000 cycles.',
      blockchain: 'Internet Computer',
      amount: 1200000,
      currency: 'cycles',
      priority: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      success: true,
    },
    {
      id: '2',
      type: 'nft_alert',
      title: 'ICRC-7 Collection Price Alert',
      message: 'Floor price has dropped below your target of 5 ICP. Current floor price: 4.2 ICP',
      blockchain: 'Internet Computer',
      amount: 4.2,
      currency: 'ICP',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      success: true,
    },
    {
      id: '3',
      type: 'chain_fusion_alert',
      title: 'Chain Fusion Bitcoin Transaction',
      message: '✅ Bitcoin transfer from Bitcoin to Internet Computer completed. Status: COMPLETED',
      blockchain: 'Bitcoin → Internet Computer',
      amount: 0.001,
      currency: 'ckBTC',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      success: true,
    },
    {
      id: '4',
      type: 'portfolio_update',
      title: 'Portfolio Update',
      message: '📈 Portfolio value: 125.50 ICP. 24h Change: +12.5% (+13.9 ICP)',
      amount: 125.5,
      currency: 'ICP',
      priority: 'low',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      success: true,
    },
    {
      id: '5',
      type: 'cycles_alert',
      title: 'Cycles Alert Failed',
      message: 'Failed to send cycles alert notification. Please check your Telegram Chat ID.',
      blockchain: 'Internet Computer',
      priority: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      success: false,
    },
  ];

  useEffect(() => {
    // Load notification history
    setNotifications(mockNotifications);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cycles_alert':
        return '⚡';
      case 'nft_alert':
        return '🎨';
      case 'portfolio_update':
        return '💰';
      case 'chain_fusion_alert':
        return '🔗';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'low':
        return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
      default:
        return 'text-slate-400 bg-slate-900/30 border-slate-500/50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const refreshNotifications = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setNotifications([...mockNotifications]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Telegram Notification History</h2>
        </div>
        <button
          onClick={refreshNotifications}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No notifications sent yet</p>
            <p className="text-slate-500 text-sm mt-2">Configure your Telegram Chat ID to start receiving notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-medium truncate">{notification.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-2 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(notification.timestamp)}</span>
                      </div>
                      
                      {notification.blockchain && (
                        <div className="flex items-center space-x-1">
                          <span>🔗</span>
                          <span>{notification.blockchain}</span>
                        </div>
                      )}
                      
                      {notification.amount && notification.currency && (
                        <div className="flex items-center space-x-1">
                          <span>💰</span>
                          <span>{notification.amount.toLocaleString()} {notification.currency}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {notification.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Notification Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {notifications.length}
              </div>
              <div className="text-slate-400 text-sm">Total Sent</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {notifications.filter(n => n.success).length}
              </div>
              <div className="text-slate-400 text-sm">Successful</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {notifications.filter(n => !n.success).length}
              </div>
              <div className="text-slate-400 text-sm">Failed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
              <div className="text-slate-400 text-sm">High Priority</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationHistory;
