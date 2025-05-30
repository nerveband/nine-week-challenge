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
    'border-orange-400', 'bg-orange-50', 'text-orange-600',
    'border-purple-400', 'bg-purple-50', 'text-purple-600',
    'border-yellow-400', 'bg-yellow-50', 'text-yellow-600',
    // Brand color classes
    'text-brand-orange', 'bg-brand-orange', 'border-brand-orange',
    'text-brand-green', 'bg-brand-green', 'border-brand-green',
    'text-brand-blue', 'bg-brand-blue', 'border-brand-blue',
    'bg-brand-orange/10', 'bg-brand-green/10', 'bg-brand-blue/10',
    'hover:bg-brand-orange/20', 'hover:bg-brand-green/20', 'hover:bg-brand-blue/20',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary oranges from KettleFit inspiration
          primary: '#FF4500',        // Kettlebell Orange - main brand color
          secondary: '#FF6B35',      // Energy Orange - highlights and gradients
          accent: '#00B894',         // Achievement Green - success states
          
          // Supporting colors with orange harmony
          orange: '#FF4500',         // Primary actions, branding
          'orange-light': '#FF6B35', // Hover states, secondary actions
          'orange-glow': '#FFB366',  // Subtle highlights, soft backgrounds
          
          green: '#00B894',          // Success, achievements, progress
          'green-light': '#55E6C1',  // Light success states
          
          blue: '#3B82F6',           // Info, water tracking, calm elements
          'blue-light': '#93C5FD',   // Light info states
          
          gray: '#2D3436',           // Iron Black - text, headers
          'gray-light': '#6C757D',   // Neutral Gray - secondary text
          'gray-bg': '#F8F9FA',      // Background White - cards, backgrounds
          
          // Legacy colors for backward compatibility
          pink: '#FF6B35',           // Map to energy orange
          'pink-light': '#FFB366',   // Map to orange glow
          mint: '#00B894',           // Map to achievement green
          yellow: '#F59E0B',         // Vibrant yellow for warnings
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