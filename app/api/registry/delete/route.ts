import { NextRequest, NextResponse } from 'next/server'
import { unlink, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { getCurrentUser } from '@/lib/auth-helpers'

/**
 * API endpoint to delete component files from the registry
 * Used for rollback when DB save fails
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
    const { slug } = body

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing required field: slug' },
        { status: 400 }
      )
    }

    const registryPath = join(process.cwd(), 'components', 'registry')
    const componentPath = join(registryPath, `${slug}.tsx`)
    
    // Delete component file
    try {
      await unlink(componentPath)
      console.log(`🗑️  Deleted component file: ${componentPath}`)
    } catch (error) {
      // File might not exist, which is OK for rollback
      console.warn(`Component file not found (already deleted?): ${componentPath}`)
    }

    // Remove from registry index
    await removeFromRegistryIndex(slug)

    // Remove from metadata
    await removeFromRegistryMetadata(slug)

    return NextResponse.json({
      success: true,
      deleted: slug,
    })
  } catch (error) {
    console.error('Error deleting component file:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete component file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Remove component export from registry index.ts
 */
async function removeFromRegistryIndex(slug: string) {
  const indexPath = join(process.cwd(), 'components', 'registry', 'index.ts')
  
  try {
    let content = await readFile(indexPath, 'utf-8')
    
    // Remove the export line for this slug
    // Matches: export { ComponentName } from './slug'
    const exportPattern = new RegExp(`export\\s+{[^}]+}\\s+from\\s+['"]\\.\\/${slug}['"]\\n?`, 'g')
    content = content.replace(exportPattern, '')
    
    await writeFile(indexPath, content, 'utf-8')
    console.log(`✅ Removed ${slug} from registry index`)
  } catch (error) {
    console.error('Error removing from registry index:', error)
    // Don't throw - this is cleanup
  }
}

/**
 * Remove component from registry metadata file
 */
async function removeFromRegistryMetadata(slug: string) {
  const metaPath = join(process.cwd(), 'components', 'registry', '_meta.json')
  
  try {
    const metaContent = await readFile(metaPath, 'utf-8')
    const meta = JSON.parse(metaContent)
    
    // Remove component from array
    meta.components = meta.components.filter((c: { slug: string }) => c.slug !== slug)
    
    await writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
    console.log(`✅ Removed ${slug} from registry metadata`)
  } catch (error) {
    console.error('Error removing from registry metadata:', error)
    // Don't throw - this is cleanup
  }
}

