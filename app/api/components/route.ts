import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isValidComponentName, extractComponentNameFromCode } from '@/lib/component-utils'

interface ComponentPayload {
  name: string
  slug: string
  component_name?: string  // Exact TypeScript export name
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
      component_name: providedComponentName,
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
    
    // Validate and extract component_name
    let component_name: string = providedComponentName || ''
    
    // If not provided, try to extract from code
    if (!component_name) {
      const extracted = extractComponentNameFromCode(code)
      if (!extracted) {
        return NextResponse.json(
          { error: 'Could not extract component export name from code. Ensure code has: export const ComponentName = ...' },
          { status: 400 }
        )
      }
      component_name = extracted
    }
    
    // Validate component name format
    if (!isValidComponentName(component_name)) {
      return NextResponse.json(
        { error: `Invalid component name: ${component_name}. Must start with uppercase letter and contain only alphanumeric characters.` },
        { status: 400 }
      )
    }
    
    // Insert component
    const componentData = {
      name,
      slug,
      component_name, // Validated component export name
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

