import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Use /tmp for Vercel compatibility (serverless functions can write here)
const TEMP_DIR = process.env.VERCEL 
  ? join('/tmp', 'preview-components')
  : join(process.cwd(), 'components/registry/.temp')

export async function POST(request: NextRequest) {
  try {
    const { code, componentName } = await request.json()
    
    if (!code || !componentName) {
      return NextResponse.json(
        { error: 'Missing code or componentName' },
        { status: 400 }
      )
    }
    
    // Create temp directory if it doesn't exist
    await mkdir(TEMP_DIR, { recursive: true })
    
    // Generate unique ID for this preview
    const previewId = randomUUID()
    const fileName = `${previewId}.tsx`
    const filePath = join(TEMP_DIR, fileName)
    
    // Write code to temp file
    await writeFile(filePath, code, 'utf-8')
    
    console.log('✅ Temp preview file created:', filePath)
    
    return NextResponse.json({ 
      previewId, 
      componentName,
      filePath: fileName,
      expiresAt: Date.now() + 30 * 60 * 1000 // 30 min TTL
    })
  } catch (error) {
    console.error('❌ Failed to create temp preview:', error)
    return NextResponse.json(
      { error: 'Failed to create preview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

