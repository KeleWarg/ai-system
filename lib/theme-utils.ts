import type { Theme } from './supabase'

/**
 * Generate CSS variables from theme object
 */
export function generateThemeCSS(theme: Theme): string {
  const cssVars: string[] = []

  // Add colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars.push(`  --${key}: ${value};`)
  })

  // Add typography
  if (theme.typography) {
    Object.entries(theme.typography).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          cssVars.push(`  --${key}-${subKey}: ${subValue};`)
        })
      } else {
        cssVars.push(`  --${key}: ${value};`)
      }
    })
  }

  // Add spacing
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      cssVars.push(`  --spacing-${key}: ${value};`)
    })
  }

  // Add radius
  if (theme.radius) {
    cssVars.push(`  --radius: ${theme.radius};`)
  }

  return `:root {\n${cssVars.join('\n')}\n}`
}

/**
 * Apply theme to document root
 */
export function applyThemeToDOM(theme: Theme) {
  if (typeof window === 'undefined') return

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

/**
 * Validate HSL color format
 */
export function isValidHSL(value: string): boolean {
  // HSL format: "H S% L%" (e.g., "222.2 47.4% 11.2%")
  const hslRegex = /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/
  return hslRegex.test(value.trim())
}

/**
 * Validate theme colors
 */
export function validateThemeColors(colors: Record<string, string>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const requiredColors = [
    'background',
    'foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
  ]

  // Check required colors
  for (const color of requiredColors) {
    if (!colors[color]) {
      errors.push(`Missing required color: ${color}`)
    } else if (!isValidHSL(colors[color])) {
      errors.push(`Invalid HSL format for ${color}: ${colors[color]}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Convert hex to HSL
 */
export function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '')

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  // Convert to HSL format (H S% L%)
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Create default theme
 */
export function createDefaultTheme(): Omit<Theme, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: 'Default Theme',
    slug: 'default',
    colors: {
      background: '0 0% 100%',
      foreground: '222.2 47.4% 11.2%',
      card: '0 0% 100%',
      'card-foreground': '222.2 47.4% 11.2%',
      popover: '0 0% 100%',
      'popover-foreground': '222.2 47.4% 11.2%',
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
    },
    typography: {},
    spacing: {},
    radius: '0.5rem',
    is_active: true,
  }
}

