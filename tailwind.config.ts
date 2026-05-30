import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        // Brand — deep indigo-green inspired by SA landscape
        brand: {
          50:  '#edfaf4',
          100: '#d3f4e4',
          200: '#aae8cb',
          300: '#72d5ab',
          400: '#39ba85',
          500: '#18a06d',
          600: '#0d8259',
          700: '#0b6848',
          800: '#0c523a',
          900: '#0b4431',
          950: '#04261c',
        },
        // Gold accent — SA sunshine / springbok gold
        gold: {
          300: '#fcd674',
          400: '#f9c231',
          500: '#e8ab10',
          600: '#c98a08',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
