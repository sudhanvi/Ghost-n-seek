// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ghost: {
          light: '#e0e7ff',
          dark: '#3f3f46',
        },
      },
      keyframes: {
        drift: {
          '0%':   { transform: 'translateY(0) rotate(0deg)' },
          '50%':  { transform: 'translateY(-20px) rotate(5deg)' },
          '100%': { transform: 'translateY(0) rotate(0deg)' },
        },
      },
      animation: {
        ghost: 'drift 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
