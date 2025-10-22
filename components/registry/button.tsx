import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focused-border focus-visible:ring-offset-2 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary-bg text-primary-text hover:bg-primary-hover-bg active:bg-primary-pressed-bg disabled:bg-primary-disabled-bg",
        secondary: "bg-secondary border border-secondary-border text-secondary-text hover:bg-secondary-hover-bg active:bg-secondary-pressed-bg",
        ghost: "bg-ghost-bg text-ghost-text hover:bg-ghost-hover-bg active:bg-ghost-pressed-bg",
        white: "bg-white border border-secondary-border text-secondary-text hover:bg-neutral-subtle active:bg-neutral-light"
      },
      size: {
        small: "h-8 px-3 py-[6px] text-sm gap-2",
        base: "h-10 px-4 py-[10px] text-sm gap-2", 
        large: "h-12 px-5 py-3 text-base gap-2"
      },
      state: {
        enabled: "",
        hover: "",
        focused: "ring-2 ring-focused-border ring-offset-2",
        pressed: "",
        disabled: "opacity-50 cursor-not-allowed"
      },
      icon: {
        none: "",
        left: "",
        right: "flex-row-reverse"
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
  children?: React.ReactNode
}

/**
 * Interactive button component for triggering actions with multiple variants, states, and icon positions
 * 
 * @example
 * <Button variant="primary" size="base">
 *   Click me
 * </Button>
 * 
 * @example
 * <Button variant="secondary" size="large" leftIcon={<Icon />}>
 *   With Icon
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, state, icon, asChild = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Determine icon position based on props
    const iconPosition = leftIcon ? "left" : rightIcon ? "right" : "none"
    const finalIcon = icon || iconPosition
    
    // Set disabled state if disabled prop is true
    const finalState = disabled ? "disabled" : state
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, state: finalState, icon: finalIcon, className }))}
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      >
        {leftIcon && (
          <span className="w-5 h-5 flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="w-5 h-5 flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export type ButtonVariants = VariantProps<typeof buttonVariants>