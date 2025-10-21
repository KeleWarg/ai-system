'use client'

/**
 * Inline Component Preview
 * Renders component from code string in real-time
 */

import { useState, useEffect } from 'react'
import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'

interface InlineComponentPreviewProps {
  code: string
  variants?: Record<string, string[]>
}

export function InlineComponentPreview({ code, variants }: InlineComponentPreviewProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    try {
      // Extract component name from code - support multiple patterns
      let componentName: string | null = null

      // Pattern 1: export { ComponentName, ... } - look for component (starts with capital, not ending in Variants)
      const exportListMatch = code.match(/export\s*\{\s*(\w+)/)
      if (exportListMatch) {
        const match = exportListMatch[1]
        // Skip if it's a variants object (buttonVariants, etc) - we want the actual component
        if (/^[A-Z]/.test(match) && !match.endsWith('Variants') && !match.endsWith('Props')) {
          componentName = match
        }
      }
      
      // If first match was variants, try to find the component name after it
      if (!componentName) {
        const allExports = code.match(/export\s*\{\s*([^}]+)\}/)
        if (allExports) {
          const exports = allExports[1].split(',').map(e => e.trim())
          // Find first export that looks like a component (Capital letter, not Variants/Props)
          componentName = exports.find(e => /^[A-Z]/.test(e) && !e.endsWith('Variants') && !e.endsWith('Props')) || null
        }
      }

      // Pattern 2: const ComponentName = React.forwardRef
      if (!componentName) {
        const forwardRefMatch = code.match(/const\s+(\w+)\s*=\s*React\.forwardRef/)
        if (forwardRefMatch) {
          componentName = forwardRefMatch[1]
        }
      }

      // Pattern 3: export const ComponentName (legacy pattern)
      if (!componentName) {
        const exportConstMatch = code.match(/export\s+(?:const|function)\s+(\w+)/)
        if (exportConstMatch) {
          componentName = exportConstMatch[1]
        }
      }

      if (!componentName) {
        console.error('❌ Could not find component export in code')
        console.log('Code snippet:', code.substring(0, 300))
        setError('Could not find component export')
        return
      }

      console.log('🎬 Attempting to render preview for:', componentName)
      console.log('Code length:', code.length)

      // Strip import statements and export keywords
      let codeWithoutImports = code
        // Remove import statements
        .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
        // Remove export { ... } statements
        .replace(/^export\s+\{[^}]+\}\s*;?\s*$/gm, '')
        // Remove entire interface declarations (they can't be used in new Function anyway)
        .replace(/^export\s+interface\s+\w+[\s\S]*?\{[\s\S]*?\}\s*$/gm, '')
        .replace(/^interface\s+\w+[\s\S]*?\{[\s\S]*?\}\s*$/gm, '')
        // Remove entire type declarations
        .replace(/^export\s+type\s+\w+[\s\S]*?;\s*$/gm, '')
        .replace(/^type\s+\w+[\s\S]*?;\s*$/gm, '')
        // Remove export keywords from const/function
        .replace(/^export\s+(const|function)\s+/gm, '$1 ')
        .trim()
      
      // Remove TypeScript-specific syntax that breaks in runtime
      codeWithoutImports = codeWithoutImports
        // Remove generic type parameters from forwardRef, functions, etc
        .replace(/React\.forwardRef<[^>]+>/g, 'React.forwardRef')
        .replace(/React\.ComponentType<[^>]+>/g, 'React.ComponentType')
        .replace(/: React\.\w+<[^>]+>/g, '')
        // Remove any remaining generic parameters (be thorough)
        .replace(/\w+<[\w\s,<>[\]|&.]+>/g, (match) => {
          // Keep HTML tags, remove TypeScript generics
          if (match.startsWith('React.') || /^[A-Z]/.test(match[0])) {
            return match.split('<')[0]
          }
          return match
        })
        // Remove extends clauses from interfaces (shouldn't exist after interface removal, but just in case)
        .replace(/extends\s+[\w\.<>,\s]+(?=\{)/g, '')
        .trim()
      
      console.log('Code after stripping imports:', codeWithoutImports.substring(0, 200) + '...')
      
      // Create a function that compiles and returns the component
      // We need to provide React, cva, cn, and Slot as dependencies
      const componentFactory = new Function(
        'React',
        'cva',
        'cn',
        'Slot',
        `
        'use strict';
        const { forwardRef, HTMLAttributes, ButtonHTMLAttributes } = React;
        ${codeWithoutImports}
        return ${componentName};
        `
      )
      
      console.log('✅ Component function created successfully')
      const comp = componentFactory(React, cva, cn, Slot)
      console.log('✅ Component instantiated:', comp ? 'Success' : 'Failed')
      setComponent(() => comp)
      setError(null)
    } catch (err) {
      console.error('❌ Preview compilation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to compile component')
    }
  }, [code])
  
  if (error) {
    return (
      <div className="flex items-start gap-2 text-destructive text-xs p-3 bg-destructive/10 rounded-lg">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Preview unavailable</p>
          <p className="text-xs opacity-80 mt-1">{error}</p>
        </div>
      </div>
    )
  }
  
  if (!Component) {
    return (
      <div className="text-xs text-muted-foreground animate-pulse">
        Loading preview...
      </div>
    )
  }
  
  // Render component with different variant combinations
  const variantKeys = Object.keys(variants || {}).filter(key => key !== 'state')
  
  if (variantKeys.length === 0) {
    // No variants defined, just render default
    return (
      <div className="space-y-3">
        <Component>Button</Component>
      </div>
    )
  }
  
  // Render all combinations of first two variant types (to avoid explosion)
  const [firstVariant, secondVariant] = variantKeys.slice(0, 2)
  const firstValues = variants?.[firstVariant] || []
  const secondValues = variants?.[secondVariant] || []
  
  return (
    <div className="space-y-4">
      {firstValues.slice(0, 3).map((firstValue) => (
        <div key={firstValue} className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground capitalize">
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

