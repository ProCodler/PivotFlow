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
        cyan: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        purple: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
        green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
        blue: 'bg-sky-400/20 text-sky-400 border-sky-400/30'
    };

    const progressColors = {
        cyan: 'from-sky-500 to-sky-400',
        purple: 'from-violet-500 to-violet-400',
        green: 'from-emerald-500 to-emerald-400',
        yellow: 'from-yellow-500 to-yellow-400',
        orange: 'from-orange-500 to-orange-400',
        red: 'from-red-500 to-red-400',
        blue: 'from-sky-400 to-sky-300'
    };

    const textColors = {
        cyan: 'text-sky-400',
        purple: 'text-violet-400',
        green: 'text-emerald-400',
        yellow: 'text-yellow-400',
        orange: 'text-orange-400',
        red: 'text-red-400',
        blue: 'text-sky-400'
    };

    const progressPercentage = Math.min(100, (progressValue / progressMax) * 100);

    return (
        <div className={`card-glow rounded-2xl p-6 w-auto min-w-fit transition-all duration-200 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
                    {icon}
                </div>
                {change && (
                    <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-emerald-400' :
                        trend === 'down' ? 'text-red-400' :
                            'text-muted-foreground'
                        }`}>
                        {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                        {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                        <span className="text-sky-400">{change}</span>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-end justify-between">
                    <div>
                        <p className={`text-3xl font-bold leading-none ${textColors[color]}`}>{value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{title}</p>
                    </div>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground/70">{subtitle}</p>
                    )}
                </div>

                {showProgress && (
                    <div className="mt-3">
                        <div className="w-full bg-muted/30 rounded-full h-2 border border-border/30">
                            <div
                                className={`bg-gradient-to-r ${progressColors[color]} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{progressValue}</span>
                            <span>{progressMax}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
