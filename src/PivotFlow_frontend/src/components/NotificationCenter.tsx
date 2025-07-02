import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Bell, X, Check, AlertTriangle, Info, Settings } from 'lucide-react';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
}

export const NotificationCenter: React.FC = () => {
    const { recentActivity, nftAlerts, gasAlerts } = useAppContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Convert recent activity to notifications
        const activityNotifications: Notification[] = recentActivity.map(activity => ({
            id: activity.id,
            type: activity.type === 'nft_alert' ? 'info' :
                activity.type === 'cycles_alert' ? 'warning' :
                    activity.type === 'portfolio_update' ? 'success' :
                        'info',
            title: activity.type === 'nft_alert' ? 'NFT Alert Triggered' :
                activity.type === 'cycles_alert' ? 'Cycles Alert' :
                    activity.type === 'portfolio_update' ? 'Portfolio Updated' :
                        'Activity Update',
            message: activity.message,
            timestamp: activity.timestamp,
            isRead: false,
            actionUrl: activity.type === 'nft_alert' ? '/nft-alerts' :
                activity.type === 'cycles_alert' ? '/blockchain-fees' : undefined
        }));

        // Add system notifications
        const systemNotifications: Notification[] = [];

        // Check for cycles alerts
        const activeCyclesAlerts = gasAlerts.filter(alert => alert.isActive);
        if (activeCyclesAlerts.length > 0) {
            systemNotifications.push({
                id: 'cycles-warning',
                type: 'warning',
                title: 'Cycles Alert Active',
                message: `${activeCyclesAlerts.length} cycles alerts are currently active`,
                timestamp: new Date().toISOString(),
                isRead: false,
                actionUrl: '/blockchain-fees'
            });
        }

        // Check for NFT alerts
        const activeNftAlerts = nftAlerts.filter(alert => alert.isActive);
        if (activeNftAlerts.length > 5) {
            systemNotifications.push({
                id: 'nft-alert-high',
                type: 'info',
                title: 'High NFT Alert Activity',
                message: `${activeNftAlerts.length} NFT alerts are currently active`,
                timestamp: new Date().toISOString(),
                isRead: false,
                actionUrl: '/nft-alerts'
            });
        }

        const allNotifications = [...systemNotifications, ...activityNotifications].slice(0, 20);
        setNotifications(allNotifications);
        setUnreadCount(allNotifications.filter(n => !n.isRead).length);
    }, [recentActivity, nftAlerts, gasAlerts]);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const clearNotification = (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <Check className="w-5 h-5 text-emerald-400" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'error':
                return <X className="w-5 h-5 text-red-400" />;
            case 'info':
                return <Info className="w-5 h-5 text-sky-400" />;
            default:
                return <Bell className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getNotificationBorder = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-emerald-500/30 bg-emerald-500/5';
            case 'warning':
                return 'border-yellow-500/30 bg-yellow-500/5';
            case 'error':
                return 'border-red-500/30 bg-red-500/5';
            case 'info':
                return 'border-sky-500/30 bg-sky-500/5';
            default:
                return 'border-border bg-card/30';
        }
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
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl glass-effect hover:border-sky-400/50 transition-all duration-200 border-glow"
                aria-label="Open notifications"
                title="Notifications"
            >
                <Bell className="w-6 h-6 text-sky-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-96 card-glow rounded-2xl z-50!  max-h-[600px] overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Bell className="w-5 h-5 text-sky-400" />
                                <h3 className="font-semibold text-foreground">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-sky-500/20 text-sky-400 text-xs px-2 py-1 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-muted/50 rounded-lg transition-colors"
                                    aria-label="Close notifications"
                                    title="Close"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No notifications yet</p>
                                <p className="text-sm text-muted-foreground/70 mt-1">
                                    We'll notify you when something important happens
                                </p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-xl border transition-all duration-200 hover:border-sky-400/30 group ${notification.isRead
                                            ? 'bg-card/30 border-border/30'
                                            : getNotificationBorder(notification.type)
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-medium ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                                                        }`}>
                                                        {notification.title}
                                                    </p>
                                                    <button
                                                        onClick={() => clearNotification(notification.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted/50 rounded transition-all"
                                                        aria-label="Clear notification"
                                                        title="Clear"
                                                    >
                                                        <X className="w-3 h-3 text-muted-foreground" />
                                                    </button>
                                                </div>

                                                <p className={`text-sm mt-1 ${notification.isRead ? 'text-muted-foreground' : 'text-muted-foreground'
                                                    }`}>
                                                    {notification.message}
                                                </p>

                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-muted-foreground/70">
                                                        {formatTimeAgo(notification.timestamp)}
                                                    </span>

                                                    <div className="flex items-center space-x-2">
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                        {notification.actionUrl && (
                                                            <button className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                                                                View
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-border">
                        <button className="w-full text-sm text-sky-400 hover:text-sky-300 transition-colors flex items-center justify-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Notification Settings</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-45"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};      
