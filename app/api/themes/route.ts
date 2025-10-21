import { NextResponse } from 'next/server'
import { getThemes, createTheme } from '@/lib/db/themes'
import { getCurrentUser } from '@/lib/auth-helpers'

// GET all themes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || undefined

    const result = await getThemes({ page, limit, search })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    )
  }
}

// POST create new theme
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
    const { name, slug, colors, typography, spacing, radius, is_active } = body

    // Validate required fields
    if (!name || !slug || !colors) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, colors' },
        { status: 400 }
      )
    }

    // Create theme
    const newTheme = await createTheme({
      name,
      slug,
      colors,
      typography: typography || {},
      spacing: spacing || {},
      radius: radius || '0.5rem',
      is_active: is_active || false,
    })

    return NextResponse.json(newTheme, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating theme:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to create theme', details: err.message },
      { status: 500 }
    )
  }
}

