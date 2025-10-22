'use client'

import { useTheme } from './theme-provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Palette } from 'lucide-react'

/**
 * Theme Switcher for Admin Panel
 * Allows admins to preview different themes without activating them globally
 */
export function ThemeSwitcherAdmin() {
  const { theme, themes, loading, setActiveTheme } = useTheme()

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-fg-caption">
        <Palette className="h-4 w-4 animate-pulse" />
        <span>Loading themes...</span>
      </div>
    )
  }

  if (themes.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <Palette className="h-4 w-4 text-fg-caption" />
      <div className="flex items-center gap-2">
        <Label htmlFor="theme-select" className="text-sm font-normal">
          Theme:
        </Label>
        <Select
          value={theme?.id || ''}
          onValueChange={(value) => setActiveTheme(value)}
        >
          <SelectTrigger id="theme-select" className="w-[180px]">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            {themes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full border"
                    style={{
                      backgroundColor: `hsl(${t.colors.primary || '221 83% 53%'})`,
                    }}
                  />
                  {t.name}
                  {t.is_active && (
                    <span className="text-xs text-green-600">(Active)</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

