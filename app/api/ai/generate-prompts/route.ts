import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { generateUsagePrompts } from '@/lib/ai/claude'

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

    const body = await request.json()
    const { componentName, componentCode, variants } = body

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

    // Generate prompts
    const prompts = await generateUsagePrompts({
      componentName,
      componentCode,
      variants,
    })

    return NextResponse.json(prompts)
  } catch (error: unknown) {
    console.error('Error generating prompts:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to generate prompts', details: err.message },
      { status: 500 }
    )
  }
}

