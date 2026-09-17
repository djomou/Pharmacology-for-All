import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
          300: '#86efac', 400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 800: '#166534',
          900: '#14532d', 950: '#052e16',
        },
      },
      boxShadow: {
        'green-sm': '0 2px 8px rgba(34,197,94,0.12)',
        'green-md': '0 4px 20px rgba(34,197,94,0.18)',
        'green-lg': '0 8px 40px rgba(34,197,94,0.25)',
      },
    },
  },
  plugins: [],
  safelist: [
    'card','card-green','btn-primary','btn-secondary','btn-ghost',
    'input-field','badge','badge-green','badge-white','badge-gray',
    'badge-red','badge-yellow','nav-item','active','stat-card',
    'example-pill','section-title','result-row','page-in',
    'animate-fade-up','animate-fade-in','animate-spin','animate-pulse',
  ],
};
export default config;
