# Following shadcn's Approach

## The Right Way: File-Based Component Registry

### How shadcn Does It:

1. Components are saved as actual `.tsx` files
2. They're imported directly in documentation
3. No runtime compilation or iframe tricks
4. Type-safe, performant, simple

### Our Implementation:

```
ai-design-system/
├── components/
│   └── registry/          # Generated components go here
│       ├── button.tsx
│       ├── card.tsx
│       └── index.ts       # Export all components
├── app/
│   └── (public)/
│       └── docs/
│           └── components/
│               └── [slug]/
│                   └── page.tsx  # Imports from registry
```

## Implementation Steps:

### 1. When AI Generates a Component:

```typescript
// app/admin/components/new/page.tsx
const handleSave = async () => {
  // Generate code with Claude
  const code = await generateComponent(...)
  
  // Save to database
  await saveToDatabase(...)
  
  // Write to file system
  await writeComponentFile({
    slug: componentSlug,
    code: generatedCode
  })
  
  // Trigger Next.js rebuild (dev mode auto-reloads)
}
```

### 2. Component File Structure:

```typescript
// components/registry/button.tsx
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 3. Registry Index:

```typescript
// components/registry/index.ts
export { Button } from './button'
export { Card } from './card'
// ... auto-generated exports
```

### 4. Documentation Page:

```typescript
// app/(public)/docs/components/[slug]/page.tsx
import { Button } from '@/components/registry'

export default function ComponentPage() {
  return (
    <div>
      {/* Real component rendering - no iframe! */}
      <div className="preview-section">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
      </div>
      
      {/* Code display */}
      <CodeBlock code={componentCode} />
    </div>
  )
}
```

## Benefits:

✅ **No iframe complexity**
✅ **No runtime compilation**
✅ **Full TypeScript support**
✅ **Better performance**
✅ **Hot reload in dev**
✅ **Type-safe props**
✅ **Real React components**
✅ **Works with Next.js perfectly**

## Challenges & Solutions:

### Challenge 1: Dynamic Imports
**Problem**: We don't know component names at build time
**Solution**: Use Next.js dynamic imports

```typescript
const DynamicComponent = dynamic(() => 
  import(`@/components/registry/${slug}`).then(mod => mod[componentName])
)
```

### Challenge 2: File System Writes
**Problem**: Need to write files during component generation
**Solution**: Use Node.js `fs` module in API routes

```typescript
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const { slug, code } = await req.json()
  
  // Write component file
  const filePath = path.join(process.cwd(), 'components/registry', `${slug}.tsx`)
  await fs.writeFile(filePath, code, 'utf-8')
  
  // Update registry index
  await updateRegistryIndex()
}
```

### Challenge 3: Auto-Generating Preview Variants
**Problem**: We need to show all variants automatically
**Solution**: Parse the component metadata or use a config file

```typescript
// components/registry/_meta.ts
export const componentMeta = {
  button: {
    variants: {
      variant: ['default', 'secondary', 'outline'],
      size: ['sm', 'default', 'lg']
    },
    examples: [
      { props: { variant: 'default' }, children: 'Default' },
      { props: { variant: 'secondary' }, children: 'Secondary' },
    ]
  }
}
```

## Next Steps:

1. Create `/components/registry/` directory
2. Add file writing API endpoint
3. Update component generation to write files
4. Modify docs pages to import from registry
5. Create dynamic preview component that reads metadata
6. Remove iframe-based preview code

This is the **industry standard** approach and exactly how production-ready component libraries work!

