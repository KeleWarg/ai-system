import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

config({ path: join(process.cwd(), '.env.local') })

async function testPublicUI() {
  console.log('🧪 Testing Part 7: Public UI\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Homepage exists
  try {
    if (fs.existsSync('app/(public)/page.tsx')) {
      console.log('✅ Homepage exists')
      passed++
      
      const homeContent = fs.readFileSync('app/(public)/page.tsx', 'utf-8')
      
      // Check for hero section
      if (homeContent.includes('Hero') || homeContent.includes('AI-Powered')) {
        console.log('✅ Homepage has hero section')
        passed++
      } else {
        console.log('❌ Homepage missing hero section')
        failed++
      }
      
      // Check for CTA buttons
      if (homeContent.includes('Browse Components') || homeContent.includes('Get Started')) {
        console.log('✅ Homepage has CTA buttons')
        passed++
      } else {
        console.log('❌ Homepage missing CTA buttons')
        failed++
      }
    } else {
      console.log('❌ Homepage missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking homepage:', e)
    failed++
  }
  
  // Test 2: Public layout exists
  try {
    if (fs.existsSync('app/(public)/layout.tsx')) {
      console.log('✅ Public layout exists')
      passed++
    } else {
      console.log('❌ Public layout missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking public layout:', e)
    failed++
  }
  
  // Test 3: Public navigation component exists
  try {
    if (fs.existsSync('components/public-nav.tsx')) {
      console.log('✅ Public navigation component exists')
      passed++
      
      const navContent = fs.readFileSync('components/public-nav.tsx', 'utf-8')
      
      // Check for navigation links
      if (navContent.includes('Components') || navContent.includes('navigation')) {
        console.log('✅ Navigation has menu items')
        passed++
      } else {
        console.log('❌ Navigation missing menu items')
        failed++
      }
    } else {
      console.log('❌ Public navigation missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking navigation:', e)
    failed++
  }
  
  // Test 4: Footer component exists
  try {
    if (fs.existsSync('components/public-footer.tsx')) {
      console.log('✅ Footer component exists')
      passed++
    } else {
      console.log('❌ Footer component missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking footer:', e)
    failed++
  }
  
  // Test 5: Component list page exists
  try {
    if (fs.existsSync('app/(public)/docs/components/page.tsx')) {
      console.log('✅ Component list page exists')
      passed++
    } else {
      console.log('❌ Component list page missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking component list:', e)
    failed++
  }
  
  // Test 6: Component detail page exists
  try {
    if (fs.existsSync('app/(public)/docs/components/[slug]/page.tsx')) {
      console.log('✅ Component detail page exists')
      passed++
      
      const detailContent = fs.readFileSync('app/(public)/docs/components/[slug]/page.tsx', 'utf-8')
      
      // Check for tabs
      if (detailContent.includes('Tabs') || detailContent.includes('TabsContent')) {
        console.log('✅ Component detail has tabs')
        passed++
      } else {
        console.log('❌ Component detail missing tabs')
        failed++
      }
    } else {
      console.log('❌ Component detail page missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking component detail:', e)
    failed++
  }
  
  // Test 7: Code block component exists
  try {
    if (fs.existsSync('components/code-block.tsx')) {
      console.log('✅ Code block component exists')
      passed++
      
      const codeBlockContent = fs.readFileSync('components/code-block.tsx', 'utf-8')
      
      // Check for copy functionality
      if (codeBlockContent.includes('Copy') || codeBlockContent.includes('clipboard')) {
        console.log('✅ Code block has copy functionality')
        passed++
      } else {
        console.log('❌ Code block missing copy button')
        failed++
      }
    } else {
      console.log('❌ Code block component missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking code block:', e)
    failed++
  }
  
  // Test 8: UI components exist
  const uiComponents = [
    'components/ui/badge.tsx',
    'components/ui/tabs.tsx',
  ]
  
  for (const component of uiComponents) {
    try {
      if (fs.existsSync(component)) {
        console.log(`✅ UI component exists: ${component.split('/').pop()}`)
        passed++
      } else {
        console.log(`❌ UI component missing: ${component}`)
        failed++
      }
    } catch (e) {
      console.log(`❌ Error checking ${component}:`, e)
      failed++
    }
  }
  
  // Test 9: Check Radix Tabs installed
  try {
    const pkg = require('../package.json')
    if (pkg.dependencies['@radix-ui/react-tabs']) {
      console.log('✅ Radix UI Tabs installed')
      passed++
    } else {
      console.log('❌ Radix UI Tabs not installed')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking Radix Tabs:', e)
    failed++
  }
  
  // Test 10: Check component grouping by category
  try {
    const listPageContent = fs.readFileSync('app/(public)/docs/components/page.tsx', 'utf-8')
    
    if (listPageContent.includes('category') || listPageContent.includes('componentsByCategory')) {
      console.log('✅ Components grouped by category')
      passed++
    } else {
      console.log('⚠️  Consider grouping components by category')
    }
  } catch (e) {
    console.log('❌ Error checking component grouping:', e)
    failed++
  }
  
  // Summary
  console.log(`\n📊 Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  console.log('\n📝 Next Steps:')
  console.log('1. Start the dev server: npm run dev')
  console.log('2. Visit http://localhost:3000 to see the homepage')
  console.log('3. Visit /docs/components to see the component list')
  console.log('4. Create a component in admin to test the docs')
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Ready for Part 8.')
  } else {
    console.log('\n⚠️  Some tests failed. Fix issues before continuing.')
    process.exit(1)
  }
}

testPublicUI().catch(console.error)

