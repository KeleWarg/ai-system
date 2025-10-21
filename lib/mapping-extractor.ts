/**
 * Mapping Issue Extractor (Extended)
 * Extracts both validation issues AND all editable properties from spec
 */

import type { ComponentAnalysis } from './ai/spec-validator'

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

export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    muted: string
    destructive: string
    foreground: string
    background: string
    border: string
  }
  [key: string]: unknown
}

export interface MappingIssue {
  id: string
  type: 'color' | 'spacing' | 'variant' | 'typography'
  title: string
  specRequirement: string
  currentValue: string
  suggestedFix: string
  options?: string[]
  isIssue?: boolean // Mark if this is a validation issue vs optional edit
}

/**
 * Extract ALL editable properties from spec (not just validation issues)
 * This allows advanced mode to edit everything
 */
export function extractAllEditableProperties(
  spec: ExtractedSpec,
  validation: ComponentAnalysis,
  componentCode: string,
  theme?: Theme
): MappingIssue[] {
  const properties: MappingIssue[] = []
  let idCounter = 0
  
  // First, add validation issues (these are marked as isIssue: true)
  const issues = extractMappingIssues(spec, validation, theme)
  properties.push(...issues.map(issue => ({ ...issue, isIssue: true })))
  
  // Then, add ALL other editable properties from spec
  
  // ALL Variants (not just missing ones)
  if (spec.variants) {
    Object.entries(spec.variants).forEach(([key, values]) => {
      // Skip if already added as an issue
      const alreadyAdded = properties.some(p => 
        p.type === 'variant' && p.title.includes(key)
      )
      
      if (!alreadyAdded) {
        properties.push({
          id: `variant-all-${key}-${idCounter++}`,
          type: 'variant',
          title: `Variant: ${key}`,
          specRequirement: values.join(', '),
          currentValue: values.join(', '),
          suggestedFix: `Available options: ${values.join(', ')}`,
          options: values,
          isIssue: false,
        })
      }
    })
  }
  
  // ALL Spacing values
  if (spec.spacing) {
    spec.spacing.forEach((spacingSpec) => {
      const match = spacingSpec.match(/^(.+?):\s*(\d+)px$/i)
      if (match) {
        const [, name, pixels] = match
        
        // Skip if already added as an issue
        const alreadyAdded = properties.some(p => 
          p.type === 'spacing' && p.title.includes(name)
        )
        
        if (!alreadyAdded) {
          properties.push({
            id: `spacing-all-${name.replace(/\s+/g, '-')}-${idCounter++}`,
            type: 'spacing',
            title: `${name}`,
            specRequirement: `${pixels}px`,
            currentValue: `${pixels}px`,
            suggestedFix: getTailwindClass(name, parseInt(pixels, 10)),
            options: generateSpacingOptions(parseInt(pixels, 10), name),
            isIssue: false,
          })
        }
      }
    })
  }
  
  // ALL Colors
  if (spec.colors) {
    spec.colors.forEach((colorSpec) => {
      const match = colorSpec.match(/^(.+?):\s*(#[0-9A-Fa-f]{6}|transparent)$/i)
      if (match) {
        const [, name, hexValue] = match
        
        // Skip if already added as an issue
        const alreadyAdded = properties.some(p => 
          p.type === 'color' && p.currentValue === hexValue
        )
        
        if (!alreadyAdded) {
          properties.push({
            id: `color-all-${hexValue.replace('#', '')}-${idCounter++}`,
            type: 'color',
            title: `Color: ${name}`,
            specRequirement: 'Theme token',
            currentValue: hexValue,
            suggestedFix: 'Map to theme color',
            options: theme ? generateColorOptions(theme) : [],
            isIssue: false,
          })
        }
      }
    })
  }
  
  // ALL Typography
  if (spec.typography) {
    spec.typography.forEach((typoSpec) => {
      const sizeMatch = typoSpec.match(/font size:\s*(\d+)px/i)
      const weightMatch = typoSpec.match(/font weight:\s*(\d+)/i)
      
      if (sizeMatch) {
        properties.push({
          id: `typo-size-${idCounter++}`,
          type: 'typography',
          title: 'Font Size',
          specRequirement: `${sizeMatch[1]}px`,
          currentValue: `${sizeMatch[1]}px`,
          suggestedFix: `text-[${sizeMatch[1]}px]`,
          options: [`text-sm (14px)`, `text-base (16px)`, `text-lg (18px)`, `text-[${sizeMatch[1]}px] (custom)`],
          isIssue: false,
        })
      }
      
      if (weightMatch) {
        properties.push({
          id: `typo-weight-${idCounter++}`,
          type: 'typography',
          title: 'Font Weight',
          specRequirement: weightMatch[1],
          currentValue: weightMatch[1],
          suggestedFix: `font-[${weightMatch[1]}]`,
          options: [`font-normal (400)`, `font-medium (500)`, `font-semibold (600)`, `font-bold (700)`],
          isIssue: false,
        })
      }
    })
  }
  
  return properties
}

function getTailwindClass(propertyName: string, pixels: number): string {
  const spacingMap: Record<number, string> = {
    4: '1', 8: '2', 12: '3', 16: '4', 20: '5',
    24: '6', 32: '8', 40: '10', 48: '12',
  }
  
  let prefix = 'h'
  if (propertyName.toLowerCase().includes('padding')) {
    prefix = 'p'
  } else if (propertyName.toLowerCase().includes('gap')) {
    prefix = 'gap'
  }
  
  return spacingMap[pixels] ? `${prefix}-${spacingMap[pixels]}` : `${prefix}-[${pixels}px]`
}

/**
 * Extract mapping issues from validation analysis (validation issues only)
 */
export function extractMappingIssues(
  spec: ExtractedSpec,
  validation: ComponentAnalysis,
  theme?: Theme
): MappingIssue[] {
  const issues: MappingIssue[] = []
  
  // Extract variant issues
  validation.recommendations.forEach((rec, index) => {
    // Pattern: "Add missing type values: primary, secondary, ghost"
    const variantMatch = rec.match(/Add missing (\w+) values:\s*(.+)$/i)
    if (variantMatch) {
      const [, variantName, values] = variantMatch
      issues.push({
        id: `variant-${variantName}-${index}`,
        type: 'variant',
        title: `Missing variant: ${variantName}`,
        specRequirement: values,
        currentValue: 'none',
        suggestedFix: rec,
        options: values.split(',').map(v => v.trim()),
      })
      return
    }
    
    // Pattern: 'Add "icon" variant with values: none, left, right'
    const variantMatch2 = rec.match(/Add "(\w+)" variant with values:\s*(.+)$/i)
    if (variantMatch2) {
      const [, variantName, values] = variantMatch2
      issues.push({
        id: `variant-${variantName}-${index}`,
        type: 'variant',
        title: `Missing variant: ${variantName}`,
        specRequirement: values,
        currentValue: 'none',
        suggestedFix: rec,
        options: values.split(',').map(v => v.trim()),
      })
      return
    }
    
    // Pattern: "Ensure height is set to 40px (use Tailwind class: h-10)"
    const spacingMatch = rec.match(/Ensure (.+?) is set to (\d+)px.*?:\s*([\w\-\[\]]+)\)/i)
    if (spacingMatch) {
      const [, propertyName, pixels, tailwindClass] = spacingMatch
      issues.push({
        id: `spacing-${propertyName.replace(/\s+/g, '-')}-${index}`,
        type: 'spacing',
        title: `${propertyName}: ${pixels}px`,
        specRequirement: `${pixels}px`,
        currentValue: 'incorrect',
        suggestedFix: tailwindClass,
        options: generateSpacingOptions(parseInt(pixels, 10), propertyName),
      })
      return
    }
    
    // Pattern: "Use theme color tokens (bg-primary, text-foreground) instead of direct colors"
    if (rec.toLowerCase().includes('color token')) {
      issues.push({
        id: `color-tokens-${index}`,
        type: 'color',
        title: 'Use theme colors',
        specRequirement: 'Theme tokens',
        currentValue: 'Hardcoded hex values',
        suggestedFix: rec,
        options: theme ? generateColorOptions(theme) : [],
      })
      return
    }
    
    // Pattern: "Replace hardcoded colors #047857, #FFFFFF with theme tokens"
    const colorMatch = rec.match(/Replace hardcoded colors? (.+?) with/i)
    if (colorMatch) {
      const hexColors = colorMatch[1].split(',').map(c => c.trim())
      hexColors.forEach((hexColor, hexIndex) => {
        issues.push({
          id: `color-${hexColor.replace('#', '')}-${index}-${hexIndex}`,
          type: 'color',
          title: `Replace color: ${hexColor}`,
          specRequirement: 'Theme token',
          currentValue: hexColor,
          suggestedFix: 'Use theme color',
          options: theme ? generateColorOptions(theme) : [],
        })
      })
    }
  })
  
  return issues
}

/**
 * Generate spacing options based on pixel value
 */
function generateSpacingOptions(pixels: number, propertyName: string): string[] {
  const options: string[] = []
  
  // Determine prefix based on property type
  let prefix = 'h'
  if (propertyName.toLowerCase().includes('padding')) {
    if (propertyName.toLowerCase().includes('horizontal')) {
      prefix = 'px'
    } else if (propertyName.toLowerCase().includes('vertical')) {
      prefix = 'py'
    } else {
      prefix = 'p'
    }
  } else if (propertyName.toLowerCase().includes('gap')) {
    prefix = 'gap'
  } else if (propertyName.toLowerCase().includes('radius')) {
    prefix = 'rounded'
  } else if (propertyName.toLowerCase().includes('width')) {
    prefix = 'w'
  }
  
  // Tailwind spacing scale mapping (4px increments)
  const spacingMap: Record<number, string> = {
    0: '0',
    4: '1',
    8: '2',
    12: '3',
    16: '4',
    20: '5',
    24: '6',
    32: '8',
    40: '10',
    48: '12',
    56: '14',
    64: '16',
  }
  
  // Add exact match if it exists in Tailwind scale
  if (spacingMap[pixels]) {
    options.push(`${prefix}-${spacingMap[pixels]} (${pixels}px - exact match)`)
  }
  
  // Add closest smaller and larger values
  const closestSmaller = Object.keys(spacingMap)
    .map(Number)
    .filter(p => p < pixels)
    .sort((a, b) => b - a)[0]
    
  const closestLarger = Object.keys(spacingMap)
    .map(Number)
    .filter(p => p > pixels)
    .sort((a, b) => a - b)[0]
  
  if (closestSmaller && !spacingMap[pixels]) {
    options.push(`${prefix}-${spacingMap[closestSmaller]} (${closestSmaller}px)`)
  }
  
  if (closestLarger) {
    options.push(`${prefix}-${spacingMap[closestLarger]} (${closestLarger}px)`)
  }
  
  // Add custom arbitrary value option
  options.push(`${prefix}-[${pixels}px] (custom exact)`)
  
  return options
}

/**
 * Generate color options from theme
 */
function generateColorOptions(theme: Theme): string[] {
  const options: string[] = []
  
  // Background colors
  options.push('bg-primary', 'bg-secondary', 'bg-accent', 'bg-muted', 'bg-background')
  
  // Text colors
  options.push('text-foreground', 'text-primary', 'text-secondary', 'text-muted-foreground')
  
  // Border colors
  options.push('border-border', 'border-primary', 'border-secondary')
  
  return options
}
