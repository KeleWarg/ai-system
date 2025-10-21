/**
 * Test script to verify component save functionality
 */

const testComponentCode = `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        base: "h-10 px-4 py-2",
        small: "h-8 px-3 py-1.5",
        large: "h-12 px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "base",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`

const testPayload = {
  name: 'TestButton',
  slug: 'test-button',
  component_name: 'Button',
  description: 'A test button component',
  category: 'inputs',
  code: testComponentCode,
  variants: {
    variant: ['primary', 'secondary'],
    size: ['base', 'small', 'large']
  },
  props: {
    variant: { type: 'string', default: 'primary' },
    size: { type: 'string', default: 'base' },
  },
  prompts: {
    basic: ['Create a button'],
    advanced: ['Create a primary button with icon'],
    useCases: ['Form submission', 'Navigation']
  },
  installation: 'npm install @radix-ui/react-slot class-variance-authority',
  theme_id: null
}

console.log('🧪 Testing component save...\n')
console.log('📦 Payload summary:')
console.log('  - Name:', testPayload.name)
console.log('  - Slug:', testPayload.slug)
console.log('  - Component name:', testPayload.component_name)
console.log('  - Code length:', testPayload.code.length, 'chars')
console.log('  - Variants:', Object.keys(testPayload.variants).join(', '))
console.log('\n⚠️  Note: This requires an authenticated session')
console.log('💡 Please test manually in the browser instead\n')
console.log('Steps to test:')
console.log('1. Go to http://localhost:3000/admin/components/new')
console.log('2. Upload a spec sheet')
console.log('3. Generate component')
console.log('4. Click "Save Component"')
console.log('5. Check browser console for logs')
console.log('6. Check terminal for backend logs')

