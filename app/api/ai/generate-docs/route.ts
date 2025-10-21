import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { generateDocumentation } from '@/lib/ai/claude'
import { checkRateLimit, aiRateLimiter } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(currentUser.user.id, aiRateLimiter)
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response
    }

    const body = await request.json()
    const { componentName, componentCode } = body

    // Validate required fields
    if (!componentName || !componentCode) {
      return NextResponse.json(
        { error: 'Missing required fields: componentName, componentCode' },
        { status: 400 }
      )
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Generate documentation
    const docs = await generateDocumentation({
      componentName,
      componentCode,
    })

    return NextResponse.json(docs)
  } catch (error: unknown) {
    console.error('Error generating documentation:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to generate documentation', details: err.message },
      { status: 500 }
    )
  }
}

