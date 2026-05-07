/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './**/*.{ts,tsx}', '!./node_modules/**', '!./dist/**'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        archivo: ['Archivo', 'sans-serif'],
      },
      fontSize: {
        h1: ['40px', { lineHeight: '44px', fontWeight: '500' }],
        h2: ['32px', { lineHeight: '36px', fontWeight: '500' }],
        h3: ['28px', { lineHeight: '32px', fontWeight: '500' }],
        h4: ['24px', { lineHeight: '28px', fontWeight: '500' }],
        h5: ['20px', { lineHeight: '24px', fontWeight: '500' }],
        h6: ['18px', { lineHeight: '22px', fontWeight: '500' }],
        subtitle1: ['16px', { lineHeight: '20px', fontWeight: '500' }],
        subtitle2: ['14px', { lineHeight: '18px', fontWeight: '500' }],
        body1: ['16px', { lineHeight: '20px', fontWeight: '400' }],
        body2: ['14px', { lineHeight: '18px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        caption1: ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        background: '#030712',
        foreground: '#f8fafc',
        primary: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#1f2937',
          foreground: '#9ca3af',
        },
        card: {
          DEFAULT: 'rgba(17, 24, 39, 0.7)',
          foreground: '#f8fafc',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulseSlow 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.12' },
        },
      },
    },
  },
  plugins: [],
};
