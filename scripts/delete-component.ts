#!/usr/bin/env node
/**
 * Delete a component from the registry
 * Usage: npm run delete-component <slug>
 * Example: npm run delete-component button
 */

import { unlink, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const slug = process.argv[2]

if (!slug) {
  console.error('❌ Usage: npm run delete-component <slug>')
  process.exit(1)
}

async function deleteComponent() {
  console.log(`🗑️  Deleting component: ${slug}`)

  try {
    // 1. Delete the file
    const componentPath = join(process.cwd(), 'components', 'registry', `${slug}.tsx`)
    await unlink(componentPath)
    console.log(`✅ Deleted file: ${componentPath}`)

    // 2. Update index.ts
    const indexPath = join(process.cwd(), 'components', 'registry', 'index.ts')
    let indexContent = await readFile(indexPath, 'utf-8')
    
    // Remove the export line for this component
    const lines = indexContent.split('\n')
    const filteredLines = lines.filter(line => !line.includes(`from './${slug}'`))
    indexContent = filteredLines.join('\n')
    
    await writeFile(indexPath, indexContent, 'utf-8')
    console.log(`✅ Updated index.ts`)

    // 3. Update _meta.json
    const metaPath = join(process.cwd(), 'components', 'registry', '_meta.json')
    const metaContent = await readFile(metaPath, 'utf-8')
    const meta = JSON.parse(metaContent)
    
    meta.components = meta.components.filter((c: any) => c.slug !== slug)
    
    await writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
    console.log(`✅ Updated _meta.json`)

    console.log(`\n✨ Component "${slug}" deleted successfully!`)
    console.log(`\n⚠️  Note: Database entry still exists. Delete manually if needed.`)
  } catch (error) {
    console.error('❌ Error deleting component:', error)
    process.exit(1)
  }
}

deleteComponent()

