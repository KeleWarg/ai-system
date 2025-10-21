'use client'

import { useState, useEffect, Suspense } from 'react'
import type { ComponentType, ReactElement } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Code, Copy, Check, AlertCircle } from 'lucide-react'

interface ComponentPreviewRealProps {
  slug: string
  componentName: string
  componentCode: string
  variants?: Record<string, string[]>
  description?: string
  spacing?: string[]
}

export function ComponentPreviewReal({
  slug,
  componentName,
  componentCode,
  variants,
  description,
  spacing,
}: ComponentPreviewRealProps) {
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [DynamicComponent, setDynamicComponent] = useState<ComponentType<Record<string, unknown>> | null>(null)

  useEffect(() => {
    async function loadComponent() {
      try {
        console.log(`Loading component: ${slug}`)
        const componentModule = await import(`@/components/registry/${slug}`)
        const Component = componentModule[componentName] || componentModule.default
        
        if (!Component) {
          throw new Error(`Component ${componentName} not found in module`)
        }
        
        setDynamicComponent(() => Component)
        setError(null) // Clear any errors on successful load
        console.log(`✅ Component ${componentName} loaded successfully`)
      } catch (err) {
        console.error(`Failed to load component ${componentName}:`, err)
        
        // Check if we're on Vercel production
        const isProduction = typeof window !== 'undefined' && 
          (window.location.hostname.includes('vercel.app') || 
           window.location.hostname.includes('your-domain.com'))
        
        if (isProduction) {
          setError('💡 This component was generated after deployment. Live preview will be available after the next git commit + deploy. Copy the code below to use it in your project.')
        } else {
          setError(`Failed to load component: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }
    }

    loadComponent()
  }, [slug, componentName])

  const handleCopy = () => {
    navigator.clipboard.writeText(componentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate all variant combinations for preview
  const generateVariantExamples = () => {
    if (!variants || !DynamicComponent) return null

    const examples: ReactElement[] = []

    // Show type variants
    if (variants.type && variants.type.length > 0) {
      const typeVariants = variants.type.filter(
        (v) => !['enabled', 'hover', 'focused', 'pressed', 'disabled'].includes(v)
      )
      if (typeVariants.length > 0) {
        examples.push(
          <div key="type" className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Variants
            </h3>
            <div className="flex flex-wrap gap-3">
              {typeVariants.map((variant) => (
                <DynamicComponent key={variant} variant={variant}>
                  {variant}
                </DynamicComponent>
              ))}
            </div>
          </div>
        )
      }
    }

    // Show size variants
    if (variants.size && variants.size.length > 0) {
      examples.push(
        <div key="size" className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {variants.size.map((size) => (
              <DynamicComponent key={size} size={size}>
                {size === 'base' ? 'Medium' : size}
              </DynamicComponent>
            ))}
          </div>
        </div>
      )
    }

    // Show state variants
    if (variants.state && variants.state.includes('disabled')) {
      examples.push(
        <div key="state" className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            States
          </h3>
          <div className="flex flex-wrap gap-3">
            <DynamicComponent>Default</DynamicComponent>
            <DynamicComponent disabled>Disabled</DynamicComponent>
          </div>
          <p className="text-xs text-muted-foreground">
            Hover and focus states are interactive - try hovering over the components above
          </p>
        </div>
      )
    }

    // Show icon variants
    if (variants.icon && (variants.icon.includes('left') || variants.icon.includes('right'))) {
      examples.push(
        <div key="icon" className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            With Icons
          </h3>
          <div className="flex flex-wrap gap-3">
            {variants.icon.includes('left') && (
              <DynamicComponent>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Left Icon
              </DynamicComponent>
            )}
            {variants.icon.includes('right') && (
              <DynamicComponent>
                Right Icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </DynamicComponent>
            )}
          </div>
        </div>
      )
    }

    return examples.length > 0 ? (
      <div className="space-y-8">{examples}</div>
    ) : (
      <div className="flex items-center justify-center py-12">
        <DynamicComponent>Default</DynamicComponent>
      </div>
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
              {componentName}
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
            {description && <p className="text-muted-foreground">{description}</p>}

            {error ? (
              <div className="border border-destructive rounded-lg p-8 bg-destructive/5">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <h3 className="text-lg font-semibold text-destructive">Preview Error</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <p className="text-xs text-muted-foreground">
                  The component may not have been written to the file system correctly. Try regenerating it.
                </p>
              </div>
            ) : DynamicComponent ? (
              <>
                <div className="border rounded-lg p-8 bg-gradient-to-br from-muted/30 to-muted/10">
                  <Suspense fallback={<div>Loading component...</div>}>
                    {generateVariantExamples()}
                  </Suspense>
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
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Component Code</h3>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
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
              <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto max-h-96 overflow-y-auto">
                <code>{componentCode}</code>
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

