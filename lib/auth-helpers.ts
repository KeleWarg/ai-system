import { createServerSupabaseClient } from './supabase-server'
import { redirect } from 'next/navigation'
import { getUser } from './db/users'

export async function requireAuth() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const dbUser = await getUser(user.id)

  if (!dbUser || dbUser.role !== 'admin') {
    redirect('/admin')
  }

  return { user, dbUser }
}

export async function requireRole(role: 'admin' | 'editor') {
  const user = await requireAuth()
  const dbUser = await getUser(user.id)

  if (!dbUser) {
    redirect('/admin/login')
  }

  if (role === 'admin' && dbUser.role !== 'admin') {
    redirect('/admin')
  }

  return { user, dbUser }
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user from database using server client
  const { data: dbUser, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return { user, dbUser }
}

export async function isAuthenticated() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return !!user
}

