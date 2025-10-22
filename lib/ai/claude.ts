import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface GenerateComponentParams {
  name: string
  description: string
  category: string
  variants?: Record<string, string[]>
  props?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  theme?: {
    id: string
    name: string
    colors: Record<string, string>
  }
  colors?: string[]
  spacing?: string[]
}

export interface GeneratePromptsParams {
  componentName: string
  componentCode: string
  variants?: Record<string, string[]>
}

export interface GenerateDocsParams {
  componentName: string
  componentCode: string
}

export interface ExtractSpecParams {
  imageBase64: string
  imageMediaType: string
}

/**
 * Generate React component code using Claude
 */
export async function generateComponentCode(
  params: GenerateComponentParams
): Promise<string> {
  const variantsText = params.variants
    ? Object.entries(params.variants)
        .map(([key, values]) => `${key}: ${values.join(', ')}`)
        .join('\n')
    : 'No variants'

  const propsText = params.props?.length
    ? params.props.map((p) => `${p.name}: ${p.type} (${p.required ? 'required' : 'optional'}) - ${p.description}`).join('\n')
    : 'No props specified'

  // Build theme color mapping information
  let themeInfo = ''
  if (params.theme && params.colors && params.colors.length > 0) {
    themeInfo = `\n\nTheme Information:
Theme Name: ${params.theme.name}
Detected Colors in Spec: ${params.colors.join(', ')}

IMPORTANT - Color Mapping:
- Map detected colors to appropriate theme tokens from this theme:
  * primary: ${params.theme.colors.primary || 'Main brand color'}
  * secondary: ${params.theme.colors.secondary || 'Secondary actions'}
  * accent: ${params.theme.colors.accent || 'Highlighted elements'}
  * muted: ${params.theme.colors.muted || 'Subtle backgrounds'}
  * destructive: ${params.theme.colors.destructive || 'Error states'}
- NEVER use hardcoded hex colors like #3B82F6
- ALWAYS use Tailwind theme classes like bg-primary, text-foreground, border-border
- Example: If spec shows blue button, use bg-primary NOT bg-blue-500`
  }

  const spacingInfo = params.spacing?.length 
    ? `\n\n⚠️ CRITICAL - EXACT SPACING REQUIREMENTS (MUST MATCH):
${params.spacing.map(s => `• ${s}`).join('\n')}

📐 TAILWIND SPACING MAPPING TABLE (Use these EXACT mappings):

HEIGHTS:
• 24px = h-6       • 28px = h-7       • 32px = h-8
• 36px = h-9       • 40px = h-10      • 44px = h-11
• 48px = h-12      • 56px = h-14      • 64px = h-16

PADDING (Horizontal px-* / Vertical py-*):
• 4px = p-1        • 8px = p-2        • 12px = p-3
• 16px = p-4       • 20px = p-5       • 24px = p-6
• 32px = p-8       • 40px = p-10      • 48px = p-12

GAP (Space between elements):
• 4px = gap-1      • 8px = gap-2      • 12px = gap-3
• 16px = gap-4     • 20px = gap-5     • 24px = gap-6

BORDER RADIUS:
• 2px = rounded-sm    • 4px = rounded    • 6px = rounded-md
• 8px = rounded-lg    • 12px = rounded-xl • 16px = rounded-2xl

FONT SIZES:
• 12px = text-xs   • 14px = text-sm   • 16px = text-base
• 18px = text-lg   • 20px = text-xl   • 24px = text-2xl

FONT WEIGHTS:
• 400 = font-normal  • 500 = font-medium  • 600 = font-semibold
• 700 = font-bold    • 800 = font-extrabold

⚠️ VALIDATION RULES:
1. Use EXACT pixel values from spec sheet
2. Map to closest Tailwind class from table above
3. If EXACT match not available, use arbitrary values: h-[42px], px-[18px], text-[15px]
4. NEVER round significantly (40px should be h-10, NOT h-12)
5. Test all size variants have correct heights
6. Arbitrary values are ACCEPTABLE for precision`
    : ''

  const prompt = `Generate a professional React component with TypeScript for a design system.

Component Name: ${params.name}
Description: ${params.description}
Category: ${params.category}

Variants:
${variantsText}

Props:
${propsText}${themeInfo}${spacingInfo}

⚠️ MANDATORY REQUIREMENTS (Build will fail if violated):

1. EXPORT NAME: Component MUST be exported with exact name: ${params.name}
   export const ${params.name} = React.forwardRef<HTMLButtonElement, ${params.name}Props>(...)

2. TYPESCRIPT:
   ✓ Proper TypeScript types for ALL props
   ✓ Use VariantProps<typeof ${params.name.toLowerCase()}Variants> for variant types
   ✓ Extend React.ComponentPropsWithoutRef or HTMLAttributes
   ✓ Export both component AND variant types

3. VARIANTS (class-variance-authority):
   ✓ Define ALL variants from spec: ${Object.keys(params.variants || {}).join(', ')}
   ✓ Use cva() for variant definition
   ✓ Include default values for each variant
   ✓ MUST match spec sheet EXACTLY

4. SPACING & SIZING:
   ✓ Use EXACT measurements from spec sheet
   ✓ Map using Tailwind table above (40px = h-10)
   ✓ Use arbitrary values for non-standard sizes: h-[42px]
   ✓ DO NOT approximate (40px is NOT h-12)

5. COLOR MAPPING (NO HEX COLORS ALLOWED):
   ✓ Map spec colors to theme tokens:
     • Primary/Brand → bg-primary, text-primary-foreground
     • Secondary → bg-secondary, text-secondary-foreground
     • Neutral/Gray → bg-muted, text-muted-foreground
     • Borders → border-border
     • Hover states → hover:bg-primary/90
     • Disabled → opacity-50, cursor-not-allowed
   ✓ NEVER use: bg-blue-500, #3B82F6, rgb()
   ✓ ALWAYS use: bg-primary, text-foreground

6. SHADCN/UI PATTERNS:
   ✓ Use React.forwardRef for ref forwarding
   ✓ Use Slot from @radix-ui/react-slot for asChild pattern
   ✓ Merge classNames with cn() utility
   ✓ Spread remaining props with {...props}

7. ACCESSIBILITY:
   ✓ Proper ARIA attributes (aria-label, aria-disabled)
   ✓ Keyboard navigation support
   ✓ Focus visible styles (focus-visible:ring-2)
   ✓ Disabled state handling

8. STRUCTURE:
   ✓ Import statements at top
   ✓ Type definitions before component
   ✓ cva() variant definition
   ✓ Component with React.forwardRef
   ✓ Export statement at bottom
   ✓ JSDoc comments with usage examples

⚠️ VALIDATION: Component will be programmatically validated against spec sheet:
✓ Variant count matches (expecting ${Object.keys(params.variants || {}).length})
✓ No hex colors present
✓ Spacing matches spec
✓ Export name: ${params.name}
✓ TypeScript types present

Return ONLY the component code, no explanations.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514', // Claude 4.5 Sonnet - latest version
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  // Extract code from markdown code blocks if present
  let code = textContent.text
  const codeBlockMatch = code.match(/```(?:tsx?|typescript|javascript)?\n([\s\S]*?)```/)
  if (codeBlockMatch) {
    code = codeBlockMatch[1]
  }

  return code.trim()
}

/**
 * Generate usage prompts for a component using Claude
 */
export async function generateUsagePrompts(
  params: GeneratePromptsParams
): Promise<{
  basic: string[]
  advanced: string[]
  useCases: Array<{
    scenario: string
    prompt: string
    output?: string
  }>
}> {
  const variantsText = params.variants
    ? Object.entries(params.variants)
        .map(([key, values]) => `${key}: ${values.join(', ')}`)
        .join('\n')
    : 'No variants'

  const prompt = `Generate installation and usage instructions for this React component.

Component Name: ${params.componentName}

Component Code:
\`\`\`tsx
${params.componentCode}
\`\`\`

Variants Available:
${variantsText}

Generate practical usage instructions in 3 categories:

1. BASIC PROMPTS (3-5 simple examples):
   - How to import the component
   - Basic usage with default props
   - Simple variant usage
   
2. ADVANCED PROMPTS (3-5 advanced examples):
   - Multiple props combined
   - Complex variant combinations
   - Integration with other components
   
3. USE CASES (3-5 real scenarios):
   - Specific business needs
   - Complete implementation example
   - Expected visual result

IMPORTANT: 
- Instructions should guarantee the component works when copy-pasted
- Include exact import paths
- Show actual code examples users can run
- Keep each example concise (under 200 characters)
- Escape any quotes in code examples properly

Return as JSON:
{
  "basic": ["example 1", "example 2", ...],
  "advanced": ["example 1", "example 2", ...],
  "useCases": [
    {
      "scenario": "what it's for",
      "prompt": "complete code to use",
      "output": "what user will see"
    }
  ]
}

CRITICAL: Return ONLY valid JSON with properly escaped strings. No markdown, no backticks.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514', // Claude 4.5 Sonnet - latest version
    max_tokens: 3000, // Increased to avoid truncation
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  // Extract JSON from response
  let jsonText = textContent.text.trim()
  const jsonMatch = jsonText.match(/```json\n([\s\S]*?)```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1]
  }

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('Failed to parse prompts JSON response:', jsonText.substring(0, 500))
    throw new Error(`Invalid JSON response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate documentation for a component using Claude
 */
export async function generateDocumentation(
  params: GenerateDocsParams
): Promise<{
  props: Array<{
    name: string
    type: string
    required: boolean
    description: string
    default?: string
  }>
  installation: {
    dependencies: string[]
    devDependencies: string[]
    files: Array<{
      path: string
      content: string
    }>
  }
}> {
  const prompt = `Analyze this React component and generate comprehensive documentation.

Component Name: ${params.componentName}

Component Code:
\`\`\`tsx
${params.componentCode}
\`\`\`

Generate documentation in JSON format with:

1. Props (extract all props with their types, whether required, description, and default values)
2. Installation (list required dependencies, dev dependencies, and any additional files needed)

Return as JSON in this exact format:
{
  "props": [
    {
      "name": "prop name",
      "type": "TypeScript type",
      "required": true/false,
      "description": "What this prop does",
      "default": "default value if any"
    },
    ...
  ],
  "installation": {
    "dependencies": ["package-name@version", ...],
    "devDependencies": ["package-name@version", ...],
    "files": [
      {
        "path": "relative/path/to/file.ts",
        "content": "file content"
      },
      ...
    ]
  }
}

Return ONLY valid JSON, no markdown or explanations.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514', // Claude 4.5 Sonnet - latest version
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  // Extract JSON from response
  let jsonText = textContent.text.trim()
  const jsonMatch = jsonText.match(/```json\n([\s\S]*?)```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1]
  }

  return JSON.parse(jsonText)
}

/**
 * Extract component specifications from an image using Claude Vision
 */
export async function extractSpecFromImage(
  params: ExtractSpecParams
): Promise<{
  name: string
  description: string
  category: string
  variants: Record<string, string[]>
  colors: string[]
  spacing: string[]
  notes: string
}> {
  const prompt = `⚠️ CRITICAL: Analyze this design specification image and extract EXACT component specifications.

🎯 PRIORITY: If the spec sheet has LABELED measurements and values, use those EXACT numbers.
   Do NOT estimate or approximate when explicit values are shown.

🎯 EXTRACTION REQUIREMENTS (Be extremely precise):

1. Component name (as shown in spec)
2. Brief description of what the component does
3. Category (MUST be one of: buttons, inputs, navigation, feedback, data-display, overlays, other)

4. Variants - Extract ALL visible variants with their EXACT names (read labels if present):
   - variant/type: ["primary", "secondary", "ghost", "outline", etc.]
   - size: ["small", "medium", "large", "xl", etc.]
   - state: ["default", "hover", "focus", "active", "disabled", "loading"]
   - icon: ["none", "left", "right", "only"] (if icons are shown)
   - ANY other variant dimensions you see

5. Colors - Extract EXACT HEX VALUES (not descriptions):
   ⚠️ CRITICAL: If hex codes are LABELED in the spec, copy them EXACTLY as written.
   If not labeled, identify the hex values from the colors shown.
   Format: "Purpose: #HEXCODE" (e.g., "Primary background: #3B82F6")
   Extract:
   - Background colors for each variant
   - Text/foreground colors
   - Border colors
   - Hover state colors
   - Focus ring colors
   - Disabled state colors

6. Spacing/Sizing - Extract EXACT PIXEL VALUES (not vague terms):
   ⚠️ CRITICAL: If measurements are LABELED in the spec (e.g., "40px", "16px padding"), 
   copy those EXACT numbers. Do NOT round or approximate labeled values.
   If not labeled, carefully measure from the visual.
   Extract:
   - Component heights (e.g., "Default height: 40px", "Small height: 32px")
   - Horizontal padding (e.g., "Horizontal padding: 16px")
   - Vertical padding (e.g., "Vertical padding: 10px")
   - Border radius (e.g., "Border radius: 6px")
   - Icon size (e.g., "Icon size: 20px")
   - Gap between icon and text (e.g., "Icon gap: 8px")
   - Min width if specified

7. Typography - Extract EXACT specifications:
   ⚠️ CRITICAL: Read labeled font specs directly from the image.
   - Font size (e.g., "Base: 14px", "Small: 12px")
   - Font weight (e.g., "Medium: 500", "Bold: 600")  
   - Line height (e.g., "Line height: 20px")
   - Font family if specified

8. Border & Shadow specifications:
   - Border width (e.g., "Border: 1px")
   - Shadow for each state (e.g., "Focus shadow: 0 0 0 3px rgba(59, 130, 246, 0.5)")

9. Notes - Any special requirements or additional context

⚠️ VALIDATION RULES:
- Colors MUST be hex codes (#RRGGBB), NOT descriptions
- Spacing MUST be pixel values (e.g., "40px"), NOT "medium" or "large"
- ALL visible variants MUST be included
- State variants (hover, focus, disabled) MUST be extracted if visible

Return as JSON in this EXACT format:
{
  "name": "Component name",
  "description": "What this component does",
  "category": "category-name",
  "variants": {
    "variant": ["primary", "secondary", "ghost"],
    "size": ["small", "base", "large"],
    "state": ["default", "hover", "focus", "disabled"],
    "icon": ["none", "left", "right"]
  },
  "colors": [
    "Primary background: #3B82F6",
    "Primary text: #FFFFFF",
    "Primary hover background: #2563EB",
    "Secondary background: #F3F4F6",
    "Border color: #E5E7EB",
    "Focus ring: #3B82F6"
  ],
  "spacing": [
    "Base height: 40px",
    "Small height: 32px",
    "Large height: 48px",
    "Horizontal padding: 16px",
    "Vertical padding: 10px",
    "Border radius: 6px",
    "Icon size: 20px",
    "Icon gap: 8px"
  ],
  "typography": [
    "Base font size: 14px",
    "Small font size: 12px",
    "Font weight: 500",
    "Line height: 20px"
  ],
  "borders": [
    "Border width: 1px",
    "Focus shadow: 0 0 0 3px rgba(59, 130, 246, 0.5)"
  ],
  "notes": "Additional notes or requirements"
}

⚠️ CRITICAL: Return ONLY valid JSON, no markdown code blocks, no explanations, no commentary.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514', // Claude 4.5 Sonnet - latest version
    max_tokens: 2500, // Increased for detailed extraction
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: params.imageMediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: params.imageBase64,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  })

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  // Extract JSON from response - try multiple patterns
  let jsonText = textContent.text
    .trim()
    .replace(/^\uFEFF/, '') // Remove BOM
    .replace(/^\s+/gm, '') // Remove leading spaces from lines

  console.log('📋 Raw Claude response for spec extraction (first 500 chars):', jsonText.substring(0, 500))

  // Try to extract from markdown code blocks (with or without json tag)
  const codeBlockPatterns = [
    /```json\s*\n([\s\S]*?)```/,
    /```\s*\n([\s\S]*?)```/,
    /```json\s*([\s\S]*?)```/,
    /\{[\s\S]*\}/, // Match raw JSON object
  ]

  let extracted = false
  for (const pattern of codeBlockPatterns) {
    const match = jsonText.match(pattern)
    if (match) {
      jsonText = match[1] ? match[1].trim() : match[0].trim()
      extracted = true
      console.log(`✅ Extracted using pattern: ${pattern}`)
      break
    }
  }

  // If no pattern matched, try to find JSON boundaries manually
  if (!extracted) {
    const startIdx = jsonText.indexOf('{')
    const endIdx = jsonText.lastIndexOf('}')
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      jsonText = jsonText.substring(startIdx, endIdx + 1)
      console.log('✅ Extracted JSON by finding braces')
    }
  }

  // Clean up any remaining issues
  jsonText = jsonText
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/[\u0000-\u001F]+/g, ' ') // Remove control characters except newlines
    .trim()

  console.log('🔍 Cleaned JSON (first 300 chars):', jsonText.substring(0, 300))

  // Try to parse the JSON
  try {
    const parsed = JSON.parse(jsonText)
    console.log('✅ Successfully parsed spec extraction JSON')
    return parsed
  } catch (parseError) {
    console.error('❌ Failed to parse JSON from Claude response')
    console.error('Error:', parseError instanceof Error ? parseError.message : String(parseError))
    console.error('Full response:', jsonText)

    // Try one last time with a more aggressive clean
    try {
      const cleanedAgain = jsonText
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      const parsed = JSON.parse(cleanedAgain)
      console.log('✅ Parsed after removing trailing commas')
      return parsed
    } catch (secondError) {
      throw new Error(
        `Failed to parse JSON response from Claude API. ` +
        `Error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. ` +
        `Response preview: ${jsonText.substring(0, 300)}...`
      )
    }
  }
}

