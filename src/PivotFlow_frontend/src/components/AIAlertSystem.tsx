import React, { useState } from 'react';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Settings, Zap } from 'lucide-react';

interface AIInsight {
    id: string;
    type: 'prediction' | 'anomaly' | 'opportunity' | 'warning';
    title: string;
    description: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    timestamp: string;
    actionable: boolean;
}

interface AIConfiguration {
    smartAlerts: boolean;
    marketPredictions: boolean;
    anomalyDetection: boolean;
    riskAssessment: boolean;
    confidenceThreshold: number;
}

export const AIAlertSystem: React.FC = () => {
    const [config, setConfig] = useState<AIConfiguration>({
        smartAlerts: true,
        marketPredictions: true,
        anomalyDetection: true,
        riskAssessment: false,
        confidenceThreshold: 75
    });

    const [activeTab, setActiveTab] = useState<'insights' | 'config'>('insights');

    // Mock AI insights
    const aiInsights: AIInsight[] = [
        {
            id: '1',
            type: 'prediction',
            title: 'BAYC Floor Price Prediction',
            description: 'AI models predict BAYC floor price will increase by 15-20% in the next 48 hours based on whale activity and market sentiment.',
            confidence: 87,
            impact: 'high',
            timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
            actionable: true
        },
        {
            id: '2',
            type: 'opportunity',
            title: 'Undervalued Collection Detected',
            description: 'Pudgy Penguins showing strong fundamentals with 23% below historical average. Potential entry opportunity.',
            confidence: 92,
            impact: 'medium',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
            actionable: true
        },
        {
            id: '3',
            type: 'anomaly',
            title: 'Unusual Trading Volume',
            description: 'Detected 340% increase in trading volume for Azuki collection in the last 2 hours. Investigate potential catalyst.',
            confidence: 78,
            impact: 'high',
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
            actionable: false
        },
        {
            id: '4',
            type: 'warning',
            title: 'Market Volatility Alert',
            description: 'Elevated market volatility detected. Consider risk management strategies for active positions.',
            confidence: 85,
            impact: 'medium',
            timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
            actionable: true
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

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'prediction':
                return <TrendingUp className="w-5 h-5" />;
            case 'opportunity':
                return <Sparkles className="w-5 h-5" />;
            case 'anomaly':
                return <AlertTriangle className="w-5 h-5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />;
            default:
                return <Brain className="w-5 h-5" />;
        }
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'prediction':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'opportunity':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'anomaly':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'warning':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high':
                return 'text-red-400';
            case 'medium':
                return 'text-yellow-400';
            case 'low':
                return 'text-green-400';
            default:
                return 'text-slate-400';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-400';
        if (confidence >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Brain className="w-6 h-6 mr-2 text-purple-400" />
                        AI Alert System
                    </h2>
                    <p className="text-slate-400 mt-1">Advanced market intelligence and predictive insights</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-purple-400">AI Active</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl">
                {[
                    { id: 'insights', label: 'AI Insights', icon: Sparkles },
                    { id: 'config', label: 'Configuration', icon: Settings }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'insights' && (
                    <div className="space-y-4">
                        {aiInsights.map((insight) => (
                            <div
                                key={insight.id}
                                className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg border ${getInsightColor(insight.type)}`}>
                                            {getInsightIcon(insight.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{insight.title}</h4>
                                            <p className="text-sm text-slate-400">{formatTimeAgo(insight.timestamp)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400">Confidence</p>
                                            <p className={`font-bold ${getConfidenceColor(insight.confidence)}`}>
                                                {insight.confidence}%
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400">Impact</p>
                                            <p className={`font-bold uppercase text-xs ${getImpactColor(insight.impact)}`}>
                                                {insight.impact}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-300 mb-4">{insight.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getInsightColor(insight.type)}`}>
                                            {insight.type}
                                        </span>
                                        {insight.actionable && (
                                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-medium">
                                                Actionable
                                            </span>
                                        )}
                                    </div>

                                    {insight.actionable && (
                                        <div className="flex space-x-2">
                                            <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-white rounded-lg text-sm font-medium transition-all duration-300">
                                                Dismiss
                                            </button>
                                            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105">
                                                Create Alert
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Zap className="w-5 h-5 mr-2 text-purple-400" />
                                AI Features
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { key: 'smartAlerts', label: 'Smart Alerts', description: 'AI-powered alert optimization and filtering' },
                                    { key: 'marketPredictions', label: 'Market Predictions', description: 'Price and trend predictions based on ML models' },
                                    { key: 'anomalyDetection', label: 'Anomaly Detection', description: 'Detect unusual market behavior and opportunities' },
                                    { key: 'riskAssessment', label: 'Risk Assessment', description: 'Automated risk analysis for trading decisions' }
                                ].map((feature) => (
                                    <div key={feature.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-white">{feature.label}</h4>
                                            <p className="text-sm text-slate-400">{feature.description}</p>
                                        </div>
                                        <button
                                            onClick={() => setConfig(prev => ({ ...prev, [feature.key]: !prev[feature.key as keyof AIConfiguration] }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config[feature.key as keyof AIConfiguration] ? 'bg-purple-500' : 'bg-slate-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config[feature.key as keyof AIConfiguration] ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Confidence Threshold</h3>
                            <p className="text-slate-400 mb-4">Only show insights with confidence above this threshold</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">{config.confidenceThreshold}%</span>
                                    <span className="text-sm text-slate-400">Minimum Confidence</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="95"
                                    step="5"
                                    value={config.confidenceThreshold}
                                    onChange={(e) => setConfig(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>50%</span>
                                    <span>95%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
