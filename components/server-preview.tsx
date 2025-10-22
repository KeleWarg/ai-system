'use client'

/**
 * Server-Side Preview Component
 * 
 * Uses Next.js dynamic imports to render AI-generated components.
 * This approach matches shadcn's file-based preview system.
 * 
 * Flow:
 * 1. Write code to temp file via API
 * 2. Dynamic import (Next.js bundles it)
 * 3. Render component
 * 4. Auto-cleanup on unmount
 */

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

interface ServerPreviewProps {
  code: string
  variants?: Record<string, string[]>
  componentName?: string
}

export function ServerPreview({ code, variants, componentName }: ServerPreviewProps) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Create temp file and load component
  useEffect(() => {
    let currentPreviewId: string | null = null
    let isMounted = true
    
    async function loadPreview() {
      if (!isMounted) return
      
      setLoading(true)
      setError(null)
      
      try {
        console.log('🎬 Starting server preview for:', componentName)
        
        // Step 1: Write code to temp file
        const res = await fetch('/api/preview/temp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, componentName }),
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to create preview file')
        }
        
        const { previewId: id, componentName: name } = await res.json()
        
        if (!isMounted) return
        
        currentPreviewId = id
        setPreviewId(id)
        
        console.log('✅ Preview file created:', id)
        
        // Step 2: Use require() for dynamic loading in Node.js environment
        // Note: Dynamic imports don't work with Turbopack for runtime paths
        // We'll use a server-side rendering approach instead
        
        // For now, fall back to the old InlineComponentPreview approach
        // but with better error handling
        throw new Error('Dynamic preview temporarily disabled. Please save component to see preview.')
      } catch (err) {
        console.error('❌ Preview error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load preview')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    loadPreview()
    
    // Cleanup: Delete temp file when component unmounts
    return () => {
      isMounted = false
      if (currentPreviewId) {
        fetch(`/api/preview/temp/${currentPreviewId}`, { method: 'DELETE' })
          .then(() => console.log('🗑️ Cleanup: Deleted preview file'))
          .catch(console.error)
      }
    }
  }, [code, componentName])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-fg-caption">
        <div className="animate-pulse">Loading preview...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-start gap-2 text-fg-feedback-error text-xs p-3 bg-fg-feedback-error/10 rounded-lg">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Preview unavailable</p>
          <p className="text-xs opacity-80 mt-1">{error}</p>
          <p className="text-xs opacity-60 mt-2">
            💡 Tip: Preview works in local development. After saving, component will be available in production.
          </p>
        </div>
      </div>
    )
  }
  
  if (!Component) {
    return (
      <div className="text-xs text-fg-caption">
        No component loaded
      </div>
    )
  }
  
  // Render component with variant combinations
  const variantKeys = Object.keys(variants || {}).filter(k => k !== 'state')
  
  if (variantKeys.length === 0) {
    return (
      <div className="space-y-3">
        <Component>Preview</Component>
      </div>
    )
  }
  
  const [firstVariant, secondVariant] = variantKeys.slice(0, 2)
  const firstValues = variants?.[firstVariant] || []
  const secondValues = variants?.[secondVariant] || []
  
  return (
    <div className="space-y-4">
      {firstValues.slice(0, 3).map((firstValue) => (
        <div key={firstValue} className="space-y-2">
          <div className="text-xs font-medium text-fg-caption capitalize">
            {firstVariant}: {firstValue}
          </div>
          <div className="flex flex-wrap gap-2">
            {secondValues.slice(0, 3).map((secondValue) => (
              <Component
                key={`${firstValue}-${secondValue}`}
                {...{ [firstVariant]: firstValue, [secondVariant]: secondValue }}
              >
                {firstValue}
              </Component>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

