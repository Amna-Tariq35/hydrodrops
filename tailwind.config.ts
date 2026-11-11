import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hydro: {
          DEFAULT: '#059669', // Hydro Green (Emerald)
          dark: '#047857',
          light: '#e6f4ea',
        },
        drops: {
          DEFAULT: '#0284c7', // Drops Blue (Sky)
          dark: '#0369a1',
          light: '#e0f2fe',
        },
      },
    },
  },
  plugins: [],
}

export default config