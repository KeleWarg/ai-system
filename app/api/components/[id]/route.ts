import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get component details before deletion
    const { data: component, error: fetchError } = await supabase
      .from('components')
      .select('slug, name')
      .eq('id', id)
      .single()

    if (fetchError || !component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      )
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('components')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Database deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete component from database' },
        { status: 500 }
      )
    }

    // Delete from file system
    try {
      const registryDir = path.join(process.cwd(), 'components', 'registry')
      const componentFile = path.join(registryDir, `${component.slug}.tsx`)
      
      // Check if file exists before deleting
      try {
        await fs.access(componentFile)
        await fs.unlink(componentFile)
        console.log(`✅ Deleted file: ${componentFile}`)
      } catch (fileError) {
        console.log(`⚠️  File not found: ${componentFile}`)
      }

      // Update index.ts - remove export
      const indexPath = path.join(registryDir, 'index.ts')
      let indexContent = await fs.readFile(indexPath, 'utf-8')
      
      // Get component name (capitalize first letter of slug)
      const componentName = component.slug
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      
      // Remove the export line
      const exportLine = `export { ${componentName} } from './${component.slug}'`
      indexContent = indexContent
        .split('\n')
        .filter(line => !line.includes(exportLine))
        .join('\n')
      
      await fs.writeFile(indexPath, indexContent, 'utf-8')
      console.log(`✅ Updated index.ts`)

      // Update _meta.json - remove component metadata
      const metaPath = path.join(registryDir, '_meta.json')
      const metaContent = await fs.readFile(metaPath, 'utf-8')
      const metadata = JSON.parse(metaContent)
      
      delete metadata[component.slug]
      
      await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2), 'utf-8')
      console.log(`✅ Updated _meta.json`)

    } catch (fsError) {
      console.error('File system cleanup error:', fsError)
      // Don't fail the request if file cleanup fails
      // The component is already deleted from the database
    }

    // Revalidate relevant pages
    revalidatePath('/admin/components')
    revalidatePath('/docs/components')
    revalidatePath(`/docs/components/${component.slug}`)

    return NextResponse.json({
      success: true,
      message: `Component "${component.name}" deleted successfully`,
    })
  } catch (error) {
    console.error('Delete component error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin or editor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin or editor access required' },
        { status: 403 }
      )
    }

    // Update component
    const { data, error } = await supabase
      .from('components')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: 'Failed to update component' },
        { status: 500 }
      )
    }

    // Revalidate relevant pages
    revalidatePath('/admin/components')
    revalidatePath('/docs/components')
    if (data.slug) {
      revalidatePath(`/docs/components/${data.slug}`)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Update component error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

