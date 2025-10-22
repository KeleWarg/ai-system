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
    const { componentCode, componentProps, componentVariants, specImage } = body

    // Validate required fields
    if (!componentCode || !specImage) {
      return NextResponse.json(
        { error: 'Missing required fields: componentCode, specImage' },
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
    const prompt = `Analyze this React component and compare it with a new spec sheet to identify required changes.

Current Component Code:
\`\`\`tsx
${componentCode}
\`\`\`

Current Props:
${JSON.stringify(componentProps, null, 2)}

Current Variants:
${JSON.stringify(componentVariants, null, 2)}

The attached image shows updated requirements. Analyze what needs to change.

Identify:
1. Properties to ADD (new props not in current component)
2. Properties to REMOVE (props no longer needed)
3. Properties to MODIFY (type changes)
4. Variants to ADD (new variant types/values)
5. Variants to REMOVE (unused variants)

Return as JSON:
{
  "propertiesToAdd": [
    {
      "name": "propName",
      "type": "TypeScript type",
      "description": "what it does"
    }
  ],
  "propertiesToRemove": ["propName1", "propName2"],
  "propertiesToModify": [
    {
      "name": "propName",
      "oldType": "old type",
      "newType": "new type",
      "description": "why it changed"
    }
  ],
  "variantsToAdd": {
    "variantType": ["value1", "value2"]
  },
  "variantsToRemove": ["variantType1"]
}

Return ONLY valid JSON.`

    // Call Claude with vision
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: specImage.startsWith('data:image/png') ? 'image/png' : 
                            specImage.startsWith('data:image/jpeg') ? 'image/jpeg' :
                            specImage.startsWith('data:image/webp') ? 'image/webp' : 'image/png',
                data: specImage.split(',')[1],
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    // Extract JSON from response
    let jsonText = textContent.text.trim()
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    const result = JSON.parse(jsonText)

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Error analyzing component changes:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to analyze changes', details: err.message },
      { status: 500 }
    )
  }
}

