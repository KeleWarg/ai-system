/**
 * Component Code Updater
 * Applies visual edits back to component code while preserving structure
 */

import type { EditableProperty } from './component-parser'
import { pixelsToTailwind, replacePropertyInClasses } from './tailwind-converter'

// Re-export EditableProperty for convenience
export type { EditableProperty } from './component-parser'

/**
 * Update a single property in component code
 */
export function updateComponentProperty(
  code: string,
  property: EditableProperty,
  newValue: string
): string {
  switch (property.category) {
    case 'spacing':
      return updateSpacingProperty(code, property, newValue)
    case 'color':
      return updateColorProperty(code, property, newValue)
    case 'typography':
      return updateTypographyProperty(code, property, newValue)
    case 'variant':
      return updateVariantProperty(code, property, newValue)
    default:
      return code
  }
}

/**
 * Update multiple properties at once
 */
export function updateMultipleProperties(
  code: string,
  updates: Array<{ property: EditableProperty; newValue: string }>
): string {
  let updatedCode = code
  
  updates.forEach(({ property, newValue }) => {
    updatedCode = updateComponentProperty(updatedCode, property, newValue)
  })
  
  return updatedCode
}

/**
 * Update spacing property (height, padding, gap, etc.)
 */
function updateSpacingProperty(
  code: string,
  property: EditableProperty,
  newValue: string
): string {
  if (!property.tailwindClass || !property.cssProperty) return code
  
  // Find the className string containing this property
  const classNamePattern = /className=["']([^"']+)["']/g
  let match
  let updatedCode = code
  
  while ((match = classNamePattern.exec(code)) !== null) {
    const fullMatch = match[0]
    const classes = match[1]
    
    // Check if this className contains our target class
    if (classes.includes(property.tailwindClass)) {
      // Replace the old class with new value
      const updatedClasses = replacePropertyInClasses(
        classes,
        property.cssProperty,
        newValue
      )
      
      const updatedClassName = `className="${updatedClasses}"`
      updatedCode = updatedCode.replace(fullMatch, updatedClassName)
      break
    }
  }
  
  // Also check for template literals
  const templatePattern = /className=\{[^}]*`([^`]+)`[^}]*\}/g
  while ((match = templatePattern.exec(code)) !== null) {
    const fullMatch = match[0]
    const classes = match[1]
    
    if (classes.includes(property.tailwindClass)) {
      const updatedClasses = replacePropertyInClasses(
        classes,
        property.cssProperty,
        newValue
      )
      
      const updatedClassName = fullMatch.replace(classes, updatedClasses)
      updatedCode = updatedCode.replace(fullMatch, updatedClassName)
      break
    }
  }
  
  // Handle cva() variants
  return updateInCvaVariants(updatedCode, property, newValue)
}

/**
 * Update color property (bg-, text-, border-)
 */
function updateColorProperty(
  code: string,
  property: EditableProperty,
  newValue: string
): string {
  // Replace hex colors with theme tokens
  if (property.currentValue.startsWith('#')) {
    // Find and replace hex value with theme token
    const hexPattern = new RegExp(property.currentValue.replace('#', '#'), 'g')
    return code.replace(hexPattern, newValue)
  }
  
  // Replace existing Tailwind color classes
  if (property.tailwindClass) {
    const oldClassPattern = new RegExp(`\\b${property.tailwindClass}\\b`, 'g')
    return code.replace(oldClassPattern, newValue)
  }
  
  return code
}

/**
 * Update typography property (font-size, font-weight, line-height)
 */
function updateTypographyProperty(
  code: string,
  property: EditableProperty,
  newValue: string
): string {
  if (!property.tailwindClass) return code
  
  const oldClassPattern = new RegExp(`\\b${property.tailwindClass}\\b`, 'g')
  return code.replace(oldClassPattern, newValue)
}

/**
 * Update variant property (add/remove variant values)
 */
function updateVariantProperty(
  code: string,
  property: EditableProperty,
  newValue: string
): string {
  if (!property.variantKey) return code
  
  // Parse new values (comma-separated string to array)
  const newValues = newValue.split(',').map((v) => v.trim()).filter((v) => v)
  
  // Find the variants block in cva()
  const cvaPattern = /(cva\([^,]*,\s*\{[\s\S]*?variants:\s*\{)([\s\S]*?)(\}[\s\S]*?\})/m
  const cvaMatch = code.match(cvaPattern)
  
  if (!cvaMatch) return code
  
  const [fullMatch, before, variantsBlock, after] = cvaMatch
  
  // Find this specific variant
  const variantPattern = new RegExp(
    `(${property.variantKey}:\\s*\\{)([^}]+)(\\})`,
    'i'
  )
  const variantMatch = variantsBlock.match(variantPattern)
  
  if (!variantMatch) {
    // Variant doesn't exist, add it
    const newVariantBlock = generateVariantBlock(property.variantKey, newValues)
    const updatedVariants = variantsBlock + `,\n      ${newVariantBlock}`
    return code.replace(fullMatch, before + updatedVariants + after)
  }
  
  // Update existing variant
  const [, variantBefore, , variantAfter] = variantMatch
  const newVariantContent = generateVariantContent(newValues)
  const updatedVariant = `${variantBefore}${newVariantContent}${variantAfter}`
  
  const updatedVariants = variantsBlock.replace(variantMatch[0], updatedVariant)
  return code.replace(fullMatch, before + updatedVariants + after)
}

/**
 * Update property within cva() variants
 */
function updateInCvaVariants(
  code: string,
  property: EditableProperty,
  newValue: string
): string {
  if (!property.tailwindClass || !property.cssProperty) return code
  
  // Find cva() call
  const cvaPattern = /(cva\(\s*["']([^"']+)["'])/
  const match = code.match(cvaPattern)
  
  if (!match) return code
  
  const [fullMatch, , baseClasses] = match
  
  // Check if property is in base classes
  if (baseClasses.includes(property.tailwindClass)) {
    const updatedClasses = replacePropertyInClasses(
      baseClasses,
      property.cssProperty,
      newValue
    )
    const updatedCva = fullMatch.replace(baseClasses, updatedClasses)
    return code.replace(fullMatch, updatedCva)
  }
  
  // Check in variant values
  const variantsPattern = /variants:\s*\{[\s\S]*?\}/
  const variantsMatch = code.match(variantsPattern)
  
  if (!variantsMatch) return code
  
  const variantsBlock = variantsMatch[0]
  
  // Replace within variant className strings
  const classPattern = /["']([^"']*?)["']/g
  let updatedVariants = variantsBlock
  let classMatch
  
  while ((classMatch = classPattern.exec(variantsBlock)) !== null) {
    const classes = classMatch[1]
    
    if (classes.includes(property.tailwindClass)) {
      const updatedClasses = replacePropertyInClasses(
        classes,
        property.cssProperty,
        newValue
      )
      updatedVariants = updatedVariants.replace(classes, updatedClasses)
    }
  }
  
  return code.replace(variantsBlock, updatedVariants)
}

/**
 * Generate variant block code
 */
function generateVariantBlock(key: string, values: string[]): string {
  const content = generateVariantContent(values)
  return `${key}: {${content}}`
}

/**
 * Generate variant content (the key-value pairs inside a variant)
 */
function generateVariantContent(values: string[]): string {
  // Generate placeholder className for each value
  return values
    .map((value) => `\n        ${value}: ""`)
    .join(',') + '\n      '
}

/**
 * Validate updated code (basic syntax check)
 */
export function validateUpdatedCode(code: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check for balanced braces
  const openBraces = (code.match(/\{/g) || []).length
  const closeBraces = (code.match(/\}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces in code')
  }
  
  // Check for balanced parentheses
  const openParens = (code.match(/\(/g) || []).length
  const closeParens = (code.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    errors.push('Unbalanced parentheses in code')
  }
  
  // Check for cva() presence
  if (!code.includes('cva(')) {
    errors.push('Missing cva() function call')
  }
  
  // Check for export statement
  if (!code.includes('export')) {
    errors.push('Missing export statement')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

