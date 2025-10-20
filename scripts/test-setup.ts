import { config } from 'dotenv'
import { join } from 'path'

config({ path: join(process.cwd(), '.env.local') })

async function testSetup() {
  console.log('🧪 Testing Part 1: Initial Setup\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Check environment file exists
  try {
    const fs = require('fs')
    if (fs.existsSync('.env.local')) {
      console.log('✅ .env.local file exists')
      passed++
    } else {
      console.log('❌ .env.local file missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking .env.local:', e)
    failed++
  }
  
  // Test 2: Check required directories exist
  const requiredDirs = [
    'app',
    'lib',
    'components',
    'hooks',
    'database',
    'scripts',
  ]
  
  for (const dir of requiredDirs) {
    try {
      const fs = require('fs')
      if (fs.existsSync(dir)) {
        console.log(`✅ Directory exists: ${dir}`)
        passed++
      } else {
        console.log(`❌ Directory missing: ${dir}`)
        failed++
      }
    } catch (e) {
      console.log(`❌ Error checking ${dir}:`, e)
      failed++
    }
  }
  
  // Test 3: Check package.json has required dependencies
  try {
    const pkg = require('../package.json')
    const requiredDeps = [
      'react',
      'next',
      '@supabase/supabase-js',
      '@supabase/ssr',
      '@anthropic-ai/sdk',
      'class-variance-authority',
      'tailwind-merge',
      'lucide-react',
    ]
    
    for (const dep of requiredDeps) {
      if (pkg.dependencies[dep]) {
        console.log(`✅ Dependency installed: ${dep}`)
        passed++
      } else {
        console.log(`❌ Dependency missing: ${dep}`)
        failed++
      }
    }
  } catch (e) {
    console.log('❌ Error checking package.json:', e)
    failed++
  }
  
  // Test 4: Check utility functions work
  try {
    const { cn } = require('../lib/utils')
    const result = cn('class1', 'class2')
    if (result === 'class1 class2') {
      console.log('✅ cn() utility function works')
      passed++
    } else {
      console.log('❌ cn() utility function failed')
      failed++
    }
  } catch (e) {
    console.log('❌ Error testing utils:', e)
    failed++
  }
  
  // Test 5: Check slugify function works
  try {
    const { slugify } = require('../lib/utils')
    const testCases = [
      { input: 'Hello World', expected: 'hello-world' },
      { input: 'Test-Component', expected: 'test-component' },
      { input: 'Special@#$Chars', expected: 'specialchars' },
    ]
    
    for (const test of testCases) {
      const result = slugify(test.input)
      if (result === test.expected) {
        console.log(`✅ slugify("${test.input}") = "${result}"`)
        passed++
      } else {
        console.log(`❌ slugify("${test.input}") = "${result}" (expected "${test.expected}")`)
        failed++
      }
    }
  } catch (e) {
    console.log('❌ Error testing slugify:', e)
    failed++
  }
  
  // Test 6: Edge case - empty slugify
  try {
    const { slugify } = require('../lib/utils')
    const result = slugify('')
    if (result === '') {
      console.log('✅ Edge case: slugify("") = ""')
      passed++
    } else {
      console.log(`❌ Edge case: slugify("") = "${result}"`)
      failed++
    }
  } catch (e) {
    console.log('❌ Edge case failed:', e)
    failed++
  }
  
  // Summary
  console.log(`\n📊 Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Ready for Part 2.')
  } else {
    console.log('\n⚠️  Some tests failed. Fix issues before continuing.')
    process.exit(1)
  }
}

testSetup().catch(console.error)

