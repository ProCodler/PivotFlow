import React from 'react';

interface PivotFlowLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'minimal' | 'text-only';
    className?: string;
}

export const PivotFlowLogo: React.FC<PivotFlowLogoProps> = ({
    size = 'md',
    variant = 'default',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'h-8 w-auto',
        md: 'h-12 w-auto',
        lg: 'h-16 w-auto',
        xl: 'h-24 w-auto'
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-5xl'
    };

    if (variant === 'text-only') {
        return (
            <div className={`flex items-center ${className}`}>
                <span className={`font-bold bg-gradient-to-r from-sky-400 via-sky-500 to-blue-400 bg-clip-text text-transparent ${textSizes[size]}`}>
                    PivotFlow
                </span>
            </div>
        );
    }

    const LogoIcon = () => (
        <div className="relative">
            {/* Main logo container */}
            <div className="relative flex items-center justify-center">
                {/* Outer ring - representing blockchain network */}
                <div className="absolute w-full h-full rounded-full border-2 border-sky-400 animate-spin-slow opacity-60"></div>

                {/* Middle ring - representing data flow */}
                <div className="absolute w-4/5 h-4/5 rounded-full border border-sky-500/50 animate-pulse"></div>

                {/* Inner core - representing the pivot point */}
                <div className="relative z-10 flex items-center justify-center">
                    {/* Central pivot symbol */}
                    <svg
                        viewBox="0 0 100 100"
                        className={`${sizeClasses[size]} fill-current text-transparent`}
                    >
                        {/* Gradient definitions */}
                        <defs>
                            <linearGradient id="pivotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="50%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#60a5fa" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Main pivot shape - representing flow and movement */}
                        <path
                            d="M50 10 
                 L80 30 
                 L70 50 
                 L90 70 
                 L70 90 
                 L50 80 
                 L30 90 
                 L10 70 
                 L30 50 
                 L20 30 
                 Z"
                            fill="url(#pivotGradient)"
                            filter="url(#glow)"
                            className="drop-shadow-lg"
                        />

                        {/* Inner flow lines */}
                        <path
                            d="M35 35 L65 35 M35 50 L65 50 M35 65 L65 65"
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />

                        {/* Central pivot dot */}
                        <circle
                            cx="50"
                            cy="50"
                            r="4"
                            fill="white"
                            className="drop-shadow-md"
                        />
                    </svg>
                </div>

                {/* Floating particles around the logo */}
                <div className="absolute inset-0">
                    <div className="absolute w-1 h-1 bg-sky-400 rounded-full animate-ping"
                        style={{ left: '80%', top: '20%', animationDelay: '0s' }}></div>
                    <div className="absolute w-1 h-1 bg-sky-500 rounded-full animate-ping"
                        style={{ left: '20%', top: '80%', animationDelay: '1s' }}></div>
                    <div className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping"
                        style={{ left: '90%', top: '70%', animationDelay: '2s' }}></div>
                </div>
            </div>
        </div>
    );

    if (variant === 'minimal') {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <div className={sizeClasses[size]}>
                    <LogoIcon />
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className={sizeClasses[size]}>
                <LogoIcon />
            </div>
            <div className="flex flex-col">
                <span className={`font-bold bg-gradient-to-r from-sky-400 via-sky-500 to-blue-400 bg-clip-text text-transparent ${textSizes[size]}`}>
                    PivotFlow
                </span>
                <span className="text-xs text-slate-400 tracking-wider uppercase">
                    Web3 Alert System
                </span>
            </div>
        </div>
    );
};

// Additional logo variants for specific use cases
export const PivotFlowLogoIcon: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
    size = 'md',
    className = ''
}) => {
    return <PivotFlowLogo size={size} variant="minimal" className={className} />;
};

export const PivotFlowWordmark: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
    size = 'md',
    className = ''
}) => {
    return <PivotFlowLogo size={size} variant="text-only" className={className} />;
};
