import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    color: 'cyan' | 'purple' | 'green' | 'yellow' | 'orange' | 'red' | 'blue';
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
    showProgress?: boolean;
    progressValue?: number;
    progressMax?: number;
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    icon,
    color,
    trend,
    subtitle,
    showProgress = false,
    progressValue = 0,
    progressMax = 100,
    className = ""
}) => {
    const colorClasses = {
        cyan: 'bg-cyan-500/20 text-cyan-400 shadow-cyan-500/20',
        purple: 'bg-purple-500/20 text-purple-400 shadow-purple-500/20',
        green: 'bg-green-500/20 text-green-400 shadow-green-500/20',
        yellow: 'bg-yellow-500/20 text-yellow-400 shadow-yellow-500/20',
        orange: 'bg-orange-500/20 text-orange-400 shadow-orange-500/20',
        red: 'bg-red-500/20 text-red-400 shadow-red-500/20',
        blue: 'bg-blue-500/20 text-blue-400 shadow-blue-500/20'
    };

    const progressColors = {
        cyan: 'from-cyan-500 to-blue-500',
        purple: 'from-purple-500 to-pink-500',
        green: 'from-green-500 to-emerald-500',
        yellow: 'from-yellow-500 to-orange-500',
        orange: 'from-orange-500 to-red-500',
        red: 'from-red-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500'
    };

    const progressPercentage = Math.min(100, (progressValue / progressMax) * 100);

    return (
        <div className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-${color}-500/20 hover:border-slate-600/50 transition-all duration-300 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}>
                    {icon}
                </div>
                {change && (
                    <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-400' :
                            trend === 'down' ? 'text-red-400' :
                                'text-slate-400'
                        }`}>
                        {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                        {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                        <span>{change}</span>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-bold text-white leading-none">{value}</p>
                        <p className="text-sm text-slate-400 mt-1">{title}</p>
                    </div>
                    {subtitle && (
                        <p className="text-xs text-slate-500">{subtitle}</p>
                    )}
                </div>

                {showProgress && (
                    <div className="mt-3">
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                            <div
                                className={`bg-gradient-to-r ${progressColors[color]} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>{progressValue}</span>
                            <span>{progressMax}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
