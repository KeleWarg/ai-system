import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import {
  validateComponentAgainstSpec,
  generateImprovementPrompt,
  type ExtractedSpec,
} from '@/lib/ai/spec-validator'
import { checkRateLimit, aiRateLimiter } from '@/lib/rate-limit'

/**
 * API endpoint to validate generated component against spec sheet
 * Returns validation analysis and improvement suggestions
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(currentUser.user.id, aiRateLimiter)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response
    }

    const body = await request.json()
    const { componentCode, spec } = body as {
      componentCode: string
      spec: ExtractedSpec
    }

    // Validate required fields
    if (!componentCode || !spec) {
      return NextResponse.json(
        { error: 'Missing required fields: componentCode, spec' },
        { status: 400 }
      )
    }

    // Run validation
    const analysis = validateComponentAgainstSpec(componentCode, spec)

    // Generate improvement prompt if needed
    const improvementPrompt =
      analysis.overallMatch < 90
        ? generateImprovementPrompt(analysis, spec)
        : null

    return NextResponse.json({
      analysis,
      improvementPrompt,
      needsImprovement: analysis.overallMatch < 90,
      matchScore: analysis.overallMatch,
    })
  } catch (error: unknown) {
    console.error('Error validating component:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to validate component', details: err.message },
      { status: 500 }
    )
  }
}

