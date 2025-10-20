import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/db/users'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ user: null, dbUser: null })
    }

    const dbUser = await getUser(user.id)

    return NextResponse.json({ user, dbUser })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}

