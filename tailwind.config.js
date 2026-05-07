/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          1: 'rgba(255,255,255,0.03)',
          2: 'rgba(255,255,255,0.055)',
          3: 'rgba(255,255,255,0.08)',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.16)',
        },
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          glow: 'rgba(99,102,241,0.35)',
        },
        ink: {
          DEFAULT: '#f1f5f9',
          muted:   '#64748b',
          faint:   '#334155',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
      },
      backgroundImage: {
        'grid-subtle': `
          linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
        `,
        'glow-indigo': 'radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 70%)',
        'glow-cyan':   'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, transparent 70%)',
        'card-shine':  'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)',
      },
      backgroundSize: {
        'grid': '44px 44px',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease both',
        'fade-in':    'fadeIn 0.3s ease both',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.32,0.72,0,1) both',
        'shimmer':    'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'bar-fill':   'barFill 0.8s cubic-bezier(0.34,1.56,0.64,1) both',
        'ring-draw':  'ringDraw 1s cubic-bezier(0.34,1.56,0.64,1) both',
        'shake':      'shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both',
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(100%)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        pulseGlow: { '0%,100%': { opacity: 0.4 }, '50%': { opacity: 0.8 } },
        barFill:   { from: { width: '0%' } },
        ringDraw:  { from: { strokeDashoffset: '999' } },
        shake: {
          '10%, 90%': { transform: 'translateX(-2px)' },
          '20%, 80%': { transform: 'translateX(4px)' },
          '30%, 50%, 70%': { transform: 'translateX(-6px)' },
          '40%, 60%': { transform: 'translateX(6px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
