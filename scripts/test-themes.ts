import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

config({ path: join(process.cwd(), '.env.local') })

async function testThemes() {
  console.log('🧪 Testing Part 4: Theme System\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: ThemeProvider component exists
  try {
    if (fs.existsSync('components/theme-provider.tsx')) {
      console.log('✅ ThemeProvider component exists')
      passed++
      
      const providerContent = fs.readFileSync('components/theme-provider.tsx', 'utf-8')
      
      // Check for real-time subscriptions
      if (providerContent.includes('.channel(') || providerContent.includes('postgres_changes')) {
        console.log('✅ Real-time subscriptions implemented')
        passed++
      } else {
        console.log('❌ Real-time subscriptions missing')
        failed++
      }
      
      // Check for useTheme hook
      if (providerContent.includes('export function useTheme')) {
        console.log('✅ useTheme hook exported')
        passed++
      } else {
        console.log('❌ useTheme hook not found')
        failed++
      }
      
      // Check for applyTheme function
      if (providerContent.includes('applyTheme')) {
        console.log('✅ Theme application logic present')
        passed++
      } else {
        console.log('❌ Theme application logic missing')
        failed++
      }
    } else {
      console.log('❌ ThemeProvider component missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking ThemeProvider:', e)
    failed++
  }
  
  // Test 2: Theme utilities exist
  try {
    if (fs.existsSync('lib/theme-utils.ts')) {
      console.log('✅ Theme utilities file exists')
      passed++
      
      const utilsContent = fs.readFileSync('lib/theme-utils.ts', 'utf-8')
      const requiredFunctions = [
        'generateThemeCSS',
        'applyThemeToDOM',
        'validateThemeColors',
        'hexToHSL',
        'createDefaultTheme',
      ]
      
      for (const func of requiredFunctions) {
        if (utilsContent.includes(func)) {
          console.log(`✅ Theme utility: ${func}`)
          passed++
        } else {
          console.log(`❌ Missing utility: ${func}`)
          failed++
        }
      }
    } else {
      console.log('❌ Theme utilities file missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking theme utilities:', e)
    failed++
  }
  
  // Test 3: Theme API routes exist
  const apiRoutes = [
    'app/api/themes/route.ts',
    'app/api/themes/[id]/route.ts',
    'app/api/themes/active/route.ts',
  ]
  
  for (const route of apiRoutes) {
    try {
      if (fs.existsSync(route)) {
        console.log(`✅ API route exists: ${route}`)
        passed++
      } else {
        console.log(`❌ API route missing: ${route}`)
        failed++
      }
    } catch (e) {
      console.log(`❌ Error checking ${route}:`, e)
      failed++
    }
  }
  
  // Test 4: Layout includes ThemeProvider
  try {
    const layoutContent = fs.readFileSync('app/layout.tsx', 'utf-8')
    
    if (layoutContent.includes('ThemeProvider')) {
      console.log('✅ ThemeProvider included in layout')
      passed++
    } else {
      console.log('❌ ThemeProvider not in layout')
      failed++
    }
    
    if (layoutContent.includes('suppressHydrationWarning')) {
      console.log('✅ Hydration warning suppression configured')
      passed++
    } else {
      console.log('⚠️  Consider adding suppressHydrationWarning to <html>')
    }
  } catch (e) {
    console.log('❌ Error checking layout:', e)
    failed++
  }
  
  // Test 5: Test theme validation
  try {
    const { validateThemeColors, isValidHSL } = require('../lib/theme-utils')
    
    // Test valid HSL
    if (isValidHSL('222.2 47.4% 11.2%')) {
      console.log('✅ HSL validation works for valid format')
      passed++
    } else {
      console.log('❌ HSL validation failed for valid format')
      failed++
    }
    
    // Test invalid HSL
    if (!isValidHSL('not-a-valid-hsl')) {
      console.log('✅ HSL validation rejects invalid format')
      passed++
    } else {
      console.log('❌ HSL validation accepted invalid format')
      failed++
    }
    
    // Test theme colors validation
    const validTheme = {
      background: '0 0% 100%',
      foreground: '222.2 47.4% 11.2%',
      primary: '222.2 47.4% 11.2%',
      'primary-foreground': '210 40% 98%',
      secondary: '210 40% 96.1%',
      'secondary-foreground': '222.2 47.4% 11.2%',
    }
    
    const result = validateThemeColors(validTheme)
    if (result.valid) {
      console.log('✅ Theme validation works for valid colors')
      passed++
    } else {
      console.log('❌ Theme validation failed for valid colors')
      failed++
    }
  } catch (e) {
    console.log('❌ Error testing theme validation:', e)
    failed++
  }
  
  // Test 6: Test database connection (if credentials provided)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      
      // Try to fetch themes
      const { data, error } = await supabase.from('themes').select('*').limit(1)
      
      if (!error) {
        console.log('✅ Can query themes table')
        passed++
        
        if (data && data.length > 0) {
          console.log('✅ Themes exist in database')
          passed++
        } else {
          console.log('⚠️  No themes in database yet (this is OK)')
        }
      } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('⚠️  Themes table not created yet - run schema.sql')
      } else {
        console.log('❌ Database query error:', error.message)
        failed++
      }
    } catch (e: unknown) {
      const err = e as Error
      console.log('⚠️  Could not test database:', err.message)
    }
  } else {
    console.log('⚠️  Skipping database tests (credentials not set)')
  }
  
  // Test 7: Check for theme trigger in schema
  try {
    const schemaContent = fs.readFileSync('database/schema.sql', 'utf-8')
    
    if (schemaContent.includes('ensure_single_active_theme')) {
      console.log('✅ Single active theme trigger in schema')
      passed++
    } else {
      console.log('❌ Single active theme trigger missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking schema:', e)
    failed++
  }
  
  // Summary
  console.log(`\n📊 Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  console.log('\n📝 Next Steps:')
  console.log('1. Create a theme in Supabase (or use seed script)')
  console.log('2. Test theme switching in browser')
  console.log('3. Verify real-time updates work')
  console.log('4. Check CSS variables applied correctly')
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Ready for Part 5.')
  } else {
    console.log('\n⚠️  Some tests failed. Fix issues before continuing.')
    process.exit(1)
  }
}

testThemes().catch(console.error)

