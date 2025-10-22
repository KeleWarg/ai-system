'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Code, Copy, Check, AlertCircle } from 'lucide-react'

interface ComponentPreviewDynamicProps {
  slug: string
  componentName: string
  componentCode: string
  variants?: Record<string, string[]>
  description?: string
}

/**
 * Dynamic component preview that works on Vercel
 * Fetches and renders components from database without filesystem writes
 */
export function ComponentPreviewDynamic({
  slug,
  componentName,
  componentCode,
  variants,
  description,
}: ComponentPreviewDynamicProps) {
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)
  const [Component, setComponent] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch and render component from database
    async function loadDatabaseComponent() {
      try {
        setLoading(true)
        setError(null)

        // Fetch component from API (which reads from database)
        const response = await fetch(`/api/registry/${slug}`)
        
        if (!response.ok) {
          throw new Error('Component not found')
        }

        const data = await response.json()
        
        // Use the code from props (already fetched) or API
        const code = componentCode || data.code

        // Try to dynamically import from pre-built registry first
        try {
          const module = await import(`@/components/registry/${slug}`)
          const ImportedComponent = module[componentName] || module.default
          
          if (ImportedComponent) {
            setComponent(() => ImportedComponent)
            console.log(`✅ Loaded ${componentName} from registry`)
            setLoading(false)
            return
          }
        } catch (importError) {
          // Component not in registry, will show code-only view
          console.log(`ℹ️  ${componentName} not in pre-built registry, showing code view`)
        }

        // If dynamic import fails, show code-only preview
        setError('Live preview not available. Copy the code to use in your project.')
        setLoading(false)

      } catch (err) {
        console.error('Failed to load component:', err)
        setError(err instanceof Error ? err.message : 'Failed to load component')
        setLoading(false)
      }
    }

    loadDatabaseComponent()
  }, [slug, componentName, componentCode])

  const handleCopy = () => {
    navigator.clipboard.writeText(componentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate example previews
  const renderPreview = useMemo(() => {
    if (!Component) return null

    const examples = []

    // Show variants if available
    if (variants?.variant) {
      const variantTypes = variants.variant.filter(v => 
        !['enabled', 'hover', 'focused', 'pressed', 'disabled'].includes(v)
      )
      
      if (variantTypes.length > 0) {
        examples.push(
          <div key="variants" className="space-y-3">
            <h4 className="text-xs font-semibold text-fg-caption uppercase">Variants</h4>
            <div className="flex flex-wrap gap-3">
              {variantTypes.map((variant) => (
                <Component key={variant} variant={variant}>
                  {variant}
                </Component>
              ))}
            </div>
          </div>
        )
      }
    }

    // Show sizes if available
    if (variants?.size) {
      examples.push(
        <div key="sizes" className="space-y-3">
          <h4 className="text-xs font-semibold text-fg-caption uppercase">Sizes</h4>
          <div className="flex flex-wrap items-center gap-3">
            {variants.size.map((size) => (
              <Component key={size} size={size}>
                {size}
              </Component>
            ))}
          </div>
        </div>
      )
    }

    // Default example if no variants
    if (examples.length === 0) {
      examples.push(
        <div key="default" className="flex justify-center py-8">
          <Component>Example</Component>
        </div>
      )
    }

    return examples
  }, [Component, variants])

  return (
    <div className="space-y-4">
      {description && (
        <p className="text-sm text-fg-caption">{description}</p>
      )}

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setPreviewMode('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            previewMode === 'preview'
              ? 'text-fg-body border-b-2 border-primary'
              : 'text-fg-caption hover:text-fg-body'
          }`}
        >
          <Eye className="inline-block w-4 h-4 mr-2" />
          Preview
        </button>
        <button
          onClick={() => setPreviewMode('code')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            previewMode === 'code'
              ? 'text-fg-body border-b-2 border-primary'
              : 'text-fg-caption hover:text-fg-body'
          }`}
        >
          <Code className="inline-block w-4 h-4 mr-2" />
          Code
        </button>
      </div>

      {/* Preview Content */}
      {previewMode === 'preview' ? (
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-fg-caption py-4">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ) : (
              <div className="space-y-8">{renderPreview}</div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono">{componentName}.tsx</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-x-auto bg-bg-neutral p-4 rounded-lg">
              <code>{componentCode}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Variants Info */}
      {variants && Object.keys(variants).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(variants).map(([key, values]) => (
            <Badge key={key} variant="secondary" className="text-xs">
              {key}: {Array.isArray(values) ? values.join(', ') : values}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

