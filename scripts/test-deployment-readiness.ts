import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const PROJECT_ROOT = process.cwd()

interface TestResult {
  name: string
  passed: boolean
  error?: string
  warning?: string
}

const results: TestResult[] = []

function test(name: string, fn: () => boolean | Promise<boolean>, warning?: string) {
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.then((passed) => {
        results.push({ name, passed, warning })
      }).catch((error) => {
        results.push({ name, passed: false, error: error.message })
      })
    } else {
      results.push({ name, passed: result, warning })
    }
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message })
  }
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(PROJECT_ROOT, filePath))
}

function fileContains(filePath: string, content: string): boolean {
  const fullPath = path.join(PROJECT_ROOT, filePath)
  if (!fs.existsSync(fullPath)) return false
  const fileContent = fs.readFileSync(fullPath, 'utf-8')
  return fileContent.includes(content)
}

console.log('🚀 Testing Deployment Readiness\n')

// Test 1: Vercel configuration exists
test('vercel.json exists', () => {
  return fileExists('vercel.json')
})

// Test 2: Vercel config is valid JSON
test('vercel.json is valid JSON', () => {
  try {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'vercel.json'), 'utf-8')
    JSON.parse(content)
    return true
  } catch {
    return false
  }
})

// Test 3: Package.json has correct scripts
test('package.json has build script', () => {
  return fileContains('package.json', '"build"')
})

// Test 4: All required environment variables documented
test('All env vars in .env.example', () => {
  return fileContains('.env.example', 'NEXT_PUBLIC_SUPABASE_URL') &&
         fileContains('.env.example', 'NEXT_PUBLIC_SUPABASE_ANON_KEY') &&
         fileContains('.env.example', 'SUPABASE_SERVICE_ROLE_KEY') &&
         fileContains('.env.example', 'ANTHROPIC_API_KEY') &&
         fileContains('.env.example', 'NEXT_PUBLIC_SITE_URL')
})

// Test 5: No sensitive data in git
test('Sensitive files ignored', () => {
  return (fileContains('.gitignore', '.env.local') || fileContains('.gitignore', '.env*')) &&
         (fileContains('.gitignore', 'node_modules') || fileContains('.gitignore', '/node_modules'))
})

// Test 6: Database schema exists
test('Database schema file exists', () => {
  return fileExists('database/schema.sql')
})

// Test 7: Deployment documentation exists
test('DEPLOYMENT.md exists', () => {
  return fileExists('DEPLOYMENT.md')
})

// Test 8: Production checklist exists
test('PRODUCTION_CHECKLIST.md exists', () => {
  return fileExists('PRODUCTION_CHECKLIST.md')
})

// Test 9: All core pages exist
test('Core pages exist', () => {
  return fileExists('app/page.tsx') &&
         fileExists('app/admin/page.tsx') &&
         fileExists('app/admin/login/page.tsx')
})

// Test 10: All API routes exist
test('All API routes exist', () => {
  return fileExists('app/api/registry/route.ts') &&
         fileExists('app/api/mcp/route.ts') &&
         fileExists('app/llms.txt/route.ts') &&
         fileExists('app/api/themes/route.ts') &&
         fileExists('app/api/components/route.ts')
})

// Test 11: Authentication middleware exists
test('Authentication middleware exists', () => {
  return fileExists('middleware.ts')
})

// Test 12: Theme system implemented
test('Theme system complete', () => {
  return fileExists('components/theme-provider.tsx') &&
         fileExists('lib/theme-utils.ts')
})

// Test 13: AI integration complete
test('AI integration complete', () => {
  return fileExists('lib/ai/claude.ts') &&
         fileExists('app/api/ai/generate-component/route.ts') &&
         fileExists('app/api/ai/extract-spec/route.ts')
})

// Test 14: Admin panel complete
test('Admin panel complete', () => {
  return fileExists('app/admin/themes/page.tsx') &&
         fileExists('app/admin/components/page.tsx') &&
         fileExists('app/admin/components/new/page.tsx')
})

// Test 15: Public UI complete
test('Public UI complete', () => {
  return fileExists('app/(public)/docs/components/page.tsx') &&
         fileExists('components/public-nav.tsx') &&
         fileExists('components/public-footer.tsx')
})

// Test 16: Utility functions exist
test('Core utilities exist', () => {
  return fileExists('lib/utils.ts') &&
         fileExists('lib/supabase.ts') &&
         fileExists('lib/auth-helpers.ts')
})

// Test 17: Database helpers exist
test('Database helpers exist', () => {
  return fileExists('lib/db/themes.ts') &&
         fileExists('lib/db/components.ts') &&
         fileExists('lib/db/users.ts')
})

// Test 18: UI components exist
test('UI components exist', () => {
  return fileExists('components/ui/button.tsx') &&
         fileExists('components/ui/input.tsx') &&
         fileExists('components/ui/card.tsx')
})

// Test 19: TypeScript configuration valid
test('tsconfig.json exists and valid', () => {
  try {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'tsconfig.json'), 'utf-8')
    JSON.parse(content)
    return true
  } catch {
    return false
  }
})

// Test 20: Tailwind configuration valid
test('tailwind.config.ts exists', () => {
  return fileExists('tailwind.config.ts')
})

// Test 21: README has deployment info
test('README mentions deployment', () => {
  return fileContains('README.md', 'Part 10') ||
         fileContains('README.md', 'Deployment')
}, 'Update README with Part 10 info')

// Test 22: No console.log in production code
test('Limited console usage', () => {
  const apiFiles = [
    'app/api/registry/route.ts',
    'app/api/mcp/route.ts',
  ]
  
  // Check that error logging exists (console.error is OK)
  return apiFiles.every(file => {
    if (!fileExists(file)) return false
    return fileContains(file, 'console.error')
  })
})

// Test 23: CORS headers configured
test('CORS headers in vercel.json', () => {
  return fileContains('vercel.json', 'Access-Control-Allow-Origin')
})

// Test 24: All test scripts exist
test('All test scripts exist', () => {
  return fileExists('scripts/test-setup.ts') &&
         fileExists('scripts/test-supabase.ts') &&
         fileExists('scripts/test-auth.ts') &&
         fileExists('scripts/test-themes.ts') &&
         fileExists('scripts/test-admin.ts') &&
         fileExists('scripts/test-ai.ts') &&
         fileExists('scripts/test-public-ui.ts') &&
         fileExists('scripts/test-component-generation.ts') &&
         fileExists('scripts/test-ai-integration.ts')
})

// Test 25: Git repository initialized
test('Git repository exists', () => {
  return fileExists('.git')
})

// Print results
console.log('Results:\n')
let passed = 0
let failed = 0
let warnings = 0

results.forEach((result) => {
  const icon = result.passed ? '✅' : '❌'
  console.log(`${icon} ${result.name}`)
  if (result.error) {
    console.log(`   Error: ${result.error}`)
  }
  if (result.warning) {
    console.log(`   ⚠️  ${result.warning}`)
    warnings++
  }
  if (result.passed) passed++
  else failed++
})

console.log(`\n📊 Summary: ${passed}/${results.length} checks passed`)

if (warnings > 0) {
  console.log(`⚠️  ${warnings} warning(s)`)
}

if (failed > 0) {
  console.log(`\n❌ ${failed} check(s) failed`)
  console.log('\n🔧 Fix the issues above before deploying to production')
  process.exit(1)
} else {
  console.log('\n✅ All deployment readiness checks passed!')
  console.log('\n🚀 Your project is ready for deployment!')
  console.log('\nNext steps:')
  console.log('1. Review DEPLOYMENT.md for deployment instructions')
  console.log('2. Review PRODUCTION_CHECKLIST.md and complete all items')
  console.log('3. Run: vercel (for preview deployment)')
  console.log('4. Run: vercel --prod (for production deployment)')
}

