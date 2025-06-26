import React from 'react';

export const CosmicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient background with deeper cosmic colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black"></div>

      {/* Secondary gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/30 via-purple-900/20 to-pink-950/30"></div>

      {/* Deep space radial gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-900/10 to-transparent"></div>

      {/* Animated stars with cosmic colors */}
      <div className="absolute inset-0">
        {Array.from({ length: 80 }).map((_, i) => {
          const colors = ['bg-white', 'bg-cyan-400', 'bg-purple-400', 'bg-pink-400', 'bg-blue-300', 'bg-yellow-300'];
          const sizes = ['w-0.5 h-0.5', 'w-1 h-1', 'w-1.5 h-1.5'];
          const animations = ['animate-pulse', 'animate-twinkle'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
          const randomAnimation = animations[Math.floor(Math.random() * animations.length)];

          return (
            <div
              key={i}
              className={`absolute ${randomSize} ${randomColor} rounded-full ${randomAnimation}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1.5 + Math.random() * 2.5}s`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          );
        })}
      </div>

      {/* Floating crypto symbols with enhanced colors */}
      <div className="absolute inset-0">
        {/* ICP symbol - prominent position */}
        <div className="absolute text-5xl text-purple-400/30 animate-float-slow"
             style={{ left: '15%', top: '15%', animationDelay: '0s' }}>
          ∞
        </div>
        
        {/* ICP symbol - second position */}
        <div className="absolute text-4xl text-cyan-400/25 animate-float-medium"
             style={{ left: '70%', top: '20%', animationDelay: '2s' }}>
          ∞
        </div>
        
        {/* Bitcoin symbol */}

        <div className="absolute text-4xl text-orange-400/25 animate-float-slow drop-shadow-lg"
          style={{ left: '10%', top: '20%', animationDelay: '0s' }}>

          ₿
        </div>

        {/* Ethereum symbol */}

        <div className="absolute text-3xl text-blue-400/30 animate-float-medium drop-shadow-lg"
          style={{ left: '80%', top: '30%', animationDelay: '1s' }}>
          ⟠
        </div>

        {/* Generic crypto symbol */}
        <div className="absolute text-2xl text-emerald-400/25 animate-float-fast drop-shadow-lg"
          style={{ left: '70%', top: '70%', animationDelay: '2s' }}>
          ◊
        </div>

        {/* ICP-style symbol */}
        <div className="absolute text-3xl text-purple-400/30 animate-float-slow drop-shadow-lg"
          style={{ left: '20%', top: '80%', animationDelay: '1.5s' }}>
          ∞

        </div>

        {/* NFT symbol */}
        <div className="absolute text-2xl text-pink-400/25 animate-float-medium drop-shadow-lg"
          style={{ left: '50%', top: '15%', animationDelay: '0.5s' }}>
          🖼
        </div>

        {/* Additional symbols for more cosmic feel */}
        <div className="absolute text-2xl text-cyan-400/20 animate-float-slow drop-shadow-lg"
          style={{ left: '90%', top: '60%', animationDelay: '3s' }}>
          ◈
        </div>

        <div className="absolute text-3xl text-indigo-400/25 animate-float-medium drop-shadow-lg"
          style={{ left: '5%', top: '50%', animationDelay: '2.5s' }}>
          ⬢
        </div>
      </div>

      {/* Enhanced nebula effects */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl animate-cosmic-pulse"
          style={{ left: '60%', top: '40%', animationDelay: '0s' }}></div>
        <div className="absolute w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-cosmic-pulse"
          style={{ left: '20%', top: '60%', animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-pink-500/6 rounded-full blur-3xl animate-cosmic-pulse"
          style={{ left: '80%', top: '20%', animationDelay: '2s' }}></div>
        <div className="absolute w-72 h-72 bg-indigo-500/7 rounded-full blur-3xl animate-cosmic-pulse"
          style={{ left: '10%', top: '10%', animationDelay: '1.5s' }}></div>
        <div className="absolute w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl animate-cosmic-pulse"
          style={{ left: '75%', top: '85%', animationDelay: '0.5s' }}></div>
      </div>

      {/* Cosmic dust particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute w-px h-px bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-1 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shooting-star"
          style={{ left: '-100px', top: '20%', animationDelay: '2s', animationDuration: '3s' }}></div>
        <div className="absolute w-1 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-shooting-star"
          style={{ left: '-100px', top: '60%', animationDelay: '5s', animationDuration: '2.5s' }}></div>
        <div className="absolute w-1 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-shooting-star"
          style={{ left: '-100px', top: '80%', animationDelay: '8s', animationDuration: '3.5s' }}></div>
      </div>
    </div>
  );
};