'use client'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Palette, Check } from 'lucide-react'
import { useState } from 'react'

export function ThemeSwitcher() {
  const { themes, theme, setActiveTheme, loading } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  if (loading || themes.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 z-50 rounded-md border border-border bg-popover shadow-lg">
            <div className="p-2">
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                Select Theme
              </div>
              <div className="space-y-1 mt-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={async () => {
                      await setActiveTheme(t.id)
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                  >
                    <div
                      className="h-4 w-4 rounded-full border border-border flex-shrink-0"
                      style={{ backgroundColor: `hsl(${t.colors.primary})` }}
                    />
                    <span className="flex-1">{t.name}</span>
                    {theme?.id === t.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

