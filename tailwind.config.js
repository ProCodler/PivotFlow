/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Morphy UI + ICP Astronaut Vibes Palette
        'space-deep-blue': '#0D0D1A',
        'space-dark-purple': '#1A0A2D',
        'space-mid-purple': '#2E0A4E',
        'accent-cyan': '#00F0FF',
        'accent-magenta': '#FF00FF',
        'accent-green': '#00FF00',
        'accent-gold': '#FFD700',
        'text-light': '#E0E0E0',
        'text-muted': '#BBBBBB',
        // Shadcn UI preset colors (adjust if using their actual components with custom theme)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", // e.g. #0D0D1A for dark mode
        foreground: "hsl(var(--foreground))", // e.g. #E0E0E0 for dark mode
        primary: {
          DEFAULT: "hsl(var(--primary))", // e.g. accent-cyan
          foreground: "hsl(var(--primary-foreground))", // e.g. space-deep-blue
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // e.g. space-mid-purple
          foreground: "hsl(var(--secondary-foreground))", // e.g. text-light
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // e.g. #FF4D4D
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // e.g. accent-magenta
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))", // e.g. space-dark-purple
          foreground: "hsl(var(--card-foreground))", // e.g. text-light
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem', // Default xl is 0.75rem
        '2xl': '1.5rem', // Default 2xl is 1rem
        'morphic': '1.25rem', // Custom for general morphic elements
      },
      boxShadow: {
        'morphic-sm': '0 4px 15px rgba(0, 240, 255, 0.1), 0 2px 8px rgba(128, 0, 128, 0.1)',
        'morphic-md': '0 8px 25px rgba(0, 240, 255, 0.15), 0 4px 12px rgba(128, 0, 128, 0.15)',
        'morphic-lg': '0 12px 35px rgba(0, 240, 255, 0.2), 0 6px 18px rgba(128, 0, 128, 0.2)',
        'morphic-xl': '0 20px 50px rgba(0, 240, 255, 0.25), 0 10px 30px rgba(128, 0, 128, 0.25)',
        'inner_md': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.25), inset 0 -1px 2px 0 rgba(200, 200, 255, 0.1)', // For inputs etc.
      },
      keyframes: {
        'text-glow': {
          '0%, 100%': { textShadow: '0 0 5px #00F0FF, 0 0 10px #00F0FF, 0 0 15px #FF00FF, 0 0 20px #FF00FF' },
          '50%': { textShadow: '0 0 10px #FF00FF, 0 0 15px #FF00FF, 0 0 20px #00F0FF, 0 0 25px #00F0FF' },
        },
        'float': {
          '0%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.05' },
          '25%': { transform: 'translateY(-15px) rotate(5deg)', opacity: '0.1' },
          '50%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.07' },
          '75%': { transform: 'translateY(15px) rotate(-5deg)', opacity: '0.1' },
          '100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.05' },
        },
        'stars': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-10000px 5000px' }, // Adjust for desired speed/direction
        },
        'pulse-border-red': {
          '0%, 100%': { borderColor: 'rgba(255, 77, 77, 0.5)', boxShadow: '0 0 15px rgba(255, 77, 77, 0.2)' },
          '50%': { borderColor: 'rgba(255, 77, 77, 0.8)', boxShadow: '0 0 25px rgba(255, 77, 77, 0.4)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          'to': { opacity: '1', transform: 'scale(1) translateY(0px)' },
        },
        'toast-in': {
            'from': { opacity: '0', transform: 'translateX(100%)' },
            'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'spin-slow': {
            'to': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'text-glow': 'text-glow 3s ease-in-out infinite',
        'float': 'float 15s ease-in-out infinite', // Base duration, will be varied inline
        'stars': 'stars 200s linear infinite',
        'pulse-border-red': 'pulse-border-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'toast-in': 'toast-in 0.5s ease-out forwards',
        'spin-slow': 'spin-slow 2s linear infinite',
      },
      // For shadcn/ui theming (if not using CSS variables extensively for colors)
      // These are just examples, align with your actual shadcn variables
      // '--background': '#0D0D1A',
      // '--foreground': '#E0E0E0',
      // '--card': '#1A0A2D',
      // '--card-foreground': '#E0E0E0',
      // '--popover': '#2E0A4E',
      // '--popover-foreground': '#E0E0E0',
      // '--primary': '#00F0FF',
      // '--primary-foreground': '#0D0D1A',
      // '--secondary': '#2E0A4E',
      // '--secondary-foreground': '#E0E0E0',
      // '--muted': '#BBBBBB',
      // '--muted-foreground': '#888888',
      // '--accent': '#FF00FF',
      // '--accent-foreground': '#FFFFFF',
      // '--destructive': '#FF4D4D',
      // '--destructive-foreground': '#FFFFFF',
      // '--border': '#2E0A4E',
      // '--input': '#2E0A4E',
      // '--ring': '#00F0FF',
      // '--radius': '1.25rem', // Morphic border radius
    },
  },
  plugins: [
    require('tailwindcss-animate'), // For shadcn/ui animations and custom ones
  ],
};
