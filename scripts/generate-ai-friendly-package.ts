import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { sanitizeComponentCode, validateComponentCode } from './sanitize-component-code'

config({ path: join(process.cwd(), '.env.local') })

/**
 * Generate an AI-friendly npm package optimized for Bolt, Lovable, v0, Cursor, etc.
 * Includes enhanced documentation, TypeScript definitions, and AI-readable metadata
 */
async function generateAIFriendlyPackage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Get all components
  const { data: components, error } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching components:', error)
    process.exit(1)
  }
  
  if (!components || components.length === 0) {
    console.log('No components found')
    return
  }
  
  console.log(`🤖 Generating AI-friendly package for ${components.length} components...`)
  
  const packageDir = join(process.cwd(), 'dist-package')
  const componentsDir = join(packageDir, 'components')
  const typesDir = join(packageDir, 'types')
  
  // Create directories
  await mkdir(packageDir, { recursive: true })
  await mkdir(componentsDir, { recursive: true })
  await mkdir(typesDir, { recursive: true })
  
  // Generate component files with enhanced AI-friendly documentation
  const exports: string[] = []
  const typeExports: string[] = []
  const allDependencies = new Set<string>([
    '@radix-ui/react-slot',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
  ])
  
  const componentMetadata: Array<{
    name: string
    slug: string
    description: string
    category: string
    variants: Record<string, string[]>
    props: Array<{ name: string; type: string; required: boolean; description: string }>
  }> = []
  
  for (const component of components) {
    const slug = component.slug
    const fileName = `${slug}.tsx`
    const filePath = join(componentsDir, fileName)
    
    // Security: Validate and sanitize component code FIRST
    const validation = validateComponentCode(component.code)
    if (!validation.valid) {
      console.error(`❌ Security validation failed for ${component.name}:`)
      validation.errors.forEach(err => console.error(`   - ${err}`))
      console.error(`   Skipping component ${component.name}`)
      continue
    }
    
    if (validation.warnings.length > 0) {
      console.warn(`⚠️  Security warnings for ${component.name}:`)
      validation.warnings.forEach(warn => console.warn(`   - ${warn}`))
    }
    
    // Sanitize code (remove dangerous patterns)
    const { sanitized, errors: sanitizeErrors, warnings: sanitizeWarnings } = 
      sanitizeComponentCode(component.code)
    
    if (sanitizeErrors.length > 0) {
      console.error(`❌ Security issues found in ${component.name}:`)
      sanitizeErrors.forEach(err => console.error(`   - ${err}`))
      console.error(`   Code has been sanitized, but review before publishing`)
    }
    
    if (sanitizeWarnings.length > 0) {
      console.warn(`⚠️  Sanitization warnings for ${component.name}:`)
      sanitizeWarnings.forEach(warn => console.warn(`   - ${warn}`))
    }
    
    // Enhance sanitized component code with AI-friendly comments
    let enhancedCode = sanitized
    
    // Add AI-friendly header comment if not present
    if (!enhancedCode.includes('@ai-generated') && !enhancedCode.includes('AI Design System')) {
      enhancedCode = `/**
 * ${component.name} - ${component.description || 'Component from AI Design System'}
 * 
 * @category ${component.category}
 * @package @ai-design-system/components
 * 
 * @example
 * import { ${component.component_name} } from '@ai-design-system/components'
 * 
 * <${component.component_name} variant="primary">
 *   Click me
 * </${component.component_name}>
 * 
 * Available variants: ${Object.entries(component.variants || {}).map(([k, v]) => `${k}: [${(v as string[]).join(', ')}]`).join(', ')}
 */
${enhancedCode}`
    }
    
    // Write component file
    await writeFile(filePath, enhancedCode, 'utf-8')
    console.log(`✅ Generated ${fileName}`)
    
    // Add export
    exports.push(`export { ${component.component_name} } from './${slug}'`)
    
    // Generate TypeScript definition file for better AI understanding
    const props = (component.props || []) as Array<{
      name: string
      type: string
      required: boolean
      description: string
    }>
    
    const typeDef = `/**
 * ${component.name} Component
 * ${component.description || ''}
 * 
 * @category ${component.category}
 */
export interface ${component.component_name}Props {
${props.map(p => `  /** ${p.description} */\n  ${p.name}${p.required ? '' : '?'}: ${p.type}`).join('\n\n')}
}

export type ${component.component_name}Variants = {
${Object.entries(component.variants || {}).map(([key, values]) => 
  `  ${key}: ${(values as string[]).map(v => `"${v}"`).join(' | ')}`
).join('\n')}
}
`
    
    await writeFile(join(typesDir, `${slug}.d.ts`), typeDef, 'utf-8')
    typeExports.push(`export * from './${slug}'`)
    
    // Collect dependencies
    if (component.installation) {
      try {
        const installData = typeof component.installation === 'string'
          ? JSON.parse(component.installation)
          : component.installation
        
        if (installData.dependencies) {
          installData.dependencies.forEach((dep: string) => allDependencies.add(dep))
        }
      } catch {
        // Skip if not JSON
      }
    }
    
    // Store metadata for README
    componentMetadata.push({
      name: component.name,
      slug: component.slug,
      description: component.description || '',
      category: component.category,
      variants: component.variants || {},
      props: props,
    })
  }
  
  // Generate main index.ts with enhanced exports
  const indexContent = `/**
 * @ai-design-system/components
 * AI-generated React components from your design system
 * 
 * @example
 * import { Button } from '@ai-design-system/components'
 * 
 * <Button variant="primary" size="large">
 *   Click me
 * </Button>
 */

${exports.join('\n')}

// Re-export types
export * from './types'
`
  await writeFile(join(componentsDir, 'index.ts'), indexContent, 'utf-8')
  
  // Generate types index
  const typesIndexContent = typeExports.join('\n')
  await writeFile(join(typesDir, 'index.d.ts'), typesIndexContent, 'utf-8')
  
  // Generate enhanced package.json with AI-friendly metadata
  const packageJson = {
    name: '@ai-design-system/components',
    version: '1.0.0',
    description: 'AI-generated React components - Ready to use with Bolt, Lovable, v0, Cursor, and other AI tools',
    keywords: [
      'react',
      'components',
      'design-system',
      'tailwind',
      'ai-generated',
      'typescript',
      'bolt',
      'lovable',
      'v0',
      'cursor',
      'ai-tools',
      'shadcn',
    ],
    author: 'Your Name',
    repository: {
      type: 'git',
      url: 'https://github.com/your-org/ai-design-system',
    },
    homepage: 'https://your-domain.com/docs/components',
    bugs: {
      url: 'https://github.com/your-org/ai-design-system/issues',
    },
    main: './components/index.ts',
    types: './components/index.ts',
    exports: {
      '.': './components/index.ts',
      './types': './types/index.d.ts',
      './package.json': './package.json',
    },
    files: ['components/**/*', 'types/**/*'],
    peerDependencies: {
      react: '^18.0.0 || ^19.0.0',
      'react-dom': '^18.0.0 || ^19.0.0',
      '@radix-ui/react-slot': '^1.2.3',
      'class-variance-authority': '^0.7.1',
      clsx: '^2.1.1',
      'tailwind-merge': '^3.3.1',
    },
    license: 'MIT',
    // AI tools metadata
    'ai-tools': {
      compatible: ['bolt.new', 'lovable.dev', 'v0.dev', 'cursor.sh', 'claude-desktop'],
      installation: 'npm install @ai-design-system/components',
      usage: "import { Button } from '@ai-design-system/components'",
      documentation: 'https://your-domain.com/docs/components',
    },
  }
  
  await writeFile(
    join(packageDir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8'
  )
  
  // Generate AI-friendly README
  const readme: string = `# @ai-design-system/components

🤖 **AI-Friendly React Components** - Perfect for Bolt, Lovable, v0, Cursor, and other AI tools!

## 🚀 Quick Start for AI Tools

### Bolt.new / Lovable
\`\`\`bash
npm install @ai-design-system/components
\`\`\`

Then prompt: "Use Button from @ai-design-system/components"

### v0.dev
\`\`\`bash
npm install @ai-design-system/components
\`\`\`

Prompt: "Create a landing page using @ai-design-system/components"

### Cursor / GitHub Copilot
Install the package, then AI will auto-suggest components:
\`\`\`tsx
import { Button } from '@ai-design-system/components'
\`\`\`

## 📦 Installation

\`\`\`bash
npm install @ai-design-system/components
\`\`\`

## 📚 Usage

\`\`\`tsx
import { Button } from '@ai-design-system/components'

export default function MyPage() {
  return (
    <Button variant="primary" size="large">
      Click me
    </Button>
  )
}
\`\`\`

## 🎨 Available Components

${componentMetadata.map(c => `
### ${c.name}
- **Category**: ${c.category}
- **Description**: ${c.description}
- **Variants**: ${Object.entries(c.variants).map(([k, v]) => \`\${k}: [\${(v as string[]).join(', ')}]\`).join(', ')}
- **Props**: ${c.props.length} available
`).join('\n')}

## 🤖 AI Tool Compatibility

✅ **Bolt.new** - Auto-installs and imports  
✅ **Lovable.dev** - Full TypeScript support  
✅ **v0.dev** - Component discovery  
✅ **Cursor** - Auto-complete suggestions  
✅ **GitHub Copilot** - IntelliSense support  
✅ **Claude Desktop** - MCP server integration  

## 📖 Documentation

- **Full Docs**: https://your-domain.com/docs/components
- **API Reference**: https://your-domain.com/api/registry
- **MCP Server**: https://your-domain.com/api/mcp

## 🎯 Why AI Tools Love This Package

1. **Full TypeScript Definitions** - AI understands all props and types
2. **Clear Exports** - Easy to discover and import
3. **JSDoc Comments** - Usage examples in code
4. **Well-Structured** - Follows React/TypeScript best practices
5. **Theme-Aware** - Uses CSS variables, no hardcoded colors

## 💡 Tips for AI Tools

- Use descriptive prompts: "Add a primary button using @ai-design-system/components"
- Mention variants: "Create a large secondary button"
- AI tools will auto-suggest props based on TypeScript types

---

Built with ❤️ using AI | Generated: ${new Date().toISOString()}
`
  
  await writeFile(join(packageDir, 'README.md'), readme, 'utf-8')
  
  // Create .npmignore for security
  const npmignoreContent = `# Security: Exclude sensitive files
.env*
*.env
*.local
*.key
*.pem
*.secret

# Exclude development files
*.log
*.tsbuildinfo
.DS_Store
node_modules/
.git/
.vscode/
.idea/

# Exclude source files (only include compiled/components)
scripts/
database/
app/
lib/
hooks/
middleware.ts
next.config.ts
tsconfig.json
tailwind.config.ts
postcss.config.mjs
eslint.config.mjs

# Exclude test files
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
__tests__/
test/

# Exclude build artifacts
.next/
out/
dist/
build/
coverage/

# Exclude documentation (keep README.md)
*.md
!README.md

# Exclude config files
.gitignore
vercel.json
.editorconfig
.prettierrc

# Only include what's needed
# components/**/* - INCLUDED
# types/**/* - INCLUDED
# package.json - INCLUDED
# README.md - INCLUDED
`
  await writeFile(join(packageDir, '.npmignore'), npmignoreContent, 'utf-8')
  console.log('✅ Created .npmignore for security')
  
  console.log(`\n✅ AI-friendly package generated in ${packageDir}`)
  console.log(`\n📦 To publish:`)
  console.log(`  cd dist-package && npm publish --access public`)
  console.log(`\n🤖 AI tools can then:`)
  console.log(`  npm install @ai-design-system/components`)
  console.log(`  import { Button } from '@ai-design-system/components'`)
}

generateAIFriendlyPackage().catch(console.error)

