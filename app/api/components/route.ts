import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

interface ComponentPayload {
  name: string
  slug: string
  description?: string
  category?: string
  code: string
  variants?: Record<string, string[]>
  props?: Record<string, unknown>
  prompts?: {
    basic: string[]
    advanced: string[]
    useCases: string[]
  }
  installation?: string
  theme_id?: string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await req.json() as ComponentPayload
    const {
      name,
      slug,
      description,
      category,
      code,
      variants,
      props,
      prompts,
      installation,
      theme_id,
    } = body
    
    // Validate required fields
    if (!name || !slug || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, code' },
        { status: 400 }
      )
    }
    
    // Insert component
    const componentData = {
      name,
      slug,
      description: description || '',
      category: category || 'general',
      code,
      variants: variants || {},
      props: props || {},
      prompts: prompts || { basic: [], advanced: [], useCases: [] },
      installation: installation || '',
      theme_id: theme_id || null,
      created_by: user.id,
    }
    
    const { data, error } = await supabase
      .from('components')
      .insert(componentData as never)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save component', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

