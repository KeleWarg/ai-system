import { NextResponse } from 'next/server'
import { getComponents } from '@/lib/db/components'

/**
 * Model Context Protocol (MCP) Server
 * Provides a standardized interface for Claude and other AI tools
 * to discover and use design system components
 */
export async function GET() {
  try {
    const components = await getComponents()
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    return NextResponse.json({
      version: "1.0.0",
      name: "AI Design System MCP Server",
      description: "Model Context Protocol server for AI-generated design system components",
      tools: [
        {
          name: "list_components",
          description: "List all available components in the design system",
          inputSchema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "Filter by category (optional)",
                enum: ["buttons", "inputs", "navigation", "feedback", "data-display", "overlays", "general"],
              },
            },
          },
        },
        {
          name: "get_component",
          description: "Get detailed information about a specific component including code, props, and usage",
          inputSchema: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "Component slug (URL-friendly identifier)",
              },
            },
            required: ["slug"],
          },
        },
        {
          name: "search_components",
          description: "Search components by name or description",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query",
              },
            },
            required: ["query"],
          },
        },
      ],
      registry_url: `${siteUrl}/api/registry`,
      docs_url: `${siteUrl}/docs`,
      components: components.map(c => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        category: c.category,
        variants: Object.keys(c.variants || {}),
        has_prompts: !!(c.prompts && (c.prompts as Record<string, unknown>).basic),
      })),
    })
  } catch (error) {
    console.error('MCP error:', error)
    return NextResponse.json(
      { error: 'Failed to load MCP server' },
      { status: 500 }
    )
  }
}

