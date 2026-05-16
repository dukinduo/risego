import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        instagram: '#0095f6',
        surface: '#fafafa',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

export default config
