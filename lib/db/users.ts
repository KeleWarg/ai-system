import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { User } from '@/lib/supabase'

export async function getUser(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data as User
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return getUser(user.id)
}

export async function getUserByEmail(email: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    console.error('Error fetching user by email:', error)
    return null
  }

  return data as User
}

export async function updateUserRole(id: string, role: 'admin' | 'editor') {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .update({ role } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user role:', error)
    throw error
  }

  return data as User
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await getUser(userId)
  return user?.role === 'admin'
}

