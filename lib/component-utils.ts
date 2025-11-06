/**
 * Component utilities for name/slug transformations
 */

/**
 * Convert a slug to a valid TypeScript component export name
 * Examples:
 *   "button" -> "Button"
 *   "button-2" -> "Button2"
 *   "card-header" -> "CardHeader"
 *   "dropdown-menu-item" -> "DropdownMenuItem"
 */
export function slugToComponentName(slug: string): string {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * Convert a component name to a slug
 * Examples:
 *   "Button" -> "button"
 *   "Button2" -> "button-2"
 *   "CardHeader" -> "card-header"
 *   "DropdownMenuItem" -> "dropdown-menu-item"
 */
export function componentNameToSlug(componentName: string): string {
  return componentName
    // Insert hyphen before uppercase letters (except first)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Insert hyphen before numbers if preceded by letter
    .replace(/([a-z])([0-9])/g, '$1-$2')
    .toLowerCase()
}

/**
 * Validate that a component name is a valid TypeScript identifier
 */
export function isValidComponentName(name: string): boolean {
  // Must start with uppercase letter, contain only alphanumeric
  return /^[A-Z][a-zA-Z0-9]*$/.test(name)
}

/**
 * Convert any string to valid PascalCase component name
 * Examples:
 *   "Design System Layout" → "DesignSystemLayout"
 *   "my-component" → "MyComponent"
 *   "button_primary" → "ButtonPrimary"
 */
export function toPascalCase(name: string): string {
  return name
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Extract the exported component name from component code
 * Looks for patterns like:
 *   export const Button = ...
 *   export { Button }
 *   export function Button() { ... }
 */
export function extractComponentNameFromCode(code: string): string | null {
  // Match: export const Button = React.forwardRef...
  const constMatch = code.match(/export\s+const\s+([A-Z][a-zA-Z0-9]*)\s*=/)
  if (constMatch) return constMatch[1]
  
  // Match: export function Button(...) { ... }
  const functionMatch = code.match(/export\s+function\s+([A-Z][a-zA-Z0-9]*)\s*\(/)
  if (functionMatch) return functionMatch[1]
  
  // Match: export { Button }
  const namedExportMatch = code.match(/export\s+{\s*([A-Z][a-zA-Z0-9]*)\s*}/)
  if (namedExportMatch) return namedExportMatch[1]
  
  return null
}

