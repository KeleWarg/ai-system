import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n')

  try {
    // Create default theme
    console.log('📦 Creating default theme...')
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .insert({
        name: 'Default Theme',
        slug: 'default',
        is_active: true,
        colors: {
          // Button / Primary (7 tokens) - Health SEM Theme
          'primary-bg': '168 11% 45%',
          'primary-text': '0 0% 100%',
          'primary-icon': '0 0% 100%',
          'primary-hover-bg': '168 17% 33%',
          'primary-pressed-bg': '167 21% 30%',
          'primary-disabled-bg': '168 11% 45%',
          'focused-border': '202 84% 73%',
          
          // Button / Secondary (7 tokens)
          'secondary-bg': '160 13% 95%',
          'secondary-border': '168 11% 45%',
          'secondary-text': '168 11% 45%',
          'secondary-icon': '167 21% 30%',
          'secondary-hover-bg': '168 28% 86%',
          'secondary-pressed-bg': '167 16% 67%',
          'secondary-disabled-bg': '160 13% 95%',
          
          // Button / Ghost (6 tokens)
          'ghost-bg': '0 0% 100% / 0',
          'ghost-text': '167 21% 30%',
          'ghost-icon': '167 21% 30%',
          'ghost-hover-bg': '168 28% 86%',
          'ghost-pressed-bg': '167 16% 67%',
          'ghost-disabled-bg': '219 21% 87%',
          
          // Background (17 tokens)
          'bg-white': '0 0% 100%',
          'bg-neutral-subtle': '225 22% 96%',
          'bg-neutral-light': '214 23% 94%',
          'bg-neutral': '216 22% 91%',
          'bg-accent': '40 14% 96%',
          'bg-accent-mid': '39 100% 92%',
          'bg-brand-subtle': '160 13% 95%',
          'bg-table': '160 13% 95%',
          'bg-secondary': '168 28% 86%',
          'bg-brand-light': '168 28% 86%',
          'bg-brand-mid': '167 16% 67%',
          'bg-brand': '168 11% 45%',
          'bg-neutral-mid': '218 9% 24%',
          'bg-neutral-strong': '220 9% 19%',
          'bg-header': '214 10% 13%',
          'bg-superlative': '25 86% 50%',
          'bg-button': '168 11% 45%',
          
          // Foreground (18 tokens)
          'fg-heading': '214 10% 13%',
          'fg-body': '218 9% 24%',
          'fg-link-secondary': '218 9% 24%',
          'fg-caption': '214 10% 42%',
          'fg-stroke-ui': '213 12% 55%',
          'fg-link': '168 11% 45%',
          'fg-stroke-ui-inverse': '219 21% 87%',
          'fg-heading-inverse': '0 0% 100%',
          'fg-body-inverse': '225 22% 96%',
          'fg-caption-inverse': '219 21% 87%',
          'fg-table-border': '217 20% 79%',
          'fg-stroke-default': '217 20% 79%',
          'fg-divider': '219 21% 87%',
          'fg-stroke-inverse': '0 0% 100%',
          'fg-stroke-dark-inverse': '218 9% 24%',
          'fg-feedback-error': '12 84% 50%',
          'fg-feedback-warning': '37 100% 61%',
          'fg-feedback-success': '169 82% 25%',
          
          // Superlative (2 tokens)
          'superlative-primary': '25 86% 50%',
          'superlative-secondary': '168 11% 45%',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: {
            base: '16px',
            sm: '14px',
            lg: '18px',
            xl: '20px',
          },
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        radius: '0.5rem',
      })
      .select()
      .single()

    if (themeError) {
      console.error('❌ Error creating theme:', themeError)
      return
    }

    console.log('✅ Default theme created:', theme.name)

    // Create sample button component
    console.log('\n📦 Creating sample button component...')
    const { data: button, error: buttonError } = await supabase
      .from('components')
      .insert({
        name: 'Button',
        component_name: 'Button',
        slug: 'button',
        description: 'A versatile button component with multiple variants and sizes',
        category: 'buttons',
        theme_id: theme.id,
        code: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary-hover",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive-hover",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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

export { Button, buttonVariants }`,
        variants: {
          variant: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
          size: ['default', 'sm', 'lg', 'icon'],
        },
        props: [
          {
            name: 'variant',
            type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
            default: '"default"',
            description: 'The visual style variant of the button',
          },
          {
            name: 'size',
            type: '"default" | "sm" | "lg" | "icon"',
            default: '"default"',
            description: 'The size of the button',
          },
          {
            name: 'asChild',
            type: 'boolean',
            default: 'false',
            description: 'When true, the button will render as a child component',
          },
        ],
        prompts: {
          component: 'Create a versatile button component with multiple variants (default, destructive, outline, secondary, ghost, link) and sizes (sm, md, lg, icon)',
          variants: 'Support different visual styles for various use cases',
          accessibility: 'Ensure proper focus states and ARIA attributes',
        },
        installation: {
          dependencies: ['@radix-ui/react-slot', 'class-variance-authority'],
          steps: [
            'Install dependencies: npm install @radix-ui/react-slot class-variance-authority',
            'Copy the button component code to your components folder',
            'Import and use: import { Button } from "@/components/ui/button"',
          ],
        },
      })
      .select()
      .single()

    if (buttonError) {
      console.error('❌ Error creating button component:', buttonError)
      return
    }

    console.log('✅ Button component created')

    // Create sample card component
    console.log('\n📦 Creating sample card component...')
    const { data: card, error: cardError } = await supabase
      .from('components')
      .insert({
        name: 'Card',
        component_name: 'Card',
        slug: 'card',
        description: 'A flexible card container for displaying content',
        category: 'data-display',
        theme_id: theme.id,
        code: `import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`,
        variants: {},
        props: [
          {
            name: 'className',
            type: 'string',
            description: 'Additional CSS classes to apply',
          },
        ],
        prompts: {
          component: 'Create a flexible card component with header, content, and footer sections',
          structure: 'Provide composable sub-components for different card sections',
        },
        installation: {
          dependencies: [],
          steps: [
            'Copy the card component code to your components folder',
            'Import and use: import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"',
          ],
        },
      })
      .select()
      .single()

    if (cardError) {
      console.error('❌ Error creating card component:', cardError)
      return
    }

    console.log('✅ Card component created')

    console.log('\n✨ Database seeded successfully!')
    console.log('\n📝 Summary:')
    console.log('  - 1 theme created (Default Theme)')
    console.log('  - 2 components created (Button, Card)')
    console.log('\n🌐 Visit http://localhost:3002/docs/components to see them!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

seedDatabase()
