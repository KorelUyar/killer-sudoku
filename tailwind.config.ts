import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0a0a14',
        elevated: '#13131f',
        card: '#1a1a26',
        'card-hover': '#1f1f2c',

        ink: {
          primary: '#fafafe',
          secondary: '#a8a8b8',
          tertiary: '#65657a',
          disabled: '#404052',
        },

        iris: {
          DEFAULT: '#a78bfa',
          hover: '#c4b5fd',
          muted: 'rgba(167, 139, 250, 0.12)',
        },
        cyan: {
          DEFAULT: '#22d3ee',
          muted: 'rgba(34, 211, 238, 0.12)',
        },
        amber: {
          DEFAULT: '#fbbf24',
          muted: 'rgba(251, 191, 36, 0.12)',
        },
        rose: {
          DEFAULT: '#fb7185',
          muted: 'rgba(251, 113, 133, 0.12)',
        },

        success: '#34d399',
        danger: '#fb7185',
        warning: '#fbbf24',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
