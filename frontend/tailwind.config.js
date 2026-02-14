/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Scandinavian / Soft Minimalism color palette
        // Light mode
        white: '#FFFFFF',
        cream: '#F8F6F3',
        softGray: '#F5F3F0',
        warmGray: '#E8E6E3',
        lightGray: '#D4D1CC',
        gray: '#9B9893',
        darkGray: '#6B6863',
        charcoal: '#3A3835',
        
        // Accent colors (soft, natural)
        sage: '#A8B5A0',      // Мягкий зеленый
        blush: '#E8D5C4',     // Теплый розовый
        sand: '#D4C4B0',      // Песочный
        stone: '#C4B8A8',     // Каменный
        forest: '#8B9A7F',    // Лесной зеленый
        
        // Dark mode
        darkBg: '#1F1D1B',
        darkSurface: '#2A2825',
        darkCard: '#34322F',
        darkText: '#E8E6E3',
        darkMuted: '#9B9893',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'sans-serif'], // Мягкий, современный шрифт
      },
      fontSize: {
        'soft-xs': ['0.75rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'soft-sm': ['0.875rem', { lineHeight: '1.7', letterSpacing: '0.005em' }],
        'soft-base': ['1rem', { lineHeight: '1.75', letterSpacing: '0' }],
        'soft-lg': ['1.125rem', { lineHeight: '1.8', letterSpacing: '-0.005em' }],
        'soft-xl': ['1.25rem', { lineHeight: '1.8', letterSpacing: '-0.01em' }],
        'soft-2xl': ['1.5rem', { lineHeight: '1.7', letterSpacing: '-0.015em' }],
        'soft-3xl': ['1.875rem', { lineHeight: '1.6', letterSpacing: '-0.02em' }],
        'soft-4xl': ['2.25rem', { lineHeight: '1.5', letterSpacing: '-0.025em' }],
        'soft-5xl': ['3rem', { lineHeight: '1.4', letterSpacing: '-0.03em' }],
        'soft-6xl': ['3.75rem', { lineHeight: '1.3', letterSpacing: '-0.035em' }],
      },
      spacing: {
        'cozy': '1.5rem',
        'cozy-lg': '3rem',
        'cozy-xl': '4.5rem',
        'cozy-2xl': '6rem',
      },
      borderRadius: {
        'soft': '0.75rem',
        'soft-lg': '1rem',
        'soft-xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 12px 32px rgba(0, 0, 0, 0.1), 0 6px 16px rgba(0, 0, 0, 0.12)',
        'soft-dark': '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)',
        'soft-dark-md': '0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.5)',
        'soft-dark-lg': '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in-slow': 'fadeIn 0.8s ease-out',
        'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        gentleBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}

