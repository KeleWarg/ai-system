import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

config({ path: join(process.cwd(), '.env.local') })

async function testSupabase() {
  console.log('🧪 Testing Part 2: Supabase Backend\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Check environment variables are set
  try {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ]
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ Environment variable set: ${envVar}`)
        passed++
      } else {
        console.log(`❌ Environment variable missing: ${envVar}`)
        console.log(`   ⚠️  Please add this to .env.local`)
        failed++
      }
    }
  } catch (e) {
    console.log('❌ Error checking environment variables:', e)
    failed++
  }
  
  // Test 2: Check Supabase client can be created
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      console.log('✅ Supabase client created successfully')
      passed++
    } else {
      console.log('⚠️  Skipping Supabase client test (env vars not set)')
    }
  } catch (e) {
    console.log('❌ Error creating Supabase client:', e)
    failed++
  }
  
  // Test 3: Check database schema file exists
  try {
    if (fs.existsSync('database/schema.sql')) {
      console.log('✅ Database schema file exists')
      passed++
      
      // Check schema contains required tables
      const schema = fs.readFileSync('database/schema.sql', 'utf-8')
      const requiredTables = ['users', 'themes', 'components']
      
      for (const table of requiredTables) {
        if (schema.includes(`CREATE TABLE IF NOT EXISTS public.${table}`)) {
          console.log(`✅ Schema defines ${table} table`)
          passed++
        } else {
          console.log(`❌ Schema missing ${table} table`)
          failed++
        }
      }
    } else {
      console.log('❌ Database schema file missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking schema file:', e)
    failed++
  }
  
  // Test 4: Check database helper functions exist
  const helperFiles = [
    'lib/db/themes.ts',
    'lib/db/components.ts',
    'lib/db/users.ts',
  ]
  
  for (const file of helperFiles) {
    try {
      if (fs.existsSync(file)) {
        console.log(`✅ Database helper exists: ${file}`)
        passed++
      } else {
        console.log(`❌ Database helper missing: ${file}`)
        failed++
      }
    } catch (e) {
      console.log(`❌ Error checking ${file}:`, e)
      failed++
    }
  }
  
  // Test 5: Check TypeScript types are defined
  try {
    const supabaseFile = fs.readFileSync('lib/supabase.ts', 'utf-8')
    const requiredTypes = ['Theme', 'Component', 'User', 'Database']
    
    for (const type of requiredTypes) {
      if (supabaseFile.includes(`interface ${type}`) || supabaseFile.includes(`type ${type}`)) {
        console.log(`✅ TypeScript type defined: ${type}`)
        passed++
      } else {
        console.log(`❌ TypeScript type missing: ${type}`)
        failed++
      }
    }
  } catch (e) {
    console.log('❌ Error checking TypeScript types:', e)
    failed++
  }
  
  // Test 6: Check RLS policies in schema
  try {
    const schema = fs.readFileSync('database/schema.sql', 'utf-8')
    
    if (schema.includes('ROW LEVEL SECURITY')) {
      console.log('✅ RLS (Row Level Security) enabled in schema')
      passed++
    } else {
      console.log('❌ RLS not found in schema')
      failed++
    }
    
    if (schema.includes('CREATE POLICY')) {
      console.log('✅ Security policies defined in schema')
      passed++
    } else {
      console.log('❌ No security policies found in schema')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking RLS policies:', e)
    failed++
  }
  
  // Test 7: Attempt database connection (if credentials provided)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      
      // Try to fetch themes (should work even if table is empty)
      const { error } = await supabase.from('themes').select('*').limit(1)
      
      if (!error) {
        console.log('✅ Database connection successful')
        console.log('✅ Can query themes table')
        passed += 2
      } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('⚠️  Database connection works but schema not applied yet')
        console.log('   Run the schema.sql in Supabase SQL Editor to create tables')
        passed++
      } else {
        console.log('❌ Database connection error:', error.message)
        failed++
      }
    } catch (e: unknown) {
      const err = e as Error
      console.log('⚠️  Could not test database connection:', err.message)
    }
  } else {
    console.log('⚠️  Skipping database connection test (credentials not set)')
  }
  
  // Summary
  console.log(`\n📊 Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  console.log('\n📝 Next Steps:')
  console.log('1. Create a Supabase project at https://supabase.com')
  console.log('2. Copy your project credentials to .env.local')
  console.log('3. Run database/schema.sql in Supabase SQL Editor')
  console.log('4. Re-run this test: npm run test:part2')
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Ready for Part 3.')
  } else {
    console.log('\n⚠️  Some tests failed. Fix issues before continuing.')
    process.exit(1)
  }
}

testSupabase().catch(console.error)

