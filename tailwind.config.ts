import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        canvas: '#0a0a0b',
        elevated: '#131316',
        card: '#1a1a1f',

        // Text
        ink: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          tertiary: '#52525b',
          disabled: '#3f3f46',
        },

        // Accent (used sparingly, no gradient)
        accent: {
          DEFAULT: '#a78bfa',
          hover: '#c4b5fd',
          muted: 'rgba(167, 139, 250, 0.12)',
        },

        // Semantic
        success: '#10b981',
        danger: '#f43f5e',
        warning: '#f59e0b',

        // Cage tints (used at 8% opacity overlay)
        cage: {
          rose: '#fda4af',
          amber: '#fcd34d',
          mint: '#86efac',
          sky: '#93c5fd',
          lavender: '#c4b5fd',
          pink: '#f9a8d4',
          peach: '#fdba74',
          teal: '#6ee7b7',
        },

        // Border alias
        line: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          medium: 'rgba(255, 255, 255, 0.10)',
          strong: 'rgba(255, 255, 255, 0.16)',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'cell-pop': 'cell-pop 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        shake: 'shake 360ms cubic-bezier(.36,.07,.19,.97)',
        shimmer: 'shimmer 1.4s linear infinite',
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
