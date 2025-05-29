import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Dynamically generated color classes for measurements
    'border-green-400', 'bg-green-50', 'text-green-600',
    'border-blue-400', 'bg-blue-50', 'text-blue-600',
    'border-red-400', 'bg-red-50', 'text-red-600',
    'border-pink-400', 'bg-pink-50', 'text-pink-600',
    'border-purple-400', 'bg-purple-50', 'text-purple-600',
    'border-orange-400', 'bg-orange-50', 'text-orange-600',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF4500',        // Vibrant orange-red from kettlebell
          'primary-light': '#FF6B35', // Lighter coral tone
          'primary-dark': '#E03E00',  // Darker orange for depth
          secondary: '#FF8C42',       // Warm orange from highlights
          accent: '#FFB366',          // Light orange from glow
          success: '#10B981',         // High contrast green
          info: '#3B82F6',           // Bright blue
          warning: '#F59E0B',        // Bold amber
          neutral: '#6B7280',        // Medium gray for contrast
          pink: '#E5B5D3',           // Original pink
          'pink-light': '#F7D5E7',   // Original pink light
          mint: '#B8E5D5',           // Original mint
          blue: '#C5D5F7',           // Original blue
          yellow: '#F7E5B5',         // Original yellow
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
}

export default config