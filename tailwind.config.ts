import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          bg: '#0b0819',
          purple: '#1f143d',
          card: '#161033',
          violet: '#8b5cf6',
          gold: '#fbbf24',
          cyan: '#06b6d4',
          magenta: '#ec4899',
        },
        gold: {
          accent: '#fbbf24',
        },
        cyan: {
          accent: '#22d3ee',
        }
      },
      fontFamily: {
        headline: ['"Cinzel Decorative"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.3)',
        'glow-gold': '0 0 15px rgba(251, 191, 36, 0.4)',
        'glow-cyan': '0 0 15px rgba(34, 211, 238, 0.4)',
      }
    },
  },
  plugins: [],
} satisfies Config;
