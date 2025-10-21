import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { generateComponentCode } from '@/lib/ai/claude'
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
    const { name, description, category, variants, props, theme, colors, spacing } = body

    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category' },
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

    // Generate component code
    const code = await generateComponentCode({
      name,
      description,
      category,
      variants,
      props,
      theme,
      colors,
      spacing,
    })

    return NextResponse.json({ code })
  } catch (error: unknown) {
    console.error('Error generating component:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to generate component', details: err.message },
      { status: 500 }
    )
  }
}

