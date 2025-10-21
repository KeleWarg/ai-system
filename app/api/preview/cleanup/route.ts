import { NextResponse } from 'next/server'
import { readdir, unlink, stat } from 'fs/promises'
import { join } from 'path'
import { getCurrentUser } from '@/lib/auth-helpers'

// Use /tmp for Vercel compatibility
const TEMP_DIR = process.env.VERCEL 
  ? join('/tmp', 'preview-components')
  : join(process.cwd(), 'components/registry/.temp')

const MAX_AGE_MS = 30 * 60 * 1000 // 30 minutes

export async function GET() {
  try {
    // Check authentication and admin role (cleanup is admin-only)
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.dbUser as { role?: string } | null)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
    const files = await readdir(TEMP_DIR).catch(() => [])
    const now = Date.now()
    let deletedCount = 0
    
    for (const file of files) {
      if (!file.endsWith('.tsx')) continue
      
      const filePath = join(TEMP_DIR, file)
      try {
        const stats = await stat(filePath)
        const age = now - stats.mtimeMs
        
        if (age > MAX_AGE_MS) {
          await unlink(filePath)
          deletedCount++
          console.log('🗑️ Cleaned up stale file:', file)
        }
      } catch (err) {
        // File might be in use or already deleted, skip
        continue
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      deletedCount,
      message: `Cleaned up ${deletedCount} stale preview files`
    })
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

