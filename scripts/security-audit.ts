import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: join(process.cwd(), '.env.local') })

/**
 * Security audit for components before publishing
 * Checks for dangerous patterns, secrets, and malicious code
 */

interface SecurityIssue {
  level: 'error' | 'warning' | 'info'
  message: string
  component?: string
  line?: number
}

const DANGEROUS_PATTERNS = [
  // Code execution
  /\beval\s*\(/,
  /\bFunction\s*\(/,
  /\bnew\s+Function\s*\(/,
  /\bsetTimeout\s*\(\s*['"`]/,
  /\bsetInterval\s*\(\s*['"`]/,
  
  // DOM manipulation risks
  /\bdangerouslySetInnerHTML/,
  /\binnerHTML\s*=/,
  /\bdocument\.write\s*\(/,
  /\bdocument\.writeln\s*\(/,
  
  // Script injection
  /<script[^>]*>/i,
  /on\w+\s*=\s*['"`]/i, // onclick=, onerror=, etc.
  
  // Environment variables (should not be in published code)
  /process\.env\./,
  /process\.env\[/,
  
  // API keys/secrets patterns
  /(?:api[_-]?key|secret|password|token|auth)[\s=:]["'`]/i,
  /sk-[a-zA-Z0-9-]+/, // API key patterns
  /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+/, // JWT tokens
  
  // Network requests to unknown domains
  /fetch\s*\(\s*['"`]https?:\/\/(?!localhost|127\.0\.0\.1)[^'"`]+/,
  
  // File system access
  /\brequire\s*\(\s*['"`]fs['"`]/,
  /\brequire\s*\(\s*['"`]path['"`]/,
  /\bimport\s+.*\s+from\s+['"`]fs['"`]/,
  /\bimport\s+.*\s+from\s+['"`]path['"`]/,
  
  // Database access
  /\brequire\s*\(\s*['"`]@supabase/,
  
  // Shell execution
  /\bexec\s*\(/,
  /\bspawn\s*\(/,
  /\bexecSync\s*\(/,
]

const WARNING_PATTERNS = [
  // External dependencies that might be risky
  /\bimport\s+.*\s+from\s+['"`]https?:\/\//, // Dynamic imports from URLs
  /\bimport\s*\(/, // Dynamic imports
  
  // Console statements (info leak)
  /\bconsole\.(log|warn|error|debug|info)\s*\(/,
  
  // Alert/confirm (annoying for users)
  /\balert\s*\(/,
  /\bconfirm\s*\(/,
]

async function auditComponent(code: string, componentName: string): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = []
  const lines = code.split('\n')
  
  lines.forEach((line, index) => {
    // Check for dangerous patterns
    DANGEROUS_PATTERNS.forEach((pattern, patternIndex) => {
      if (pattern.test(line)) {
        issues.push({
          level: 'error',
          message: `Dangerous pattern detected: ${pattern.toString()}`,
          component: componentName,
          line: index + 1,
        })
      }
    })
    
    // Check for warnings
    WARNING_PATTERNS.forEach((pattern) => {
      if (pattern.test(line)) {
        issues.push({
          level: 'warning',
          message: `Potential issue: ${pattern.toString()}`,
          component: componentName,
          line: index + 1,
        })
      }
    })
  })
  
  // Check for React component structure
  if (!code.includes('React') && !code.includes('react')) {
    issues.push({
      level: 'warning',
      message: 'Component does not import React',
      component: componentName,
    })
  }
  
  // Check for proper export
  if (!code.includes('export') && !code.includes('module.exports')) {
    issues.push({
      level: 'error',
      message: 'Component does not export anything',
      component: componentName,
    })
  }
  
  return issues
}

async function auditPackage() {
  console.log('🔒 Running security audit for package...\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Get all components
  const { data: components, error } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching components:', error)
    process.exit(1)
  }
  
  if (!components || components.length === 0) {
    console.log('No components found')
    return
  }
  
  const allIssues: SecurityIssue[] = []
  
  for (const component of components) {
    const issues = await auditComponent(component.code, component.name)
    allIssues.push(...issues)
  }
  
  // Categorize issues
  const errors = allIssues.filter(i => i.level === 'error')
  const warnings = allIssues.filter(i => i.level === 'warning')
  const info = allIssues.filter(i => i.level === 'info')
  
  // Report
  console.log(`📊 Security Audit Results:\n`)
  console.log(`Total Components: ${components.length}`)
  console.log(`Errors: ${errors.length}`)
  console.log(`Warnings: ${warnings.length}`)
  console.log(`Info: ${info.length}\n`)
  
  if (errors.length > 0) {
    console.log('❌ ERRORS (Must fix before publishing):\n')
    errors.forEach(issue => {
      console.log(`  [${issue.component}] Line ${issue.line}: ${issue.message}`)
    })
    console.log('')
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (Review before publishing):\n')
    warnings.forEach(issue => {
      console.log(`  [${issue.component}] Line ${issue.line}: ${issue.message}`)
    })
    console.log('')
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No security issues found! Package is safe to publish.\n')
  } else if (errors.length === 0) {
    console.log('✅ No critical errors. Review warnings before publishing.\n')
  } else {
    console.log('❌ CRITICAL: Fix errors before publishing!\n')
    process.exit(1)
  }
  
  return {
    errors,
    warnings,
    info,
    safe: errors.length === 0,
  }
}

auditPackage().catch(console.error)




