import { config } from 'dotenv'
import { join } from 'path'

// Load env FIRST before any other imports
config({ path: join(process.cwd(), '.env.local') })

// Verify API key is loaded
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not found in environment')
  process.exit(1)
}

// Now import other modules that depend on env vars
import { readFile, writeFile } from 'fs/promises'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// Create a fresh Anthropic client with the loaded API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

/**
 * Direct component generation - bypasses browser upload
 * Uses service role key for authentication
 * Usage: tsx scripts/direct-component-generation.ts <image-path>
 */

async function extractSpecFromImage(imageBase64: string, imageMediaType: string) {
  const prompt = `⚠️ CRITICAL: Analyze this design specification image and extract EXACT component specifications.

🎯 PRIORITY: Focus ONLY on the ACTUAL UI COMPONENT mockup/preview shown in the spec sheet.
   ⚠️ CRITICAL: IGNORE ALL Figma/design tool UI elements:
   - IGNORE: "Property Inspector", "Component Overview", "Layers Panel", "Design Panel"
   - IGNORE: Figma toolbars, sidebars, inspector panels
   - IGNORE: Frame labels like "Frame 3", "Frame 7" unless they label the actual component
   
   ✅ FOCUS ON: The component mockup/preview itself:
   - Look for a rendered/preview version of the component (not the design tool UI)
   - Extract from component labels like "Zipcode Form", "Button", "Input Field"
   - If you see a card/container with actual content (text, inputs, buttons), extract THAT
   - Extract specifications from labels and measurements ON the component mockup
   - If spec shows a form with left section (text/rating) and right section (input/button), extract that structure

🎯 EXTRACTION REQUIREMENTS (Be extremely precise):

1. Component name (from the component label/mockup itself, e.g., "Zipcode Form", "Button", "Input")
2. Brief description of what the component does (e.g., "Zipcode input form with submit button")
3. Category (MUST be one of: buttons, inputs, navigation, feedback, data-display, overlays, other)

4. Variants - Extract ALL visible variants with their EXACT names:
   - variant: ["primary", "secondary", "ghost", "outline", etc.]
   - size: ["small", "medium", "large", "xl", etc.]
   - state: ["default", "hover", "focus", "active", "disabled", "loading"]
   - icon: ["none", "left", "right", "only"] (if icons are shown)

5. Colors - Extract EXACT HEX VALUES:
   ⚠️ CRITICAL: If hex codes are LABELED in the spec, copy them EXACTLY as written.
   Format: "Purpose: #HEXCODE" (e.g., "Background: #F5F5F3", "Border: #BFC7D4")
   Extract:
   - Background colors
   - Text/foreground colors
   - Border colors
   - Hover state colors
   - Focus ring colors

6. Spacing/Sizing - Extract EXACT PIXEL VALUES:
   ⚠️ CRITICAL: If measurements are LABELED (e.g., "24px", "8px"), copy those EXACT numbers.
   Extract:
   - Component dimensions (width, height)
   - Padding values (horizontal, vertical)
   - Border radius
   - Gap between elements
   - Margin values

7. Typography:
   - Font size
   - Font weight
   - Line height
   - Font family if specified

8. Layout Structure - CRITICAL: Extract the EXACT layout:
   - Does the component have MULTIPLE SECTIONS? (e.g., left section + right section)
   - Left section content: Text? Ratings? Labels? Descriptions? List ALL elements
   - Right section content: Inputs? Buttons? Actions? List ALL elements
   - Layout direction: horizontal (side-by-side) or vertical (stacked)
   - Gap between sections (if multiple sections exist)
   - Alignment of sections
   - Container: Does it have a background color? Border? Padding?
   - If spec shows a card/container with TWO sections, extract BOTH sections' content

9. Notes - Any special requirements or additional context

⚠️ VALIDATION RULES:
- Focus on the UI COMPONENT, not design tool UI
- Colors MUST be hex codes (#RRGGBB)
- Spacing MUST be pixel values (e.g., "24px")
- Extract what's ON the component mockup

Return as JSON in this EXACT format:
{
  "name": "Component name (from component mockup)",
  "description": "What this component does",
  "category": "inputs",
  "variants": {
    "variant": ["primary", "secondary"],
    "size": ["small", "base", "large"]
  },
  "colors": [
    "Background: #F5F5F3",
    "Border: #BFC7D4",
    "Text: #000000"
  ],
  "spacing": [
    "Padding: 24px",
    "Border radius: 8px",
    "Gap: 8px"
  ],
  "typography": [
    "Font size: 14px",
    "Font weight: 500"
  ],
  "notes": "Additional requirements"
}

⚠️ CRITICAL: Return ONLY valid JSON, no markdown code blocks, no explanations, no commentary.`

  const message = await retryApiCall(
    () => anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageMediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
    'Extracting specifications'
  )

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  let jsonText = textContent.text
    .trim()
    .replace(/^\uFEFF/, '')
    .replace(/^\s+/gm, '')

  const codeBlockPatterns = [
    /```json\s*\n([\s\S]*?)```/,
    /```\s*\n([\s\S]*?)```/,
    /```json\s*([\s\S]*?)```/,
    /\{[\s\S]*\}/,
  ]

  for (const pattern of codeBlockPatterns) {
    const match = jsonText.match(pattern)
    if (match) {
      jsonText = match[1] ? match[1].trim() : match[0].trim()
      break
    }
  }

  const spec = JSON.parse(jsonText)
  return spec
}

// Helper function for retrying API calls with exponential backoff
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  operation: string,
  maxRetries = 3
): Promise<T> {
  let retries = 0
  
  while (retries <= maxRetries) {
    try {
      return await apiCall()
    } catch (error: any) {
      if (error.status === 529 && retries < maxRetries) {
        // Overloaded - wait with exponential backoff
        const waitTime = Math.pow(2, retries) * 2 // 2s, 4s, 8s
        console.log(`⚠️  ${operation} - API overloaded (529), retrying in ${waitTime}s... (attempt ${retries + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000))
        retries++
      } else {
        throw error // Re-throw if not 529 or max retries reached
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} retries`)
}

async function generateComponentCode(params: {
  name: string
  description: string
  category: string
  variants?: Record<string, string[]>
  colors?: string[]
  spacing?: string[]
  theme?: { id: string; name: string; colors: Record<string, string> }
}) {
  const variantsText = params.variants
    ? Object.entries(params.variants)
        .map(([key, values]) => `${key}: ${values.join(', ')}`)
        .join('\n')
    : 'No variants'

  const colorsInfo = params.colors?.length 
    ? `\n\n🎨 COLORS FROM SPEC SHEET (MUST MATCH VISUALLY):
${params.colors.map(c => `• ${c}`).join('\n')}

⚠️ IMPORTANT: Map these colors to theme tokens while maintaining visual match:
- Light backgrounds (#F5F5F3, #F3F4F6) → bg-white or bg-neutral-subtle
- Borders (#BFC7D4, #E5E7EB) → border-fg-stroke-ui
- Primary colors → bg-primary-bg, text-primary-text
- Ensure the component LOOKS like the spec sheet colors`
    : ''

  const spacingInfo = params.spacing?.length 
    ? `\n\n⚠️ CRITICAL - EXACT SPACING REQUIREMENTS (MUST MATCH):
${params.spacing.map(s => `• ${s}`).join('\n')}

📐 TAILWIND SPACING MAPPING TABLE (Use these EXACT mappings):
• 24px = p-6       • 28px = p-7       • 32px = p-8
• 36px = p-9       • 40px = p-10      • 44px = p-11
• 48px = p-12      • 56px = p-14      • 64px = p-16
• 4px = p-1        • 8px = p-2        • 12px = p-3
• 16px = p-4       • 20px = p-5       • 24px = p-6
• 8px = gap-2      • 12px = gap-3     • 16px = gap-4
• 2px = rounded-sm • 4px = rounded    • 6px = rounded-md
• 8px = rounded-lg • 12px = rounded-xl • 16px = rounded-2xl
⚠️ Use arbitrary values for exact matches: p-[24px], gap-[8px], rounded-[8px]`
    : ''

  const prompt = `Generate a professional React component with TypeScript for a design system.

Component Name: ${params.name}
Description: ${params.description}
Category: ${params.category}

Variants from spec:
${variantsText}${colorsInfo}${spacingInfo}

⚠️ MANDATORY REQUIREMENTS (Component MUST match spec sheet EXACTLY):

1. EXPORT NAME: Component MUST be exported with exact name: ${params.name}
   Replace spaces with nothing: "Zipcode Form" → ZipcodeForm

2. LAYOUT & STRUCTURE:
   - Match the EXACT layout shown in spec (horizontal/vertical sections)
   - If spec shows TWO SECTIONS (left + right), implement BOTH sections
   - Left section typically contains: text content, ratings, labels
   - Right section typically contains: input fields, buttons, actions
   - Use EXACT spacing values from spec (padding, gap, margins)
   - If spec shows 24px padding, use p-[24px] or p-6
   - If spec shows 8px gap, use gap-[8px] or gap-2
   - Container should have the background color and border from spec

3. COLORS:
   - Map spec colors to theme tokens but ensure visual match
   - Background #F5F5F3 → bg-white or similar light background
   - Border #BFC7D4 → border-fg-stroke-ui
   - Text colors match spec visually

4. VARIANTS (class-variance-authority):
   - Define ALL variants from spec: ${Object.keys(params.variants || {}).join(', ')}
   - Use cva() for variant definition
   - Include default values for each variant

5. TYPESCRIPT:
   - Proper types, VariantProps, extend HTMLAttributes
   - Export both component AND variant types

6. COMPONENT STRUCTURE (CRITICAL - MATCH SPEC EXACTLY):
   - Analyze the spec image: Does it show MULTIPLE SECTIONS?
   - If YES, implement ALL sections:
     * Container wrapper with background color (#F5F5F3) and border (#BFC7D4) from spec
     * Left section: Contains text content, ratings, labels, descriptions - EXACTLY as shown
     * Right section: Contains inputs, buttons, actions - EXACTLY as shown
     * Proper spacing between sections (gap-[24px] if spec shows 24px gap)
   - Structure: <div className="bg-[#F5F5F3] border border-[#BFC7D4] rounded-[8px] p-[24px] flex gap-[24px]">
                 <div className="left-section">...</div>
                 <div className="right-section">...</div>
               </div>
   - DO NOT create a simple input+button if spec shows text/rating sections
   - Include ALL visible elements from spec: text blocks, ratings, labels, inputs, buttons
   - Use React.forwardRef for ref forwarding
   - Use cn() utility for className merging
   - Include proper ARIA attributes

7. STYLING & IMPORTS:
   - Required imports:
     import React from 'react'
     import { cva, type VariantProps } from 'class-variance-authority'
     import { cn } from '@/lib/utils'
   - Use Tailwind classes matching spec measurements
   - Use arbitrary values for exact pixel matches: w-[694px], h-[40px]
   - Border radius from spec: rounded-[8px] if spec says 8px
   - Typography from spec (font size, weight, line height)

⚠️ AUTOMATED VALIDATION (Component will be scanned):
✓ NO hex colors (#XXXXXX patterns) - Will REJECT if found
✓ NO arbitrary color values (text-[#...], bg-[#...]) - Will REJECT if found
✓ NO Tailwind color utilities (bg-blue-500, text-gray-600) - Will REJECT if found  
✓ ONLY theme tokens allowed (bg-primary-bg, text-fg-body, etc.)
✓ Layout structure matches spec
✓ Spacing matches spec
✓ All sections from spec implemented

🔍 VALIDATION REGEX PATTERNS:
- Hex colors: /#[0-9A-Fa-f]{3,6}/ → Will cause REJECTION
- Arbitrary colors: /bg-\[#|text-\[#|border-\[#/ → Will cause REJECTION
- Tailwind colors: /bg-(red|blue|green|gray|slate)-\d+|text-gray/ → Will cause REJECTION

Return ONLY the component code, no explanations.`

  const message = await retryApiCall(
    () => anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
    'Generating component code'
  )

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  let code = textContent.text
  const codeBlockMatch = code.match(/```(?:tsx?|typescript|javascript)?\n([\s\S]*?)```/)
  if (codeBlockMatch) {
    code = codeBlockMatch[1]
  }

  return code.trim()
}

async function generateUsagePrompts(params: {
  componentName: string
  componentCode: string
  variants?: Record<string, string[]>
}) {
  const variantsText = params.variants
    ? Object.entries(params.variants)
        .map(([key, values]) => `${key}: ${values.join(', ')}`)
        .join('\n')
    : 'No variants'

  const prompt = `Generate installation and usage instructions for this React component.

Component Name: ${params.componentName}

Component Code:
\`\`\`tsx
${params.componentCode.substring(0, 2000)}
\`\`\`

Variants Available:
${variantsText}

Generate practical usage instructions in JSON format:
{
  "basic": ["example 1", "example 2", ...],
  "advanced": ["example 1", "example 2", ...],
  "useCases": [{"scenario": "...", "prompt": "...", "output": "..."}]
}

Return ONLY valid JSON, no markdown.`

  const message = await retryApiCall(
    () => anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
    'Generating usage prompts'
  )

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  let jsonText = textContent.text.trim()
  const jsonMatch = jsonText.match(/```json\n([\s\S]*?)```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1]
  }

  return JSON.parse(jsonText)
}

async function generateDocumentation(params: {
  componentName: string
  componentCode: string
}) {
  const prompt = `Analyze this React component and generate comprehensive documentation.

Component Name: ${params.componentName}

Component Code:
\`\`\`tsx
${params.componentCode.substring(0, 2000)}
\`\`\`

Generate documentation in JSON format:
{
  "props": [{"name": "...", "type": "...", "required": true/false, "description": "...", "default": "..."}],
  "installation": {
    "dependencies": ["package-name@version"],
    "devDependencies": ["package-name@version"],
    "files": [{"path": "...", "content": "..."}]
  }
}

Return ONLY valid JSON, no markdown.`

  const message = await retryApiCall(
    () => anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
    'Generating documentation'
  )

  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  let jsonText = textContent.text.trim()
  const jsonMatch = jsonText.match(/```json\n([\s\S]*?)```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1]
  }

  return JSON.parse(jsonText)
}

async function generateComponentFromImage(imagePath: string) {
  console.log('🚀 Direct Component Generation\n')
  console.log(`📸 Image: ${imagePath}\n`)
  
  // Read image
  const imageBuffer = await readFile(imagePath)
  const base64 = imageBuffer.toString('base64')
  
  const ext = imagePath.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
  }
  const imageMediaType = mimeTypes[ext || ''] || 'image/png'
  
  console.log(`✅ Image loaded: ${(imageBuffer.length / 1024).toFixed(2)} KB\n`)
  
  // Step 1: Extract spec
  console.log('🔍 Step 1: Extracting specifications...')
  const spec = await extractSpecFromImage(base64, imageMediaType)
  
  console.log('✅ Extraction complete!\n')
  console.log('📋 Specifications:')
  console.log(`   Name: ${spec.name}`)
  console.log(`   Category: ${spec.category}`)
  console.log(`   Description: ${spec.description}`)
  console.log(`   Variants:`, JSON.stringify(spec.variants, null, 2))
  if (spec.colors?.length) {
    console.log(`   Colors: ${spec.colors.length} found`)
    spec.colors.slice(0, 5).forEach((c: string) => console.log(`     - ${c}`))
  }
  if (spec.spacing?.length) {
    console.log(`   Spacing: ${spec.spacing.length} specs`)
    spec.spacing.slice(0, 5).forEach((s: string) => console.log(`     - ${s}`))
  }
  console.log('')
  
  // Step 2: Get theme
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data: theme } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .single()
  
  console.log(`🎨 Theme: ${theme?.name || 'Default'}\n`)
  
  // Step 3: Generate code
  console.log('⚙️  Step 2: Generating component code...')
  const code = await generateComponentCode({
    name: spec.name,
    description: spec.description,
    category: spec.category,
    variants: spec.variants,
    colors: spec.colors,
    spacing: spec.spacing,
    theme: theme ? {
      id: theme.id,
      name: theme.name,
      colors: theme.colors,
    } : undefined,
  })
  
  console.log('✅ Code generated!\n')
  console.log(`📝 Code length: ${code.length} chars`)
  console.log(`   Preview: ${code.substring(0, 200)}...\n`)
  
  // Step 4: Generate docs
  console.log('📚 Step 3: Generating documentation...')
  const [prompts, docs] = await Promise.all([
    generateUsagePrompts({
      componentName: spec.name,
      componentCode: code,
      variants: spec.variants,
    }),
    generateDocumentation({
      componentName: spec.name,
      componentCode: code,
    }),
  ])
  
  console.log('✅ Documentation generated!\n')
  
  // Step 5: Save
  console.log('💾 Step 4: Saving component...')
  
  const slug = spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  
  // Clean code - remove markdown code blocks if present
  let cleanCode = code.trim()
  // Remove opening code block markers
  cleanCode = cleanCode.replace(/^```(?:tsx?|typescript|javascript)?\s*\n?/m, '')
  // Remove closing code block markers
  cleanCode = cleanCode.replace(/\n?```\s*$/m, '')
  cleanCode = cleanCode.trim()
  
  // Extract actual component name from generated code (PascalCase export)
  const componentNameMatch = cleanCode.match(/export\s+(?:const|function)\s+(\w+)\s*[=:]/)
  const actualComponentName = componentNameMatch ? componentNameMatch[1] : spec.name.replace(/[^a-zA-Z0-9]/g, '')
  
  console.log(`📝 Component export name: ${actualComponentName}`)
  
  // Write to registry
  const registryPath = join(process.cwd(), 'components', 'registry', `${slug}.tsx`)
  await writeFile(registryPath, cleanCode, 'utf-8')
  console.log(`✅ File: ${registryPath}`)
  
  // Update index
  const indexPath = join(process.cwd(), 'components', 'registry', 'index.ts')
  let indexContent = await readFile(indexPath, 'utf-8').catch(() => '// Auto-generated registry index\n\nexport {}')
  
  const exportLine = `export { ${actualComponentName} } from './${slug}'`
  if (!indexContent.includes(exportLine)) {
    indexContent = indexContent.replace(/\nexport\s*\{\s*\}/, `\n${exportLine}`)
    if (!indexContent.includes('export {')) {
      indexContent += `\n${exportLine}\n`
    }
    await writeFile(indexPath, indexContent, 'utf-8')
    console.log('✅ Index updated')
  }
  
  // Save to database using service role
  const { data: component, error } = await supabase
    .from('components')
    .insert({
      name: spec.name,
      slug,
      component_name: actualComponentName,
      description: spec.description,
      category: spec.category,
      code,
      variants: spec.variants || {},
      props: docs.props || [],
      prompts,
      installation: docs.installation || null,
      theme_id: theme?.id || null,
      created_by: null,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to save component: ${error.message}`)
  }
  
  console.log(`✅ Database: ${component.id}\n`)
  
  console.log('🎉 Component created successfully!\n')
  console.log('📍 URLs:')
  console.log(`   Docs: http://localhost:3000/docs/components/${slug}`)
  console.log(`   Admin: http://localhost:3000/admin/components/${slug}`)
  console.log(`   File: components/registry/${slug}.tsx`)
}

const imagePath = process.argv[2]

if (!imagePath) {
  console.error('❌ Please provide image path:')
  console.error('   tsx scripts/direct-component-generation.ts <image-path>')
  console.error('\n💡 If you saved the spec sheet image, provide its path')
  process.exit(1)
}

generateComponentFromImage(imagePath).catch(console.error)

