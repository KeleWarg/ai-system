import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { getCurrentUser } from '@/lib/auth-helpers'

/**
 * API endpoint to write generated component files to the registry
 * This allows us to save AI-generated components as actual .tsx files
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { slug, code, componentName, variants } = body

    if (!slug || !code || !componentName) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, code, componentName' },
        { status: 400 }
      )
    }

    // Validate slug (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' },
        { status: 400 }
      )
    }

    const registryPath = join(process.cwd(), 'components', 'registry')
    const componentPath = join(registryPath, `${slug}.tsx`)
    
    // Write component file
    await writeFile(componentPath, code, 'utf-8')
    console.log(`✅ Component written to: ${componentPath}`)

    // Update registry index
    await updateRegistryIndex(slug, componentName)

    // Update metadata
    await updateRegistryMetadata(slug, componentName, variants)

    return NextResponse.json({
      success: true,
      path: componentPath,
      slug,
      componentName,
    })
  } catch (error) {
    console.error('Error writing component file:', error)
    return NextResponse.json(
      {
        error: 'Failed to write component file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Update the registry index.ts to export the new component
 */
async function updateRegistryIndex(slug: string, componentName: string) {
  const indexPath = join(process.cwd(), 'components', 'registry', 'index.ts')
  
  try {
    let content = await readFile(indexPath, 'utf-8')
    
    // Check if export already exists
    const exportLine = `export { ${componentName} } from './${slug}'`
    if (!content.includes(exportLine)) {
      // Remove the empty export
      content = content.replace('export {}', '')
      
      // Add new export
      content += `\n${exportLine}\n`
      
      await writeFile(indexPath, content, 'utf-8')
      console.log(`✅ Updated registry index with: ${componentName}`)
    }
  } catch (error) {
    console.error('Error updating registry index:', error)
    throw error
  }
}

/**
 * Update the registry metadata file
 */
async function updateRegistryMetadata(
  slug: string,
  componentName: string,
  variants?: Record<string, string[]>
) {
  const metaPath = join(process.cwd(), 'components', 'registry', '_meta.json')
  
  try {
    const metaContent = await readFile(metaPath, 'utf-8')
    const meta = JSON.parse(metaContent)
    
    // Find existing component or create new entry
    const existingIndex = meta.components.findIndex((c: any) => c.slug === slug)
    const componentMeta = {
      slug,
      name: componentName,
      variants: variants || {},
      addedAt: new Date().toISOString(),
    }
    
    if (existingIndex >= 0) {
      meta.components[existingIndex] = componentMeta
    } else {
      meta.components.push(componentMeta)
    }
    
    await writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
    console.log(`✅ Updated registry metadata for: ${componentName}`)
  } catch (error) {
    console.error('Error updating registry metadata:', error)
    throw error
  }
}

