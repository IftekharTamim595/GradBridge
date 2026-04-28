/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand tokens used in JSX ──────────────────────
        brand: {
          bg:            '#FAFAFA',
          surface:       '#FFFFFF',
          alt:           '#F1F5F9',
          border:        '#E2E8F0',
          primary:       '#0052FF',
          primaryHover:  '#0041CC',
          primarySoft:   '#EFF4FF',
          success:       '#22C55E',
          successSoft:   '#F0FDF4',
          textMain:      '#0F172A',
          textSecondary: '#64748B',
          textMuted:     '#94A3B8',
        },
        // ── Alias for convenience ─────────────────────────
        accent: {
          DEFAULT: '#0052FF',
          light:   '#4D7CFF',
          soft:    '#EFF4FF',
        },
      },
      fontFamily: {
        heading: ['Calistoga', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        accent: '0 4px 16px rgba(0, 82, 255, 0.20)',
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        lift:   '0 8px 24px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
