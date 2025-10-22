import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isValidComponentName, extractComponentNameFromCode } from '@/lib/component-utils'
import { getComponents } from '@/lib/db/components'

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    const result = await getComponents({ page, limit, category, search })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching components:', error)
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  console.log('🔵 POST /api/components - Request received')
  
  try {
    const supabase = await createServerSupabaseClient()
    console.log('🔵 Supabase client created')
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔵 Auth check:', user ? `User ${user.id}` : 'No user', authError ? `Error: ${authError.message}` : 'OK')
    
    if (authError || !user) {
      console.error('❌ Unauthorized request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await req.json() as ComponentPayload
    console.log('🔵 Request body parsed:', {
      name: body.name,
      slug: body.slug,
      component_name: body.component_name,
      codeLength: body.code?.length,
      hasVariants: !!body.variants,
      hasPrompts: !!body.prompts,
      theme_id: body.theme_id,
    })
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
    console.log('🔵 Component name validation - provided:', providedComponentName)
    
    // If not provided, try to extract from code
    if (!component_name) {
      const extracted = extractComponentNameFromCode(code)
      console.log('🔵 Extracted component name from code:', extracted)
      if (!extracted) {
        console.error('❌ Could not extract component name from code')
        return NextResponse.json(
          { error: 'Could not extract component export name from code. Ensure code has: export const ComponentName = ...' },
          { status: 400 }
        )
      }
      component_name = extracted
    }
    
    // Validate component name format
    const isValid = isValidComponentName(component_name)
    console.log('🔵 Component name format validation:', component_name, 'valid:', isValid)
    
    if (!isValid) {
      console.error('❌ Invalid component name format:', component_name)
      return NextResponse.json(
        { error: `Invalid component name: ${component_name}. Must start with uppercase letter and contain only alphanumeric characters.` },
        { status: 400 }
      )
    }
    
    // Insert component
    // Ensure installation is an object (database expects JSONB)
    let installationData: Record<string, unknown> = {}
    if (typeof installation === 'string') {
      installationData = { steps: installation }
    } else if (installation && typeof installation === 'object') {
      installationData = installation
    }
    
    // Validate category (must match DB CHECK constraint)
    const validCategories = ['buttons', 'inputs', 'navigation', 'feedback', 'data-display', 'overlays', 'other']
    const finalCategory = category && validCategories.includes(category) ? category : 'other'
    
    console.log('🔵 Category validation:', category, '->', finalCategory)
    
    const componentData = {
      name,
      slug,
      component_name, // Validated component export name
      description: description || '',
      category: finalCategory,
      code,
      variants: variants || {},
      props: props || {},
      prompts: prompts || { basic: [], advanced: [], useCases: [] },
      installation: installationData,
      theme_id: theme_id || null,
      created_by: user.id,
    }
    
    console.log('🔵 Attempting database insert...')
    
    const { data, error } = await supabase
      .from('components')
      .insert(componentData as any)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Database error:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error hint:', error.hint)
      console.error('❌ Component data sent (first 500 chars):', JSON.stringify(componentData, null, 2).substring(0, 500))
      return NextResponse.json(
        { error: 'Failed to save component', details: error.message, hint: error.hint || '', code: error.code },
        { status: 500 }
      )
    }
    
    console.log('✅ Component saved to database:', (data as any)?.id)
    
    // Also write to filesystem for preview (local dev only)
    try {
      const registryResponse = await fetch(new URL('/api/registry/write', req.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('Cookie') || '', // Forward auth cookies
        },
        body: JSON.stringify({
          slug,
          code,
          componentName: component_name,
          variants,
        }),
      })
      
      if (registryResponse.ok) {
        const registryData = await registryResponse.json()
        console.log('✅ Component written to registry:', registryData)
      } else {
        console.warn('⚠️  Failed to write to registry (may be on Vercel):', await registryResponse.text())
      }
    } catch (registryError) {
      console.warn('⚠️  Could not write to registry:', registryError)
      // Don't fail the request if registry write fails
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

