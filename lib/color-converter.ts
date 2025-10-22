/**
 * Convert hex color to HSL format for Tailwind CSS v4
 */
export function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '')
  
  // Handle shorthand hex (e.g., #FFF)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  
  // Parse hex to RGB
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
  
  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360)
  const sPercent = Math.round(s * 100)
  const lPercent = Math.round(l * 100)
  
  return `${hDeg} ${sPercent}% ${lPercent}%`
}

/**
 * Convert HSL format to hex color
 */
export function hslToHex(hsl: string): string {
  // Parse HSL string (e.g., "221 83% 53%")
  const match = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/)
  if (!match) {
    throw new Error(`Invalid HSL format: ${hsl}`)
  }
  
  const h = parseInt(match[1]) / 360
  const s = parseInt(match[2]) / 100
  const l = parseInt(match[3]) / 100
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Extract hex colors from spec extraction and convert to HSL
 */
export function convertSpecColorsToHSL(colors: string[]): Record<string, string> {
  const converted: Record<string, string> = {}
  
  for (const colorEntry of colors) {
    // Parse "Purpose: #HEXCODE" format
    const match = colorEntry.match(/^(.+?):\s*#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    if (match) {
      const purpose = match[1].trim().toLowerCase()
      const hex = `#${match[2]}`
      const hsl = hexToHSL(hex)
      
      // Map common purposes to theme token names
      const purposeMap: Record<string, string> = {
        'primary background': 'primary',
        'primary bg': 'primary',
        'primary text': 'primary-foreground',
        'primary foreground': 'primary-foreground',
        'secondary background': 'secondary',
        'secondary bg': 'secondary',
        'secondary text': 'secondary-foreground',
        'background': 'background',
        'foreground': 'foreground',
        'text': 'foreground',
        'border': 'border',
        'border color': 'border',
        'muted background': 'muted',
        'muted': 'muted',
        'accent': 'accent',
        'destructive': 'destructive',
        'error': 'destructive',
      }
      
      const tokenName = purposeMap[purpose] || purpose.replace(/\s+/g, '-')
      converted[tokenName] = hsl
    }
  }
  
  return converted
}

