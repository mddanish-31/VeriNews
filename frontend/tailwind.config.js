/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        main: 'var(--bg-main)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          secondary: 'var(--bg-surface-secondary)',
          elevated: 'var(--bg-surface-elevated)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        brand: {
          blue: 'var(--color-brand-blue)',
          violet: 'var(--color-brand-violet)',
          'blue-hover': 'var(--color-brand-blue-hover)',
          dark: '#050814',
          surface: 'rgba(12, 17, 36, 0.65)',
          elevated: 'rgba(20, 28, 56, 0.75)',
          cyan: '#00F0FF',
          'electric-blue': '#356BFF',
          'hyper-violet': '#8A68FF',
        },
        neon: {
          cyan: '#00F0FF',
          violet: '#8A68FF',
          blue: '#356BFF',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          subtle: 'var(--border-subtle)',
        },
        status: {
          success: 'var(--color-success)',
          'success-bg': 'var(--color-success-bg)',
          'success-border': 'var(--color-success-border)',
          warning: 'var(--color-warning)',
          'warning-bg': 'var(--color-warning-bg)',
          danger: 'var(--color-danger)',
          'danger-bg': 'var(--color-danger-bg)',
          'danger-border': 'var(--color-danger-border)',
        },
      },
      fontFamily: {
        sans: ['Geist', 'var(--font-inter)', 'Arial', 'sans-serif'],
        impact: ['var(--font-impact)', "'Impact'", 'sans-serif'],
        'impact-extravagant': ['var(--font-impact-extravagant)', "'Impact Extravagant'", "'Impact'", 'sans-serif'],
        brunson: ['var(--font-brunson)', "'Brunson'", 'sans-serif'],
        'heading-now': ['var(--font-heading-now)', "'Heading Now'", 'sans-serif'],
        display: ['var(--font-impact)', "'Impact'", 'sans-serif'],
        devanagari: ['var(--font-noto-sans-devanagari)', 'var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(17, 20, 38, 0.05)',
        card: '0 10px 30px -5px rgba(17, 20, 38, 0.06)',
        'glow-blue': '0 0 35px -5px rgba(53, 107, 255, 0.25)',
        'glow-dark': '0 0 40px -5px rgba(67, 136, 255, 0.2)',
        'glow-cyan': '0 0 30px -5px rgba(0, 240, 255, 0.25)',
        'glow-cyan-sm': '0 0 15px -2px rgba(0, 240, 255, 0.35)',
        'glow-violet': '0 0 35px -5px rgba(138, 104, 255, 0.25)',
        'glow-violet-sm': '0 0 15px -2px rgba(138, 104, 255, 0.35)',
      },
    },
  },
  plugins: [],
}

export default config
