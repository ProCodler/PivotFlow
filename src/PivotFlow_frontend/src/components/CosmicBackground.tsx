import React from 'react';

export const CosmicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Simple solid background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-slate-900"></div>

      {/* Minimal star field - reduced from 80 to 20 stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => {
          const colors = ['bg-white/40', 'bg-sky-400/30', 'bg-blue-400/30'];
          const sizes = ['w-0.5 h-0.5', 'w-1 h-1'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

          return (
            <div
              key={i}
              className={`absolute ${randomSize} ${randomColor} rounded-full`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
            />
          );
        })}
      </div>

      {/* Minimal crypto symbols - reduced and no animations */}
      <div className="absolute inset-0">
        <div className="absolute text-3xl text-sky-400/20" style={{ left: '15%', top: '15%' }}>∞</div>
        <div className="absolute text-2xl text-sky-300/15" style={{ left: '70%', top: '20%' }}>∞</div>
        <div className="absolute text-2xl text-blue-400/15" style={{ left: '10%', top: '70%' }}>₿</div>
        <div className="absolute text-2xl text-sky-500/20" style={{ left: '80%', top: '80%' }}>⟠</div>
      </div>

      {/* Single subtle nebula effect */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 bg-sky-500/5 rounded-full blur-3xl"
          style={{ left: '60%', top: '40%' }}
        ></div>
      </div>
    </div>
  );
};