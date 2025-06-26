import React from 'react';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'compact' | 'highlight';
}

export const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  icon, 
  subtitle, 
  children, 
  className = "",
  headerAction,
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-4';
      case 'highlight':
        return 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-600/50 p-6';
      default:
        return 'bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-6';
    }
  };

  return (
    <div className={`backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-300 ${getVariantClasses()} ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="p-2 bg-slate-700/50 rounded-lg">
              {icon}
            </div>
          )}
          <div>
            <h2 className={`font-semibold text-white flex items-center ${variant === 'compact' ? 'text-lg' : 'text-xl'}`}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {headerAction && (
          <div className="flex items-center space-x-2">
            {headerAction}
          </div>
        )}
      </div>
      
      <div className={variant === 'compact' ? 'space-y-2' : 'space-y-4'}>
        {children}
      </div>
    </div>
  );
};
