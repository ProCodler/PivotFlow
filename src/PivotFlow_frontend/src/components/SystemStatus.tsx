import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Activity, Wifi, Server, Database, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ServiceStatus {
    name: string;
    status: 'operational' | 'degraded' | 'down' | 'maintenance';
    uptime: string;
    responseTime: string;
    lastChecked: string;
    icon: React.ReactNode;
}

interface SystemMetric {
    name: string;
    value: string;
    status: 'good' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
}

export const SystemStatus: React.FC = () => {
    const { canisterCycles } = useAppContext();

    const [services, setServices] = useState<ServiceStatus[]>([
        {
            name: 'NFT Monitoring',
            status: 'operational',
            uptime: '99.9%',
            responseTime: '45ms',
            lastChecked: new Date().toISOString(),
            icon: <Activity className="w-5 h-5" />
        },
        {
            name: 'Cycles Tracking',
            status: 'operational',
            uptime: '99.8%',
            responseTime: '32ms',
            lastChecked: new Date().toISOString(),
            icon: <Zap className="w-5 h-5" />
        },
        {
            name: 'ICP Network',
            status: 'operational',
            uptime: '99.9%',
            responseTime: '120ms',
            lastChecked: new Date().toISOString(),
            icon: <Wifi className="w-5 h-5" />
        },
        {
            name: 'Canister Backend',
            status: 'operational',
            uptime: '100%',
            responseTime: '28ms',
            lastChecked: new Date().toISOString(),
            icon: <Server className="w-5 h-5" />
        },
        {
            name: 'Data Storage',
            status: 'operational',
            uptime: '99.9%',
            responseTime: '15ms',
            lastChecked: new Date().toISOString(),
            icon: <Database className="w-5 h-5" />
        }
    ]);

    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
        {
            name: 'Memory Usage',
            value: '67%',
            status: 'good',
            trend: 'stable'
        },
        {
            name: 'CPU Usage',
            value: '23%',
            status: 'good',
            trend: 'down'
        },
        {
            name: 'Network Latency',
            value: '45ms',
            status: 'good',
            trend: 'stable'
        },
        {
            name: 'Active Connections',
            value: '156',
            status: 'good',
            trend: 'up'
        }
    ]);

    useEffect(() => {
        // Simulate real-time updates
        const interval = setInterval(() => {
            setServices(prev => prev.map(service => ({
                ...service,
                responseTime: `${Math.floor(Math.random() * 50) + 20}ms`,
                lastChecked: new Date().toISOString()
            })));

            setSystemMetrics(prev => prev.map(metric => ({
                ...metric,
                value: metric.name === 'Memory Usage' ? `${Math.floor(Math.random() * 20) + 60}%` :
                    metric.name === 'CPU Usage' ? `${Math.floor(Math.random() * 30) + 15}%` :
                        metric.name === 'Network Latency' ? `${Math.floor(Math.random() * 30) + 30}ms` :
                            metric.name === 'Active Connections' ? `${Math.floor(Math.random() * 50) + 130}` :
                                metric.value
            })));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: ServiceStatus['status']) => {
        switch (status) {
            case 'operational':
                return 'text-green-400 bg-green-500/20';
            case 'degraded':
                return 'text-yellow-400 bg-yellow-500/20';
            case 'down':
                return 'text-red-400 bg-red-500/20';
            case 'maintenance':
                return 'text-blue-400 bg-blue-500/20';
            default:
                return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusIcon = (status: ServiceStatus['status']) => {
        switch (status) {
            case 'operational':
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'degraded':
                return <AlertCircle className="w-4 h-4 text-yellow-400" />;
            case 'down':
                return <AlertCircle className="w-4 h-4 text-red-400" />;
            case 'maintenance':
                return <Clock className="w-4 h-4 text-blue-400" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getMetricColor = (status: SystemMetric['status']) => {
        switch (status) {
            case 'good':
                return 'text-green-400';
            case 'warning':
                return 'text-yellow-400';
            case 'critical':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const formatCycles = (cycles: number) => {
        if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(1)}T`;
        if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(1)}B`;
        if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
        if (cycles >= 1e3) return `${(cycles / 1e3).toFixed(1)}K`;
        return cycles.toString();
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date().getTime();
        const time = new Date(timestamp).getTime();
        const diff = now - time;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(diff / 60000);

        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    };

    const overallStatus = services.every(s => s.status === 'operational') ? 'operational' :
        services.some(s => s.status === 'down') ? 'down' : 'degraded';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-cyan-400" />
                        System Status
                    </h2>
                    <p className="text-slate-400 mt-2">Real-time monitoring of all PivotFlow services</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${getStatusColor(overallStatus)}`}>
                        {getStatusIcon(overallStatus)}
                        <span className="font-medium capitalize">{overallStatus}</span>
                    </div>
                </div>
            </div>

            {/* Overall Status Banner */}
            <div className={`p-6 rounded-2xl border-2 ${overallStatus === 'operational'
                    ? 'border-green-500/30 bg-green-500/5'
                    : overallStatus === 'degraded'
                        ? 'border-yellow-500/30 bg-yellow-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {getStatusIcon(overallStatus)}
                        <div>
                            <h3 className="text-xl font-semibold text-white">
                                {overallStatus === 'operational' && 'All Systems Operational'}
                                {overallStatus === 'degraded' && 'Some Services Degraded'}
                                {overallStatus === 'down' && 'Service Disruption'}
                            </h3>
                            <p className="text-slate-300">
                                {overallStatus === 'operational' && 'All services are running smoothly'}
                                {overallStatus === 'degraded' && 'Some services are experiencing issues'}
                                {overallStatus === 'down' && 'One or more services are down'}
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-slate-400">Last updated</p>
                        <p className="text-white font-medium">{formatTimeAgo(services[0]?.lastChecked || new Date().toISOString())}</p>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                    <div key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${getStatusColor(service.status)}`}>
                                {service.icon}
                            </div>
                            {getStatusIcon(service.status)}
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-white">{service.name}</h3>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Uptime</span>
                                    <span className="text-green-400 font-medium">{service.uptime}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-400">Response</span>
                                    <span className="text-cyan-400 font-medium">{service.responseTime}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-400">Status</span>
                                    <span className={`font-medium capitalize ${getStatusColor(service.status).split(' ')[0]}`}>
                                        {service.status}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500">
                                    Last checked {formatTimeAgo(service.lastChecked)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Metrics */}
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                        Performance Metrics
                    </h3>

                    <div className="space-y-4">
                        {systemMetrics.map((metric, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                                <span className="text-slate-300">{metric.name}</span>
                                <div className="flex items-center space-x-2">
                                    <span className={`font-medium ${getMetricColor(metric.status)}`}>
                                        {metric.value}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${metric.trend === 'up' ? 'bg-green-400' :
                                            metric.trend === 'down' ? 'bg-red-400' :
                                                'bg-gray-400'
                                        }`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Canister Information */}
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                        <Server className="w-5 h-5 mr-2 text-purple-400" />
                        Canister Status
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                            <span className="text-slate-300">Available Cycles</span>
                            <span className="text-green-400 font-medium">{formatCycles(canisterCycles)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                            <span className="text-slate-300">Canister State</span>
                            <span className="text-green-400 font-medium">Running</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                            <span className="text-slate-300">Memory Usage</span>
                            <span className="text-cyan-400 font-medium">45.2 MB</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                            <span className="text-slate-300">Requests/min</span>
                            <span className="text-purple-400 font-medium">1,247</span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-400 font-medium">Healthy</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            All canister functions are operating normally.
                            No critical issues detected.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
