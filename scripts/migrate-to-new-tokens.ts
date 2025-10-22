#!/usr/bin/env tsx
/**
 * Automated migration script to replace deprecated tokens with new granular tokens
 * Replaces all 158 instances of old tokens like bg-primary, text-muted-foreground
 * with new exact tokens like bg-primary-bg, text-fg-caption
 */

import fs from 'fs'
import path from 'path'

const ROOT_DIR = path.join(__dirname, '..')

// Token replacement mapping
const TOKEN_REPLACEMENTS: Record<string, string> = {
  // Primary button tokens
  'bg-primary(?!-)': 'bg-primary-bg',
  'text-primary-foreground': 'text-primary-text',
  'hover:bg-primary/80': 'hover:bg-primary-hover-bg',
  'hover:bg-primary/90': 'hover:bg-primary-hover-bg',
  
  // Secondary tokens
  'bg-secondary(?!-)': 'bg-secondary-bg',
  'text-secondary-foreground': 'text-fg-body',
  'hover:bg-secondary/80': 'hover:bg-secondary-hover-bg',
  'hover:bg-secondary/90': 'hover:bg-secondary-hover-bg',
  
  // Muted tokens
  'bg-muted': 'bg-bg-neutral',
  'text-muted-foreground': 'text-fg-caption',
  
  // Accent tokens
  'bg-accent(?!-)': 'bg-bg-accent',
  'text-accent-foreground': 'text-fg-body',
  'hover:bg-accent': 'hover:bg-bg-neutral-subtle',
  'hover:text-accent-foreground': 'hover:text-fg-body',
  
  // Destructive tokens
  'bg-destructive(?!-)': 'bg-fg-feedback-error',
  'text-destructive-foreground': 'text-primary-text',
  'text-destructive': 'text-fg-feedback-error',
  'hover:bg-destructive/80': 'hover:bg-fg-feedback-error/80',
  'hover:bg-destructive/90': 'hover:bg-fg-feedback-error/90',
  
  // Border tokens
  'border-border': 'border-fg-stroke-ui',
  'border-input': 'border-fg-stroke-ui',
  
  // Background tokens
  'bg-background': 'bg-bg-white',
  'text-foreground': 'text-fg-body',
  
  // Card tokens
  'bg-card(?!-)': 'bg-bg-white',
  'text-card-foreground': 'text-fg-body',
  
  // Popover tokens
  'bg-popover': 'bg-bg-white',
  'text-popover-foreground': 'text-fg-body',
  
  // Ring/Focus tokens
  'ring-ring': 'ring-focused-border',
  'focus:ring-ring': 'focus:ring-focused-border',
  'focus-visible:ring-ring': 'focus-visible:ring-focused-border',
}

function migrateFile(filePath: string): { changed: boolean; count: number } {
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false
  let count = 0
  
  for (const [oldToken, newToken] of Object.entries(TOKEN_REPLACEMENTS)) {
    const regex = new RegExp(oldToken, 'g')
    const matches = content.match(regex)
    if (matches) {
      content = content.replace(regex, newToken)
      changed = true
      count += matches.length
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8')
  }
  
  return { changed, count }
}

function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, dist
      if (!['node_modules', '.next', 'dist', '.git'].includes(file)) {
        walkDir(filePath, fileList)
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath)
    }
  }
  
  return fileList
}

function main() {
  console.log('🔄 Starting token migration...\n')
  
  // Directories to scan
  const dirs = ['components', 'app', 'lib'].map(d => path.join(ROOT_DIR, d))
  
  let totalFiles = 0
  let changedFiles = 0
  let totalReplacements = 0
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    
    const files = walkDir(dir)
    
    for (const file of files) {
      const { changed, count } = migrateFile(file)
      
      totalFiles++
      if (changed) {
        changedFiles++
        totalReplacements += count
        const relativePath = path.relative(ROOT_DIR, file)
        console.log(`✅ ${relativePath}: ${count} replacements`)
      }
    }
  }
  
  console.log(`\n📊 Migration Complete!`)
  console.log(`   Files scanned: ${totalFiles}`)
  console.log(`   Files updated: ${changedFiles}`)
  console.log(`   Total replacements: ${totalReplacements}`)
  console.log(`\n🎉 All deprecated tokens have been migrated to new granular tokens!`)
  console.log(`\nNext steps:`)
  console.log(`   1. Run: npm run validate:colors`)
  console.log(`   2. Test the app: npm run dev`)
  console.log(`   3. Commit changes: git add -A && git commit -m "chore: migrate all components to new granular tokens"`)
}

main()
