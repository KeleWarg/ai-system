import { config } from 'dotenv'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { createClient } from '@supabase/supabase-js'

config({ path: join(process.cwd(), '.env.local') })

/**
 * Test script to create a component from a spec sheet image
 * Usage: tsx scripts/test-component-from-spec.ts <path-to-image>
 */

async function testComponentCreation(imagePath: string) {
  console.log('🧪 Testing component creation from spec sheet...\n')
  
  // Read image file
  const imageBuffer = await readFile(imagePath)
  const base64 = imageBuffer.toString('base64')
  
  // Determine MIME type from file extension
  const ext = imagePath.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
  }
  const imageMediaType = mimeTypes[ext || ''] || 'image/png'
  
  console.log(`📸 Image loaded: ${imagePath}`)
  console.log(`   Size: ${(imageBuffer.length / 1024).toFixed(2)} KB`)
  console.log(`   Type: ${imageMediaType}\n`)
  
  // Step 1: Extract spec from image
  console.log('🔍 Step 1: Extracting specifications from image...')
  
  const extractResponse = await fetch('http://localhost:3000/api/ai/extract-spec', {
    method: 'POST',
    headers: {
      'Cookie': process.env.TEST_COOKIE || '', // You may need to set this
    },
    body: (() => {
      const formData = new FormData()
      const blob = new Blob([imageBuffer], { type: imageMediaType })
      formData.append('image', blob, imagePath.split('/').pop())
      return formData
    })(),
  })
  
  if (!extractResponse.ok) {
    const error = await extractResponse.json().catch(() => ({ error: extractResponse.statusText }))
    console.error('❌ Extraction failed:', error)
    console.error('\n💡 Tip: Make sure you\'re logged in and the dev server is running')
    console.error('   Or upload the image manually at: http://localhost:3000/admin/components/new')
    process.exit(1)
  }
  
  const extractedSpec = await extractResponse.json()
  console.log('✅ Spec extracted successfully!\n')
  console.log('📋 Extracted Data:')
  console.log(`   Name: ${extractedSpec.name}`)
  console.log(`   Category: ${extractedSpec.category}`)
  console.log(`   Description: ${extractedSpec.description}`)
  console.log(`   Variants: ${JSON.stringify(extractedSpec.variants, null, 2)}`)
  console.log(`   Colors found: ${extractedSpec.colors?.length || 0}`)
  console.log(`   Spacing specs: ${extractedSpec.spacing?.length || 0}\n`)
  
  // Step 2: Generate component code
  console.log('⚙️  Step 2: Generating component code...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Get active theme
  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .single()
  
  const generateResponse = await fetch('http://localhost:3000/api/ai/generate-component', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': process.env.TEST_COOKIE || '',
    },
    body: JSON.stringify({
      name: extractedSpec.name,
      description: extractedSpec.description,
      category: extractedSpec.category,
      variants: extractedSpec.variants,
      colors: extractedSpec.colors,
      spacing: extractedSpec.spacing,
      theme: themes ? {
        id: themes.id,
        name: themes.name,
        colors: themes.colors,
      } : null,
    }),
  })
  
  if (!generateResponse.ok) {
    const error = await generateResponse.json().catch(() => ({ error: generateResponse.statusText }))
    console.error('❌ Generation failed:', error)
    process.exit(1)
  }
  
  const { code } = await generateResponse.json()
  console.log('✅ Component code generated!\n')
  console.log(`📝 Code length: ${code.length} characters`)
  console.log(`   Preview: ${code.substring(0, 200)}...\n`)
  
  // Step 3: Validate component
  console.log('✅ Step 3: Validating component...')
  
  const validateResponse = await fetch('http://localhost:3000/api/ai/validate-component', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': process.env.TEST_COOKIE || '',
    },
    body: JSON.stringify({
      componentCode: code,
      spec: extractedSpec,
    }),
  })
  
  if (validateResponse.ok) {
    const { analysis } = await validateResponse.json()
    console.log(`✅ Validation complete!`)
    console.log(`   Match Score: ${analysis.overallMatch}/100`)
    console.log(`   Variants: ${analysis.hasRequiredVariants ? '✅' : '❌'}`)
    console.log(`   Spacing: ${analysis.hasCorrectSpacing ? '✅' : '❌'}`)
    console.log(`   Colors: ${analysis.hasThemeColors ? '✅' : '❌'}\n`)
  }
  
  console.log('🎉 Component generation test complete!')
  console.log('\n💡 Next steps:')
  console.log('   1. Review the extracted spec above')
  console.log('   2. Visit http://localhost:3000/admin/components/new')
  console.log('   3. Upload the image to see the full UI workflow')
  console.log('   4. Generate and save the component')
}

// Get image path from command line
const imagePath = process.argv[2]

if (!imagePath) {
  console.error('❌ Please provide an image path:')
  console.error('   tsx scripts/test-component-from-spec.ts <path-to-image>')
  process.exit(1)
}

testComponentCreation(imagePath).catch(console.error)




