import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

config({ path: join(process.cwd(), '.env.local') })

async function testAdmin() {
  console.log('🧪 Testing Part 5: Admin Panel\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Admin layout exists
  try {
    if (fs.existsSync('app/admin/layout.tsx')) {
      console.log('✅ Admin layout exists')
      passed++
    } else {
      console.log('❌ Admin layout missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking admin layout:', e)
    failed++
  }
  
  // Test 2: Admin sidebar component exists
  try {
    if (fs.existsSync('components/admin-sidebar.tsx')) {
      console.log('✅ Admin sidebar component exists')
      passed++
      
      const sidebarContent = fs.readFileSync('components/admin-sidebar.tsx', 'utf-8')
      
      // Check for navigation items
      if (sidebarContent.includes('Dashboard') && sidebarContent.includes('Themes')) {
        console.log('✅ Sidebar has navigation items')
        passed++
      } else {
        console.log('❌ Sidebar missing navigation')
        failed++
      }
      
      // Check for logout functionality
      if (sidebarContent.includes('logout') || sidebarContent.includes('LogOut')) {
        console.log('✅ Logout functionality present')
        passed++
      } else {
        console.log('❌ Logout functionality missing')
        failed++
      }
    } else {
      console.log('❌ Admin sidebar missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking admin sidebar:', e)
    failed++
  }
  
  // Test 3: Admin dashboard exists
  try {
    if (fs.existsSync('app/admin/page.tsx')) {
      console.log('✅ Admin dashboard exists')
      passed++
    } else {
      console.log('❌ Admin dashboard missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking admin dashboard:', e)
    failed++
  }
  
  // Test 4: UI components exist
  const uiComponents = [
    'components/ui/button.tsx',
    'components/ui/card.tsx',
    'components/ui/input.tsx',
    'components/ui/label.tsx',
    'components/ui/textarea.tsx',
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
  
  // Test 5: Theme management pages exist
  const themePages = [
    'app/admin/themes/page.tsx',
    'app/admin/themes/new/page.tsx',
    'app/admin/themes/[id]/page.tsx',
  ]
  
  for (const page of themePages) {
    try {
      if (fs.existsSync(page)) {
        console.log(`✅ Theme page exists: ${page.split('/').slice(-2).join('/')}`)
        passed++
      } else {
        console.log(`❌ Theme page missing: ${page}`)
        failed++
      }
    } catch (e) {
      console.log(`❌ Error checking ${page}:`, e)
      failed++
    }
  }
  
  // Test 6: Theme form component exists
  try {
    if (fs.existsSync('components/theme-form.tsx')) {
      console.log('✅ Theme form component exists')
      passed++
      
      const formContent = fs.readFileSync('components/theme-form.tsx', 'utf-8')
      
      // Check for HSL color inputs
      if (formContent.includes('HSL')) {
        console.log('✅ Theme form has HSL color fields')
        passed++
      } else {
        console.log('❌ Theme form missing HSL color fields')
        failed++
      }
    } else {
      console.log('❌ Theme form missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking theme form:', e)
    failed++
  }
  
  // Test 7: Theme list item component exists
  try {
    if (fs.existsSync('components/theme-list-item.tsx')) {
      console.log('✅ Theme list item component exists')
      passed++
      
      const listItemContent = fs.readFileSync('components/theme-list-item.tsx', 'utf-8')
      
      // Check for activate/delete actions
      if (listItemContent.includes('Activate') && listItemContent.includes('Delete')) {
        console.log('✅ Theme actions (activate, delete) present')
        passed++
      } else {
        console.log('❌ Theme actions missing')
        failed++
      }
    } else {
      console.log('❌ Theme list item missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking theme list item:', e)
    failed++
  }
  
  // Test 8: Components page exists
  try {
    if (fs.existsSync('app/admin/components/page.tsx')) {
      console.log('✅ Components page exists')
      passed++
    } else {
      console.log('❌ Components page missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking components page:', e)
    failed++
  }
  
  // Test 9: Monaco editor installed
  try {
    const pkg = require('../package.json')
    if (pkg.dependencies['@monaco-editor/react']) {
      console.log('✅ Monaco editor package installed')
      passed++
    } else {
      console.log('❌ Monaco editor package not installed')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking Monaco editor:', e)
    failed++
  }
  
  // Test 10: Button component has variants
  try {
    const buttonContent = fs.readFileSync('components/ui/button.tsx', 'utf-8')
    
    if (buttonContent.includes('variant') && buttonContent.includes('default')) {
      console.log('✅ Button component has variants')
      passed++
    } else {
      console.log('❌ Button variants missing')
      failed++
    }
  } catch (e) {
    console.log('❌ Error checking button variants:', e)
    failed++
  }
  
  // Summary
  console.log(`\n📊 Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  console.log('\n📝 Next Steps:')
  console.log('1. Set up Supabase and create an admin user')
  console.log('2. Test login at /admin/login')
  console.log('3. Create your first theme')
  console.log('4. Test theme activation and real-time updates')
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Ready for Part 6.')
  } else {
    console.log('\n⚠️  Some tests failed. Fix issues before continuing.')
    process.exit(1)
  }
}

testAdmin().catch(console.error)

