/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#000000',
          raised: '#0a0a0f',
          overlay: '#111118',
        },
        brand: {
          cyan: '#00d2ff',
          blue: '#3a47d5',
          purple: '#8e2de2',
          muted: '#a0a0a0',
          heading: '#c8d0e0',
        },
        accent: {
          DEFAULT: '#3a47d5',
          dim: '#2a35a8',
          glow: '#00d2ff',
        },
        ink: {
          DEFAULT: '#e8edf5',
          muted: '#a0a0a0',
          faint: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #00d2ff 0%, #3a47d5 50%, #8e2de2 100%)',
        'brand-gradient-vertical': 'linear-gradient(180deg, #00d2ff 0%, #3a47d5 50%, #8e2de2 100%)',
        'grid-pattern':
          'linear-gradient(rgba(0, 210, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(58, 71, 213, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '64px 64px',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        pulse_slow: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
