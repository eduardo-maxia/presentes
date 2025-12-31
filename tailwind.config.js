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
          secondary: '#F5F5F5',
        },
        foreground: {
          DEFAULT: '#1A1A1A',
          secondary: '#666666',
        },
        // Dark mode colors (soft, not pure black)
        dark: {
          background: '#1C1C1E',
          backgroundSecondary: '#2C2C2E',
          foreground: '#FFFFFF',
          foregroundSecondary: '#AEAEB2',
        },
        // Emotional colors
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
    },
  },
  plugins: [],
}
