import React, { useState } from 'react';
import { Users, TrendingUp, Award, Eye, Share2, MessageCircle } from 'lucide-react';

interface TraderProfile {
    id: string;
    name: string;
    avatar: string;
    winRate: number;
    totalTrades: number;
    pnl: number;
    followers: number;
    verified: boolean;
    specialty: string;
}

interface TradingSignal {
    id: string;
    traderId: string;
    traderName: string;
    collection: string;
    action: 'buy' | 'sell' | 'hold';
    price: number;
    confidence: number;
    timestamp: string;
    reason: string;
}

export const SocialTrading: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'signals' | 'following'>('leaderboard');

    // Mock data - in real app this would come from your backend
    const topTraders: TraderProfile[] = [
        {
            id: '1',
            name: 'CryptoWhale92',
            avatar: '🐋',
            winRate: 87.5,
            totalTrades: 234,
            pnl: 45.6,
            followers: 1247,
            verified: true,
            specialty: 'Blue Chip NFTs'
        },
        {
            id: '2',
            name: 'NFTMaster',
            avatar: '🎨',
            winRate: 82.1,
            totalTrades: 156,
            pnl: 32.4,
            followers: 892,
            verified: true,
            specialty: 'Art Collections'
        },
        {
            id: '3',
            name: 'FloorSweeper',
            avatar: '🧹',
            winRate: 79.3,
            totalTrades: 189,
            pnl: 28.7,
            followers: 634,
            verified: false,
            specialty: 'Gaming NFTs'
        }
    ];

    const recentSignals: TradingSignal[] = [
        {
            id: '1',
            traderId: '1',
            traderName: 'CryptoWhale92',
            collection: 'Bored Ape Yacht Club',
            action: 'buy',
            price: 45.2,
            confidence: 85,
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            reason: 'Strong support at 45 ETH, expecting bounce to 50+'
        },
        {
            id: '2',
            traderId: '2',
            traderName: 'NFTMaster',
            collection: 'Pudgy Penguins',
            action: 'sell',
            price: 8.7,
            confidence: 78,
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            reason: 'Resistance at 9 ETH, taking profits here'
        }
    ];

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date().getTime();
        const time = new Date(timestamp).getTime();
        const diff = now - time;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (hours > 0) return `${hours}h ago`;
        return `${minutes}m ago`;
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'buy':
                return 'text-green-400 bg-green-500/20';
            case 'sell':
                return 'text-red-400 bg-red-500/20';
            case 'hold':
                return 'text-yellow-400 bg-yellow-500/20';
            default:
                return 'text-slate-400 bg-slate-500/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Users className="w-6 h-6 mr-2 text-cyan-400" />
                        Social Trading
                    </h2>
                    <p className="text-slate-400 mt-1">Follow top NFT traders and get their signals</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Live Signals</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl">
                {[
                    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
                    { id: 'signals', label: 'Live Signals', icon: TrendingUp },
                    { id: 'following', label: 'Following', icon: Eye }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'leaderboard' && (
                    <div className="space-y-4">
                        {topTraders.map((trader, index) => (
                            <div
                                key={trader.id}
                                className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl font-bold text-slate-500">#{index + 1}</span>
                                            <div className="text-3xl">{trader.avatar}</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-semibold text-white">{trader.name}</h3>
                                                {trader.verified && <Award className="w-4 h-4 text-yellow-400" />}
                                            </div>
                                            <p className="text-sm text-slate-400">{trader.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <div className="text-center">
                                            <p className="text-sm text-slate-400">Win Rate</p>
                                            <p className="text-lg font-bold text-green-400">{trader.winRate}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-slate-400">P&L</p>
                                            <p className="text-lg font-bold text-cyan-400">+{trader.pnl} ETH</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-slate-400">Followers</p>
                                            <p className="text-lg font-bold text-white">{trader.followers.toLocaleString()}</p>
                                        </div>
                                        <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'signals' && (
                    <div className="space-y-4">
                        {recentSignals.map((signal) => (
                            <div
                                key={signal.id}
                                className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{signal.traderName}</h4>
                                            <p className="text-sm text-slate-400">{formatTimeAgo(signal.timestamp)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${getActionColor(signal.action)}`}>
                                            {signal.action}
                                        </span>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-400">Confidence</p>
                                            <p className="font-bold text-white">{signal.confidence}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <h5 className="font-medium text-white mb-1">{signal.collection}</h5>
                                    <p className="text-lg font-bold text-cyan-400">{signal.price} ETH</p>
                                </div>

                                <p className="text-slate-300 mb-4">{signal.reason}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors">
                                            <MessageCircle className="w-4 h-4" />
                                            <span className="text-sm">12 comments</span>
                                        </button>
                                        <button className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors">
                                            <Share2 className="w-4 h-4" />
                                            <span className="text-sm">Share</span>
                                        </button>
                                    </div>
                                    <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-white rounded-lg text-sm font-medium transition-all duration-300">
                                        Copy Trade
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'following' && (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Following Yet</h3>
                        <p className="text-slate-400 mb-6">Start following top traders to see their signals here</p>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                        >
                            Browse Traders
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
