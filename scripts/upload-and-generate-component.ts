import { config } from 'dotenv'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { createClient } from '@supabase/supabase-js'
import { extractSpecFromImage, generateComponentCode } from '../lib/ai/claude'
import { createComponent } from '../lib/db/components'
import { writeFile } from 'fs/promises'

config({ path: join(process.cwd(), '.env.local') })

/**
 * Upload spec sheet image and generate component programmatically
 * Usage: tsx scripts/upload-and-generate-component.ts <path-to-image>
 */

async function uploadAndGenerate(imagePath: string) {
  console.log('🚀 Component Generation Workflow\n')
  console.log(`📸 Loading image: ${imagePath}\n`)
  
  // Read image file
  const imageBuffer = await readFile(imagePath)
  const base64 = imageBuffer.toString('base64')
  
  // Determine MIME type
  const ext = imagePath.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
  }
  const imageMediaType = mimeTypes[ext || ''] || 'image/png'
  
  console.log(`✅ Image loaded: ${(imageBuffer.length / 1024).toFixed(2)} KB, Type: ${imageMediaType}\n`)
  
  // Step 1: Extract spec
  console.log('🔍 Step 1: Extracting specifications from image...')
  const extractedSpec = await extractSpecFromImage({
    imageBase64: base64,
    imageMediaType,
  })
  
  console.log('✅ Spec extracted!\n')
  console.log('📋 Extracted Specifications:')
  console.log(`   Name: ${extractedSpec.name}`)
  console.log(`   Category: ${extractedSpec.category}`)
  console.log(`   Description: ${extractedSpec.description}`)
  console.log(`   Variants:`, JSON.stringify(extractedSpec.variants, null, 2))
  console.log(`   Colors: ${extractedSpec.colors?.length || 0} found`)
  console.log(`   Spacing: ${extractedSpec.spacing?.length || 0} specs\n`)
  
  // Step 2: Get active theme
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data: activeTheme } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .single()
  
  console.log(`🎨 Using theme: ${activeTheme?.name || 'Default Theme'}\n`)
  
  // Step 3: Generate component code
  console.log('⚙️  Step 2: Generating component code...')
  const componentCode = await generateComponentCode({
    name: extractedSpec.name,
    description: extractedSpec.description,
    category: extractedSpec.category,
    variants: extractedSpec.variants,
    colors: extractedSpec.colors,
    spacing: extractedSpec.spacing,
    theme: activeTheme ? {
      id: activeTheme.id,
      name: activeTheme.name,
      colors: activeTheme.colors,
    } : undefined,
  })
  
  console.log('✅ Component code generated!\n')
  console.log(`📝 Code preview (first 300 chars):`)
  console.log(componentCode.substring(0, 300) + '...\n')
  
  // Step 4: Generate prompts and docs
  console.log('📚 Step 3: Generating documentation...')
  
  const { generateUsagePrompts, generateDocumentation } = await import('../lib/ai/claude')
  
  const [prompts, docs] = await Promise.all([
    generateUsagePrompts({
      componentName: extractedSpec.name,
      componentCode,
      variants: extractedSpec.variants,
    }),
    generateDocumentation({
      componentName: extractedSpec.name,
      componentCode,
    }),
  ])
  
  console.log('✅ Documentation generated!\n')
  
  // Step 5: Save to database
  console.log('💾 Step 4: Saving component to database...')
  
  const slug = extractedSpec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  
  // Write to file system first
  const registryPath = join(process.cwd(), 'components', 'registry', `${slug}.tsx`)
  await writeFile(registryPath, componentCode, 'utf-8')
  console.log(`✅ Component written to: ${registryPath}`)
  
  // Update registry index
  const indexPath = join(process.cwd(), 'components', 'registry', 'index.ts')
  const indexContent = await readFile(indexPath, 'utf-8').catch(() => '')
  const exportLine = `export { ${extractedSpec.name} } from './${slug}'`
  
  if (!indexContent.includes(exportLine)) {
    const newIndexContent = indexContent.replace(
      /export\s*\{\s*\}/,
      `export { ${extractedSpec.name} } from './${slug}'`
    ) + (indexContent.includes('export') ? '' : `\n${exportLine}\n`)
    await writeFile(indexPath, newIndexContent, 'utf-8')
    console.log('✅ Registry index updated')
  }
  
  // Save to database
  const component = await createComponent({
    name: extractedSpec.name,
    slug,
    component_name: extractedSpec.name,
    description: extractedSpec.description,
    category: extractedSpec.category,
    code: componentCode,
    variants: extractedSpec.variants || {},
    props: docs.props || [],
    prompts,
    installation: docs.installation || null,
    theme_id: activeTheme?.id || null,
    created_by: null, // System generated
  })
  
  console.log(`✅ Component saved to database: ${component.id}\n`)
  
  console.log('🎉 Component generation complete!\n')
  console.log('📦 Component Details:')
  console.log(`   Name: ${component.name}`)
  console.log(`   Slug: ${component.slug}`)
  console.log(`   Category: ${component.category}`)
  console.log(`   File: components/registry/${slug}.tsx`)
  console.log(`   Docs: http://localhost:3000/docs/components/${component.slug}`)
  console.log(`   Admin: http://localhost:3000/admin/components/${component.slug}`)
}

// Get image path from command line
const imagePath = process.argv[2]

if (!imagePath) {
  console.error('❌ Please provide an image path:')
  console.error('   tsx scripts/upload-and-generate-component.ts <path-to-image>')
  console.error('\nExample:')
  console.error('   tsx scripts/upload-and-generate-component.ts ~/Downloads/spec-sheet.png')
  process.exit(1)
}

uploadAndGenerate(imagePath).catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})




