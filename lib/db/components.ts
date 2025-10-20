import { createClient } from '@/lib/supabase'
import type { Component } from '@/lib/supabase'

export async function getComponents() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching components:', error)
    return []
  }

  return data as Component[]
}

export async function getComponentsByCategory(category: string) {
  const supabase = createClient()
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
  const supabase = createClient()
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
  const supabase = createClient()
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
  const supabase = createClient()
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
  const supabase = createClient()
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
  const supabase = createClient()
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

