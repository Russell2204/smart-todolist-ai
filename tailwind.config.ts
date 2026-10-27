import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0E0F12',
        surface: {
          DEFAULT: '#16181D',
          elevated: '#1B1D23',
          sunken: '#101115',
        },
        slot: '#0A0B0D',
        border: {
          subtle: '#252830',
          focus: '#404552',
          amber: '#F59E0B',
          amberDim: '#78350F',
        },
        text: {
          primary: '#F2F4F7',
          secondary: '#969CA8',
          muted: '#585E6B',
        },
        accent: {
          amber: '#F59E0B',
          'amber-hover': '#FBBF24',
          'amber-active': '#D97706',
          'amber-dim': '#78350F',
        },
        status: {
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F97316',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['var(--font-rubik)', 'system-ui', 'sans-serif'],
        display: ['var(--font-oswald)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        sunken: 'inset 0 2px 4px rgba(0, 0, 0, 0.55)',
        plate: '0 1px 2px rgba(0, 0, 0, 0.4)',
        'tactile-dark': '0 2px 0 #07080A',
        'tactile-amber': '0 2px 0 #92400E',
        'glow-amber': '0 0 10px rgba(245, 158, 11, 0.35)',
        'glow-green': '0 0 10px rgba(16, 185, 129, 0.4)',
      },
      keyframes: {
        laser: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        laser: 'laser 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
