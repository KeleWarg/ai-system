import { NextResponse } from 'next/server'
import { getComponent } from '@/lib/db/components'

/**
 * Registry API - Get individual component details
 * Returns complete component information including code, props, and dependencies
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const component = await getComponent(slug)
    
    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      )
    }
    
    // Parse installation dependencies if stored as JSON
    let dependencies = [
      '@radix-ui/react-slot',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ]
    
    if (component.installation) {
      try {
        const installData = typeof component.installation === 'string' 
          ? JSON.parse(component.installation)
          : component.installation
        
        if (installData.dependencies) {
          dependencies = [...dependencies, ...installData.dependencies]
        }
      } catch (e) {
        // Installation is plain text, not JSON
      }
    }
    
    return NextResponse.json({
      name: component.name,
      slug: component.slug,
      description: component.description,
      category: component.category,
      code: component.code,
      variants: component.variants || {},
      props: component.props || {},
      prompts: component.prompts || { basic: [], advanced: [], useCases: [] },
      dependencies: [...new Set(dependencies)], // Remove duplicates
      installation: component.installation || '',
      version: "1.0.0",
      theme_based: !!component.theme_id,
    })
  } catch (error) {
    console.error('Registry error:', error)
    return NextResponse.json(
      { error: 'Failed to load component' },
      { status: 500 }
    )
  }
}

