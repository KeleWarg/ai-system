import { NextResponse } from 'next/server'
import { getComponents } from '@/lib/db/components'

/**
 * Registry API - Lists all available components
 * Used by AI tools like v0.dev, Claude, Cursor to discover components
 */
export async function GET() {
  try {
    const components = await getComponents()
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    return NextResponse.json({
      schema_version: "1.0.0",
      name: "AI Design System",
      description: "AI-generated components from spec sheets with theme support",
      components: components.map(c => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        category: c.category,
        url: `${siteUrl}/api/registry/${c.slug}`,
        docs_url: `${siteUrl}/docs/components/${c.slug}`,
        variants: Object.keys(c.variants || {}),
      })),
    })
  } catch (error) {
    console.error('Registry error:', error)
    return NextResponse.json(
      { error: 'Failed to load registry' },
      { status: 500 }
    )
  }
}

