import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

config({ path: join(process.cwd(), '.env.local') })

async function testAI() {
  console.log('🧪 Testing Part 6: AI Integration\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Check Anthropic API key is set
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('✅ Anthropic API key configured')
      passed++
    } else {
      console.log('❌ Anthropic API key not set in .env.local')
      console.log('   Add: ANTHROPIC_API_KEY=your-key-here')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking API key:', e)
    failed++
  }
  
  // Test 2: AI service wrapper exists
  try {
    if (fs.existsSync('lib/ai/claude.ts')) {
      console.log('✅ Claude AI service wrapper exists')
      passed++
      
      const claudeContent = fs.readFileSync('lib/ai/claude.ts', 'utf-8')
      
      // Check for required functions
      const requiredFunctions = [
        'generateComponentCode',
        'generateUsagePrompts',
        'generateDocumentation',
        'extractSpecFromImage',
      ]
      
      for (const func of requiredFunctions) {
        if (claudeContent.includes(func)) {
          console.log(`✅ AI function: ${func}`)
          passed++
        } else {
          console.log(`❌ Missing AI function: ${func}`)
          failed++
        }
      }
    } else {
      console.log('❌ Claude AI service wrapper missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking AI service:', e)
    failed++
  }
  
  // Test 3: AI API endpoints exist
  const aiEndpoints = [
    'app/api/ai/generate-component/route.ts',
    'app/api/ai/generate-prompts/route.ts',
    'app/api/ai/generate-docs/route.ts',
    'app/api/ai/extract-spec/route.ts',
  ]
  
  for (const endpoint of aiEndpoints) {
    try {
      if (fs.existsSync(endpoint)) {
        console.log(`✅ AI endpoint exists: ${endpoint.split('/').slice(-2).join('/')}`)
        passed++
      } else {
        console.log(`❌ AI endpoint missing: ${endpoint}`)
        failed++
      }
    } catch (e) {
      console.log(`❌ Error checking ${endpoint}:`, e)
      failed++
    }
  }
  
  // Test 4: Check endpoints have auth protection
  try {
    const componentEndpoint = fs.readFileSync('app/api/ai/generate-component/route.ts', 'utf-8')
    
    if (componentEndpoint.includes('getCurrentUser') || componentEndpoint.includes('requireAuth')) {
      console.log('✅ AI endpoints have authentication')
      passed++
    } else {
      console.log('❌ AI endpoints missing authentication')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking endpoint auth:', e)
    failed++
  }
  
  // Test 5: Check for API key validation
  try {
    const componentEndpoint = fs.readFileSync('app/api/ai/generate-component/route.ts', 'utf-8')
    
    if (componentEndpoint.includes('ANTHROPIC_API_KEY')) {
      console.log('✅ Endpoints check for API key')
      passed++
    } else {
      console.log('❌ Endpoints missing API key check')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking API key validation:', e)
    failed++
  }
  
  // Test 6: AI generate button component exists
  try {
    if (fs.existsSync('components/ai-generate-button.tsx')) {
      console.log('✅ AI generate button component exists')
      passed++
    } else {
      console.log('❌ AI generate button component missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking AI button:', e)
    failed++
  }
  
  // Test 7: Check Anthropic SDK is installed
  try {
    const pkg = require('../package.json')
    if (pkg.dependencies['@anthropic-ai/sdk']) {
      console.log('✅ Anthropic SDK installed')
      passed++
    } else {
      console.log('❌ Anthropic SDK not installed')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking Anthropic SDK:', e)
    failed++
  }
  
  // Test 8: Check AI service uses correct model
  try {
    const claudeContent = fs.readFileSync('lib/ai/claude.ts', 'utf-8')
    
    if (claudeContent.includes('claude-3') || claudeContent.includes('sonnet')) {
      console.log('✅ Using Claude 3 model')
      passed++
    } else {
      console.log('⚠️  Claude model version not specified')
    }
  } catch (e) {
    console.log('❌ Error checking model version:', e)
    failed++
  }
  
  // Test 9: Check Vision API support
  try {
    const claudeContent = fs.readFileSync('lib/ai/claude.ts', 'utf-8')
    
    if (claudeContent.includes('image') && claudeContent.includes('base64')) {
      console.log('✅ Vision API (image analysis) supported')
      passed++
    } else {
      console.log('❌ Vision API support missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking Vision API:', e)
    failed++
  }
  
  // Test 10: Check error handling in AI service
  try {
    const claudeContent = fs.readFileSync('lib/ai/claude.ts', 'utf-8')
    
    if (claudeContent.includes('try') && claudeContent.includes('catch')) {
      console.log('✅ Error handling in AI service')
      passed++
    } else {
      console.log('⚠️  Consider adding error handling')
    }
  } catch (e) {
    console.log('❌ Error checking error handling:', e)
    failed++
  }
  
  // Summary
  console.log(`\n📊 Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  console.log('\n📝 Next Steps:')
  console.log('1. Get an Anthropic API key from https://console.anthropic.com')
  console.log('2. Add ANTHROPIC_API_KEY to .env.local')
  console.log('3. Test AI generation in admin panel')
  console.log('4. Upload a PNG spec sheet to test Vision API')
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Ready for Part 7.')
  } else if (failed === 1 && !process.env.ANTHROPIC_API_KEY) {
    console.log('\n⚠️  1 test failed (API key not set). Add API key to continue.')
  } else {
    console.log('\n⚠️  Some tests failed. Fix issues before continuing.')
    process.exit(1)
  }
}

testAI().catch(console.error)

