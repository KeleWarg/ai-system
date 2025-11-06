/**
 * Sanitize component code before publishing
 * Removes dangerous patterns and validates code safety
 */

export function sanitizeComponentCode(code: string): {
  sanitized: string
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []
  let sanitized = code
  
  // Remove dangerous patterns
  const dangerousPatterns = [
    {
      pattern: /\beval\s*\(/g,
      replacement: '/* eval() removed for security */',
      error: 'eval() detected - removed for security',
    },
    {
      pattern: /\bFunction\s*\(/g,
      replacement: '/* Function() removed for security */',
      error: 'Function() constructor detected - removed for security',
    },
    {
      pattern: /\bdangerouslySetInnerHTML/g,
      replacement: '/* dangerouslySetInnerHTML removed for security */',
      warning: 'dangerouslySetInnerHTML detected - removed for security',
    },
    {
      pattern: /\binnerHTML\s*=/g,
      replacement: '/* innerHTML removed for security */',
      warning: 'innerHTML assignment detected - removed for security',
    },
    {
      pattern: /process\.env\./g,
      replacement: '/* process.env removed */',
      error: 'process.env detected - removed (should not be in published code)',
    },
    {
      pattern: /<script[^>]*>.*?<\/script>/gis,
      replacement: '/* <script> tags removed for security */',
      error: '<script> tags detected - removed for security',
    },
  ]
  
  dangerousPatterns.forEach(({ pattern, replacement, error, warning }) => {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, replacement)
      if (error) {
        errors.push(error)
      } else if (warning) {
        warnings.push(warning)
      }
    }
  })
  
  // Remove console statements (info leak)
  sanitized = sanitized.replace(/console\.(log|warn|error|debug|info)\s*\([^)]*\)/g, '/* console removed */')
  
  // Remove API keys/secrets patterns
  const apiKeyPattern = /(?:api[_-]?key|secret|password|token|auth)[\s=:]["'`][^"'`]+["'`]/gi
  if (apiKeyPattern.test(sanitized)) {
    sanitized = sanitized.replace(apiKeyPattern, '/* API key removed for security */')
    errors.push('API key/secret pattern detected - removed')
  }
  
  // Remove JWT tokens
  const jwtPattern = /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.?[a-zA-Z0-9_-]*/g
  if (jwtPattern.test(sanitized)) {
    sanitized = sanitized.replace(jwtPattern, '/* JWT token removed for security */')
    errors.push('JWT token detected - removed')
  }
  
  return {
    sanitized,
    warnings,
    errors,
  }
}

export function validateComponentCode(code: string): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Must export something
  if (!code.includes('export') && !code.includes('module.exports')) {
    errors.push('Component must export something')
  }
  
  // Should import React
  if (!code.includes('import') && !code.includes('require')) {
    warnings.push('Component has no imports')
  }
  
  // Should not have eval
  if (/\beval\s*\(/.test(code)) {
    errors.push('eval() is not allowed')
  }
  
  // Should not have Function constructor
  if (/\bFunction\s*\(/.test(code)) {
    errors.push('Function() constructor is not allowed')
  }
  
  // Should not have process.env
  if (/process\.env/.test(code)) {
    errors.push('process.env should not be in published code')
  }
  
  // Should not have dangerous HTML
  if (/\bdangerouslySetInnerHTML/.test(code)) {
    warnings.push('dangerouslySetInnerHTML is risky - ensure sanitization')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}




