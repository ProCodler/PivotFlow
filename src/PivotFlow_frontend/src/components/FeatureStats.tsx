import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Shield, Zap, Globe,  TrendingUp, Bell, Wallet, Activity } from 'lucide-react';

interface FeatureStatProps {
    title: string;
    description: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
}

const FeatureStat: React.FC<FeatureStatProps> = ({ title, description, value, icon, color, gradient }) => {
    return (
        <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:border-slate-600/50 transition-all duration-300 group`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/3 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-500"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        {icon}
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                            {value}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const FeatureStats: React.FC = () => {
    const { nftAlerts, gasAlerts, recentActivity, canisterCycles, isOperator } = useAppContext();

    const formatCycles = (cycles: number) => {
        if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(1)}T`;
        if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(1)}B`;
        if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
        if (cycles >= 1e3) return `${(cycles / 1e3).toFixed(1)}K`;
        return cycles.toString();
    };

    const activeNftAlerts = nftAlerts.filter(alert => alert.isActive).length;
    const activeGasAlerts = gasAlerts.filter(alert => alert.isActive).length;
    const totalActiveAlerts = activeNftAlerts + activeGasAlerts;
    const uniqueCollections = new Set(nftAlerts.map(alert => alert.collectionSlug)).size;

    const features = [
        {
            title: 'NFT Price Monitoring',
            description: 'Real-time floor price tracking across multiple NFT collections with instant alerts when thresholds are met.',
            value: activeNftAlerts.toString(),
            icon: <Bell className="w-6 h-6 text-cyan-400" />,
            color: 'bg-cyan-500/20',
            gradient: 'from-cyan-900/20 to-blue-900/20'
        },
        {
            title: 'Cycles Optimization',
            description: 'Smart monitoring of ICP cycles consumption with predictive alerts for cost optimization.',
            value: activeGasAlerts.toString(),
            icon: <Zap className="w-6 h-6 text-purple-400" />,
            color: 'bg-purple-500/20',
            gradient: 'from-purple-900/20 to-pink-900/20'
        },
        {
            title: 'Cross-Chain Support',
            description: 'Multi-blockchain compatibility enabling monitoring across Ethereum, ICP, and other major networks.',
            value: uniqueCollections.toString(),
            icon: <Globe className="w-6 h-6 text-green-400" />,
            color: 'bg-green-500/20',
            gradient: 'from-green-900/20 to-emerald-900/20'
        },
        {
            title: 'Secure Authentication',
            description: 'Decentralized identity management through Internet Computer Protocol for maximum security.',
            value: '100%',
            icon: <Shield className="w-6 h-6 text-blue-400" />,
            color: 'bg-blue-500/20',
            gradient: 'from-blue-900/20 to-indigo-900/20'
        },
        {
            title: 'Real-Time Analytics',
            description: 'Advanced market analytics with AI-powered insights for better trading decisions.',
            value: recentActivity.length.toString(),
            icon: <TrendingUp className="w-6 h-6 text-orange-400" />,
            color: 'bg-orange-500/20',
            gradient: 'from-orange-900/20 to-red-900/20'
        },
        {
            title: 'Portfolio Tracking',
            description: 'Comprehensive portfolio management with performance metrics and risk assessment.',
            value: `${totalActiveAlerts}`,
            icon: <Wallet className="w-6 h-6 text-pink-400" />,
            color: 'bg-pink-500/20',
            gradient: 'from-pink-900/20 to-rose-900/20'
        }
    ];

    // Add cycles feature for operators
    if (isOperator) {
        features.push({
            title: 'Canister Management',
            description: 'Advanced canister lifecycle management with automated scaling and monitoring.',
            value: formatCycles(canisterCycles),
            icon: <Activity className="w-6 h-6 text-yellow-400" />,
            color: 'bg-yellow-500/20',
            gradient: 'from-yellow-900/20 to-amber-900/20'
        });
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Platform Features
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Discover the powerful features that make PivotFlow the ultimate Web3 monitoring solution
                </p>
            </div>

            {/* Stats Overview */}
            <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                            {totalActiveAlerts}
                        </div>
                        <div className="text-slate-400 text-sm md:text-base">Active Alerts</div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                            {uniqueCollections}
                        </div>
                        <div className="text-slate-400 text-sm md:text-base">Collections</div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                            99.9%
                        </div>
                        <div className="text-slate-400 text-sm md:text-base">Uptime</div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">
                            &lt;2s
                        </div>
                        <div className="text-slate-400 text-sm md:text-base">Alert Speed</div>
                    </div>
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <FeatureStat
                        key={index}
                        title={feature.title}
                        description={feature.description}
                        value={feature.value}
                        icon={feature.icon}
                        color={feature.color}
                        gradient={feature.gradient}
                    />
                ))}
            </div>
        </div>
    );
};
