/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Clash Display', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        sb: {
          // Light warm cream palette
          page: '#FCFBF8',
          card: '#FFFFFF',
          hover: '#F6F4EF',
          border: '#E6E1DA',
          'border-dark': '#D4CDBF',
          // Text
          text: '#292524',
          muted: '#78716C',
          contrast: '#1C1917',
          // Accent – orange used strictly as accent only
          orange: '#F97316',
          'orange-light': '#FB923C',
          'orange-pale': '#FDBA74',
          amber: '#F59E0B',
          cream: '#FFF7ED',
          emerald: '#34D399',
          // Legacy dark surface kept for teacher/exam portals only
          surface: '#1A1714',
          'surface-dark': '#0C0A09',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'warm-pulse': 'warmPulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        warmPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
}