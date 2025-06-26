import React, { useState } from 'react';
import { SocialTrading } from '../SocialTrading';
import { AIAlertSystem } from '../AIAlertSystem';
import { DashboardMetrics } from '../DashboardMetrics';
import { FeatureStats } from '../FeatureStats';
import { Brain, Users, BarChart3, Star } from 'lucide-react';

export const AdvancedFeaturesPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'social' | 'ai' | 'metrics' | 'features'>('social');

    const tabs = [
        { id: 'social', label: 'Social Trading', icon: Users, component: SocialTrading },
        { id: 'ai', label: 'AI Insights', icon: Brain, component: AIAlertSystem },
        { id: 'metrics', label: 'Analytics', icon: BarChart3, component: DashboardMetrics },
        { id: 'features', label: 'Feature Stats', icon: Star, component: FeatureStats }
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || SocialTrading;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Advanced Features
                </h1>
                <p className="text-slate-400 text-lg">
                    Explore powerful tools for professional NFT trading and analysis
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 bg-slate-800/50 p-2 rounded-2xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30 shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[600px]">
                <ActiveComponent />
            </div>
        </div>
    );
};
