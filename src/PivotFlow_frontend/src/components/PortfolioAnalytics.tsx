import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3, Calendar, RefreshCw } from 'lucide-react';

interface PortfolioData {
    totalValue: number;
    change24h: number;
    changePercentage: number;
    nftCount: number;
    alertsTriggered: number;
    cyclesSpent: number;
}

interface ChartData {
    name: string;
    value: number;
    percentage: number;
    color: string;
}

export const PortfolioAnalytics: React.FC = () => {
    const {
        nftAlerts,
        gasAlerts,
        recentActivity,
        canisterCycles,
        isLoading,
        refreshPortfolio
    } = useAppContext();

    const [portfolioData, setPortfolioData] = useState<PortfolioData>({
        totalValue: 0,
        change24h: 0,
        changePercentage: 0,
        nftCount: 0,
        alertsTriggered: 0,
        cyclesSpent: 0
    });

    const [timeFrame, setTimeFrame] = useState<'24h' | '7d' | '30d' | '1y'>('24h');
    const [chartData, setChartData] = useState<ChartData[]>([]);

    useEffect(() => {
        // Calculate portfolio metrics
        const activeNftAlerts = nftAlerts.filter(alert => alert.isActive);
        const activeCyclesAlerts = gasAlerts.filter(alert => alert.isActive);
        const totalAlertsTriggered = recentActivity.filter(activity =>
            activity.type === 'nft_alert' || activity.type === 'cycles_alert'
        ).length;

        // Simulate portfolio data (in a real app, this would come from API)
        const mockPortfolioValue = activeNftAlerts.reduce((sum, alert) => sum + (alert.targetPrice || 0), 0);
        const mockChange = (Math.random() - 0.5) * 1000;
        const mockChangePercentage = mockChange / (mockPortfolioValue || 1) * 100;

        setPortfolioData({
            totalValue: mockPortfolioValue || 12500,
            change24h: mockChange,
            changePercentage: mockChangePercentage,
            nftCount: activeNftAlerts.length,
            alertsTriggered: totalAlertsTriggered,
            cyclesSpent: canisterCycles
        });

        // Create chart data for alert distribution
        const nftAlertsCount = activeNftAlerts.length;
        const cyclesAlertsCount = activeCyclesAlerts.length;
        const total = nftAlertsCount + cyclesAlertsCount;

        if (total > 0) {
            setChartData([
                {
                    name: 'NFT Alerts',
                    value: nftAlertsCount,
                    percentage: (nftAlertsCount / total) * 100,
                    color: '#06b6d4' // cyan
                },
                {
                    name: 'Cycles Alerts',
                    value: cyclesAlertsCount,
                    percentage: (cyclesAlertsCount / total) * 100,
                    color: '#8b5cf6' // purple
                }
            ]);
        }
    }, [nftAlerts, gasAlerts, recentActivity, canisterCycles]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

    const formatCycles = (cycles: number) => {
        if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(1)}T`;
        if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(1)}B`;
        if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
        if (cycles >= 1e3) return `${(cycles / 1e3).toFixed(1)}K`;
        return cycles.toString();
    };

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center">
                        <BarChart3 className="w-8 h-8 mr-3 text-cyan-400" />
                        Portfolio Analytics
                    </h2>
                    <p className="text-slate-400 mt-2">Track your NFT alerts and cycles spending performance</p>
                </div>

                <div className="flex items-center space-x-3">
                    <select
                        value={timeFrame}
                        onChange={(e) => setTimeFrame(e.target.value as typeof timeFrame)}
                        className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                        <option value="24h">24 Hours</option>
                        <option value="7d">7 Days</option>
                        <option value="30d">30 Days</option>
                        <option value="1y">1 Year</option>
                    </select>

                    <button
                        onClick={refreshPortfolio}
                        disabled={isLoading}
                        className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Portfolio Value */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${portfolioData.changePercentage >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {portfolioData.changePercentage >= 0 ?
                                <TrendingUp className="w-4 h-4" /> :
                                <TrendingDown className="w-4 h-4" />
                            }
                            <span>{formatPercentage(portfolioData.changePercentage)}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-white">
                            {formatCurrency(portfolioData.totalValue)}
                        </p>
                        <p className="text-sm text-slate-400">Portfolio Value</p>
                        <p className={`text-sm ${portfolioData.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {portfolioData.change24h >= 0 ? '+' : ''}{formatCurrency(portfolioData.change24h)} today
                        </p>
                    </div>
                </div>

                {/* Active NFT Alerts */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-cyan-500/20 rounded-xl">
                            <Activity className="w-6 h-6 text-cyan-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-white">{portfolioData.nftCount}</p>
                        <p className="text-sm text-slate-400">Active NFT Alerts</p>
                        <p className="text-sm text-cyan-400">Monitoring collections</p>
                    </div>
                </div>

                {/* Alerts Triggered */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Calendar className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-white">{portfolioData.alertsTriggered}</p>
                        <p className="text-sm text-slate-400">Alerts Triggered</p>
                        <p className="text-sm text-purple-400">This {timeFrame}</p>
                    </div>
                </div>

                {/* Cycles Spent */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                            <Activity className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-white">{formatCycles(portfolioData.cyclesSpent)}</p>
                        <p className="text-sm text-slate-400">Cycles Available</p>
                        <p className="text-sm text-yellow-400">ICP Network</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alert Distribution */}
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                            <PieChart className="w-5 h-5 mr-2 text-cyan-400" />
                            Alert Distribution
                        </h3>
                    </div>

                    {chartData.length > 0 ? (
                        <div className="space-y-4">
                            {chartData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-slate-300">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-medium">{item.value}</p>
                                        <p className="text-sm text-slate-400">{item.percentage.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}

                            {/* Visual Bar */}
                            <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden flex">
                                {chartData.map((item, index) => (
                                    <div
                                        key={index}
                                        className="h-full transition-all duration-500"
                                        style={{
                                            width: `${item.percentage}%`,
                                            backgroundColor: item.color
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">No alert data available</p>
                            <p className="text-sm text-slate-500">Create some alerts to see distribution</p>
                        </div>
                    )}
                </div>

                {/* Performance Metrics */}
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                            Performance Metrics
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300">Alert Success Rate</span>
                                <span className="text-green-400 font-medium">98.5%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full w-[98.5%]"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300">Response Time</span>
                                <span className="text-cyan-400 font-medium">32ms avg</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-400 h-2 rounded-full w-[85%]"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300">Cycles Efficiency</span>
                                <span className="text-purple-400 font-medium">92.1%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full w-[92.1%]"></div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700/50">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-white">24/7</p>
                                    <p className="text-sm text-slate-400">Monitoring</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">99.9%</p>
                                    <p className="text-sm text-slate-400">Uptime</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
