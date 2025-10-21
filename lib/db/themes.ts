import { createClient } from '@/lib/supabase'
import type { Theme } from '@/lib/supabase'

export async function getThemes(options?: {
  page?: number
  limit?: number
  search?: string
}) {
  const supabase = createClient()
  const page = options?.page || 1
  const limit = options?.limit || 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('themes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  // Apply search filter if provided
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching themes:', error)
    return {
      data: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
      }
    }
  }

  return {
    data: (data || []) as Theme[],
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
      hasNext: offset + limit < (count || 0),
      hasPrev: page > 1,
    }
  }
}

export async function getActiveTheme() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching active theme:', error)
    return null
  }

  return data as Theme
}

export async function getThemeBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching theme:', error)
    return null
  }

  return data as Theme
}

export async function createTheme(theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .insert(theme as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating theme:', error)
    throw error
  }

  return data as Theme
}

export async function updateTheme(id: string, updates: Partial<Omit<Theme, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating theme:', error)
    throw error
  }

  return data as Theme
}

export async function deleteTheme(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting theme:', error)
    throw error
  }

  return true
}

export async function setActiveTheme(id: string) {
  const supabase = createClient()
  
  // First, deactivate all themes
  await supabase
    .from('themes')
    .update({ is_active: false } as never)
    .neq('id', id)

  // Then activate the selected theme
  const { data, error } = await supabase
    .from('themes')
    .update({ is_active: true } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error setting active theme:', error)
    throw error
  }

  return data as Theme
}

