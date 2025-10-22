#!/usr/bin/env tsx
/**
 * Migration script to replace old default theme with new 60+ token structure
 * Handles foreign key constraints by updating/deleting components first
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

async function migrateDefaultTheme() {
  console.log('🔄 Starting Default Theme Migration...\n')

  try {
    // Step 1: Find the old default theme
    console.log('1️⃣  Finding old default theme...')
    const { data: oldTheme, error: findError } = await supabase
      .from('themes')
      .select('*')
      .eq('slug', 'default')
      .single()

    if (findError) {
      if (findError.code === 'PGRST116') {
        console.log('✅ No old default theme found, creating new one...')
      } else {
        console.error('❌ Error finding old theme:', findError)
        process.exit(1)
      }
    } else {
      console.log(`✅ Found old default theme: ${oldTheme.id}`)

      // Step 2: Find components referencing this theme
      console.log('\n2️⃣  Finding components referencing old theme...')
      const { data: components, error: componentsError } = await supabase
        .from('components')
        .select('id, name')
        .eq('theme_id', oldTheme.id)

      if (componentsError) {
        console.error('❌ Error finding components:', componentsError)
        process.exit(1)
      }

      console.log(`✅ Found ${components?.length || 0} components`)

      if (components && components.length > 0) {
        console.log('\n3️⃣  Updating components to set theme_id = NULL...')
        const { error: updateError } = await supabase
          .from('components')
          .update({ theme_id: null })
          .eq('theme_id', oldTheme.id)

        if (updateError) {
          console.error('❌ Error updating components:', updateError)
          process.exit(1)
        }

        console.log('✅ Components updated')
      }

      // Step 3: Delete the old theme
      console.log('\n4️⃣  Deleting old default theme...')
      const { error: deleteError } = await supabase
        .from('themes')
        .delete()
        .eq('id', oldTheme.id)

      if (deleteError) {
        console.error('❌ Error deleting old theme:', deleteError)
        process.exit(1)
      }

      console.log('✅ Old theme deleted')
    }

    // Step 4: Create new default theme with 60+ tokens
    console.log('\n5️⃣  Creating new default theme with 80 tokens...')
    const { data: newTheme, error: createError } = await supabase
      .from('themes')
      .insert({
        name: 'Default Theme',
        slug: 'default',
        is_active: true,
        colors: {
          // Button / Primary (7 tokens) - Health SEM Theme
          'primary-bg': '168 11% 45%',
          'primary-text': '0 0% 100%',
          'primary-icon': '0 0% 100%',
          'primary-hover-bg': '168 17% 33%',
          'primary-pressed-bg': '167 21% 30%',
          'primary-disabled-bg': '168 11% 45%',
          'focused-border': '202 84% 73%',
          
          // Button / Secondary (7 tokens)
          'secondary-bg': '160 13% 95%',
          'secondary-border': '168 11% 45%',
          'secondary-text': '168 11% 45%',
          'secondary-icon': '167 21% 30%',
          'secondary-hover-bg': '168 28% 86%',
          'secondary-pressed-bg': '167 16% 67%',
          'secondary-disabled-bg': '160 13% 95%',
          
          // Button / Ghost (6 tokens)
          'ghost-bg': '0 0% 100% / 0',
          'ghost-text': '167 21% 30%',
          'ghost-icon': '167 21% 30%',
          'ghost-hover-bg': '168 28% 86%',
          'ghost-pressed-bg': '167 16% 67%',
          'ghost-disabled-bg': '219 21% 87%',
          
          // Background (17 tokens)
          'bg-white': '0 0% 100%',
          'bg-neutral-subtle': '225 22% 96%',
          'bg-neutral-light': '214 23% 94%',
          'bg-neutral': '216 22% 91%',
          'bg-accent': '40 14% 96%',
          'bg-accent-mid': '39 100% 92%',
          'bg-brand-subtle': '160 13% 95%',
          'bg-table': '160 13% 95%',
          'bg-secondary': '168 28% 86%',
          'bg-brand-light': '168 28% 86%',
          'bg-brand-mid': '167 16% 67%',
          'bg-brand': '168 11% 45%',
          'bg-neutral-mid': '218 9% 24%',
          'bg-neutral-strong': '220 9% 19%',
          'bg-header': '214 10% 13%',
          'bg-superlative': '25 86% 50%',
          'bg-button': '168 11% 45%',
          
          // Foreground (18 tokens)
          'fg-heading': '214 10% 13%',
          'fg-body': '218 9% 24%',
          'fg-link-secondary': '218 9% 24%',
          'fg-caption': '214 10% 42%',
          'fg-stroke-ui': '213 12% 55%',
          'fg-link': '168 11% 45%',
          'fg-stroke-ui-inverse': '219 21% 87%',
          'fg-heading-inverse': '0 0% 100%',
          'fg-body-inverse': '225 22% 96%',
          'fg-caption-inverse': '219 21% 87%',
          'fg-table-border': '217 20% 79%',
          'fg-stroke-default': '217 20% 79%',
          'fg-divider': '219 21% 87%',
          'fg-stroke-inverse': '0 0% 100%',
          'fg-stroke-dark-inverse': '218 9% 24%',
          'fg-feedback-error': '12 84% 50%',
          'fg-feedback-warning': '37 100% 61%',
          'fg-feedback-success': '169 82% 25%',
          
          // Superlative (2 tokens)
          'superlative-primary': '25 86% 50%',
          'superlative-secondary': '168 11% 45%',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: {
            base: '16px',
            sm: '14px',
            lg: '18px',
            xl: '20px',
          },
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        radius: '0.5rem',
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating new theme:', createError)
      process.exit(1)
    }

    console.log('✅ New default theme created:', newTheme.id)
    console.log('\n🎉 Migration complete!')
    console.log('\n📋 Summary:')
    console.log('   - Old theme deleted')
    console.log('   - New "Health - SEM" theme created with 57 tokens')
    console.log('   - Legacy tokens removed (backward compatibility removed)')
    console.log('   - Theme switching should now work correctly')
    console.log('\n🔄 Next steps:')
    console.log('   1. Refresh your browser (hard refresh: Cmd+Shift+R)')
    console.log('   2. Test theme switching')
    console.log('   3. Verify all UI components show Health-SEM colors')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

migrateDefaultTheme()

