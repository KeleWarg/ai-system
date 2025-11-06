import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focused-border focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-bg text-primary-text hover:bg-primary-hover-bg active:bg-primary-pressed-bg disabled:bg-primary-disabled-bg",
        secondary: "bg-secondary border border-secondary-border text-secondary-text hover:bg-secondary-hover-bg active:bg-secondary-pressed-bg",
        ghost: "bg-ghost-bg text-ghost-text hover:bg-ghost-hover-bg active:bg-ghost-pressed-bg",
        white: "bg-white text-fg-body border border-fg-stroke-ui hover:bg-neutral-subtle"
      },
      size: {
        small: "h-8 px-3 text-sm",
        base: "h-10 px-4 text-sm",
        large: "h-12 px-5 text-base"
      },
      state: {
        enabled: "",
        hover: "",
        focused: "ring-2 ring-focused-border ring-offset-2",
        pressed: "",
        disabled: "disabled:opacity-50 disabled:pointer-events-none"
      },
      icon: {
        none: "",
        left: "gap-2",
        right: "gap-2"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "base",
      state: "enabled",
      icon: "none"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/**
 * Button component with multiple variants, states, and icon support
 * 
 * @example
 * <Button variant="primary" size="base">
 *   Click me
 * </Button>
 * 
 * @example
 * <Button variant="secondary" leftIcon={<Icon />}>
 *   With icon
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, state, icon, asChild = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Determine icon variant based on presence of icons
    const iconVariant = leftIcon ? "left" : rightIcon ? "right" : "none"
    
    // Determine state based on disabled prop
    const stateVariant = disabled ? "disabled" : state || "enabled"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, state: stateVariant, icon: iconVariant, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {leftIcon && (
          <span className="w-4 h-4 flex-shrink-0">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="w-4 h-4 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
export type { VariantProps }