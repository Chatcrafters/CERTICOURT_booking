import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cc: {
          blue:       '#1E54D0',
          'blue-dark':'#1440A8',
          'blue-light':'#EBF1FD',
          teal:       '#0AAFA0',
          'teal-light':'#E0F7F5',
          green:      '#16A34A',
          amber:      '#D97706',
          red:        '#DC2626',
          dark:       '#0D1A2D',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      }
    }
  },
  plugins: []
}
export default config
