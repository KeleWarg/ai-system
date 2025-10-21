import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'

// Use /tmp for Vercel compatibility
const TEMP_DIR = process.env.VERCEL 
  ? join('/tmp', 'preview-components')
  : join(process.cwd(), 'components/registry/.temp')

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ previewId: string }> }
) {
  try {
    const { previewId } = await params
    const filePath = join(TEMP_DIR, `${previewId}.tsx`)
    
    await unlink(filePath)
    console.log('🗑️ Temp preview file deleted:', filePath)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    // File might already be deleted, don't error
    console.log('⚠️ Could not delete temp file (might already be gone):', error)
    return NextResponse.json({ success: true })
  }
}

