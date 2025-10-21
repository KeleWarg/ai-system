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
    ? `\n\nSpacing/Sizing: ${params.spacing.join(', ')}`
    : ''

  const prompt = `Generate a professional React component with TypeScript for a design system.

Component Name: ${params.name}
Description: ${params.description}
Category: ${params.category}

Variants:
${variantsText}

Props:
${propsText}${themeInfo}${spacingInfo}

Requirements:
1. Use TypeScript with proper types
2. Use class-variance-authority (cva) for variant management
3. Use Tailwind CSS classes with THEME TOKENS ONLY (bg-primary, text-foreground, NOT hex colors)
4. Follow shadcn/ui patterns
5. Include proper prop validation
6. Make it accessible (ARIA attributes)
7. Use React.forwardRef for ref forwarding
8. Use the @/lib/utils cn() function for className merging
9. Map spec sheet colors to theme tokens intelligently:
   - Primary colors → bg-primary, text-primary
   - Neutral colors → bg-muted, text-muted-foreground
   - Borders → border-border
   - Backgrounds → bg-background, bg-card
10. Include JSDoc comments

Return ONLY the component code, no explanations.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
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

  const prompt = `Given this React component, generate helpful AI prompts that users can use to generate similar components or variations.

Component Name: ${params.componentName}

Component Code:
\`\`\`tsx
${params.componentCode}
\`\`\`

Variants:
${variantsText}

Generate prompts in the following categories:

1. Basic Prompts (3-5 simple prompts for common use cases)
2. Advanced Prompts (3-5 complex prompts for advanced customization)
3. Use Cases (3-5 real-world scenarios with prompts and expected output)

Return as JSON in this exact format:
{
  "basic": ["prompt 1", "prompt 2", ...],
  "advanced": ["prompt 1", "prompt 2", ...],
  "useCases": [
    {
      "scenario": "Description of use case",
      "prompt": "AI prompt for this scenario",
      "output": "Expected result description"
    },
    ...
  ]
}

Return ONLY valid JSON, no markdown or explanations.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
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
    model: 'claude-3-5-sonnet-20241022',
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
  const prompt = `Analyze this design specification image and extract component information.

Extract the following information:
1. Component name
2. Brief description of what the component does
3. Category (one of: buttons, inputs, navigation, feedback, data-display, overlays, other)
4. Variants (e.g., size: small, medium, large; variant: primary, secondary, outline)
5. Colors used (describe the color scheme)
6. Spacing/sizing information (padding, margins, dimensions)
7. Any additional notes or special requirements

Return as JSON in this exact format:
{
  "name": "Component name",
  "description": "What this component does",
  "category": "category-name",
  "variants": {
    "variant-key": ["value1", "value2", ...],
    ...
  },
  "colors": ["color description 1", "color description 2", ...],
  "spacing": ["spacing detail 1", "spacing detail 2", ...],
  "notes": "Additional notes or requirements"
}

Return ONLY valid JSON, no markdown or explanations.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
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
  let jsonText = textContent.text.trim()

  console.log('Raw Claude response for spec extraction:', jsonText)

  // Try to extract from markdown code blocks (with or without json tag)
  const codeBlockPatterns = [
    /```json\s*\n([\s\S]*?)```/,
    /```\s*\n([\s\S]*?)```/,
    /```json\s*([\s\S]*?)```/,
  ]

  for (const pattern of codeBlockPatterns) {
    const match = jsonText.match(pattern)
    if (match) {
      jsonText = match[1].trim()
      break
    }
  }

  // Try to parse the JSON
  try {
    return JSON.parse(jsonText)
  } catch (parseError) {
    console.error('Failed to parse JSON from Claude response:', jsonText)
    throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Response was: ${jsonText.substring(0, 200)}`)
  }
}

