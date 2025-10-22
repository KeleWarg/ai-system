/**
 * Tailwind-compatible color system using HSL format
 * Format: "H S% L%" (e.g., "240 5.9% 10%" for a dark blue)
 * These map directly to CSS variables that Tailwind classes use
 */
export const DEFAULT_COLORS = {
  // Base colors
  'background': '0 0% 100%',           // White
  'foreground': '240 10% 3.9%',        // Near black
  
  // Card colors
  'card': '0 0% 100%',                 // White
  'card-foreground': '240 10% 3.9%',   // Near black
  
  // Popover colors
  'popover': '0 0% 100%',              // White
  'popover-foreground': '240 10% 3.9%', // Near black
  
  // Primary colors (main brand color - default: blue)
  'primary': '221 83% 53%',            // Blue #3B82F6
  'primary-foreground': '0 0% 98%',    // White
  'primary-hover': '221 83% 45%',      // Darker blue hover
  
  // Secondary colors (muted, subtle)
  'secondary': '240 4.8% 95.9%',       // Light gray
  'secondary-foreground': '240 5.9% 10%', // Dark gray
  'secondary-hover': '240 4.8% 90%',   // Slightly darker gray
  
  // Muted colors (backgrounds, disabled states)
  'muted': '240 4.8% 95.9%',           // Light gray
  'muted-foreground': '240 3.8% 46.1%', // Mid gray
  
  // Accent colors (highlights, badges)
  'accent': '240 4.8% 95.9%',          // Light gray
  'accent-foreground': '240 5.9% 10%', // Dark gray
  
  // Destructive colors (errors, delete actions)
  'destructive': '0 84.2% 60.2%',      // Red
  'destructive-foreground': '0 0% 98%', // White
  'destructive-hover': '0 84.2% 50%',  // Darker red
  
  // Border colors
  'border': '240 5.9% 90%',            // Light gray border
  'input': '240 5.9% 90%',             // Input border
  'ring': '240 5.9% 10%',              // Focus ring (dark)
} as const

export const COLOR_CATEGORIES = {
  'Base': [
    'background',
    'foreground',
  ],
  'Primary (Brand)': [
    'primary',
    'primary-foreground',
    'primary-hover',
  ],
  'Secondary': [
    'secondary',
    'secondary-foreground',
    'secondary-hover',
  ],
  'Muted': [
    'muted',
    'muted-foreground',
  ],
  'Accent': [
    'accent',
    'accent-foreground',
  ],
  'Destructive (Error)': [
    'destructive',
    'destructive-foreground',
    'destructive-hover',
  ],
  'UI Elements': [
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'border',
    'input',
    'ring',
  ],
} as const

export const COLOR_LABELS: Record<string, string> = {
  'background': 'Background',
  'foreground': 'Foreground Text',
  'card': 'Card Background',
  'card-foreground': 'Card Text',
  'popover': 'Popover Background',
  'popover-foreground': 'Popover Text',
  'primary': 'Primary (Brand)',
  'primary-foreground': 'Primary Text',
  'primary-hover': 'Primary Hover',
  'secondary': 'Secondary Background',
  'secondary-foreground': 'Secondary Text',
  'secondary-hover': 'Secondary Hover',
  'muted': 'Muted Background',
  'muted-foreground': 'Muted Text',
  'accent': 'Accent Background',
  'accent-foreground': 'Accent Text',
  'destructive': 'Destructive (Error)',
  'destructive-foreground': 'Destructive Text',
  'destructive-hover': 'Destructive Hover',
  'border': 'Border',
  'input': 'Input Border',
  'ring': 'Focus Ring',
}
