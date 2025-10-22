'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Loader2, Plus, X } from 'lucide-react'
import { ColorPicker } from './color-picker'
import type { Theme, ThemeFont } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { DEFAULT_COLORS, COLOR_CATEGORIES, COLOR_LABELS } from '@/lib/color-system'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface ThemeFormProps {
  theme?: Theme
}

export function ThemeForm({ theme }: ThemeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: theme?.name || '',
    slug: theme?.slug || '',
    colors: theme?.colors || DEFAULT_COLORS,
    typography: theme?.typography || {
      fonts: [
        {
          name: 'Primary',
          family: 'Inter',
          weights: ['400', '500', '600', '700'],
          fallback: 'sans-serif',
        },
      ] as ThemeFont[],
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
    },
    spacing: theme?.spacing || {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    radius: theme?.radius || '0.5rem',
    is_active: theme?.is_active || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = theme ? `/api/themes/${theme.id}` : '/api/themes'
      const method = theme ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save theme')
      }

      router.push('/admin/themes')
      router.refresh()
    } catch (error) {
      console.error('Error saving theme:', error)
      alert(error instanceof Error ? error.message : 'Failed to save theme')
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: theme ? formData.slug : slugify(name),
    })
  }

  const handleColorChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      colors: {
        ...formData.colors,
        [key]: value,
      },
    })
  }

  const addFont = () => {
    const newFont: ThemeFont = {
      name: `Font ${(formData.typography.fonts || []).length + 1}`,
      family: 'Inter',
      weights: ['400'],
      fallback: 'sans-serif',
    }
    setFormData({
      ...formData,
      typography: {
        ...formData.typography,
        fonts: [...(formData.typography.fonts || []), newFont],
      },
    })
  }

  const removeFont = (index: number) => {
    const fonts = [...(formData.typography.fonts || [])]
    fonts.splice(index, 1)
    setFormData({
      ...formData,
      typography: {
        ...formData.typography,
        fonts,
      },
    })
  }

  const updateFont = (index: number, updates: Partial<ThemeFont>) => {
    const fonts = [...(formData.typography.fonts || [])]
    fonts[index] = { ...fonts[index], ...updates }
    setFormData({
      ...formData,
      typography: {
        ...formData.typography,
        fonts,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Theme Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Ocean Blue"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., ocean-blue"
              required
            />
            <p className="text-xs text-fg-caption mt-1">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          <div>
            <Label htmlFor="radius">Border Radius</Label>
            <Input
              id="radius"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              placeholder="e.g., 0.5rem"
            />
            <p className="text-xs text-fg-caption mt-1">
              Default border radius for components (e.g., 0.5rem, 8px)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Typography</CardTitle>
            <Button type="button" size="sm" onClick={addFont} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Font
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fonts */}
          <div className="space-y-4">
            {(formData.typography.fonts || []).map((font, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Input
                      value={font.name}
                      onChange={(e) => updateFont(index, { name: e.target.value })}
                      className="text-sm font-medium max-w-xs"
                      placeholder="Font name"
                    />
                    {(formData.typography.fonts || []).length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFont(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Font Family</Label>
                      <Input
                        value={font.family}
                        onChange={(e) => updateFont(index, { family: e.target.value })}
                        placeholder="e.g., Inter"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fallback</Label>
                      <Input
                        value={font.fallback || ''}
                        onChange={(e) => updateFont(index, { fallback: e.target.value })}
                        placeholder="e.g., sans-serif"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Weights (comma-separated)</Label>
                    <Input
                      value={font.weights.join(', ')}
                      onChange={(e) =>
                        updateFont(index, {
                          weights: e.target.value.split(',').map((w) => w.trim()),
                        })
                      }
                      placeholder="e.g., 400, 500, 600, 700"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Custom Font URL (optional)</Label>
                    <Input
                      value={font.url || ''}
                      onChange={(e) => updateFont(index, { url: e.target.value })}
                      placeholder="https://fonts.googleapis.com/..."
                    />
                    <p className="text-xs text-fg-caption mt-1">
                      Google Fonts URL or custom @font-face URL
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Font Sizes */}
          <div>
            <Label className="mb-3 block">Font Sizes</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'].map((size) => (
                <div key={size}>
                  <Label htmlFor={`fontSize-${size}`} className="text-xs text-fg-caption">
                    {size}
                  </Label>
                  <Input
                    id={`fontSize-${size}`}
                    value={((formData.typography as any).fontSize || {})[size] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        typography: {
                          ...formData.typography,
                          fontSize: {
                            ...(formData.typography as any).fontSize,
                            [size]: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="e.g., 1rem"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((size) => (
              <div key={size}>
                <Label htmlFor={`spacing-${size}`} className="text-xs text-fg-caption">
                  {size}
                </Label>
                <Input
                  id={`spacing-${size}`}
                  value={(formData.spacing as any)[size] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      spacing: {
                        ...formData.spacing,
                        [size]: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., 1rem"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Colors (Hex Format)</CardTitle>
          <p className="text-sm text-fg-caption">
            Use hex format (#000000) or &quot;transparent&quot;
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Primary Button">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
              {Object.keys(COLOR_CATEGORIES).map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(COLOR_CATEGORIES).map(([category, colors]) => (
              <TabsContent key={category} value={category} className="space-y-4 mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {colors.map((colorKey) => (
                    <ColorPicker
                      key={colorKey}
                      id={colorKey}
                      label={COLOR_LABELS[colorKey] || colorKey}
                      value={formData.colors[colorKey] || DEFAULT_COLORS[colorKey]}
                      onChange={(value) => handleColorChange(colorKey, value)}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {theme ? 'Update Theme' : 'Create Theme'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
