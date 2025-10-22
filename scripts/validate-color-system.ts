/**
 * Comprehensive validation script for 60+ token color system
 * Run this BEFORE and AFTER implementing the new token system
 */

import fs from 'fs'
import path from 'path'

interface ValidationResult {
  passed: boolean
  message: string
  details?: string[]
}

interface TestResults {
  colorSystemTokens: ValidationResult
  cssVariables: ValidationResult
  componentUsage: ValidationResult
  aiPrompts: ValidationResult
  remapToolTokens: ValidationResult
  colorConverter: ValidationResult
  themeProvider: ValidationResult
  tailwindConfig: ValidationResult
}

// Expected tokens from spec sheets
const EXPECTED_TOKENS = [
  // Button Primary (7)
  'primary-bg', 'primary-text', 'primary-icon', 'primary-hover-bg', 'primary-pressed-bg', 'primary-disabled-bg', 'focused-border',
  // Button Secondary (7)
  'secondary-bg', 'secondary-border', 'secondary-text', 'secondary-icon', 'secondary-hover-bg', 'secondary-pressed-bg', 'secondary-disabled-bg',
  // Button Ghost (6)
  'ghost-bg', 'ghost-text', 'ghost-icon', 'ghost-hover-bg', 'ghost-pressed-bg', 'ghost-disabled-bg',
  // Background (17)
  'bg-white', 'bg-neutral-subtle', 'bg-neutral-light', 'bg-neutral', 'bg-accent', 'bg-accent-mid', 'bg-brand-subtle', 'bg-table',
  'bg-secondary', 'bg-brand-light', 'bg-brand-mid', 'bg-brand', 'bg-neutral-mid', 'bg-neutral-strong', 'bg-header', 'bg-superlative', 'bg-button',
  // Foreground (18)
  'fg-heading', 'fg-body', 'fg-link-secondary', 'fg-caption', 'fg-stroke-ui', 'fg-link', 'fg-stroke-ui-inverse',
  'fg-heading-inverse', 'fg-body-inverse', 'fg-caption-inverse', 'fg-table-border', 'fg-stroke-default',
  'fg-divider', 'fg-stroke-inverse', 'fg-stroke-dark-inverse', 'fg-feedback-error', 'fg-feedback-warning', 'fg-feedback-success',
  // Superlative (2)
  'superlative-primary', 'superlative-secondary',
]

// Old token PATTERNS that should be REMOVED or MIGRATED
// These are patterns that DON'T match our new granular tokens
const DEPRECATED_PATTERNS = [
  // Legacy generic patterns (but NOT new specific tokens)
  /\bbg-primary(?!-)/g,           // bg-primary but NOT bg-primary-bg
  /\btext-primary(?!-)/g,         // text-primary but NOT text-primary-text
  /\btext-primary-foreground\b/g, // Old name
  /\btext-secondary-foreground\b/g,
  /\bbg-muted\b/g,                // Old muted (new: bg-bg-neutral)
  /\btext-muted-foreground\b/g,   // Old muted text (new: text-fg-caption)
  /\btext-accent-foreground\b/g,  // Old accent text (new: text-fg-body)
  /\bbg-destructive(?!-)/g,       // bg-destructive but NOT bg-destructive-*
  /\btext-destructive-foreground\b/g,
  /\bborder-border\b/g,           // Old border (new: border-fg-stroke-ui)
  /\bborder-input\b/g,            // Old input border (new: border-fg-stroke-ui)
  /\bring-ring\b/g,               // Old ring (new: ring-focused-border)
  /\bbg-card(?!-)/g,              // bg-card but NOT bg-card-*
  /\btext-card-foreground\b/g,
  /\bbg-popover\b/g,
  /\btext-popover-foreground\b/g,
  /\bbg-background\b/g,           // Old background (new: bg-bg-white)
  /\btext-foreground\b/g,         // Old foreground (new: text-fg-body)
]

const rootDir = path.resolve(__dirname, '..')

// Test 1: Verify color-system.ts has all tokens
function validateColorSystemTokens(): ValidationResult {
  const colorSystemPath = path.join(rootDir, 'lib', 'color-system.ts')
  const content = fs.readFileSync(colorSystemPath, 'utf-8')
  
  const missing: string[] = []
  const found: string[] = []
  
  for (const token of EXPECTED_TOKENS) {
    // Check if token exists in DEFAULT_COLORS or COLOR_LABELS
    if (content.includes(`'${token}'`) || content.includes(`"${token}"`)) {
      found.push(token)
    } else {
      missing.push(token)
    }
  }
  
  return {
    passed: missing.length === 0,
    message: missing.length === 0 
      ? `✅ All ${EXPECTED_TOKENS.length} tokens found in color-system.ts`
      : `❌ Missing ${missing.length} tokens in color-system.ts`,
    details: missing.length > 0 ? [`Missing: ${missing.join(', ')}`] : undefined,
  }
}

// Test 2: Verify globals.css has all CSS variables
function validateCSSVariables(): ValidationResult {
  const globalsPath = path.join(rootDir, 'app', 'globals.css')
  const content = fs.readFileSync(globalsPath, 'utf-8')
  
  const missing: string[] = []
  
  for (const token of EXPECTED_TOKENS) {
    // Check for --token-name: or --token-name)
    if (!content.includes(`--${token}`)) {
      missing.push(token)
    }
  }
  
  return {
    passed: missing.length === 0,
    message: missing.length === 0
      ? `✅ All ${EXPECTED_TOKENS.length} CSS variables defined in globals.css`
      : `❌ Missing ${missing.length} CSS variables in globals.css`,
    details: missing.length > 0 ? [`Missing: ${missing.join(', ')}`] : undefined,
  }
}

// Test 3: Verify no old token usage in components
function validateComponentUsage(): ValidationResult {
  const componentsDir = path.join(rootDir, 'components')
  const appDir = path.join(rootDir, 'app')
  
  const issues: string[] = []
  
  function searchFiles(dir: string) {
    if (!fs.existsSync(dir)) return
    
    const files = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name)
      
      if (file.isDirectory() && file.name !== 'node_modules' && file.name !== '.next') {
        searchFiles(fullPath)
      } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts'))) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        
        // Check for deprecated token patterns
        for (const pattern of DEPRECATED_PATTERNS) {
          const matches = content.match(pattern)
          if (matches && matches.length > 0) {
            issues.push(`${fullPath.replace(rootDir, '')}: Found "${matches[0]}"`)
          }
        }
      }
    }
  }
  
  searchFiles(componentsDir)
  searchFiles(appDir)
  
  return {
    passed: issues.length === 0,
    message: issues.length === 0
      ? '✅ No deprecated token usage found in components'
      : `❌ Found ${issues.length} instances of deprecated tokens`,
    details: issues.length > 0 ? issues.slice(0, 10) : undefined,
  }
}

// Test 4: Verify AI prompts mention new tokens
function validateAIPrompts(): ValidationResult {
  const claudePath = path.join(rootDir, 'lib', 'ai', 'claude.ts')
  const content = fs.readFileSync(claudePath, 'utf-8')
  
  const requiredMentions = [
    'primary-bg',
    'primary-hover-bg',
    'secondary-bg',
    'ghost-bg',
  ]
  
  const missing = requiredMentions.filter(token => !content.includes(token))
  
  return {
    passed: missing.length === 0,
    message: missing.length === 0
      ? '✅ AI prompts reference new token names'
      : `❌ AI prompts missing references to new tokens`,
    details: missing.length > 0 ? [`Missing: ${missing.join(', ')}`] : undefined,
  }
}

// Test 5: Verify remap tool has new tokens
function validateRemapToolTokens(): ValidationResult {
  const remapPath = path.join(rootDir, 'app', 'admin', 'components', '[slug]', 'remap', 'page.tsx')
  
  if (!fs.existsSync(remapPath)) {
    return {
      passed: false,
      message: '❌ Remap tool page not found',
    }
  }
  
  const content = fs.readFileSync(remapPath, 'utf-8')
  
  // Check if it references theme.colors or COLOR_CATEGORIES (dynamic)
  const hasDynamicTokens = content.includes('theme.colors') || content.includes('COLOR_CATEGORIES')
  
  return {
    passed: hasDynamicTokens,
    message: hasDynamicTokens
      ? '✅ Remap tool uses dynamic token loading'
      : '❌ Remap tool may have hardcoded tokens',
  }
}

// Test 6: Verify color converter has new mappings
function validateColorConverter(): ValidationResult {
  const converterPath = path.join(rootDir, 'lib', 'color-converter.ts')
  const content = fs.readFileSync(converterPath, 'utf-8')
  
  const keyMappings = ['primary-bg', 'secondary-bg', 'ghost-bg']
  const found = keyMappings.filter(token => content.includes(token))
  
  return {
    passed: found.length > 0,
    message: found.length > 0
      ? '✅ Color converter has updated mappings'
      : '❌ Color converter may need updated purpose mappings',
  }
}

// Test 7: Verify theme provider applies all variables
function validateThemeProvider(): ValidationResult {
  const providerPath = path.join(rootDir, 'components', 'theme-provider.tsx')
  const content = fs.readFileSync(providerPath, 'utf-8')
  
  // Check if it dynamically applies all colors
  const hasDynamicApplication = content.includes('Object.entries(theme.colors)') && 
                                 content.includes('root.style.setProperty')
  
  return {
    passed: hasDynamicApplication,
    message: hasDynamicApplication
      ? '✅ Theme provider dynamically applies all color tokens'
      : '❌ Theme provider may have hardcoded color application',
  }
}

// Test 8: Verify Tailwind config (if needed)
function validateTailwindConfig(): ValidationResult {
  const tailwindPath = path.join(rootDir, 'tailwind.config.ts')
  
  if (!fs.existsSync(tailwindPath)) {
    return { passed: true, message: '⚠️  No Tailwind config found (may use v4 defaults)' }
  }
  
  const content = fs.readFileSync(tailwindPath, 'utf-8')
  
  // For Tailwind v4 with @theme, config may be minimal
  // Just verify it exists and doesn't have hardcoded old colors
  // Check if hardcoded old tokens exist (just a basic check)
  const hasHardcodedOldColors = content.includes('primary-foreground') || 
    content.includes('muted-foreground') || content.includes('accent-foreground')
  
  return {
    passed: !hasHardcodedOldColors,
    message: hasHardcodedOldColors
      ? '❌ Tailwind config has hardcoded old token names'
      : '✅ Tailwind config looks good',
  }
}

// Run all tests
async function runValidation() {
  console.log('\n🔍 VALIDATING 60+ TOKEN COLOR SYSTEM\n')
  console.log('=' .repeat(60))
  
  const results: TestResults = {
    colorSystemTokens: validateColorSystemTokens(),
    cssVariables: validateCSSVariables(),
    componentUsage: validateComponentUsage(),
    aiPrompts: validateAIPrompts(),
    remapToolTokens: validateRemapToolTokens(),
    colorConverter: validateColorConverter(),
    themeProvider: validateThemeProvider(),
    tailwindConfig: validateTailwindConfig(),
  }
  
  // Print results
  for (const [test, result] of Object.entries(results)) {
    console.log(`\n${result.message}`)
    if (result.details) {
      result.details.forEach((detail: string) => console.log(`  ${detail}`))
    }
  }
  
  // Summary
  const passed = Object.values(results).filter(r => r.passed).length
  const total = Object.values(results).length
  
  console.log('\n' + '='.repeat(60))
  console.log(`\n📊 SUMMARY: ${passed}/${total} tests passed\n`)
  
  if (passed === total) {
    console.log('✅ ALL TESTS PASSED! Color system is ready.\n')
    process.exit(0)
  } else {
    console.log('❌ SOME TESTS FAILED! Fix issues before proceeding.\n')
    process.exit(1)
  }
}

runValidation()

