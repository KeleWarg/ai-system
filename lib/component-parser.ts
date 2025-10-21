/**
 * Component Property Parser
 * Extracts editable properties from component code for visual editing
 */

import type { ComponentAnalysis } from './ai/spec-validator'
import { tailwindToPixels, fontSizeToPixels, fontWeightToNumber } from './tailwind-converter'

export interface ExtractedSpec {
  name: string
  description: string
  category: string
  variants?: Record<string, string[]>
  colors?: string[]
  spacing?: string[]
  typography?: string[]
  notes?: string
}

export interface EditableProperty {
  id: string
  category: 'spacing' | 'color' | 'typography' | 'variant'
  name: string
  currentValue: string
  tailwindClass?: string
  pixelValue?: number
  cssProperty?: string
  variantKey?: string
  variantValues?: string[]
  hasIssue: boolean
  recommendation?: string
  path: string // Location in code (for updates)
}

/**
 * Parse component code and extract editable properties
 */
export function parseComponentProperties(
  code: string,
  spec: ExtractedSpec,
  validation?: ComponentAnalysis
): EditableProperty[] {
  const properties: EditableProperty[] = []
  
  // Parse spacing properties
  properties.push(...parseSpacingProperties(code, spec, validation))
  
  // Parse color properties
  properties.push(...parseColorProperties(code, spec, validation))
  
  // Parse typography properties
  properties.push(...parseTypographyProperties(code, spec, validation))
  
  // Parse variants
  properties.push(...parseVariantProperties(code, spec, validation))
  
  return properties
}

/**
 * Parse spacing properties from code
 */
function parseSpacingProperties(
  code: string,
  spec: ExtractedSpec,
  validation?: ComponentAnalysis
): EditableProperty[] {
  const properties: EditableProperty[] = []
  
  if (!spec.spacing) return properties
  
  // Parse spec spacing to understand what we're looking for
  spec.spacing.forEach((spacingSpec) => {
    // Example: "Base height: 40px" or "Horizontal padding: 16px"
    const match = spacingSpec.match(/^(.+?):\s*(\d+)px$/i)
    if (!match) return
    
    const [, name, pixels] = match
    const pixelValue = parseInt(pixels, 10)
    
    // Determine CSS property from name
    let cssProperty = 'height'
    let searchPattern = /h-\S+/
    
    if (name.toLowerCase().includes('padding')) {
      if (name.toLowerCase().includes('horizontal')) {
        cssProperty = 'paddingX'
        searchPattern = /px-\S+/
      } else if (name.toLowerCase().includes('vertical')) {
        cssProperty = 'paddingY'
        searchPattern = /py-\S+/
      } else {
        cssProperty = 'padding'
        searchPattern = /p-\S+/
      }
    } else if (name.toLowerCase().includes('gap')) {
      cssProperty = 'gap'
      searchPattern = /gap-\S+/
    } else if (name.toLowerCase().includes('radius')) {
      cssProperty = 'borderRadius'
      searchPattern = /rounded-\S+/
    }
    
    // Find the class in code
    const classMatch = code.match(searchPattern)
    const currentClass = classMatch ? classMatch[0] : ''
    const currentPixels = currentClass ? tailwindToPixels(cssProperty, currentClass) : null
    
    // Check if this property has a validation issue
    const hasIssue = validation?.spacingIssues?.some((issue) => 
      issue.toLowerCase().includes(name.toLowerCase())
    ) || false
    
    const recommendation = validation?.recommendations?.find((rec) =>
      rec.toLowerCase().includes(name.toLowerCase())
    )
    
    properties.push({
      id: `spacing-${name.toLowerCase().replace(/\s+/g, '-')}`,
      category: 'spacing',
      name,
      currentValue: currentClass || `${pixelValue}px`,
      tailwindClass: currentClass,
      pixelValue: currentPixels || pixelValue,
      cssProperty,
      hasIssue,
      recommendation,
      path: `className.${cssProperty}`,
    })
  })
  
  return properties
}

/**
 * Parse color properties from code
 */
function parseColorProperties(
  code: string,
  spec: ExtractedSpec,
  validation?: ComponentAnalysis
): EditableProperty[] {
  const properties: EditableProperty[] = []
  
  if (!spec.colors) return properties
  
  // Extract color specifications
  spec.colors.forEach((colorSpec) => {
    // Example: "Primary background: #047857"
    const match = colorSpec.match(/^(.+?):\s*(#[0-9A-Fa-f]{6}|transparent)$/i)
    if (!match) return
    
    const [, name, hexValue] = match
    
    // Determine Tailwind color class pattern
    let searchPattern = /bg-\S+/
    if (name.toLowerCase().includes('text') || name.toLowerCase().includes('foreground')) {
      searchPattern = /text-\S+/
    } else if (name.toLowerCase().includes('border')) {
      searchPattern = /border-\S+/
    }
    
    // Find the class in code
    const classMatch = code.match(searchPattern)
    const currentClass = classMatch ? classMatch[0] : ''
    
    // Check for hardcoded hex values (validation issue)
    const hasHex = code.includes(hexValue)
    const hasIssue = hasHex || (validation?.colorIssues?.includes(hexValue) || false)
    
    const recommendation = validation?.recommendations?.find((rec) =>
      rec.toLowerCase().includes('color') || rec.toLowerCase().includes(hexValue.toLowerCase())
    )
    
    properties.push({
      id: `color-${name.toLowerCase().replace(/\s+/g, '-')}`,
      category: 'color',
      name,
      currentValue: currentClass || hexValue,
      tailwindClass: currentClass,
      hasIssue,
      recommendation: recommendation || (hasHex ? `Replace ${hexValue} with theme token` : undefined),
      path: `className.color`,
    })
  })
  
  return properties
}

/**
 * Parse typography properties from code
 */
function parseTypographyProperties(
  code: string,
  spec: ExtractedSpec,
  validation?: ComponentAnalysis
): EditableProperty[] {
  const properties: EditableProperty[] = []
  
  if (!spec.typography) return properties
  
  // Extract typography specifications
  spec.typography.forEach((typoSpec) => {
    // Example: "Base font size: 14px" or "Font weight: 500"
    const sizeMatch = typoSpec.match(/font size:\s*(\d+)px/i)
    const weightMatch = typoSpec.match(/font weight:\s*(\d+)/i)
    const heightMatch = typoSpec.match(/line height:\s*(\d+)px/i)
    
    if (sizeMatch) {
      const [, pixels] = sizeMatch
      const pixelValue = parseInt(pixels, 10)
      const classMatch = code.match(/text-\S+/)
      const currentClass = classMatch ? classMatch[0] : ''
      const currentPixels = currentClass ? fontSizeToPixels(currentClass) : null
      
      properties.push({
        id: `typography-font-size`,
        category: 'typography',
        name: 'Font Size',
        currentValue: currentClass || `${pixelValue}px`,
        tailwindClass: currentClass,
        pixelValue: currentPixels || pixelValue,
        cssProperty: 'fontSize',
        hasIssue: false,
        path: `className.fontSize`,
      })
    }
    
    if (weightMatch) {
      const [, weight] = weightMatch
      const weightValue = parseInt(weight, 10)
      const classMatch = code.match(/font-\S+/)
      const currentClass = classMatch ? classMatch[0] : ''
      const currentWeight = currentClass ? fontWeightToNumber(currentClass) : null
      
      properties.push({
        id: `typography-font-weight`,
        category: 'typography',
        name: 'Font Weight',
        currentValue: currentClass || `${weightValue}`,
        tailwindClass: currentClass,
        pixelValue: currentWeight || weightValue,
        cssProperty: 'fontWeight',
        hasIssue: false,
        path: `className.fontWeight`,
      })
    }
  })
  
  return properties
}

/**
 * Parse variant properties from code
 */
function parseVariantProperties(
  code: string,
  spec: ExtractedSpec,
  validation?: ComponentAnalysis
): EditableProperty[] {
  const properties: EditableProperty[] = []
  
  if (!spec.variants) return properties
  
  // Extract variants from cva() call
  const cvaMatch = code.match(/cva\([^,]*,\s*\{[\s\S]*?variants:\s*\{([\s\S]*?)\}/m)
  if (!cvaMatch) return properties
  
  const variantsBlock = cvaMatch[1]
  
  Object.entries(spec.variants).forEach(([key, expectedValues]) => {
    // Skip state variants (they're implementation details)
    if (key === 'state') return
    
    // Find this variant in the code
    const variantPattern = new RegExp(`${key}:\\s*\\{([^}]+)\\}`, 'i')
    const variantMatch = variantsBlock.match(variantPattern)
    
    if (!variantMatch) {
      // Variant is missing entirely
      properties.push({
        id: `variant-${key}`,
        category: 'variant',
        name: key,
        currentValue: '[]',
        variantKey: key,
        variantValues: [],
        hasIssue: true,
        recommendation: `Add missing "${key}" variant with values: ${expectedValues.join(', ')}`,
        path: `cva.variants.${key}`,
      })
      return
    }
    
    // Extract existing variant values
    const variantContent = variantMatch[1]
    const valueMatches = variantContent.matchAll(/(\w+):/g)
    const currentValues = Array.from(valueMatches).map((m) => m[1])
    
    // Check for missing values
    const missingValues = expectedValues.filter((v) => !currentValues.includes(v))
    const hasIssue = missingValues.length > 0
    
    properties.push({
      id: `variant-${key}`,
      category: 'variant',
      name: key,
      currentValue: currentValues.join(', '),
      variantKey: key,
      variantValues: currentValues,
      hasIssue,
      recommendation: hasIssue ? `Add missing ${key} values: ${missingValues.join(', ')}` : undefined,
      path: `cva.variants.${key}`,
    })
  })
  
  return properties
}

/**
 * Group properties by category and issue status
 */
export function groupProperties(properties: EditableProperty[]): {
  spacing: { issues: EditableProperty[]; optional: EditableProperty[] }
  colors: { issues: EditableProperty[]; optional: EditableProperty[] }
  typography: { issues: EditableProperty[]; optional: EditableProperty[] }
  variants: { issues: EditableProperty[]; optional: EditableProperty[] }
} {
  const grouped = {
    spacing: { issues: [] as EditableProperty[], optional: [] as EditableProperty[] },
    colors: { issues: [] as EditableProperty[], optional: [] as EditableProperty[] },
    typography: { issues: [] as EditableProperty[], optional: [] as EditableProperty[] },
    variants: { issues: [] as EditableProperty[], optional: [] as EditableProperty[] },
  }
  
  properties.forEach((prop) => {
    const categoryKey = prop.category === 'color' ? 'colors' : `${prop.category}s` as 'spacing' | 'colors' | 'typography' | 'variants'
    const target = prop.hasIssue ? grouped[categoryKey].issues : grouped[categoryKey].optional
    target.push(prop)
  })
  
  return grouped
}

