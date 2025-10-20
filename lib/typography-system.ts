import type { Typography } from './supabase'

export const DEFAULT_TYPOGRAPHY: Typography = {
  fonts: [
    {
      name: 'Primary',
      family: 'Inter',
      weights: ['300', '400', '500', '600', '700'],
      fallback: 'sans-serif',
    },
  ],
  fontSize: {
    display: { desktop: '56px', tablet: '48px', mobile: '32px' },
    'heading-lg': { desktop: '48px', tablet: '32px', mobile: '28px' },
    'heading-md': { desktop: '32px', tablet: '28px', mobile: '24px' },
    'heading-sm': { desktop: '24px', tablet: '24px', mobile: '20px' },
    'title-lg': { desktop: '20px', tablet: '20px', mobile: '18px' },
    'title-md': { desktop: '18px', tablet: '18px', mobile: '16px' },
    'title-sm': { desktop: '16px', tablet: '16px', mobile: '16px' },
    'title-xs': { desktop: '14px', tablet: '14px', mobile: '14px' },
    'body-lg': { desktop: '18px', tablet: '18px', mobile: '16px' },
    'body-md': { desktop: '16px', tablet: '16px', mobile: '16px' },
    'body-xs': { desktop: '12px', tablet: '12px', mobile: '12px' },
    'body-sm': { desktop: '14px', tablet: '14px', mobile: '14px' },
    'label-lg': { desktop: '16px', tablet: '16px', mobile: '16px' },
    'label-md': { desktop: '14px', tablet: '14px', mobile: '14px' },
    'label-sm': { desktop: '12px', tablet: '12px', mobile: '12px' },
    'label-xs': { desktop: '10px', tablet: '10px', mobile: '10px' },
  },
  lineHeight: {
    '5xl': { desktop: '68px', tablet: '58px', mobile: '40px' },
    '4xl': { desktop: '58px', tablet: '40px', mobile: '36px' },
    '3xl': { desktop: '40px', tablet: '36px', mobile: '28px' },
    '2xl': { desktop: '32px', tablet: '32px', mobile: '28px' },
    xl: { desktop: '26px', tablet: '26px', mobile: '24px' },
    lg: { desktop: '24px', tablet: '24px', mobile: '20px' },
    md: { desktop: '24px', tablet: '24px', mobile: '24px' },
    sm: { desktop: '22px', tablet: '22px', mobile: '22px' },
    xs: { desktop: '18px', tablet: '18px', mobile: '18px' },
    '2xs': { desktop: '16px', tablet: '16px', mobile: '16px' },
  },
  fontWeight: {
    bold: '700',
    semibold: '600',
    medium: '500',
    regular: '400',
    light: '300',
  },
  letterSpacing: {
    tighter: '-0.2px',
    wider: '1px',
    tight: '-0.1px',
    normal: '0',
    wide: '0.5px',
  },
}

export const FONT_SIZE_KEYS = [
  'display',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'title-lg',
  'title-md',
  'title-sm',
  'title-xs',
  'body-lg',
  'body-md',
  'body-xs',
  'body-sm',
  'label-lg',
  'label-md',
  'label-sm',
  'label-xs',
] as const

export const LINE_HEIGHT_KEYS = [
  '5xl',
  '4xl',
  '3xl',
  '2xl',
  'xl',
  'lg',
  'md',
  'sm',
  'xs',
  '2xs',
] as const

export const FONT_WEIGHT_KEYS = [
  'bold',
  'semibold',
  'medium',
  'regular',
  'light',
] as const

export const LETTER_SPACING_KEYS = [
  'tighter',
  'wider',
  'tight',
  'normal',
  'wide',
] as const
