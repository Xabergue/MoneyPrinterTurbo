import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#fafafa',
        card: {
          DEFAULT: '#111111',
          foreground: '#fafafa',
        },
        popover: {
          DEFAULT: '#111111',
          foreground: '#fafafa',
        },
        primary: {
          DEFAULT: '#7c3aed',
          foreground: '#fafafa',
          hover: '#6d28d9',
        },
        secondary: {
          DEFAULT: '#1a1a1a',
          foreground: '#fafafa',
        },
        muted: {
          DEFAULT: '#1a1a1a',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#7c3aed',
          foreground: '#fafafa',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fafafa',
        },
        border: '#262626',
        input: '#262626',
        ring: '#7c3aed',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
