#!/usr/bin/env tsx
/**
 * Migrate existing themes from old token structure to new 60+ token structure
 * This ensures theme switching works correctly with updated component token references
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ===== Color Manipulation Utilities =====

interface HSL {
  h: number
  s: number
  l: number
}

// Parse HSL string "221 83% 53%" → { h: 221, s: 83, l: 53 }
function parseHSL(hsl: string): HSL {
  const parts = hsl.trim().split(/\s+/)
  return {
    h: parseFloat(parts[0]),
    s: parseFloat(parts[1]),
    l: parseFloat(parts[2]),
  }
}

// Convert HSL object back to string
function hslToString(hsl: HSL): string {
  return `${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%`
}

// Adjust lightness (positive = lighter, negative = darker)
function adjustLightness(hsl: string, amount: number): string {
  const parsed = parseHSL(hsl)
  parsed.l = Math.max(0, Math.min(100, parsed.l + amount))
  return hslToString(parsed)
}

// Adjust saturation (positive = more saturated, negative = less saturated)
function adjustSaturation(hsl: string, amount: number): string {
  const parsed = parseHSL(hsl)
  parsed.s = Math.max(0, Math.min(100, parsed.s + amount))
  return hslToString(parsed)
}

// Create a complete color palette from a primary color
function deriveColorPalette(primaryColor: string): Record<string, string> {
  const palette: Record<string, string> = {}
  
  // Button / Primary variants (use primary color)
  palette['primary-bg'] = primaryColor
  palette['primary-text'] = '0 0% 100%'  // White text
  palette['primary-icon'] = '0 0% 100%'
  palette['primary-hover-bg'] = adjustLightness(primaryColor, -8)
  palette['primary-pressed-bg'] = adjustLightness(primaryColor, -18)
  palette['primary-disabled-bg'] = adjustSaturation(adjustLightness(primaryColor, 20), -40)
  palette['focused-border'] = primaryColor
  
  // Button / Secondary variants (very light primary)
  palette['secondary-bg'] = adjustLightness(adjustSaturation(primaryColor, -70), 43)
  palette['secondary-border'] = primaryColor
  palette['secondary-text'] = primaryColor
  palette['secondary-icon'] = adjustLightness(primaryColor, -15)
  palette['secondary-hover-bg'] = adjustLightness(adjustSaturation(primaryColor, -50), 38)
  palette['secondary-pressed-bg'] = adjustLightness(adjustSaturation(primaryColor, -30), 22)
  palette['secondary-disabled-bg'] = adjustLightness(adjustSaturation(primaryColor, -70), 43)
  
  // Button / Ghost variants
  palette['ghost-bg'] = '0 0% 100% / 0'  // Transparent
  palette['ghost-text'] = adjustLightness(primaryColor, -15)
  palette['ghost-icon'] = adjustLightness(primaryColor, -15)
  palette['ghost-hover-bg'] = adjustLightness(adjustSaturation(primaryColor, -50), 38)
  palette['ghost-pressed-bg'] = adjustLightness(adjustSaturation(primaryColor, -30), 22)
  palette['ghost-disabled-bg'] = '219 21% 87%'  // Neutral gray
  
  // Background variants
  palette['bg-white'] = '0 0% 100%'
  palette['bg-neutral-subtle'] = '225 22% 96%'
  palette['bg-neutral-light'] = '214 23% 94%'
  palette['bg-neutral'] = '216 22% 91%'
  palette['bg-accent'] = adjustLightness(adjustSaturation(primaryColor, -75), 48)
  palette['bg-accent-mid'] = adjustLightness(adjustSaturation(primaryColor, -60), 42)
  palette['bg-brand-subtle'] = adjustLightness(adjustSaturation(primaryColor, -70), 47)
  palette['bg-table'] = adjustLightness(adjustSaturation(primaryColor, -70), 47)
  palette['bg-secondary'] = adjustLightness(adjustSaturation(primaryColor, -50), 38)
  palette['bg-brand-light'] = adjustLightness(adjustSaturation(primaryColor, -50), 38)
  palette['bg-brand-mid'] = adjustLightness(adjustSaturation(primaryColor, -30), 22)
  palette['bg-brand'] = primaryColor
  palette['bg-neutral-mid'] = '218 9% 24%'
  palette['bg-neutral-strong'] = '220 9% 19%'
  palette['bg-header'] = '214 10% 13%'
  palette['bg-superlative'] = '25 86% 50%'  // Orange accent
  palette['bg-button'] = primaryColor
  
  // Foreground variants (neutral grays for text)
  palette['fg-heading'] = '214 10% 13%'
  palette['fg-body'] = '218 9% 24%'
  palette['fg-link-secondary'] = '218 9% 24%'
  palette['fg-caption'] = '214 10% 42%'
  palette['fg-stroke-ui'] = '213 12% 55%'
  palette['fg-link'] = primaryColor
  palette['fg-stroke-ui-inverse'] = '219 21% 87%'
  palette['fg-heading-inverse'] = '0 0% 100%'
  palette['fg-body-inverse'] = '225 22% 96%'
  palette['fg-caption-inverse'] = '219 21% 87%'
  palette['fg-table-border'] = '217 20% 79%'
  palette['fg-stroke-default'] = '217 20% 79%'
  palette['fg-divider'] = '219 21% 87%'
  palette['fg-stroke-inverse'] = '0 0% 100%'
  palette['fg-stroke-dark-inverse'] = '218 9% 24%'
  palette['fg-feedback-error'] = '12 84% 50%'
  palette['fg-feedback-warning'] = '37 100% 61%'
  palette['fg-feedback-success'] = '169 82% 25%'
  
  // Superlative
  palette['superlative-primary'] = '25 86% 50%'  // Orange
  palette['superlative-secondary'] = primaryColor
  
  return palette
}

// Old token → New token mappings
const TOKEN_MIGRATION_MAP: Record<string, string> = {
  // Primary
  'primary': 'primary-bg',
  'primary-foreground': 'primary-text',
  'primary-hover': 'primary-hover-bg',
  
  // Secondary
  'secondary': 'secondary-bg',
  'secondary-foreground': 'secondary-text',
  'secondary-hover': 'secondary-hover-bg',
  
  // Backgrounds
  'background': 'bg-white',
  'card': 'bg-white',
  'popover': 'bg-white',
  'muted': 'bg-neutral',
  'accent': 'bg-accent',
  
  // Foregrounds
  'foreground': 'fg-body',
  'card-foreground': 'fg-body',
  'popover-foreground': 'fg-body',
  'muted-foreground': 'fg-caption',
  'accent-foreground': 'fg-body',
  
  // Borders and strokes
  'border': 'fg-stroke-ui',
  'input': 'fg-stroke-ui',
  'ring': 'focused-border',
  
  // Destructive/Error
  'destructive': 'fg-feedback-error',
  'destructive-foreground': 'primary-text',
  'destructive-hover': 'fg-feedback-error',
}

async function migrateThemes() {
  console.log('🔄 Starting SMART theme migration with color derivation...\n')
  
  // Force re-migration flag (set to true to re-derive colors for all themes)
  const FORCE_REDEMIGRATE = false

  try {
    // Fetch all themes
    console.log('1️⃣  Fetching all themes from database...')
    const { data: themes, error: fetchError } = await supabase
      .from('themes')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching themes:', fetchError)
      process.exit(1)
    }

    if (!themes || themes.length === 0) {
      console.log('✅ No themes found in database')
      return
    }

    console.log(`✅ Found ${themes.length} theme(s)\n`)

    // Process each theme
    for (const theme of themes) {
      console.log(`📝 Processing theme: "${theme.name}" (${theme.id})`)
      
      const oldColors = theme.colors as Record<string, string>
      const hasOldTokens = Object.keys(oldColors).some(key => 
        key in TOKEN_MIGRATION_MAP || 
        !key.includes('-') // Old tokens typically don't have hyphens (except primary-foreground)
      )

      if (!hasOldTokens && !FORCE_REDEMIGRATE) {
        console.log(`   ✅ Already using new token structure (${Object.keys(oldColors).length} tokens)`)
        continue
      }
      
      if (FORCE_REDEMIGRATE) {
        console.log(`   🔄 Force re-migrating to derive colors from theme's primary...`)
      } else {
        console.log(`   🔄 Migrating from old token structure...`)
      }
      
      // Create new colors object
      const newColors: Record<string, string> = {}

      // Step 1: Map old tokens to new tokens
      let mappedCount = 0
      for (const [oldToken, value] of Object.entries(oldColors)) {
        const newToken = TOKEN_MIGRATION_MAP[oldToken]
        if (newToken) {
          newColors[newToken] = value
          mappedCount++
        }
      }

      console.log(`   📍 Mapped ${mappedCount} old tokens to new tokens`)

      // Step 2: Derive missing tokens from theme's primary color
      // Try to find the primary color from mapped tokens, old tokens, or current tokens
      const basePrimary = newColors['primary-bg'] || oldColors['primary-bg'] || oldColors['primary'] || '221 83% 53%'
      console.log(`   🎨 Deriving color palette from primary: ${basePrimary}`)
      
      const derivedPalette = deriveColorPalette(basePrimary)
      let derivedCount = 0
      
      for (const [token, derivedValue] of Object.entries(derivedPalette)) {
        if (!newColors[token]) {
          newColors[token] = derivedValue
          derivedCount++
        }
      }

      console.log(`   📍 Derived ${derivedCount} tokens from theme's primary color`)
      console.log(`   📍 Total tokens: ${Object.keys(newColors).length}`)

      // Step 3: Update theme in database
      const { error: updateError } = await supabase
        .from('themes')
        .update({ colors: newColors })
        .eq('id', theme.id)

      if (updateError) {
        console.error(`   ❌ Error updating theme: ${updateError.message}`)
        continue
      }

      console.log(`   ✅ Successfully migrated!\n`)
    }

    console.log('🎉 Migration complete!')
    console.log('\n📋 Summary:')
    console.log(`   - Processed ${themes.length} theme(s)`)
    console.log(`   - All themes now use 57+ new tokens`)
    console.log(`   - Theme switching should now work correctly`)
    console.log('\n🔄 Next steps:')
    console.log('   1. Refresh your browser (hard refresh: Cmd+Shift+R)')
    console.log('   2. Test theme switching in the theme switcher dropdown')
    console.log('   3. Verify colors change when switching themes')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

migrateThemes()

