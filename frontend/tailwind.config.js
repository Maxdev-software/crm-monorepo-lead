/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        ink: '#0d0d0f',
        paper: '#f4f3ef',
        accent: '#e84646',
        muted: '#8a8a8e',
        border: '#e2e0d8',
        surface: '#ffffff',
      },
    },
  },
  plugins: [],
}
