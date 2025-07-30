import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-style colors
        apple: {
          black: '#0a0a0a',
          white: '#ffffff',
          gray: {
            100: '#f5f5f7',
            200: '#e5e5e7',
            300: '#d2d2d7',
            400: '#a1a1a6',
            500: '#86868b',
            600: '#6e6e73',
            700: '#424245',
            800: '#1d1d1f',
            900: '#0a0a0a',
          }
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'spotlight': 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
        'cinematic': 'radial-gradient(circle at center, rgba(255, 255, 255, 0.02) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
};

export default config; 