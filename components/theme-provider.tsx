'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Theme } from '@/lib/supabase'

interface ThemeContextType {
  theme: Theme | null
  themes: Theme[]
  loading: boolean
  setActiveTheme: (themeId: string) => Promise<void>
  refreshThemes: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)

  // Load themes and active theme
  const loadThemes = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Get all themes
      const { data: allThemes } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: false })

      if (allThemes) {
        setThemes(allThemes as Theme[])
        
        // Find active theme
        const activeTheme = (allThemes as Theme[]).find((t) => t.is_active)
        if (activeTheme) {
          setTheme(activeTheme)
          applyTheme(activeTheme)
        }
      }
    } catch (error) {
      console.error('Error loading themes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Apply theme CSS variables
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement

    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Apply typography
    if (theme.typography) {
      Object.entries(theme.typography).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            root.style.setProperty(`--${key}-${subKey}`, String(subValue))
          })
        } else {
          root.style.setProperty(`--${key}`, String(value))
        }
      })
    }

    // Apply spacing
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, String(value))
      })
    }

    // Apply radius
    if (theme.radius) {
      root.style.setProperty('--radius', theme.radius)
    }
  }

  // Set active theme
  const setActiveTheme = async (themeId: string) => {
    try {
      const supabase = createClient()
      
      // Update theme to be active
      const { data, error } = await supabase
        .from('themes')
        .update({ is_active: true } as never)
        .eq('id', themeId)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setTheme(data as Theme)
        applyTheme(data as Theme)
      }

      // Refresh themes to update the list
      await loadThemes()
    } catch (error) {
      console.error('Error setting active theme:', error)
      throw error
    }
  }

  // Subscribe to theme changes
  useEffect(() => {
    loadThemes()

    const supabase = createClient()

    // Subscribe to theme changes
    const channel = supabase
      .channel('themes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'themes',
        },
        async (payload) => {
          console.log('Theme change detected:', payload)
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedTheme = payload.new as Theme
            
            // If this theme is now active, apply it
            if (updatedTheme.is_active) {
              setTheme(updatedTheme)
              applyTheme(updatedTheme)
            }
          }
          
          // Reload all themes
          await loadThemes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadThemes])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes,
        loading,
        setActiveTheme,
        refreshThemes: loadThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

