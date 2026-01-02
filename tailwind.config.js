/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F7F9FC',
        },
        foreground: {
          DEFAULT: '#0F1419',
          secondary: '#57606A',
        },
        // Dark mode colors - improved with warmer tones and better contrast
        dark: {
          background: '#0F1419',
          backgroundSecondary: '#1A1F29',
          foreground: '#E6EDF3',
          foregroundSecondary: '#8B949E',
          border: '#30363D',
        },
        // Emotional colors - enhanced for better dark mode visibility
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        success: '#95E1D3',
        // Category colors
        practical: '#6C9BCF',
        emotional: '#FF6B6B',
        fun: '#FFE66D',
        experience: '#B28DFF',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
