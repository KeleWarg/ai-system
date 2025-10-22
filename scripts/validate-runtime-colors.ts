/**
 * Runtime validation script to test color system in the browser
 * Add this to a test page and run it after theme loads
 */

export const EXPECTED_TOKENS = [
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

export interface RuntimeValidationResult {
  token: string
  defined: boolean
  value: string | null
  valid: boolean
}

export function validateRuntimeColors(): RuntimeValidationResult[] {
  const results: RuntimeValidationResult[] = []
  const root = document.documentElement
  const computedStyle = getComputedStyle(root)
  
  for (const token of EXPECTED_TOKENS) {
    const cssVar = `--${token}`
    const value = computedStyle.getPropertyValue(cssVar).trim()
    
    // Check if value exists and looks like HSL format
    const isValidHSL = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/.test(value)
    
    results.push({
      token,
      defined: value.length > 0,
      value: value || null,
      valid: isValidHSL,
    })
  }
  
  return results
}

export function printRuntimeValidation() {
  console.log('\n🎨 RUNTIME COLOR VALIDATION\n')
  console.log('='.repeat(60))
  
  const results = validateRuntimeColors()
  
  const missing = results.filter(r => !r.defined)
  const invalid = results.filter(r => r.defined && !r.valid)
  const valid = results.filter(r => r.valid)
  
  console.log(`\n✅ Valid: ${valid.length}/${results.length}`)
  console.log(`❌ Missing: ${missing.length}`)
  console.log(`⚠️  Invalid format: ${invalid.length}`)
  
  if (missing.length > 0) {
    console.log('\nMissing CSS Variables:')
    missing.forEach(r => console.log(`  --${r.token}`))
  }
  
  if (invalid.length > 0) {
    console.log('\nInvalid Format (not HSL):')
    invalid.forEach(r => console.log(`  --${r.token}: ${r.value}`))
  }
  
  console.log('\n' + '='.repeat(60))
  
  if (missing.length === 0 && invalid.length === 0) {
    console.log('\n✅ ALL COLORS VALID! System is working correctly.\n')
    return true
  } else {
    console.log('\n❌ ISSUES FOUND! Check CSS variables in globals.css\n')
    return false
  }
}

// Auto-run if in browser dev tools
if (typeof window !== 'undefined') {
  (window as any).validateColors = printRuntimeValidation
  console.log('💡 Run validateColors() to test color system')
}

