import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import Anthropic from '@anthropic-ai/sdk'
import type { ComponentAnalysis, ExtractedSpec } from '@/lib/ai/spec-validator'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * AI-Powered Fix Suggestion API
 * When validation fails, this generates corrected code based on the issues found
 */
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { componentCode, spec, analysis } = body as {
      componentCode: string
      spec: ExtractedSpec
      analysis: ComponentAnalysis
    }

    if (!componentCode || !spec || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields: componentCode, spec, analysis' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Build fix prompt based on validation analysis
    const fixPrompt = buildFixPrompt(componentCode, spec, analysis)

    console.log('🔧 Requesting AI fix for validation issues...')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      temperature: 0.3, // Lower temperature for more precise fixes
      system: `You are an expert React developer specializing in fixing component code to match design specifications.
Your task is to fix the provided component code to match the spec sheet requirements exactly.
Return ONLY the corrected component code, no explanations, no markdown blocks, just the pure TypeScript/React code.`,
      messages: [
        {
          role: 'user',
          content: fixPrompt,
        },
      ],
    })

    const fixedCode =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Clean the code (remove markdown if AI added it anyway)
    const cleanedCode = fixedCode
      .replace(/```typescript\n?/g, '')
      .replace(/```tsx\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return NextResponse.json({
      fixedCode: cleanedCode,
      changes: generateChangesSummary(analysis),
      matchScoreBefore: analysis.overallMatch,
    })
  } catch (error: unknown) {
    console.error('Error generating fix:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to generate fix', details: err.message },
      { status: 500 }
    )
  }
}

/**
 * Build a detailed prompt for AI to fix the component
 */
function buildFixPrompt(
  code: string,
  spec: ExtractedSpec,
  analysis: ComponentAnalysis
): string {
  return `⚠️ COMPONENT FIX REQUIRED

The following component code FAILED validation against the spec sheet.
Your task is to fix the code to match the spec sheet EXACTLY.

## ORIGINAL CODE:
\`\`\`typescript
${code}
\`\`\`

## SPEC SHEET REQUIREMENTS:

### Component Name: ${spec.name}
${spec.description}

### Required Variants:
${spec.variants
  ? Object.entries(spec.variants)
      .map(([key, values]) => `- ${key}: ${values.join(', ')}`)
      .join('\n')
  : 'None specified'}

### Spacing/Sizing Requirements:
${spec.spacing && spec.spacing.length > 0 ? spec.spacing.map((s) => `- ${s}`).join('\n') : 'None specified'}

### Color Requirements:
${spec.colors && spec.colors.length > 0 ? spec.colors.map((c) => `- ${c}`).join('\n') : 'Use theme tokens'}

## VALIDATION FAILURES:

### Missing Variants:
${analysis.missingVariants.length > 0 ? analysis.missingVariants.map((v) => `❌ ${v}`).join('\n') : '✅ All variants present'}

### Spacing Issues:
${analysis.spacingIssues.length > 0 ? analysis.spacingIssues.map((s) => `❌ ${s}`).join('\n') : '✅ Spacing correct'}

### Color Issues:
${analysis.colorIssues.length > 0 ? analysis.colorIssues.map((c) => `❌ ${c}`).join('\n') : '✅ Colors correct'}

## REQUIRED FIXES:
${analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## CRITICAL RULES:
1. Fix ALL issues listed above
2. Keep the same component structure (using cva, forwardRef, etc.)
3. Maintain TypeScript types and interfaces
4. Use theme tokens (bg-primary, text-foreground) instead of hardcoded colors
5. Match spacing values EXACTLY from spec sheet (use Tailwind classes or arbitrary values like h-[40px])
6. Include ALL required variants from the spec
7. Keep the component export name the same: export const ${spec.name}

Return ONLY the fixed component code, no explanations.`
}

/**
 * Generate a human-readable summary of changes made
 */
function generateChangesSummary(analysis: ComponentAnalysis): string[] {
  const changes: string[] = []

  if (analysis.missingVariants.length > 0) {
    changes.push(
      `Added missing variants: ${analysis.missingVariants.join(', ')}`
    )
  }

  if (analysis.spacingIssues.length > 0) {
    changes.push(`Fixed spacing issues: ${analysis.spacingIssues.length} corrected`)
  }

  if (analysis.colorIssues.length > 0) {
    changes.push(
      `Replaced ${analysis.colorIssues.length} hardcoded colors with theme tokens`
    )
  }

  if (changes.length === 0) {
    changes.push('No major changes needed')
  }

  return changes
}

