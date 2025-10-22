'use client'

/**
 * Inline Component Preview
 * Shows a preview message before component is saved
 */

import { Eye, Sparkles } from 'lucide-react'

interface InlineComponentPreviewProps {
  code: string
  variants?: Record<string, string[]>
}

export function InlineComponentPreview({ code, variants }: InlineComponentPreviewProps) {
  if (!code) {
    return (
      <div className="text-xs text-muted-foreground p-3">
        No code generated yet
      </div>
    )
  }

  const variantCount = variants ? Object.keys(variants).length : 0
  const totalVariants = variants 
    ? Object.values(variants).reduce((acc, arr) => acc + arr.length, 0) 
    : 0

  return (
    <div className="w-full rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Eye className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Component Generated!</h4>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground">
            Preview will be available after saving the component
          </p>
          {variantCount > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <div className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                {variantCount} variant {variantCount === 1 ? 'type' : 'types'}
              </div>
              <div className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                {totalVariants} total {totalVariants === 1 ? 'variant' : 'variants'}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            💡 <strong>Tip:</strong> Click "Save Component" below to see the live preview with all variants
          </p>
        </div>
      </div>
    </div>
  )
}

