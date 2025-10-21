/**
 * Comprehensive System Audit Script
 * Tests all aspects of the AI Design System
 */

import { createClient } from '@supabase/supabase-js'

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

interface TestResult {
  phase: string
  test: string
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP'
  message?: string
  details?: any
}

const results: TestResult[] = []

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function addResult(phase: string, test: string, status: TestResult['status'], message?: string, details?: any) {
  results.push({ phase, test, status, message, details })
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '⏭️'
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : status === 'WARN' ? 'yellow' : 'cyan'
  log(color, `${icon} ${test}${message ? ': ' + message : ''}`)
}

// =============================================================================
// PHASE 1: ENVIRONMENT & CONFIGURATION AUDIT
// =============================================================================

async function phase1_EnvironmentAudit() {
  log('magenta', '\n========================================')
  log('magenta', 'PHASE 1: ENVIRONMENT & CONFIGURATION')
  log('magenta', '========================================\n')

  // Check required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
  ]

  const optionalEnvVars = [
    'NEXT_PUBLIC_SITE_URL',
  ]

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      addResult('Phase 1', `Environment: ${envVar}`, 'PASS', 'Configured')
    } else {
      addResult('Phase 1', `Environment: ${envVar}`, 'FAIL', 'Missing or not set')
    }
  }

  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      addResult('Phase 1', `Environment: ${envVar}`, 'PASS', 'Configured')
    } else {
      addResult('Phase 1', `Environment: ${envVar}`, 'WARN', 'Not set (optional but recommended)')
    }
  }

  // Check if .env.local exists
  const fs = await import('fs')
  const path = await import('path')
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (fs.existsSync(envPath)) {
    addResult('Phase 1', '.env.local file', 'PASS', 'File exists')
  } else {
    addResult('Phase 1', '.env.local file', 'WARN', 'File not found - using system env vars')
  }
}

// =============================================================================
// PHASE 2: DATABASE SCHEMA AUDIT
// =============================================================================

async function phase2_DatabaseAudit() {
  log('magenta', '\n========================================')
  log('magenta', 'PHASE 2: DATABASE SCHEMA AUDIT')
  log('magenta', '========================================\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    addResult('Phase 2', 'Database connection', 'SKIP', 'Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test 1: Check if tables exist
  const tables = ['users', 'themes', 'components']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        addResult('Phase 2', `Table: ${table}`, 'FAIL', error.message)
      } else {
        addResult('Phase 2', `Table: ${table}`, 'PASS', 'Accessible')
      }
    } catch (err: any) {
      addResult('Phase 2', `Table: ${table}`, 'FAIL', err.message)
    }
  }

  // Test 2: Check indexes
  try {
    const { data: indexes, error } = await supabase.rpc('pg_indexes', {}).select('*')
    if (!error && indexes) {
      addResult('Phase 2', 'Database indexes', 'PASS', `Found indexes in database`)
    } else {
      addResult('Phase 2', 'Database indexes', 'WARN', 'Could not verify indexes')
    }
  } catch {
    addResult('Phase 2', 'Database indexes', 'WARN', 'Manual verification needed')
  }

  // Test 3: Check component_name column exists
  try {
    const { data, error } = await supabase
      .from('components')
      .select('component_name')
      .limit(1)
    
    if (error && error.message.includes('column')) {
      addResult('Phase 2', 'component_name column', 'FAIL', 'Missing from components table')
    } else {
      addResult('Phase 2', 'component_name column', 'PASS', 'Column exists')
    }
  } catch (err: any) {
    addResult('Phase 2', 'component_name column', 'FAIL', err.message)
  }

  // Test 4: Validate category CHECK constraint
  try {
    const { error } = await supabase
      .from('components')
      .insert({
        name: 'TEST_INVALID_CATEGORY',
        slug: 'test-invalid-' + Date.now(),
        component_name: 'TestComponent',
        code: 'export const TestComponent = () => <div>Test</div>',
        category: 'invalid_category_xyz',
      })
    
    if (error && error.message.includes('check')) {
      addResult('Phase 2', 'Category CHECK constraint', 'PASS', 'Constraint enforced')
    } else {
      addResult('Phase 2', 'Category CHECK constraint', 'WARN', 'Constraint may not be enforced')
    }
  } catch {
    addResult('Phase 2', 'Category CHECK constraint', 'WARN', 'Unable to test')
  }
}

// =============================================================================
// PHASE 3: RLS POLICIES AUDIT
// =============================================================================

async function phase3_RLSPoliciesAudit() {
  log('magenta', '\n========================================')
  log('magenta', 'PHASE 3: RLS POLICIES AUDIT')
  log('magenta', '========================================\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    addResult('Phase 3', 'RLS testing', 'SKIP', 'Missing Supabase credentials')
    return
  }

  // Test with anon client (unauthenticated)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)

  // Test 1: Anonymous can read themes
  try {
    const { data, error } = await anonClient.from('themes').select('*').limit(1)
    if (!error) {
      addResult('Phase 3', 'RLS: Anon read themes', 'PASS', 'Public read access works')
    } else {
      addResult('Phase 3', 'RLS: Anon read themes', 'FAIL', error.message)
    }
  } catch (err: any) {
    addResult('Phase 3', 'RLS: Anon read themes', 'FAIL', err.message)
  }

  // Test 2: Anonymous can read components
  try {
    const { data, error } = await anonClient.from('components').select('*').limit(1)
    if (!error) {
      addResult('Phase 3', 'RLS: Anon read components', 'PASS', 'Public read access works')
    } else {
      addResult('Phase 3', 'RLS: Anon read components', 'FAIL', error.message)
    }
  } catch (err: any) {
    addResult('Phase 3', 'RLS: Anon read components', 'FAIL', err.message)
  }

  // Test 3: Anonymous CANNOT create themes
  try {
    const { error } = await anonClient.from('themes').insert({
      name: 'TEST_UNAUTHORIZED',
      slug: 'test-unauth-' + Date.now(),
      colors: {},
    })
    
    if (error) {
      addResult('Phase 3', 'RLS: Anon create theme', 'PASS', 'Properly blocked')
    } else {
      addResult('Phase 3', 'RLS: Anon create theme', 'FAIL', 'SECURITY ISSUE: Unauthenticated user can create themes!')
    }
  } catch {
    addResult('Phase 3', 'RLS: Anon create theme', 'PASS', 'Properly blocked')
  }

  // Test 4: Anonymous CANNOT create components
  try {
    const { error } = await anonClient.from('components').insert({
      name: 'TEST_UNAUTHORIZED',
      slug: 'test-unauth-' + Date.now(),
      component_name: 'TestComponent',
      code: 'test',
    })
    
    if (error) {
      addResult('Phase 3', 'RLS: Anon create component', 'PASS', 'Properly blocked')
    } else {
      addResult('Phase 3', 'RLS: Anon create component', 'FAIL', 'SECURITY ISSUE: Unauthenticated user can create components!')
    }
  } catch {
    addResult('Phase 3', 'RLS: Anon create component', 'PASS', 'Properly blocked')
  }

  // Test 5: Check if RLS is actually enabled
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    const { data, error } = await serviceClient.rpc('pg_tables')
    addResult('Phase 3', 'RLS Status', 'WARN', 'Manual verification recommended via Supabase dashboard')
  } catch {
    addResult('Phase 3', 'RLS Status', 'WARN', 'Cannot programmatically verify - check Supabase dashboard')
  }
}

// =============================================================================
// PHASE 4: API AUTHORIZATION AUDIT
// =============================================================================

async function phase4_APIAuthorizationAudit() {
  log('magenta', '\n========================================')
  log('magenta', 'PHASE 4: API AUTHORIZATION AUDIT')
  log('magenta', '========================================\n')

  // Check if API files have proper authorization checks
  const fs = await import('fs')
  const path = await import('path')

  const apiRoutes = [
    'app/api/components/route.ts',
    'app/api/components/[id]/route.ts',
    'app/api/themes/route.ts',
    'app/api/themes/[id]/route.ts',
    'app/api/ai/generate-component/route.ts',
    'app/api/ai/extract-spec/route.ts',
    'app/api/ai/generate-docs/route.ts',
    'app/api/ai/generate-prompts/route.ts',
    'app/api/ai/validate-component/route.ts',
    'app/api/ai/suggest-fix/route.ts',
  ]

  for (const route of apiRoutes) {
    const fullPath = path.join(process.cwd(), route)
    
    if (!fs.existsSync(fullPath)) {
      addResult('Phase 4', `API: ${route}`, 'WARN', 'File not found')
      continue
    }

    const content = fs.readFileSync(fullPath, 'utf-8')
    
    // Check for authentication
    const hasAuthCheck = 
      content.includes('getCurrentUser') ||
      content.includes('requireAuth') ||
      content.includes('getUser()') ||
      content.includes('auth.getUser')

    if (hasAuthCheck) {
      addResult('Phase 4', `Auth Check: ${route}`, 'PASS', 'Has authentication check')
    } else {
      addResult('Phase 4', `Auth Check: ${route}`, 'WARN', 'No visible authentication check')
    }

    // Check for role-based authorization (admin/editor checks)
    const hasRoleCheck = 
      content.includes('isAdmin') ||
      content.includes('requireAdmin') ||
      content.includes("role === 'admin'") ||
      content.includes('requireRole')

    if (route.includes('[id]') && (route.includes('DELETE') || content.includes('delete'))) {
      if (hasRoleCheck) {
        addResult('Phase 4', `Role Check: ${route}`, 'PASS', 'Has role authorization')
      } else {
        addResult('Phase 4', `Role Check: ${route}`, 'WARN', 'DELETE endpoint may lack role check')
      }
    }
  }

  // Check for missing API endpoints
  const emptyDirs = [
    'app/api/admin',
    'app/api/public',
  ]

  for (const dir of emptyDirs) {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath)
      if (files.length === 0) {
        addResult('Phase 4', `Empty directory: ${dir}`, 'WARN', 'Directory exists but empty')
      }
    }
  }
}

// =============================================================================
// PHASE 5: SECURITY CONFIGURATION AUDIT
// =============================================================================

async function phase5_SecurityAudit() {
  log('magenta', '\n========================================')
  log('magenta', 'PHASE 5: SECURITY CONFIGURATION AUDIT')
  log('magenta', '========================================\n')

  const fs = await import('fs')
  const path = await import('path')

  // Check vercel.json CORS settings
  const vercelPath = path.join(process.cwd(), 'vercel.json')
  if (fs.existsSync(vercelPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'))
    
    const corsHeader = vercelConfig.headers?.find((h: any) => 
      h.headers?.some((hdr: any) => hdr.key === 'Access-Control-Allow-Origin')
    )

    if (corsHeader) {
      const allowOrigin = corsHeader.headers.find((h: any) => h.key === 'Access-Control-Allow-Origin')
      if (allowOrigin?.value === '*') {
        addResult('Phase 5', 'CORS Policy', 'FAIL', 'SECURITY RISK: Allows all origins (*)')
      } else {
        addResult('Phase 5', 'CORS Policy', 'PASS', `Restricted to: ${allowOrigin?.value}`)
      }
    } else {
      addResult('Phase 5', 'CORS Policy', 'WARN', 'No CORS policy defined')
    }
  } else {
    addResult('Phase 5', 'vercel.json', 'WARN', 'File not found')
  }

  // Check for API key exposure in client code
  const clientFiles = [
    'components',
    'app/(public)',
    'app/admin',
  ]

  let hasApiKeyExposure = false
  for (const dir of clientFiles) {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      const checkDirectory = (dirPath: string) => {
        const items = fs.readdirSync(dirPath)
        for (const item of items) {
          const itemPath = path.join(dirPath, item)
          const stat = fs.statSync(itemPath)
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            checkDirectory(itemPath)
          } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
            const content = fs.readFileSync(itemPath, 'utf-8')
            if (content.includes('ANTHROPIC_API_KEY') && !content.includes('process.env.ANTHROPIC_API_KEY')) {
              hasApiKeyExposure = true
            }
          }
        }
      }
      checkDirectory(fullPath)
    }
  }

  if (hasApiKeyExposure) {
    addResult('Phase 5', 'API Key Exposure', 'FAIL', 'SECURITY RISK: API key may be exposed in client code')
  } else {
    addResult('Phase 5', 'API Key Exposure', 'PASS', 'No API keys found in client code')
  }

  // Check middleware for security headers
  const middlewarePath = path.join(process.cwd(), 'middleware.ts')
  if (fs.existsSync(middlewarePath)) {
    const middleware = fs.readFileSync(middlewarePath, 'utf-8')
    
    const securityHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
    ]

    const foundHeaders = securityHeaders.filter(header => middleware.includes(header))
    
    if (foundHeaders.length === 0) {
      addResult('Phase 5', 'Security Headers', 'WARN', 'No security headers found in middleware')
    } else {
      addResult('Phase 5', 'Security Headers', 'PASS', `Found: ${foundHeaders.join(', ')}`)
    }
  }

  // Check for rate limiting
  const hasRateLimiting = fs.existsSync(path.join(process.cwd(), 'lib', 'rate-limit.ts')) ||
                          fs.existsSync(path.join(process.cwd(), 'middleware.ts')) && 
                          fs.readFileSync(path.join(process.cwd(), 'middleware.ts'), 'utf-8').includes('rate')

  if (hasRateLimiting) {
    addResult('Phase 5', 'Rate Limiting', 'PASS', 'Rate limiting implementation found')
  } else {
    addResult('Phase 5', 'Rate Limiting', 'FAIL', 'SECURITY RISK: No rate limiting on expensive AI endpoints')
  }
}

// =============================================================================
// PHASE 6: CODE QUALITY AUDIT
// =============================================================================

async function phase6_CodeQualityAudit() {
  log('magenta', '\n========================================')
  log('magenta', 'PHASE 6: CODE QUALITY AUDIT')
  log('magenta', '========================================\n')

  const fs = await import('fs')
  const path = await import('path')

  // Check for TypeScript errors
  try {
    const { execSync } = await import('child_process')
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
    addResult('Phase 6', 'TypeScript Compilation', 'PASS', 'No TypeScript errors')
  } catch (err: any) {
    const errorCount = (err.stdout?.toString() || '').split('error TS').length - 1
    addResult('Phase 6', 'TypeScript Compilation', 'FAIL', `${errorCount} TypeScript errors found`)
  }

  // Check for console.log statements in production code
  let consoleLogCount = 0
  const checkForConsoleLogs = (dirPath: string) => {
    const items = fs.readdirSync(dirPath)
    for (const item of items) {
      if (item === 'node_modules' || item.startsWith('.')) continue
      
      const itemPath = path.join(dirPath, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        checkForConsoleLogs(itemPath)
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        const content = fs.readFileSync(itemPath, 'utf-8')
        const matches = content.match(/console\.log/g)
        if (matches) {
          consoleLogCount += matches.length
        }
      }
    }
  }

  const srcDirs = ['app', 'components', 'lib']
  for (const dir of srcDirs) {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      checkForConsoleLogs(fullPath)
    }
  }

  if (consoleLogCount > 50) {
    addResult('Phase 6', 'Console Logs', 'WARN', `${consoleLogCount} console.log statements found`)
  } else {
    addResult('Phase 6', 'Console Logs', 'PASS', `${consoleLogCount} console statements (acceptable for debugging)`)
  }

  // Check for error boundaries
  const errorBoundaryExists = fs.existsSync(path.join(process.cwd(), 'components', 'error-boundary.tsx')) ||
                               fs.existsSync(path.join(process.cwd(), 'app', 'error.tsx'))

  if (errorBoundaryExists) {
    addResult('Phase 6', 'Error Boundaries', 'PASS', 'Error boundary components found')
  } else {
    addResult('Phase 6', 'Error Boundaries', 'WARN', 'No error boundary found - consider adding')
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function runAudit() {
  log('cyan', '\n╔════════════════════════════════════════════════════════════════╗')
  log('cyan', '║          COMPREHENSIVE SYSTEM AUDIT                            ║')
  log('cyan', '║          AI Design System                                      ║')
  log('cyan', '╚════════════════════════════════════════════════════════════════╝\n')

  try {
    await phase1_EnvironmentAudit()
    await phase2_DatabaseAudit()
    await phase3_RLSPoliciesAudit()
    await phase4_APIAuthorizationAudit()
    await phase5_SecurityAudit()
    await phase6_CodeQualityAudit()

    // Summary
    log('cyan', '\n╔════════════════════════════════════════════════════════════════╗')
    log('cyan', '║          AUDIT SUMMARY                                         ║')
    log('cyan', '╚════════════════════════════════════════════════════════════════╝\n')

    const passed = results.filter(r => r.status === 'PASS').length
    const failed = results.filter(r => r.status === 'FAIL').length
    const warnings = results.filter(r => r.status === 'WARN').length
    const skipped = results.filter(r => r.status === 'SKIP').length
    const total = results.length

    log('green', `✅ Passed: ${passed}/${total}`)
    log('red', `❌ Failed: ${failed}/${total}`)
    log('yellow', `⚠️  Warnings: ${warnings}/${total}`)
    log('cyan', `⏭️  Skipped: ${skipped}/${total}`)

    const score = ((passed / (total - skipped)) * 100).toFixed(1)
    log('magenta', `\n📊 Overall Score: ${score}%\n`)

    // Critical Issues
    const criticalIssues = results.filter(r => r.status === 'FAIL')
    if (criticalIssues.length > 0) {
      log('red', '\n🔴 CRITICAL ISSUES:\n')
      criticalIssues.forEach(issue => {
        log('red', `   • ${issue.test}: ${issue.message}`)
      })
    }

    // Export results to JSON
    const fs = await import('fs')
    const path = await import('path')
    const outputPath = path.join(process.cwd(), 'audit-results.json')
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    log('blue', `\n📄 Detailed results exported to: audit-results.json\n`)

  } catch (error) {
    log('red', `\n❌ Audit failed with error: ${error}\n`)
    process.exit(1)
  }
}

// Run the audit
runAudit().catch(console.error)

