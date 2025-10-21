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

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Parse FormData
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const imageMediaType = imageFile.type

    // Extract spec from image
    const spec = await extractSpecFromImage({
      imageBase64: base64,
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

