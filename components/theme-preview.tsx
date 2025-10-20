'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Palette, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Theme } from '@/lib/supabase'

interface ThemePreviewProps {
  themes: Theme[]
}

export function ThemePreview({ themes }: ThemePreviewProps) {
  const activeTheme = themes.find((t) => t.is_active) || themes[0]
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(activeTheme || null)

  // Apply complete theme (colors, typography, spacing, radius)
  useEffect(() => {
    if (!selectedTheme) return

    const root = document.documentElement

    // Apply colors (hex format)
    if (selectedTheme.colors) {
      Object.entries(selectedTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, String(value))
      })
    }

    // Apply typography
    if (selectedTheme.typography) {
      const typo = selectedTheme.typography as any

      // Apply font families
      if (typo.fonts && Array.isArray(typo.fonts)) {
        // Apply primary font (first in list)
        if (typo.fonts[0]) {
          const primaryFont = typo.fonts[0]
          const fontFamily = primaryFont.fallback
            ? `${primaryFont.family}, ${primaryFont.fallback}`
            : primaryFont.family
          root.style.setProperty('--font-sans', fontFamily)

          // Load custom font if URL provided
          if (primaryFont.url) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = primaryFont.url
            document.head.appendChild(link)
          }
        }
      }

      // Apply font sizes
      if (typo.fontSize) {
        Object.entries(typo.fontSize).forEach(([key, value]) => {
          root.style.setProperty(`--font-size-${key}`, String(value))
        })
      }
    }

    // Apply spacing
    if (selectedTheme.spacing) {
      Object.entries(selectedTheme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, String(value))
      })
    }

    // Apply radius
    if (selectedTheme.radius) {
      root.style.setProperty('--radius', selectedTheme.radius)
    }

    return () => {
      // Restore original theme on unmount
      if (activeTheme) {
        if (activeTheme.colors) {
          Object.entries(activeTheme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, String(value))
          })
        }
        if (activeTheme.typography) {
          const typo = activeTheme.typography as any
          if (typo.fonts && typo.fonts[0]) {
            const primaryFont = typo.fonts[0]
            const fontFamily = primaryFont.fallback
              ? `${primaryFont.family}, ${primaryFont.fallback}`
              : primaryFont.family
            root.style.setProperty('--font-sans', fontFamily)
          }
        }
        if (activeTheme.spacing) {
          Object.entries(activeTheme.spacing).forEach(([key, value]) => {
            root.style.setProperty(`--spacing-${key}`, String(value))
          })
        }
        if (activeTheme.radius) {
          root.style.setProperty('--radius', activeTheme.radius)
        }
      }
    }
  }, [selectedTheme, activeTheme])

  if (themes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Palette className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No themes yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Themes will appear here once they&apos;re created in the admin panel.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <Badge variant="secondary" className="text-xs">
            {themes.length} {themes.length === 1 ? 'Theme' : 'Themes'}
          </Badge>
        </div>
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            Pick a Theme. Make it yours.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Try our hand-picked themes. Click to preview how components adapt to different styles in real-time.
          </p>
        </div>

        {/* Theme Selector */}
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all',
                selectedTheme?.id === theme.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Components */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Component Preview</h2>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Live Preview
          </Badge>
        </div>

        {/* Sample Components Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Example */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Card Component
              </h3>
              <p className="text-sm text-muted-foreground">
                This is how cards will look with the selected theme.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" variant="outline">Outline</Button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold">$15,231.89</p>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">+20.1%</span> from last month
            </p>
          </div>

          {/* Buttons Showcase */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Button Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Badge Examples */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          {/* Alert Example */}
          <div className="md:col-span-2 rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Theme Applied Successfully</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              All components are now using the <span className="font-medium text-foreground">{selectedTheme?.name}</span> theme.
              Notice how colors, spacing, borders, and typography have adapted to match.
            </p>
          </div>
        </div>

        {/* Theme Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Color Palette */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Color Palette</h3>
            <div className="grid grid-cols-3 gap-3">
              {selectedTheme?.colors && Object.entries(selectedTheme.colors).slice(0, 9).map(([name, value]) => (
                <div key={name} className="space-y-2">
                  <div
                    className="h-16 rounded-md border shadow-sm"
                    style={{
                      backgroundColor: String(value)
                    }}
                  />
                  <p className="text-xs font-medium capitalize truncate">
                    {name.replace(/-/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Properties */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Theme Properties</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Border Radius:</span>
                <span className="font-mono">{selectedTheme?.radius || '0.5rem'}</span>
              </div>
              {selectedTheme?.typography && (
                <>
                  {(selectedTheme.typography as any).fonts && (selectedTheme.typography as any).fonts[0] && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary Font:</span>
                      <span className="font-mono text-xs">
                        {(selectedTheme.typography as any).fonts[0].family}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fonts Count:</span>
                    <span className="font-mono">
                      {(selectedTheme.typography as any).fonts?.length || 0}
                    </span>
                  </div>
                </>
              )}
              {selectedTheme?.spacing && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Spacing:</span>
                  <span className="font-mono">
                    {(selectedTheme.spacing as any).md || '1rem'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-muted/50 p-6">
          <h3 className="font-semibold mb-2">About Themes</h3>
          <p className="text-sm text-muted-foreground">
            Themes define the complete visual appearance of all components including colors, typography,
            spacing, and border styles. The preview above updates in real-time to show how your entire
            design system adapts to different themes.
          </p>
        </div>
      </div>
    </div>
  )
}
