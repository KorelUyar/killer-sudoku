import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#07060d',
          elevated: '#0d0c17',
        },
        accent: {
          violet: '#7c3aed',
          cyan: '#06b6d4',
          glow: '#a78bfa',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.16)',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'aurora':
          'radial-gradient(ellipse 1200px 600px at 10% 0%, rgba(124,58,237,0.25), transparent 50%), radial-gradient(ellipse 1000px 500px at 90% 10%, rgba(6,182,212,0.22), transparent 50%)',
        'noise':
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        'gradient-accent': 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,58,237,0.35), 0 0 32px -8px rgba(124,58,237,0.45)',
        cyan: '0 0 0 1px rgba(6,182,212,0.35), 0 0 32px -8px rgba(6,182,212,0.45)',
      },
      animation: {
        'cell-pop': 'cell-pop 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        shake: 'shake 360ms cubic-bezier(.36,.07,.19,.97)',
        shimmer: 'shimmer 1.4s linear infinite',
        'pulse-glow': 'pulse-glow 1.8s ease-in-out infinite',
        sparkle: 'sparkle 900ms ease-out',
      },
      keyframes: {
        'cell-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-3px)' },
          '40%, 60%': { transform: 'translateX(3px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(124,58,237,0.6)' },
          '50%': { boxShadow: '0 0 0 8px rgba(124,58,237,0)' },
        },
        sparkle: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
