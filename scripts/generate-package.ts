import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { sanitizeComponentCode, validateComponentCode } from './sanitize-component-code'

config({ path: join(process.cwd(), '.env.local') })

/**
 * Generate an installable npm package from components in the registry
 */
async function generatePackage() {
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
  
  console.log(`📦 Generating package for ${components.length} components...`)
  
  const packageDir = join(process.cwd(), 'dist-package')
  const componentsDir = join(packageDir, 'components')
  
  // Create directories
  await mkdir(packageDir, { recursive: true })
  await mkdir(componentsDir, { recursive: true })
  
  // Generate component files
  const exports: string[] = []
  const allDependencies = new Set<string>([
    '@radix-ui/react-slot',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
  ])
  
  for (const component of components) {
    const slug = component.slug
    const fileName = `${slug}.tsx`
    const filePath = join(componentsDir, fileName)
    
    // Security: Validate and sanitize component code
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
    
    // Write sanitized component file
    await writeFile(filePath, sanitized, 'utf-8')
    console.log(`✅ Generated ${fileName}${sanitizeErrors.length > 0 ? ' (sanitized)' : ''}`)
    
    // Add export
    exports.push(`export { ${component.component_name} as ${component.component_name} } from './${slug}'`)
    
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
  }
  
  // Generate index.ts
  const indexContent = `// Auto-generated component exports
${exports.join('\n')}
`
  await writeFile(join(componentsDir, 'index.ts'), indexContent, 'utf-8')
  
  // Generate package.json
  // ⚠️ IMPORTANT: Change the name if you want a different npm package name
  // Options:
  // - '@ai-design-system/components' (requires npm org: ai-design-system)
  // - '@your-username/components' (uses your personal scope)
  // - 'ai-design-system-components' (unscoped, no org needed)
  const packageJson = {
    name: '@ai-design-system/components', // Change this to your preferred name
    version: '1.0.0',
    description: 'AI-generated React components from your design system',
    author: 'Your Name', // Add your name/email
    repository: {
      type: 'git',
      url: 'https://github.com/your-org/ai-design-system', // Update with your repo
    },
    homepage: 'https://your-domain.com/docs/components', // Update with your domain
    bugs: {
      url: 'https://github.com/your-org/ai-design-system/issues', // Update
    },
    main: './components/index.ts',
    types: './components/index.ts',
    files: ['components/**/*'],
    peerDependencies: {
      react: '^18.0.0 || ^19.0.0',
      'react-dom': '^18.0.0 || ^19.0.0',
      '@radix-ui/react-slot': '^1.2.3',
      'class-variance-authority': '^0.7.1',
      clsx: '^2.1.1',
      'tailwind-merge': '^3.3.1',
    },
    keywords: ['react', 'components', 'design-system', 'tailwind', 'ai-generated', 'typescript'],
    license: 'MIT',
  }
  
  await writeFile(
    join(packageDir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf-8'
  )
  
  // Copy .npmignore for security
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
  
  // Generate README
  const readme = `# AI Design System Components

Installable package of AI-generated React components.

## Installation

\`\`\`bash
npm install ./dist-package
\`\`\`

Or copy the \`components\` folder to your project.

## Usage

\`\`\`tsx
import { Button } from '@ai-design-system/components'

<Button variant="primary">Click me</Button>
\`\`\`

## Components

${components.map(c => `- **${c.name}** (\`${c.slug}\`) - ${c.description || 'No description'}`).join('\n')}

## Required Dependencies

${Array.from(allDependencies).map(dep => `- ${dep}`).join('\n')}

## Documentation

Visit https://your-domain.com/docs/components for full documentation.
`
  
  await writeFile(join(packageDir, 'README.md'), readme, 'utf-8')
  
  console.log(`\n✅ Package generated in ${packageDir}`)
  console.log(`\nTo install:`)
  console.log(`  npm install ./dist-package`)
  console.log(`\nOr publish to npm:`)
  console.log(`  cd dist-package && npm publish`)
}

generatePackage().catch(console.error)

