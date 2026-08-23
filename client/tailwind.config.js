/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D5C3A',
          light: '#22A66A',
          dark: '#083D27',
        },
        accent: '#22A66A',
        bg: {
          DEFAULT: '#0A1510',
          surface: '#111E17',
          elevated: '#1A2F23',
        },
        text: {
          primary: '#E8F5EE',
          secondary: '#8BAF9A',
          muted: '#5C7A68',
        },
        danger: '#E85038',
        warning: '#E8901A',
        info: '#3B9ED4',
        success: '#22A66A',
        priority: {
          low: '#22A66A',
          medium: '#E8D61A',
          high: '#E8901A',
          critical: '#E85038',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'civic-gradient': 'linear-gradient(135deg, #0A1510 0%, #0D5C3A20 50%, #0A1510 100%)',
        'card-gradient': 'linear-gradient(145deg, #111E17, #1A2F23)',
        'hero-gradient': 'radial-gradient(ellipse at top, #0D5C3A40 0%, #0A1510 70%)',
      },
      animation: {
        'pulse-critical': 'pulse-critical 1.5s ease-in-out infinite',
        'glow-green': 'glow-green 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      keyframes: {
        'pulse-critical': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 80, 56, 0.7)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 0 12px rgba(232, 80, 56, 0)', transform: 'scale(1.05)' },
        },
        'glow-green': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(34, 166, 106, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(34, 166, 106, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
