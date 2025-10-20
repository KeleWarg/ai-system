import { NextResponse } from 'next/server'
import { getActiveTheme, setActiveTheme } from '@/lib/db/themes'
import { getCurrentUser } from '@/lib/auth-helpers'

// GET active theme
export async function GET() {
  try {
    const theme = await getActiveTheme()
    
    if (!theme) {
      return NextResponse.json(
        { error: 'No active theme found' },
        { status: 404 }
      )
    }

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error fetching active theme:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active theme' },
      { status: 500 }
    )
  }
}

// POST set active theme
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

    // Only admins can change active theme
    if (currentUser.dbUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { themeId } = body

    if (!themeId) {
      return NextResponse.json(
        { error: 'Missing themeId' },
        { status: 400 }
      )
    }

    const theme = await setActiveTheme(themeId)
    return NextResponse.json(theme)
  } catch (error: unknown) {
    console.error('Error setting active theme:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to set active theme', details: err.message },
      { status: 500 }
    )
  }
}

