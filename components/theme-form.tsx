'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Loader2, Plus, X, Search, Copy, Check } from 'lucide-react'
import { ColorPicker } from './color-picker'
import type { Theme, ThemeFont, ResponsiveValue } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { DEFAULT_COLORS, COLOR_CATEGORIES, COLOR_LABELS } from '@/lib/color-system'
import { DEFAULT_TYPOGRAPHY, FONT_SIZE_KEYS, LINE_HEIGHT_KEYS, FONT_WEIGHT_KEYS, LETTER_SPACING_KEYS } from '@/lib/typography-system'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface ThemeFormProps {
  theme?: Theme
}

export function ThemeForm({ theme }: ThemeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: theme?.name || '',
    slug: theme?.slug || '',
    colors: theme?.colors || DEFAULT_COLORS,
    typography: theme?.typography || DEFAULT_TYPOGRAPHY,
    spacing: theme?.spacing || {
      '2xs': '2px',
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '40px',
      '4xl': '48px',
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
        console.error('API Error Response:', error)
        const errorMessage = error.details || error.error || 'Failed to save theme'
        throw new Error(errorMessage)
      }

      router.push('/admin/themes')
      router.refresh()
    } catch (error) {
      console.error('Error saving theme:', error)
      const message = error instanceof Error ? error.message : 'Failed to save theme'
      alert(`Error: ${message}`)
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

  const copyTokenValue = (tokenKey: string) => {
    const value = (formData.colors as Record<string, string>)[tokenKey] || (DEFAULT_COLORS as Record<string, string>)[tokenKey]
    navigator.clipboard.writeText(value)
    setCopiedToken(tokenKey)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const filterColorsBySearch = (colors: readonly string[]) => {
    if (!searchQuery.trim()) return [...colors]
    const query = searchQuery.toLowerCase()
    return colors.filter(key => {
      const label = (COLOR_LABELS as Record<string, string>)[key] || key
      return key.toLowerCase().includes(query) || label.toLowerCase().includes(query)
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

  const updateResponsiveValue = (
    category: 'fontSize' | 'lineHeight',
    key: string,
    device: 'desktop' | 'tablet' | 'mobile',
    value: string
  ) => {
    const current = (formData.typography[category] || {}) as Record<string, ResponsiveValue>
    const currentValue = current[key] || { desktop: '', tablet: '', mobile: '' }

    setFormData({
      ...formData,
      typography: {
        ...formData.typography,
        [category]: {
          ...current,
          [key]: {
            ...currentValue,
            [device]: value,
          },
        },
      },
    })
  }

  const updateFontWeight = (key: string, value: string) => {
    setFormData({
      ...formData,
      typography: {
        ...formData.typography,
        fontWeight: {
          ...(formData.typography.fontWeight || {}),
          [key]: value,
        },
      },
    })
  }

  const updateLetterSpacing = (key: string, value: string) => {
    setFormData({
      ...formData,
      typography: {
        ...formData.typography,
        letterSpacing: {
          ...(formData.typography.letterSpacing || {}),
          [key]: value,
        },
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
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <p className="text-sm text-fg-caption">
            Configure fonts, sizes, line heights, weights, and letter spacing
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fonts">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="fonts">Fonts</TabsTrigger>
              <TabsTrigger value="sizes">Sizes</TabsTrigger>
              <TabsTrigger value="lineHeight">Line Height</TabsTrigger>
              <TabsTrigger value="weights">Weights</TabsTrigger>
              <TabsTrigger value="spacing">Letter Spacing</TabsTrigger>
            </TabsList>

            {/* Fonts Tab */}
            <TabsContent value="fonts" className="space-y-4 mt-4">
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={addFont} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Font
                </Button>
              </div>
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
                        placeholder="e.g., 300, 400, 500, 600, 700"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Custom Font URL (optional)</Label>
                      <Input
                        value={font.url || ''}
                        onChange={(e) => updateFont(index, { url: e.target.value })}
                        placeholder="https://fonts.googleapis.com/..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Font Sizes Tab */}
            <TabsContent value="sizes" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-fg-caption px-2">
                  <div>Name</div>
                  <div>Desktop</div>
                  <div>Tablet</div>
                  <div>Mobile</div>
                </div>
                {FONT_SIZE_KEYS.map((key) => {
                  const value = (formData.typography.fontSize || {})[key] || { desktop: '', tablet: '', mobile: '' }
                  return (
                    <div key={key} className="grid grid-cols-4 gap-2 items-center">
                      <Label className="text-xs">{key}</Label>
                      <Input
                        value={value.desktop}
                        onChange={(e) => updateResponsiveValue('fontSize', key, 'desktop', e.target.value)}
                        placeholder="56px"
                        className="text-xs"
                      />
                      <Input
                        value={value.tablet}
                        onChange={(e) => updateResponsiveValue('fontSize', key, 'tablet', e.target.value)}
                        placeholder="48px"
                        className="text-xs"
                      />
                      <Input
                        value={value.mobile}
                        onChange={(e) => updateResponsiveValue('fontSize', key, 'mobile', e.target.value)}
                        placeholder="32px"
                        className="text-xs"
                      />
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* Line Height Tab */}
            <TabsContent value="lineHeight" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-fg-caption px-2">
                  <div>Name</div>
                  <div>Desktop</div>
                  <div>Tablet</div>
                  <div>Mobile</div>
                </div>
                {LINE_HEIGHT_KEYS.map((key) => {
                  const value = (formData.typography.lineHeight || {})[key] || { desktop: '', tablet: '', mobile: '' }
                  return (
                    <div key={key} className="grid grid-cols-4 gap-2 items-center">
                      <Label className="text-xs">line-height-{key}</Label>
                      <Input
                        value={value.desktop}
                        onChange={(e) => updateResponsiveValue('lineHeight', key, 'desktop', e.target.value)}
                        placeholder="68px"
                        className="text-xs"
                      />
                      <Input
                        value={value.tablet}
                        onChange={(e) => updateResponsiveValue('lineHeight', key, 'tablet', e.target.value)}
                        placeholder="58px"
                        className="text-xs"
                      />
                      <Input
                        value={value.mobile}
                        onChange={(e) => updateResponsiveValue('lineHeight', key, 'mobile', e.target.value)}
                        placeholder="40px"
                        className="text-xs"
                      />
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* Font Weights Tab */}
            <TabsContent value="weights" className="space-y-4 mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {FONT_WEIGHT_KEYS.map((key) => (
                  <div key={key}>
                    <Label htmlFor={`weight-${key}`} className="text-xs">
                      font-weight-{key}
                    </Label>
                    <Input
                      id={`weight-${key}`}
                      value={(formData.typography.fontWeight || {})[key] || ''}
                      onChange={(e) => updateFontWeight(key, e.target.value)}
                      placeholder="400"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Letter Spacing Tab */}
            <TabsContent value="spacing" className="space-y-4 mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {LETTER_SPACING_KEYS.map((key) => (
                  <div key={key}>
                    <Label htmlFor={`spacing-${key}`} className="text-xs">
                      spacing-{key}
                    </Label>
                    <Input
                      id={`spacing-${key}`}
                      value={(formData.typography.letterSpacing || {})[key] || ''}
                      onChange={(e) => updateLetterSpacing(key, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing Scale</CardTitle>
          <p className="text-sm text-fg-caption">
            Define spacing values in pixels for consistent layout
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'].map((size) => (
              <div key={size}>
                <Label htmlFor={`spacing-${size}`} className="text-xs font-medium">
                  spacing-{size}
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
                  placeholder="e.g., 12px"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Colors (HSL Format)</CardTitle>
              <p className="text-sm text-fg-caption mt-1">
                Use HSL format (H S% L%) - Example: 221 83% 53%
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-fg-caption">
              <span className="font-medium">
                {Object.keys(formData.colors).length} tokens
              </span>
            </div>
          </div>
          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-caption" />
            <Input
              type="text"
              placeholder="Search color tokens (e.g., 'primary', 'button', 'hover')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['Button / Primary', 'Background']} className="w-full">
            {Object.entries(COLOR_CATEGORIES).map(([category, colors]) => {
              const filteredColors = filterColorsBySearch(colors)
              if (filteredColors.length === 0 && searchQuery.trim()) return null
              
              return (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>{category}</span>
                      <span className="text-xs font-normal text-fg-caption">
                        ({filteredColors.length}/{colors.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 sm:grid-cols-2 pt-4">
                      {filteredColors.map((colorKey) => (
                        <div key={colorKey} className="relative">
                          <ColorPicker
                            id={colorKey}
                            label={(COLOR_LABELS as Record<string, string>)[colorKey] || colorKey}
                            value={(formData.colors as Record<string, string>)[colorKey] || (DEFAULT_COLORS as Record<string, string>)[colorKey]}
                            onChange={(value) => handleColorChange(colorKey, value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0 h-6 w-6 p-0"
                            onClick={() => copyTokenValue(colorKey)}
                            title="Copy HSL value"
                          >
                            {copiedToken === colorKey ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
          {searchQuery.trim() && Object.entries(COLOR_CATEGORIES).every(([_, colors]) => filterColorsBySearch(colors).length === 0) && (
            <div className="text-center py-8 text-fg-caption">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No color tokens match &quot;{searchQuery}&quot;</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            </div>
          )}
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
