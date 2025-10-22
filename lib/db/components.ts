import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Component } from '@/lib/supabase'

export async function getComponents(options?: {
  page?: number
  limit?: number
  category?: string
  search?: string
}) {
  const supabase = await createServerSupabaseClient()
  const page = options?.page || 1
  const limit = options?.limit || 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('components')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  // Apply category filter if provided
  if (options?.category) {
    query = query.eq('category', options.category)
  }

  // Apply search filter if provided
  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching components:', error)
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
    data: (data || []) as Component[],
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

export async function getComponentsByCategory(category: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching components by category:', error)
    return []
  }

  return data as Component[]
}

export async function getComponentBySlug(slug: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching component:', error)
    return null
  }

  return data as Component
}

export async function createComponent(component: Omit<Component, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('components')
    .insert(component as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating component:', error)
    throw error
  }

  return data as Component
}

export async function updateComponent(id: string, updates: Partial<Omit<Component, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('components')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating component:', error)
    throw error
  }

  return data as Component
}

export async function deleteComponent(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting component:', error)
    throw error
  }

  return true
}

export async function searchComponents(query: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching components:', error)
    return []
  }

  return data as Component[]
}

