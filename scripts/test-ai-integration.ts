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

console.log('🧪 Testing Part 9: AI Tool Integration\n')

// Test 1: Registry API main route exists
test('Registry API main route exists', () => {
  return fileExists('app/api/registry/route.ts')
})

// Test 2: Registry API returns component list
test('Registry API has GET handler', () => {
  return fileContains('app/api/registry/route.ts', 'export async function GET')
})

// Test 3: Registry API includes schema version
test('Registry API includes schema version', () => {
  return fileContains('app/api/registry/route.ts', 'schema_version')
})

// Test 4: Registry API lists components
test('Registry API maps components', () => {
  return fileContains('app/api/registry/route.ts', 'getComponents') &&
         fileContains('app/api/registry/route.ts', 'components.map')
})

// Test 5: Registry API includes URLs
test('Registry API includes component URLs', () => {
  return fileContains('app/api/registry/route.ts', 'url:') &&
         fileContains('app/api/registry/route.ts', 'docs_url:')
})

// Test 6: Registry individual component route exists
test('Registry individual component route exists', () => {
  return fileExists('app/api/registry/[slug]/route.ts')
})

// Test 7: Registry component route handles 404
test('Registry component route handles not found', () => {
  return fileContains('app/api/registry/[slug]/route.ts', 'Component not found') &&
         fileContains('app/api/registry/[slug]/route.ts', '404')
})

// Test 8: Registry component route returns code
test('Registry component route returns full details', () => {
  return fileContains('app/api/registry/[slug]/route.ts', 'code:') &&
         fileContains('app/api/registry/[slug]/route.ts', 'variants:') &&
         fileContains('app/api/registry/[slug]/route.ts', 'props:')
})

// Test 9: Registry component route includes dependencies
test('Registry component route includes dependencies', () => {
  return fileContains('app/api/registry/[slug]/route.ts', 'dependencies:') &&
         fileContains('app/api/registry/[slug]/route.ts', 'class-variance-authority')
})

// Test 10: MCP Server route exists
test('MCP Server route exists', () => {
  return fileExists('app/api/mcp/route.ts')
})

// Test 11: MCP Server has correct structure
test('MCP Server has version and tools', () => {
  return fileContains('app/api/mcp/route.ts', 'version:') &&
         fileContains('app/api/mcp/route.ts', 'tools:')
})

// Test 12: MCP Server lists tools
test('MCP Server defines list_components tool', () => {
  return fileContains('app/api/mcp/route.ts', 'list_components')
})

// Test 13: MCP Server defines get component tool
test('MCP Server defines get_component tool', () => {
  return fileContains('app/api/mcp/route.ts', 'get_component') &&
         fileContains('app/api/mcp/route.ts', 'slug')
})

// Test 14: MCP Server includes registry URL
test('MCP Server includes registry URL', () => {
  return fileContains('app/api/mcp/route.ts', 'registry_url:')
})

// Test 15: MCP Server includes components list
test('MCP Server includes components', () => {
  return fileContains('app/api/mcp/route.ts', 'components:') &&
         fileContains('app/api/mcp/route.ts', 'getComponents')
})

// Test 16: llms.txt route exists
test('llms.txt route exists', () => {
  return fileExists('app/llms.txt/route.ts')
})

// Test 17: llms.txt returns plain text
test('llms.txt returns text/plain', () => {
  return fileContains('app/llms.txt/route.ts', 'text/plain')
})

// Test 18: llms.txt includes API endpoints
test('llms.txt includes API endpoints', () => {
  return fileContains('app/llms.txt/route.ts', '/api/registry') &&
         fileContains('app/llms.txt/route.ts', '/api/mcp')
})

// Test 19: llms.txt includes usage instructions
test('llms.txt includes usage instructions', () => {
  return fileContains('app/llms.txt/route.ts', 'v0.dev') &&
         fileContains('app/llms.txt/route.ts', 'Claude') &&
         fileContains('app/llms.txt/route.ts', 'Cursor')
})

// Test 20: llms.txt lists components
test('llms.txt lists components', () => {
  return fileContains('app/llms.txt/route.ts', 'getComponents') &&
         fileContains('app/llms.txt/route.ts', 'Available Components')
})

// Test 21: Environment variable documented
test('NEXT_PUBLIC_SITE_URL in .env.example', () => {
  return fileContains('.env.example', 'NEXT_PUBLIC_SITE_URL')
})

// Test 22: All APIs use NEXT_PUBLIC_SITE_URL
test('APIs use NEXT_PUBLIC_SITE_URL variable', () => {
  return fileContains('app/api/registry/route.ts', 'NEXT_PUBLIC_SITE_URL') &&
         fileContains('app/api/mcp/route.ts', 'NEXT_PUBLIC_SITE_URL') &&
         fileContains('app/llms.txt/route.ts', 'NEXT_PUBLIC_SITE_URL')
})

// Test 23: APIs have fallback URLs
test('APIs have localhost fallback', () => {
  return fileContains('app/api/registry/route.ts', 'localhost:3000') &&
         fileContains('app/api/mcp/route.ts', 'localhost:3000') &&
         fileContains('app/llms.txt/route.ts', 'localhost:3000')
})

// Test 24: Error handling in Registry API
test('Registry API has error handling', () => {
  return fileContains('app/api/registry/route.ts', 'catch') &&
         fileContains('app/api/registry/route.ts', 'error')
})

// Test 25: Error handling in MCP Server
test('MCP Server has error handling', () => {
  return fileContains('app/api/mcp/route.ts', 'catch') &&
         fileContains('app/api/mcp/route.ts', 'error')
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

