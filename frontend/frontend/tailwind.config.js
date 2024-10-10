import plugin from 'tailwindcss/plugin';
import { blackA, mauve, violet, indigo, purple } from '@radix-ui/colors';
/** @type {import('tailwindcss').Config} */

export const darkMode = ['class'];
export const content = [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './app/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
];
export const prefix = '';
export const theme = {
  container: {
    center: true,
    padding: '2rem',
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px',
      '3xl': '1920px',
      '4xl': '2560px',
      '5xl': '3200px',
      '6xl': '3840px',
    },
  },
  extend: {
    fontFamily: {
      poppins: ['Poppins', 'sans-serif'],
    },
    fontSize: {
      clamp: 'clamp(0.9rem, 1.6vw, 1.0rem)',
    },
    colors: {
      custom1: '#262014',
      custom2: '#29261D',
      custom3: '#21190E',
      custom4: '#17120C',
      custom5: '#0D0D0D',
      ...blackA,
      ...mauve,
      ...violet,
      ...purple,
      ...indigo,
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',

      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
        background: 'hsl(var(--primary-background))',
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
    backgroundImage: {
      'custom-gradient':
        'linear-gradient(45deg, #262014, var(--custom2), #21190E, #17120C, #0D0D0D)',
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
    keyframes: {
      'accordion-down': {
        from: { height: '0' },
        to: { height: 'var(--radix-accordion-content-height)' },
      },
      'accordion-up': {
        from: { height: 'var(--radix-accordion-content-height)' },
        to: { height: '0' },
      },
      enterFromRight: {
        from: { opacity: '0', transform: 'translateX(200px)' },
        to: { opacity: '1', transform: 'translateX(0)' },
      },
      enterFromLeft: {
        from: { opacity: '0', transform: 'translateX(-200px)' },
        to: { opacity: '1', transform: 'translateX(0)' },
      },
      exitToRight: {
        from: { opacity: '1', transform: 'translateX(0)' },
        to: { opacity: '0', transform: 'translateX(200px)' },
      },
      exitToLeft: {
        from: { opacity: '1', transform: 'translateX(0)' },
        to: { opacity: '0', transform: 'translateX(-200px)' },
      },
      scaleIn: {
        from: { opacity: '0', transform: 'rotateX(-10deg) scale(0.9)' },
        to: { opacity: '1', transform: 'rotateX(0deg) scale(1)' },
      },
      scaleOut: {
        from: { opacity: '1', transform: 'rotateX(0deg) scale(1)' },
        to: { opacity: '0', transform: 'rotateX(-10deg) scale(0.95)' },
      },
      fadeIn: {
        from: { opacity: '0' },
        to: { opacity: '1' },
      },
      fadeOut: {
        from: { opacity: '1' },
        to: { opacity: '0' },
      },
    },
    animation: {
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out',
      scaleIn: 'scaleIn 200ms ease',
      scaleOut: 'scaleOut 200ms ease',
      fadeIn: 'fadeIn 200ms ease',
      fadeOut: 'fadeOut 200ms ease',
      enterFromLeft: 'enterFromLeft 250ms ease',
      enterFromRight: 'enterFromRight 250ms ease',
      exitToLeft: 'exitToLeft 250ms ease',
      exitToRight: 'exitToRight 250ms ease',
    },
  },
};
export const plugins = [
  require('tailwindcss-animate'),
  plugin(({ matchUtilities }) => {
    require('tailwind-scrollbar')({nocompatible:true}),
    matchUtilities({
      perspective: value => ({
        perspective: value,
      }),
    });
  }),
];
