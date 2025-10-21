import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { extractSpecFromImage } from '@/lib/ai/claude'
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

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Convert file to base64 and validate magic numbers (file signature)
    const arrayBuffer = await imageFile.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    
    // Check magic numbers (file signature validation)
    const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
    const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
    const isWebP = bytes.length > 11 && 
                   bytes[8] === 0x57 && bytes[9] === 0x45 && 
                   bytes[10] === 0x42 && bytes[11] === 0x50

    if (!isPNG && !isJPEG && !isWebP) {
      return NextResponse.json(
        { error: 'Invalid image file. File signature does not match PNG, JPG, or WebP format.' },
        { status: 400 }
      )
    }

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

