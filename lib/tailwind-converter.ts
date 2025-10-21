/**
 * Tailwind ↔ Pixel Converter
 * Bidirectional conversion between Tailwind classes and pixel values
 */

// Comprehensive mapping tables
const SPACING_MAP: Record<string, number> = {
  '0': 0,
  'px': 1,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
}

const FONT_SIZE_MAP: Record<string, number> = {
  'xs': 12,
  'sm': 14,
  'base': 16,
  'lg': 18,
  'xl': 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
}

const FONT_WEIGHT_MAP: Record<string, number> = {
  'thin': 100,
  'extralight': 200,
  'light': 300,
  'normal': 400,
  'medium': 500,
  'semibold': 600,
  'bold': 700,
  'extrabold': 800,
  'black': 900,
}

/**
 * Convert pixels to Tailwind class
 */
export function pixelsToTailwind(property: string, pixels: number): string {
  const prefix = getPropertyPrefix(property)
  
  if (!prefix) return `${pixels}px`
  
  // Find exact match in spacing map
  const spacingKey = Object.keys(SPACING_MAP).find(
    (key) => SPACING_MAP[key] === pixels
  )
  
  if (spacingKey) {
    return `${prefix}-${spacingKey}`
  }
  
  // Use arbitrary value for non-standard sizes
  return `${prefix}-[${pixels}px]`
}

/**
 * Convert Tailwind class to pixels
 */
export function tailwindToPixels(property: string, className: string): number | null {
  // Handle arbitrary values: h-[42px]
  const arbitraryMatch = className.match(/\[(\d+)px\]/)
  if (arbitraryMatch) {
    return parseInt(arbitraryMatch[1], 10)
  }
  
  // Extract the numeric part
  const prefix = getPropertyPrefix(property)
  if (!prefix) return null
  
  const pattern = new RegExp(`${prefix}-(\\S+)`)
  const match = className.match(pattern)
  
  if (!match) return null
  
  const value = match[1]
  
  // Check spacing map
  if (SPACING_MAP[value] !== undefined) {
    return SPACING_MAP[value]
  }
  
  // Check font size map
  if (FONT_SIZE_MAP[value] !== undefined) {
    return FONT_SIZE_MAP[value]
  }
  
  return null
}

/**
 * Convert font size Tailwind to pixels
 */
export function fontSizeToPixels(className: string): number | null {
  const match = className.match(/text-(\S+)/)
  if (!match) return null
  
  const value = match[1]
  return FONT_SIZE_MAP[value] || null
}

/**
 * Convert pixels to font size Tailwind
 */
export function pixelsToFontSize(pixels: number): string {
  const sizeKey = Object.keys(FONT_SIZE_MAP).find(
    (key) => FONT_SIZE_MAP[key] === pixels
  )
  
  return sizeKey ? `text-${sizeKey}` : `text-[${pixels}px]`
}

/**
 * Convert font weight Tailwind to numeric value
 */
export function fontWeightToNumber(className: string): number | null {
  const match = className.match(/font-(\S+)/)
  if (!match) return null
  
  const value = match[1]
  return FONT_WEIGHT_MAP[value] || null
}

/**
 * Convert numeric font weight to Tailwind
 */
export function numberToFontWeight(weight: number): string {
  const weightKey = Object.keys(FONT_WEIGHT_MAP).find(
    (key) => FONT_WEIGHT_MAP[key] === weight
  )
  
  return weightKey ? `font-${weightKey}` : `font-[${weight}]`
}

/**
 * Check if value is an arbitrary Tailwind value
 */
export function isArbitraryValue(value: string): boolean {
  return /\[.+\]/.test(value)
}

/**
 * Get Tailwind prefix for CSS property
 */
function getPropertyPrefix(property: string): string | null {
  const prefixMap: Record<string, string> = {
    'height': 'h',
    'width': 'w',
    'padding': 'p',
    'paddingTop': 'pt',
    'paddingRight': 'pr',
    'paddingBottom': 'pb',
    'paddingLeft': 'pl',
    'paddingX': 'px',
    'paddingY': 'py',
    'margin': 'm',
    'marginTop': 'mt',
    'marginRight': 'mr',
    'marginBottom': 'mb',
    'marginLeft': 'ml',
    'marginX': 'mx',
    'marginY': 'my',
    'gap': 'gap',
    'gapX': 'gap-x',
    'gapY': 'gap-y',
    'borderRadius': 'rounded',
    'fontSize': 'text',
    'fontWeight': 'font',
    'lineHeight': 'leading',
  }
  
  return prefixMap[property] || null
}

/**
 * Get all available Tailwind spacing options
 */
export function getSpacingOptions(): Array<{ label: string; value: string; pixels: number }> {
  return Object.keys(SPACING_MAP).map((key) => ({
    label: `${key} (${SPACING_MAP[key]}px)`,
    value: key,
    pixels: SPACING_MAP[key],
  }))
}

/**
 * Get all available font size options
 */
export function getFontSizeOptions(): Array<{ label: string; value: string; pixels: number }> {
  return Object.keys(FONT_SIZE_MAP).map((key) => ({
    label: `${key} (${FONT_SIZE_MAP[key]}px)`,
    value: key,
    pixels: FONT_SIZE_MAP[key],
  }))
}

/**
 * Get all available font weight options
 */
export function getFontWeightOptions(): Array<{ label: string; value: string; weight: number }> {
  return Object.keys(FONT_WEIGHT_MAP).map((key) => ({
    label: `${key} (${FONT_WEIGHT_MAP[key]})`,
    value: key,
    weight: FONT_WEIGHT_MAP[key],
  }))
}

/**
 * Parse a complete className string and extract specific property
 */
export function extractPropertyFromClasses(
  classNames: string,
  property: string
): string | null {
  const prefix = getPropertyPrefix(property)
  if (!prefix) return null
  
  const classes = classNames.split(/\s+/)
  const pattern = new RegExp(`^${prefix}-`)
  
  const match = classes.find((cls) => pattern.test(cls))
  return match || null
}

/**
 * Replace a property in className string
 */
export function replacePropertyInClasses(
  classNames: string,
  property: string,
  newValue: string
): string {
  const prefix = getPropertyPrefix(property)
  if (!prefix) return classNames
  
  const classes = classNames.split(/\s+/)
  const pattern = new RegExp(`^${prefix}-`)
  
  const filteredClasses = classes.filter((cls) => !pattern.test(cls))
  filteredClasses.push(newValue)
  
  return filteredClasses.join(' ')
}

