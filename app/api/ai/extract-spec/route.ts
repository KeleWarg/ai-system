import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { extractSpecFromImage } from '@/lib/ai/claude'

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
    const { imageBase64, imageMediaType } = body

    // Validate required fields
    if (!imageBase64 || !imageMediaType) {
      return NextResponse.json(
        { error: 'Missing required fields: imageBase64, imageMediaType' },
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

    // Extract spec from image
    const spec = await extractSpecFromImage({
      imageBase64,
      imageMediaType,
    })

    return NextResponse.json(spec)
  } catch (error: unknown) {
    console.error('Error extracting spec:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to extract spec', details: err.message },
      { status: 500 }
    )
  }
}

