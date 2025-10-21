import fs from 'fs'
import path from 'path'

const PROJECT_ROOT = process.cwd()

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

function test(name: string, fn: () => boolean | Promise<boolean>) {
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.then((passed) => {
        results.push({ name, passed })
      }).catch((error) => {
        results.push({ name, passed: false, error: error.message })
      })
    } else {
      results.push({ name, passed: result })
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

console.log('🧪 Testing Part 8: Component Generation\n')

// Test 1: Component upload page exists
test('Component upload page exists', () => {
  return fileExists('app/admin/components/new/page.tsx')
})

// Test 2: Upload page has image upload functionality
test('Upload page has image upload input', () => {
  return fileContains('app/admin/components/new/page.tsx', 'type="file"') &&
         fileContains('app/admin/components/new/page.tsx', 'handleImageUpload')
})

// Test 3: Upload page has theme selector
test('Upload page has theme selector', () => {
  return fileContains('app/admin/components/new/page.tsx', 'selectedTheme') &&
         fileContains('app/admin/components/new/page.tsx', 'Select Theme')
})

// Test 4: Upload page extracts spec data
test('Upload page calls extract-spec API', () => {
  return fileContains('app/admin/components/new/page.tsx', '/api/ai/extract-spec')
})

// Test 5: Upload page generates component code
test('Upload page calls generate-component API', () => {
  return fileContains('app/admin/components/new/page.tsx', '/api/ai/generate-component')
})

// Test 6: Upload page generates prompts
test('Upload page calls generate-prompts API', () => {
  return fileContains('app/admin/components/new/page.tsx', '/api/ai/generate-prompts')
})

// Test 7: Upload page generates documentation
test('Upload page calls generate-docs API', () => {
  return fileContains('app/admin/components/new/page.tsx', '/api/ai/generate-docs')
})

// Test 8: Upload page saves component
test('Upload page saves component via API', () => {
  return fileContains('app/admin/components/new/page.tsx', '/api/components') &&
         fileContains('app/admin/components/new/page.tsx', 'handleSave')
})

// Test 9: Upload page has error handling
test('Upload page has error handling', () => {
  return fileContains('app/admin/components/new/page.tsx', 'setError') &&
         fileContains('app/admin/components/new/page.tsx', 'catch')
})

// Test 10: Upload page shows loading states
test('Upload page shows loading states', () => {
  return fileContains('app/admin/components/new/page.tsx', 'uploading') &&
         fileContains('app/admin/components/new/page.tsx', 'generating') &&
         fileContains('app/admin/components/new/page.tsx', 'saving')
})

// Test 11: Components API route exists
test('Components POST API route exists', () => {
  return fileExists('app/api/components/route.ts')
})

// Test 12: Components API validates authentication
test('Components API checks authentication', () => {
  return fileContains('app/api/components/route.ts', 'getUser') &&
         fileContains('app/api/components/route.ts', 'Unauthorized')
})

// Test 13: Components API validates required fields
test('Components API validates required fields', () => {
  return fileContains('app/api/components/route.ts', 'name') &&
         fileContains('app/api/components/route.ts', 'slug') &&
         fileContains('app/api/components/route.ts', 'code') &&
         fileContains('app/api/components/route.ts', 'Missing required fields')
})

// Test 14: Components API saves to database
test('Components API saves to Supabase', () => {
  return fileContains('app/api/components/route.ts', 'supabase') &&
         fileContains('app/api/components/route.ts', '.insert(')
})

// Test 15: AI integration supports theme-aware generation
test('AI integration has theme parameter', () => {
  return fileContains('lib/ai/claude.ts', 'theme?:') &&
         fileContains('lib/ai/claude.ts', 'colors?:')
})

// Test 16: AI integration maps colors to theme tokens
test('AI integration maps spec colors to theme tokens', () => {
  return fileContains('lib/ai/claude.ts', 'Theme Information') &&
         fileContains('lib/ai/claude.ts', 'Color Mapping') &&
         fileContains('lib/ai/claude.ts', 'bg-primary') &&
         fileContains('lib/ai/claude.ts', 'NEVER use hardcoded hex colors')
})

// Test 17: AI integration instructs to use theme classes
test('AI integration enforces theme class usage', () => {
  return fileContains('lib/ai/claude.ts', 'NO HEX COLORS') &&
         fileContains('lib/ai/claude.ts', 'bg-primary')
})

// Test 18: Admin components page links to new component
test('Admin components page links to create page', () => {
  return fileContains('app/admin/components/page.tsx', '/admin/components/new') &&
         fileContains('app/admin/components/page.tsx', 'Create Component')
})

// Test 19: Admin components page shows empty state
test('Admin components page has proper empty state', () => {
  return fileContains('app/admin/components/page.tsx', 'Upload a PNG spec sheet')
})

// Test 20: Components can be managed from admin page (Preview/Edit/Delete via ComponentActions)
test('Admin components page links to component view', () => {
  return fileContains('app/admin/components/page.tsx', 'ComponentActions') &&
         fileContains('app/admin/components/page.tsx', 'componentSlug')
})

// Print results
console.log('Results:\n')
let passed = 0
let failed = 0

results.forEach((result) => {
  const icon = result.passed ? '✅' : '❌'
  console.log(`${icon} ${result.name}`)
  if (result.error) {
    console.log(`   Error: ${result.error}`)
  }
  if (result.passed) passed++
  else failed++
})

console.log(`\n📊 Summary: ${passed}/${results.length} tests passed`)

if (failed > 0) {
  console.log(`\n⚠️  ${failed} test(s) failed`)
  process.exit(1)
} else {
  console.log('\n✅ All tests passed!')
}

