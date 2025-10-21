'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Code, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { useTheme } from './theme-provider'

interface ComponentPreviewProps {
  componentCode: string
  componentName: string
  variants?: Record<string, string[]>
  description?: string
  spacing?: string[]
}

export function ComponentPreview({ componentCode, componentName, variants, description, spacing }: ComponentPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { theme } = useTheme()

  const generatePreview = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Generating preview for component:', componentName)
      console.log('Component code length:', componentCode?.length)
      
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: componentCode,
          variants: variants || {},
          theme: theme ? { colors: theme.colors } : undefined,
        }),
      })

      console.log('Preview API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to generate preview')
      }

      const html = await response.text()
      console.log('Preview HTML received, length:', html.length)
      setPreviewHtml(html)
      
      // Create a blob URL as an alternative to srcDoc
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      
      // Cleanup old URL
      return () => {
        if (url) {
          URL.revokeObjectURL(url)
        }
      }
    } catch (err) {
      console.error('Preview generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate preview')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Generate preview HTML when component code changes
    if (componentCode && componentCode.trim()) {
      console.log('useEffect triggered, generating preview...')
      generatePreview()
    } else {
      console.log('No component code, skipping preview generation')
      setIsLoading(false)
    }
  }, [componentCode, variants, theme])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(componentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleRefresh = () => {
    generatePreview()
  }

  // Extract component name from code for display
  const extractComponentName = (code: string) => {
    const match = code.match(/export\s+(?:default\s+)?function\s+(\w+)/)
    return match ? match[1] : componentName
  }

  const displayName = extractComponentName(componentCode)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Component Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Component Preview</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Eye className="h-3 w-3" />
              {displayName}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant={previewMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('preview')}
                className="h-8"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                variant={previewMode === 'code' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('code')}
                className="h-8"
              >
                <Code className="h-4 w-4 mr-1" />
                Code
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {previewMode === 'preview' ? (
          <div className="space-y-6">
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
            
            {error ? (
              <div className="border border-destructive rounded-lg p-8 bg-destructive/5">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <h3 className="text-lg font-semibold text-destructive">Preview Error</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden bg-background">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground ml-2">Live Preview</span>
                    </div>
                    <Button onClick={handleRefresh} variant="ghost" size="sm" className="h-7 gap-2">
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </Button>
                  </div>
                  {previewUrl ? (
                    <>
                      <iframe
                        ref={iframeRef}
                        src={previewUrl}
                        className="w-full border-0 bg-white"
                        style={{ minHeight: '500px', height: '500px' }}
                        sandbox="allow-scripts allow-same-origin"
                        title="Component Preview"
                        onLoad={() => {
                          console.log('Iframe loaded successfully')
                          // Auto-resize iframe based on content
                          try {
                            const iframe = iframeRef.current
                            if (iframe?.contentWindow?.document) {
                              const body = iframe.contentWindow.document.body
                              const html = iframe.contentWindow.document.documentElement
                              const height = Math.max(
                                body.scrollHeight,
                                body.offsetHeight,
                                html.clientHeight,
                                html.scrollHeight,
                                html.offsetHeight
                              )
                              console.log('Setting iframe height to:', height)
                              iframe.style.height = height + 'px'
                            }
                          } catch (err) {
                            console.error('Cannot resize iframe:', err)
                          }
                        }}
                        onError={(e) => {
                          console.error('Iframe error:', e)
                          setError('Failed to load preview iframe')
                        }}
                      />
                      {/* Fallback: Show raw HTML preview */}
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          View Raw HTML (Debug)
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                          {previewHtml.substring(0, 500)}...
                        </pre>
                      </details>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                
                {/* Debug Info */}
                <div className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded border">
                  <strong>Debug Info:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground font-mono">
                    <li>Preview HTML length: {previewHtml?.length || 0} chars</li>
                    <li>Component code length: {componentCode?.length || 0} chars</li>
                    <li>Variants: {JSON.stringify(variants)}</li>
                    <li>Loading: {isLoading ? 'Yes' : 'No'}</li>
                    <li>Error: {error || 'None'}</li>
                  </ul>
                </div>

                {spacing && spacing.length > 0 && (
                  <div className="text-xs bg-blue-50 dark:bg-blue-950/20 p-4 rounded border border-blue-200 dark:border-blue-900">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">📐</span>
                      <div className="flex-1">
                        <strong className="text-blue-900 dark:text-blue-200">Spec Sheet Measurements:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                          {spacing.map((spec, i) => (
                            <li key={i}>{spec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Component Code</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            
            <div className="relative">
              <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                <code>{componentCode}</code>
              </pre>
            </div>
            
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
