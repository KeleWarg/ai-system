import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { anthropic } from '@/lib/ai/claude'
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
    const { originalCode, changes, componentName } = body

    // Validate required fields
    if (!originalCode || !changes || !componentName) {
      return NextResponse.json(
        { error: 'Missing required fields: originalCode, changes, componentName' },
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

    // Build prompt
    const prompt = `Regenerate this React component by applying the specified changes.

Component Name: ${componentName}

Current Component Code:
\`\`\`tsx
${originalCode}
\`\`\`

Required Changes:
${JSON.stringify(changes, null, 2)}

Instructions:
1. Apply all the specified changes to the component
2. Maintain the existing code structure and style
3. Ensure type safety and proper TypeScript types
4. Keep existing functionality that's not being changed
5. Use class-variance-authority for variants
6. Return ONLY the updated component code

Return the complete updated component code as plain text (no markdown, no JSON wrapper).`

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    // Extract code (remove markdown if present)
    let code = textContent.text.trim()
    const codeMatch = code.match(/```(?:tsx|typescript|jsx|javascript)?\n([\s\S]*?)```/)
    if (codeMatch) {
      code = codeMatch[1]
    }

    return NextResponse.json({
      code,
      componentName,
    })
  } catch (error: unknown) {
    console.error('Error regenerating component:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to regenerate component', details: err.message },
      { status: 500 }
    )
  }
}

