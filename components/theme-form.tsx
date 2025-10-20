'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Loader2 } from 'lucide-react'
import type { Theme } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

interface ThemeFormProps {
  theme?: Theme
}

export function ThemeForm({ theme }: ThemeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: theme?.name || '',
    slug: theme?.slug || '',
    colors: theme?.colors || {
      background: '0 0% 100%',
      foreground: '222.2 47.4% 11.2%',
      primary: '222.2 47.4% 11.2%',
      'primary-foreground': '210 40% 98%',
      'primary-hover': '222.2 47.4% 20%',
      secondary: '210 40% 96.1%',
      'secondary-foreground': '222.2 47.4% 11.2%',
      'secondary-hover': '210 40% 90%',
      muted: '210 40% 96.1%',
      'muted-foreground': '215.4 16.3% 46.9%',
      accent: '210 40% 96.1%',
      'accent-foreground': '222.2 47.4% 11.2%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '210 40% 98%',
      'destructive-hover': '0 84.2% 50%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 84% 4.9%',
      card: '0 0% 100%',
      popover: '0 0% 100%',
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

  const colorFields = [
    { key: 'background', label: 'Background' },
    { key: 'foreground', label: 'Foreground' },
    { key: 'primary', label: 'Primary' },
    { key: 'primary-foreground', label: 'Primary Foreground' },
    { key: 'primary-hover', label: 'Primary Hover' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'secondary-foreground', label: 'Secondary Foreground' },
    { key: 'secondary-hover', label: 'Secondary Hover' },
    { key: 'muted', label: 'Muted' },
    { key: 'muted-foreground', label: 'Muted Foreground' },
    { key: 'accent', label: 'Accent' },
    { key: 'accent-foreground', label: 'Accent Foreground' },
    { key: 'destructive', label: 'Destructive' },
    { key: 'destructive-foreground', label: 'Destructive Foreground' },
    { key: 'destructive-hover', label: 'Destructive Hover' },
    { key: 'border', label: 'Border' },
  ]

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
            <p className="text-xs text-muted-foreground mt-1">
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
            <p className="text-xs text-muted-foreground mt-1">
              Default border radius for components (e.g., 0.5rem, 8px)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Colors (HSL Format)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use HSL format: &quot;H S% L%&quot; (e.g., &quot;222.2 47.4% 11.2%&quot;)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {colorFields.map(({ key, label }) => (
              <div key={key}>
                <Label htmlFor={key} className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border border-border"
                    style={{ backgroundColor: `hsl(${formData.colors[key]})` }}
                  />
                  {label}
                </Label>
                <Input
                  id={key}
                  value={formData.colors[key] || ''}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  placeholder="H S% L%"
                  required
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {theme ? 'Update Theme' : 'Create Theme'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

