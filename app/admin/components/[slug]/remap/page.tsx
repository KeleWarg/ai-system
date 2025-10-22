'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, ArrowRight, Palette } from 'lucide-react'
import { toast } from 'sonner'
import type { Component, Theme } from '@/lib/supabase'

interface StyleRemapPageProps {
  params: Promise<{ slug: string }>
}

interface StyleMatch {
  fullMatch: string // e.g., "bg-blue-500"
  prefix: string // e.g., "bg"
  value: string // e.g., "blue-500"
  type: 'color' | 'spacing'
}

interface StyleMapping {
  original: string // e.g., "bg-blue-500"
  themeToken: string // e.g., "primary"
  newClass: string // e.g., "bg-primary-bg"
}

export default function StyleRemapPage({ params }: StyleRemapPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [component, setComponent] = useState<Component | null>(null)
  const [theme, setTheme] = useState<Theme | null>(null)
  
  // Detected styles and their mappings
  const [detectedStyles, setDetectedStyles] = useState<StyleMatch[]>([])
  const [mappings, setMappings] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [slug])

  async function loadData() {
    try {
      // Load component by slug
      const compRes = await fetch(`/api/components?search=${slug}&limit=1`)
      if (!compRes.ok) throw new Error('Failed to load component')
      const compResult = await compRes.json()
      const compData = compResult.data?.[0]
      
      if (!compData) throw new Error('Component not found')
      
      setComponent(compData)
      
      // Load active theme
      const themeRes = await fetch('/api/themes/active')
      if (!themeRes.ok) throw new Error('Failed to load active theme')
      const themeData = await themeRes.json()
      setTheme(themeData)
      
      // Analyze component code for styles
      analyzeStyles(compData.code, themeData)
    } catch (error) {
      console.error('Error loading:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load data')
      setTimeout(() => router.push('/admin/components'), 2000)
    } finally {
      setLoading(false)
    }
  }

  function analyzeStyles(code: string, activeTheme: Theme) {
    const styles: StyleMatch[] = []
    const seen = new Set<string>()
    
    // Pattern to match Tailwind color classes
    const colorPattern = /(bg|text|border|ring|from|to|via)-([\w-]+?)(?=\s|"|'|`|\/|:|}|])/g
    
    let match
    while ((match = colorPattern.exec(code)) !== null) {
      const fullMatch = match[0]
      const prefix = match[1]
      const value = match[2]
      
      // Skip modifiers and non-color classes
      if (value.includes('[') || value === 'transparent' || value === 'current' || value === 'inherit') {
        continue
      }
      
      if (!seen.has(fullMatch)) {
        seen.add(fullMatch)
        styles.push({
          fullMatch,
          prefix,
          value,
          type: 'color',
        })
      }
    }
    
    setDetectedStyles(styles)
    
    // Initialize mappings with smart suggestions
    const initialMappings: Record<string, string> = {}
    styles.forEach(style => {
      // If already a theme token, keep it; otherwise suggest one
      if (Object.keys(activeTheme.colors).includes(style.value)) {
        initialMappings[style.fullMatch] = style.value
      } else {
        initialMappings[style.fullMatch] = suggestThemeToken(style.value, activeTheme)
      }
    })
    setMappings(initialMappings)
  }

  function suggestThemeToken(colorValue: string, activeTheme: Theme): string {
    // Smart suggestions based on color names
    const suggestions: Record<string, string> = {
      'blue': 'primary',
      'indigo': 'primary',
      'violet': 'primary',
      'purple': 'accent',
      'pink': 'accent',
      'red': 'destructive',
      'orange': 'destructive',
      'yellow': 'muted',
      'amber': 'muted',
      'green': 'accent',
      'emerald': 'accent',
      'teal': 'accent',
      'cyan': 'accent',
      'sky': 'primary',
      'gray': 'muted',
      'slate': 'muted',
      'zinc': 'muted',
      'neutral': 'muted',
      'stone': 'muted',
      'white': 'background',
      'black': 'foreground',
    }
    
    // Check for matches
    for (const [keyword, token] of Object.entries(suggestions)) {
      if (colorValue.toLowerCase().includes(keyword)) {
        return token
      }
    }
    
    // Default to primary
    return 'primary'
  }

  function getColorPreview(colorValue: string, activeTheme: Theme): string {
    // First check if it's a theme token
    if (activeTheme.colors[colorValue]) {
      return `hsl(${activeTheme.colors[colorValue]})`
    }
    
    // Common Tailwind color values for hardcoded styles
    const tailwindColors: Record<string, string> = {
      'blue-50': '#eff6ff',
      'blue-100': '#dbeafe',
      'blue-200': '#bfdbfe',
      'blue-300': '#93c5fd',
      'blue-400': '#60a5fa',
      'blue-500': '#3b82f6',
      'blue-600': '#2563eb',
      'blue-700': '#1d4ed8',
      'blue-800': '#1e40af',
      'blue-900': '#1e3a8a',
      'red-500': '#ef4444',
      'red-600': '#dc2626',
      'green-500': '#22c55e',
      'gray-500': '#6b7280',
      'slate-500': '#64748b',
      'white': '#ffffff',
      'black': '#000000',
    }
    
    return tailwindColors[colorValue] || '#888888'
  }

  function updateMapping(originalClass: string, newToken: string) {
    setMappings(prev => ({
      ...prev,
      [originalClass]: newToken,
    }))
  }

  async function applyRemapping() {
    if (!component || !theme) return
    
    setSaving(true)
    const toastId = toast.loading('Applying style remapping...')
    
    try {
      let updatedCode = component.code
      
      // Apply each mapping
      Object.entries(mappings).forEach(([originalClass, themeToken]) => {
        // Extract prefix (bg, text, etc.)
        const match = originalClass.match(/(bg|text|border|ring|from|to|via)-/)
        if (!match) return
        
        const prefix = match[1]
        const newClass = `${prefix}-${themeToken}`
        
        // Replace all occurrences using regex for word boundaries
        const regex = new RegExp(`\\b${originalClass}\\b`, 'g')
        updatedCode = updatedCode.replace(regex, newClass)
      })
      
      // Save to database
      const res = await fetch(`/api/components/${component.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: updatedCode }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save changes')
      }
      
      // Update filesystem
      try {
        await fetch('/api/registry/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            code: updatedCode,
            componentName: component.component_name,
            variants: component.variants,
          }),
        })
      } catch (registryError) {
        console.warn('Registry update failed (may be on Vercel):', registryError)
      }
      
      toast.success('Styles remapped successfully!', { id: toastId })
      
      // Redirect to component page
      router.push(`/docs/components/${slug}`)
    } catch (error) {
      console.error('Error applying remapping:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to apply remapping', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">Loading component styles...</div>
      </div>
    )
  }

  if (!component || !theme) return null

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Remap Styles</h1>
            <p className="text-fg-caption">
              Map hardcoded colors to theme tokens
            </p>
          </div>
        </div>
        <Button 
          onClick={applyRemapping} 
          disabled={saving || detectedStyles.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Apply Remapping'}
        </Button>
      </div>

      {/* Active Theme */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Palette className="h-8 w-8 text-primary-bg" />
          <div>
            <h2 className="text-lg font-semibold">{theme.name}</h2>
            <p className="text-sm text-fg-caption">Active Theme</p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(theme.colors).slice(0, 12).map(([name, hsl]) => (
            <div key={name} className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-md border border-fg-stroke-ui shadow-sm"
                style={{ backgroundColor: `hsl(${hsl})` }}
              />
              <span className="text-xs font-mono">{name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Component Info */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{component.name}</h2>
            <p className="text-sm text-fg-caption">{component.description}</p>
          </div>
          <Badge variant="outline">{component.category}</Badge>
        </div>
      </Card>

      {/* Style Mappings */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Component Color Styles</h2>
          <p className="text-sm text-fg-caption mt-1">
            {detectedStyles.length} color style{detectedStyles.length !== 1 ? 's' : ''} detected (includes both theme tokens and hardcoded values)
          </p>
        </div>
        
        {detectedStyles.length === 0 ? (
          <Card className="p-12 text-center">
            <Palette className="h-16 w-16 mx-auto mb-4 text-fg-caption/50" />
            <h3 className="text-lg font-semibold mb-2">No Color Styles Detected</h3>
            <p className="text-fg-caption">
              This component doesn't use any color classes (bg, text, border, etc.)
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {detectedStyles.map((style, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between gap-6">
                  {/* Current Style */}
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-fg-stroke-ui shadow-sm flex-shrink-0"
                      style={{ backgroundColor: getColorPreview(style.value, theme) }}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-bg-neutral px-3 py-1.5 rounded-md">
                          {style.fullMatch}
                        </code>
                        {Object.keys(theme.colors).includes(style.value) ? (
                          <Badge variant="default" className="text-xs">
                            Theme Token
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Hardcoded
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-fg-caption">
                        Current class
                      </p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <ArrowRight className="h-6 w-6 text-fg-caption flex-shrink-0" />
                  
                  {/* Theme Token Selector */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <Label htmlFor={`mapping-${index}`} className="text-xs mb-2 block">
                        Map to theme token
                      </Label>
                      <select
                        id={`mapping-${index}`}
                        value={mappings[style.fullMatch]}
                        onChange={(e) => updateMapping(style.fullMatch, e.target.value)}
                        className="w-full px-3 py-2 border border-fg-stroke-ui rounded-md text-sm bg-bg-white"
                      >
                        {Object.keys(theme.colors).map((tokenName) => (
                          <option key={tokenName} value={tokenName}>
                            {style.prefix}-{tokenName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-fg-stroke-ui shadow-sm flex-shrink-0"
                      style={{
                        backgroundColor: `hsl(${theme.colors[mappings[style.fullMatch]]})`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

