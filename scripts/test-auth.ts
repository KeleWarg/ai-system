import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

config({ path: join(process.cwd(), '.env.local') })

async function testAuth() {
  console.log('🧪 Testing Part 3: Authentication\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Middleware file exists
  try {
    if (fs.existsSync('middleware.ts')) {
      console.log('✅ Middleware file exists')
      passed++
      
      const middlewareContent = fs.readFileSync('middleware.ts', 'utf-8')
      if (middlewareContent.includes('/admin')) {
        console.log('✅ Middleware protects /admin routes')
        passed++
      } else {
        console.log('❌ Middleware missing /admin protection')
        failed++
      }
    } else {
      console.log('❌ Middleware file missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking middleware:', e)
    failed++
  }
  
  // Test 2: Auth helper functions exist
  try {
    if (fs.existsSync('lib/auth-helpers.ts')) {
      console.log('✅ Auth helper file exists')
      passed++
      
      const helpersContent = fs.readFileSync('lib/auth-helpers.ts', 'utf-8')
      const requiredFunctions = [
        'requireAuth',
        'requireAdmin',
        'requireRole',
        'getCurrentUser',
      ]
      
      for (const func of requiredFunctions) {
        if (helpersContent.includes(func)) {
          console.log(`✅ Auth helper function: ${func}`)
          passed++
        } else {
          console.log(`❌ Missing auth helper: ${func}`)
          failed++
        }
      }
    } else {
      console.log('❌ Auth helpers file missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking auth helpers:', e)
    failed++
  }
  
  // Test 3: Auth hooks exist
  const hookFiles = ['hooks/use-auth.ts', 'hooks/use-permissions.ts']
  
  for (const file of hookFiles) {
    try {
      if (fs.existsSync(file)) {
        console.log(`✅ Hook exists: ${file}`)
        passed++
      } else {
        console.log(`❌ Hook missing: ${file}`)
        failed++
      }
    } catch (e) {
      console.log(`❌ Error checking ${file}:`, e)
      failed++
    }
  }
  
  // Test 4: Login page exists
  try {
    if (fs.existsSync('app/admin/login/page.tsx')) {
      console.log('✅ Login page exists')
      passed++
    } else {
      console.log('❌ Login page missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking login page:', e)
    failed++
  }
  
  // Test 5: API routes exist
  const apiRoutes = [
    'app/api/auth/logout/route.ts',
    'app/api/auth/me/route.ts',
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
  
  // Test 6: Permissions hook has required methods
  try {
    const permissionsContent = fs.readFileSync('hooks/use-permissions.ts', 'utf-8')
    const requiredPerms = [
      'canCreateTheme',
      'canDeleteTheme',
      'canEditComponent',
      'canAccessAdmin',
    ]
    
    for (const perm of requiredPerms) {
      if (permissionsContent.includes(perm)) {
        console.log(`✅ Permission defined: ${perm}`)
        passed++
      } else {
        console.log(`❌ Permission missing: ${perm}`)
        failed++
      }
    }
  } catch (e) {
    console.log('❌ Error checking permissions:', e)
    failed++
  }
  
  // Test 7: Security - Check middleware has proper cookie handling
  try {
    const middlewareContent = fs.readFileSync('middleware.ts', 'utf-8')
    
    if (middlewareContent.includes('cookies')) {
      console.log('✅ Security: Cookie-based auth in middleware')
      passed++
    } else {
      console.log('⚠️  Security: Consider adding cookie protection')
    }
  } catch (e) {
    console.log('❌ Security: Could not verify auth implementation:', e)
    failed++
  }
  
  // Summary
  console.log(`\n📊 Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  console.log('\n📝 Next Steps:')
  console.log('1. Ensure Supabase project is set up (Part 2)')
  console.log('2. Create an admin user in Supabase')
  console.log('3. Test login at /admin/login')
  console.log('4. Verify middleware redirects work')
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Ready for Part 4.')
  } else {
    console.log('\n⚠️  Some tests failed. Fix issues before continuing.')
    process.exit(1)
  }
}

testAuth().catch(console.error)

