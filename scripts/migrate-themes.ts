/**
 * Migration script to add typography and spacing to existing themes
 * Run with: npx tsx scripts/migrate-themes.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const defaultTypography = {
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

const defaultSpacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
}

// Import default hex colors
const DEFAULT_COLORS = {
  'primary-bg': '#3B82F6',
  'primary-text': '#FFFFFF',
  'primary-icon': '#FFFFFF',
  'primary-hover-bg': '#2563EB',
  'primary-pressed-bg': '#1D4ED8',
  'primary-disabled-bg': '#93C5FD',
  'focused-border': '#3B82F6',
  'secondary-bg': '#F3F4F6',
  'secondary-border': '#E5E7EB',
  'secondary-text': '#1F2937',
  'secondary-icon': '#1F2937',
  'secondary-hover-bg': '#E5E7EB',
  'secondary-pressed-bg': '#D1D5DB',
  'secondary-disabled-bg': '#F9FAFB',
  'ghost-bg': 'transparent',
  'ghost-text': '#1F2937',
  'ghost-icon': '#1F2937',
  'ghost-hover-bg': '#F3F4F6',
  'ghost-pressed-bg': '#E5E7EB',
  'ghost-disabled-bg': 'transparent',
  'bg-white': '#FFFFFF',
  'bg-neutral-subtle': '#F9FAFB',
  'bg-neutral-light': '#F3F4F6',
  'bg-neutral': '#E5E7EB',
  'bg-accent': '#FEF3C7',
  'bg-accent-mid': '#FDE68A',
  'bg-brand-subtle': '#EFF6FF',
  'bg-table': '#FFFFFF',
  'bg-secondary': '#F3F4F6',
  'bg-brand-light': '#DBEAFE',
  'bg-brand-mid': '#93C5FD',
  'bg-brand': '#3B82F6',
  'bg-neutral-mid': '#9CA3AF',
  'bg-neutral-strong': '#4B5563',
  'bg-header': '#1F2937',
  'bg-superlative': '#10B981',
  'bg-button': '#3B82F6',
  'fg-heading': '#111827',
  'fg-body': '#374151',
  'fg-link-secondary': '#6B7280',
  'fg-caption': '#9CA3AF',
  'fg-stroke-ui': '#D1D5DB',
  'fg-link': '#3B82F6',
  'fg-stroke-ui-inverse': '#4B5563',
  'fg-heading-inverse': '#FFFFFF',
  'fg-body-inverse': '#F3F4F6',
  'fg-caption-inverse': '#D1D5DB',
  'fg-table-border': '#E5E7EB',
  'fg-stroke-default': '#D1D5DB',
  'fg-divider': '#E5E7EB',
  'fg-stroke-inverse': '#4B5563',
  'fg-stroke-dark-inverse': '#1F2937',
  'fg-feedback-error': '#EF4444',
  'fg-feedback-warning': '#F59E0B',
  'fg-feedback-success': '#10B981',
  'superlative-primary': '#3B82F6',
  'superlative-secondary': '#10B981',
}

async function migrateThemes() {
  console.log('Starting theme migration...')

  // Fetch all themes
  const { data: themes, error: fetchError } = await supabase
    .from('themes')
    .select('*')

  if (fetchError) {
    console.error('Error fetching themes:', fetchError)
    process.exit(1)
  }

  if (!themes || themes.length === 0) {
    console.log('No themes found to migrate')
    return
  }

  console.log(`Found ${themes.length} theme(s) to migrate`)

  // Update each theme
  for (const theme of themes) {
    const updates: any = {}

    // Check if colors need migration to new hex format
    if (theme.colors && Object.keys(theme.colors).length < 50) {
      console.log(`  Migrating colors to new hex format for theme: ${theme.name}`)
      updates.colors = DEFAULT_COLORS
    }

    // Update typography to new format with fonts array
    if (!theme.typography || !(theme.typography as any).fonts) {
      updates.typography = defaultTypography
      console.log(`  Updating typography to new format for theme: ${theme.name}`)
    }

    // Add spacing if missing
    if (!theme.spacing) {
      updates.spacing = defaultSpacing
      console.log(`  Adding spacing to theme: ${theme.name}`)
    }

    // Add radius if missing
    if (!theme.radius) {
      updates.radius = '0.5rem'
      console.log(`  Adding radius to theme: ${theme.name}`)
    }

    // Update if there are changes
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('themes')
        .update(updates)
        .eq('id', theme.id)

      if (updateError) {
        console.error(`  Error updating theme ${theme.name}:`, updateError)
      } else {
        console.log(`  ✓ Updated theme: ${theme.name}`)
      }
    } else {
      console.log(`  ✓ Theme ${theme.name} already has all fields`)
    }
  }

  console.log('\nMigration completed!')
}

migrateThemes().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
