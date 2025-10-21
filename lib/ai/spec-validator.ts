/**
 * Spec Validation System
 * Ensures generated components match the uploaded spec sheet
 */

export interface ExtractedSpec {
  name: string
  description: string
  category: string
  variants?: Record<string, string[]>
  colors?: string[]
  spacing?: string[]
  notes?: string
}

export interface ComponentAnalysis {
  hasRequiredVariants: boolean
  missingVariants: string[]
  hasCorrectSpacing: boolean
  spacingIssues: string[]
  hasThemeColors: boolean
  colorIssues: string[]
  overallMatch: number // 0-100 score
  recommendations: string[]
}

/**
 * Validate that generated component code matches the extracted spec
 */
export function validateComponentAgainstSpec(
  componentCode: string,
  spec: ExtractedSpec
): ComponentAnalysis {
  const analysis: ComponentAnalysis = {
    hasRequiredVariants: true,
    missingVariants: [],
    hasCorrectSpacing: true,
    spacingIssues: [],
    hasThemeColors: true,
    colorIssues: [],
    overallMatch: 100,
    recommendations: [],
  }

  // Check 1: Validate variants are present
  if (spec.variants) {
    for (const [variantKey, variantValues] of Object.entries(spec.variants)) {
      // Skip state variants (they're implementation details)
      if (variantKey === 'state') continue

      // Check if variant key exists in code
      if (!componentCode.includes(variantKey)) {
        analysis.hasRequiredVariants = false
        analysis.missingVariants.push(variantKey)
        analysis.recommendations.push(
          `Add "${variantKey}" variant with values: ${variantValues.join(', ')}`
        )
      } else {
        // Check if variant values are present
        const missingValues = variantValues.filter(
          (value) =>
            !['enabled', 'hover', 'focused', 'pressed', 'disabled'].includes(
              value.toLowerCase()
            ) && !componentCode.includes(value)
        )
        if (missingValues.length > 0) {
          analysis.missingVariants.push(
            `${variantKey}: ${missingValues.join(', ')}`
          )
          analysis.recommendations.push(
            `Add missing ${variantKey} values: ${missingValues.join(', ')}`
          )
        }
      }
    }
  }

  // Check 2: Validate spacing/sizing
  if (spec.spacing && spec.spacing.length > 0) {
    const spacingPatterns = extractSpacingPatterns(spec.spacing)

    for (const pattern of spacingPatterns) {
      const { property, value } = pattern
      // Check if spacing values appear in code (as Tailwind classes or direct values)
      const spacingExists =
        componentCode.includes(value) ||
        componentCode.includes(convertToTailwindClass(property, value))

      if (!spacingExists) {
        analysis.hasCorrectSpacing = false
        analysis.spacingIssues.push(`Missing ${property}: ${value}`)
        analysis.recommendations.push(
          `Ensure ${property} is set to ${value} (use Tailwind class: ${convertToTailwindClass(
            property,
            value
          )})`
        )
      }
    }
  }

  // Check 3: Validate theme colors (no hardcoded hex)
  const hexColorPattern = /#[0-9A-Fa-f]{3,6}/g
  const hexColors = componentCode.match(hexColorPattern)

  if (hexColors && hexColors.length > 0) {
    analysis.hasThemeColors = false
    analysis.colorIssues = hexColors
    analysis.recommendations.push(
      `Replace hardcoded colors ${hexColors.join(', ')} with theme tokens (bg-primary, text-foreground, etc.)`
    )
  }

  // Check 4: Validate theme token usage
  const themeTokens = [
    'bg-primary',
    'text-primary',
    'bg-secondary',
    'bg-accent',
    'bg-muted',
  ]
  const hasThemeTokens = themeTokens.some((token) =>
    componentCode.includes(token)
  )

  if (!hasThemeTokens) {
    analysis.hasThemeColors = false
    analysis.colorIssues.push('No theme tokens found')
    analysis.recommendations.push(
      'Use theme color tokens (bg-primary, text-foreground) instead of direct colors'
    )
  }

  // Calculate overall match score
  let score = 100
  if (!analysis.hasRequiredVariants) score -= 30
  if (analysis.missingVariants.length > 0)
    score -= analysis.missingVariants.length * 5
  if (!analysis.hasCorrectSpacing) score -= 20
  if (analysis.spacingIssues.length > 0) score -= analysis.spacingIssues.length * 5
  if (!analysis.hasThemeColors) score -= 20
  if (analysis.colorIssues.length > 0) score -= analysis.colorIssues.length * 5

  analysis.overallMatch = Math.max(0, score)

  return analysis
}

/**
 * Extract spacing patterns from spec sheet descriptions
 */
function extractSpacingPatterns(spacing: string[]): Array<{
  property: string
  value: string
}> {
  const patterns: Array<{ property: string; value: string }> = []

  for (const spec of spacing) {
    // Match "height: 40px" or "padding: 12px 16px" patterns
    const heightMatch = spec.match(/height:\s*(\d+px)/i)
    const paddingMatch = spec.match(/padding:\s*([\d\s]+px)/i)
    const marginMatch = spec.match(/margin:\s*([\d\s]+px)/i)
    const gapMatch = spec.match(/gap:\s*(\d+px)/i)

    if (heightMatch) {
      patterns.push({ property: 'height', value: heightMatch[1] })
    }
    if (paddingMatch) {
      patterns.push({ property: 'padding', value: paddingMatch[1] })
    }
    if (marginMatch) {
      patterns.push({ property: 'margin', value: marginMatch[1] })
    }
    if (gapMatch) {
      patterns.push({ property: 'gap', value: gapMatch[1] })
    }
  }

  return patterns
}

/**
 * Convert CSS properties to Tailwind classes
 */
function convertToTailwindClass(property: string, value: string): string {
  // Convert px values to Tailwind classes
  const pxValue = parseInt(value.replace('px', ''))

  const tailwindMap: Record<string, Record<number, string>> = {
    height: {
      32: 'h-8',
      36: 'h-9',
      40: 'h-10',
      44: 'h-11',
      48: 'h-12',
    },
    padding: {
      8: 'p-2',
      12: 'p-3',
      16: 'p-4',
      20: 'p-5',
      24: 'p-6',
    },
    gap: {
      4: 'gap-1',
      8: 'gap-2',
      12: 'gap-3',
      16: 'gap-4',
    },
  }

  return tailwindMap[property]?.[pxValue] || `${property}-[${value}]`
}

/**
 * Generate improvement suggestions based on validation
 */
export function generateImprovementPrompt(
  analysis: ComponentAnalysis,
  spec: ExtractedSpec
): string {
  if (analysis.overallMatch >= 90) {
    return '' // Component is good enough
  }

  let prompt = `IMPORTANT: The component needs improvements to match the spec sheet:\n\n`

  if (analysis.missingVariants.length > 0) {
    prompt += `1. MISSING VARIANTS:\n`
    prompt += analysis.missingVariants.map((v) => `   - ${v}`).join('\n')
    prompt += '\n\n'
  }

  if (analysis.spacingIssues.length > 0) {
    prompt += `2. SPACING ISSUES:\n`
    prompt += analysis.spacingIssues.map((s) => `   - ${s}`).join('\n')
    prompt += '\n\n'
  }

  if (analysis.colorIssues.length > 0) {
    prompt += `3. COLOR ISSUES:\n`
    prompt += analysis.colorIssues.map((c) => `   - ${c}`).join('\n')
    prompt += '\n\n'
  }

  prompt += `REQUIRED ACTIONS:\n`
  prompt += analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')

  return prompt
}

/**
 * Enhanced component generation with spec validation
 */
export interface EnhancedGenerationParams {
  spec: ExtractedSpec
  theme?: {
    colors: Record<string, string>
    spacing?: Record<string, string>
  }
  maxRetries?: number
}

export interface GenerationResult {
  code: string
  analysis: ComponentAnalysis
  retries: number
  success: boolean
}

