/**
 * Code Mapper
 * Applies user mappings to component code
 */

export interface SpecToThemeMappings {
  colors: Array<{ issueId: string; hexValue: string; themeToken: string }>
  spacing: Array<{ issueId: string; property: string; tailwindClass: string }>
  variants: Array<{ issueId: string; variantKey: string; values: string[] }>
}

/**
 * Apply user mappings to component code
 */
export function applyMappingsToCode(
  originalCode: string,
  mappings: SpecToThemeMappings
): string {
  console.log('🔧 Starting code mapping...')
  console.log('Original code length:', originalCode.length)
  console.log('Mappings:', {
    colors: mappings.colors.length,
    spacing: mappings.spacing.length,
    variants: mappings.variants.length,
  })
  
  let updatedCode = originalCode
  
  // Apply color mappings (replace hex values with theme tokens)
  for (const colorMapping of mappings.colors) {
    const { hexValue, themeToken } = colorMapping
    console.log(`🎨 Replacing color ${hexValue} with ${themeToken}`)
    
    const beforeLength = updatedCode.length
    // Replace hex values in className strings
    // Pattern: className="... #047857 ..." or style={{background: '#047857'}}
    updatedCode = updatedCode.replace(
      new RegExp(hexValue.replace(/[#]/g, '\\$&'), 'gi'),
      themeToken
    )
    
    const replaced = beforeLength !== updatedCode.length
    console.log(`  ${replaced ? '✅ Replaced' : '❌ No match found'}`)
  }
  
  // Apply spacing mappings
  // Group by property type to avoid cascading overwrites
  const spacingByType: Record<string, string[]> = {}
  
  for (const spacingMapping of mappings.spacing) {
    const { property, tailwindClass, issueId } = spacingMapping
    const cleanClass = tailwindClass.split(' ')[0] // Remove description
    
    let propertyType = 'other'
    if (property.toLowerCase().includes('height')) {
      propertyType = 'height'
    } else if (property.toLowerCase().includes('padding')) {
      propertyType = 'padding'
    } else if (property.toLowerCase().includes('gap')) {
      propertyType = 'gap'
    }
    
    if (!spacingByType[propertyType]) {
      spacingByType[propertyType] = []
    }
    spacingByType[propertyType].push(cleanClass)
    
    console.log(`📏 Queued spacing: ${property} = ${cleanClass} (type: ${propertyType}, issueId: ${issueId})`)
  }
  
  // Apply each property type once with the LAST value (most specific)
  for (const [propertyType, classes] of Object.entries(spacingByType)) {
    const finalClass = classes[classes.length - 1] // Use the last one
    console.log(`📐 Applying final ${propertyType} class: ${finalClass}`)
    
    if (propertyType === 'height') {
      updatedCode = replaceInCvaVariant(updatedCode, 'size', /h-\S+/, finalClass)
    } else if (propertyType === 'padding') {
      updatedCode = replaceInCvaVariant(updatedCode, 'size', /p[xy]?-\S+/, finalClass)
    } else if (propertyType === 'gap') {
      updatedCode = replaceInCvaVariant(updatedCode, 'size', /gap-\S+/, finalClass)
    }
  }
  
  // Apply variant mappings (add missing variants)
  for (const variantMapping of mappings.variants) {
    const { variantKey, values } = variantMapping
    console.log(`🔀 Adding variant: ${variantKey} with values:`, values)
    
    updatedCode = addVariantToCva(updatedCode, variantKey, values)
  }
  
  // CRITICAL FIX: Rename 'type' variant to 'variant' to avoid conflicts
  // This prevents errors with ButtonHTMLAttributes which has a 'type' prop
  console.log('🔧 Checking for "type" variant conflicts...')
  if (updatedCode.includes('type:') && updatedCode.includes('VariantProps')) {
    console.log('  ⚠️  Found "type" variant, renaming to "variant"')
    // Rename in cva definition
    updatedCode = updatedCode.replace(
      /(\btype):\s*\{/g,
      (match, p1, offset) => {
        // Only replace if it's inside the variants block
        const beforeText = updatedCode.substring(Math.max(0, offset - 200), offset)
        if (beforeText.includes('variants:')) {
          return 'variant: {'
        }
        return match
      }
    )
    // Rename in interface
    updatedCode = updatedCode.replace(/\btype\?:/g, 'variant?:')
    // Rename in destructuring
    updatedCode = updatedCode.replace(/,\s*type,/g, ', variant,')
    updatedCode = updatedCode.replace(/\{\s*type,/g, '{ variant,')
    console.log('  ✅ Renamed "type" to "variant"')
  }
  
  console.log('Updated code length:', updatedCode.length)
  console.log('Code changed:', originalCode !== updatedCode)
  
  return updatedCode
}

/**
 * Replace a class pattern within a cva() variant
 * More targeted approach: find specific variant and size, then replace
 */
function replaceInCvaVariant(
  code: string,
  variantName: string,
  pattern: RegExp,
  newClass: string
): string {
  console.log(`  🔍 Searching for ${pattern} in ${variantName} variant`)
  
  // Find the cva() call with variants
  const cvaMatch = code.match(/cva\([^,]*,\s*\{[\s\S]*?variants:\s*\{([\s\S]*?)\}[\s\S]*?\}[\s\S]*?\)/)
  if (!cvaMatch) {
    console.log('  ❌ No cva() found in code')
    return code
  }
  
  // Simply do a global replace of the pattern within className strings
  // This is more reliable than trying to parse cva structure
  const updatedCode = code.replace(pattern, (match) => {
    console.log(`  ✅ Replacing "${match}" with "${newClass}"`)
    return newClass
  })
  
  if (updatedCode === code) {
    console.log(`  ⚠️ No matches found for pattern ${pattern}`)
  }
  
  return updatedCode
}

/**
 * Add missing variant to cva() configuration
 */
function addVariantToCva(
  code: string,
  variantKey: string,
  values: string[]
): string {
  // Find the variants block in cva()
  const cvaMatch = code.match(/cva\([^,]*,\s*\{[\s\S]*?variants:\s*\{([\s\S]*?)\}/)
  if (!cvaMatch) return code
  
  const variantsBlock = cvaMatch[1]
  
  // Check if variant already exists
  const variantPattern = new RegExp(`${variantKey}:\\s*\\{`, 'i')
  if (variantPattern.test(variantsBlock)) {
    // Variant exists, update it to include missing values
    return addValuesToExistingVariant(code, variantKey, values)
  }
  
  // Variant doesn't exist, add it
  const newVariantBlock = generateVariantBlock(variantKey, values)
  
  // Insert before the closing brace of variants
  const insertPosition = cvaMatch[0].lastIndexOf('}')
  const updatedCva = 
    cvaMatch[0].slice(0, insertPosition) +
    `,\n    ${newVariantBlock}\n  ` +
    cvaMatch[0].slice(insertPosition)
  
  return code.replace(cvaMatch[0], updatedCva)
}

/**
 * Add values to existing variant
 */
function addValuesToExistingVariant(
  code: string,
  variantKey: string,
  values: string[]
): string {
  // Find the specific variant block
  const variantPattern = new RegExp(
    `${variantKey}:\\s*\\{([^}]+)\\}`,
    'i'
  )
  const variantMatch = code.match(variantPattern)
  if (!variantMatch) return code
  
  const existingContent = variantMatch[1]
  const existingValues = Array.from(
    existingContent.matchAll(/(\w+):/g)
  ).map(m => m[1])
  
  // Find missing values
  const missingValues = values.filter(v => !existingValues.includes(v))
  
  if (missingValues.length === 0) return code
  
  // Generate new variant entries
  const newEntries = missingValues.map(value => 
    `      ${value}: "/* Add styles for ${value} */",`
  ).join('\n')
  
  // Insert before closing brace
  const updatedVariant = variantMatch[0].replace(
    /\s*\}/,
    `,\n${newEntries}\n    }`
  )
  
  return code.replace(variantMatch[0], updatedVariant)
}

/**
 * Generate a complete variant block
 */
function generateVariantBlock(variantKey: string, values: string[]): string {
  const entries = values.map(value => 
    `      ${value}: "/* Add styles for ${value} */",`
  ).join('\n')
  
  return `${variantKey}: {\n${entries}\n    }`
}

