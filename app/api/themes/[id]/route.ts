import { NextResponse } from 'next/server'
import { updateTheme, deleteTheme } from '@/lib/db/themes'
import { getCurrentUser } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase'

// GET single theme
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching theme:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    )
  }
}

// PATCH update theme
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const updatedTheme = await updateTheme(id, body)
    return NextResponse.json(updatedTheme)
  } catch (error: unknown) {
    console.error('Error updating theme:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to update theme', details: err.message },
      { status: 500 }
    )
  }
}

// DELETE theme
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.dbUser as { role?: string } | null)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    await deleteTheme(id)
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting theme:', error)
    const err = error as Error
    return NextResponse.json(
      { error: 'Failed to delete theme', details: err.message },
      { status: 500 }
    )
  }
}

