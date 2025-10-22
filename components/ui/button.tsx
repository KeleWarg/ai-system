import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focused-border disabled:pointer-events-none disabled:bg-primary-disabled-bg disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-bg text-primary-text shadow hover:bg-primary-hover-bg active:bg-primary-pressed-bg",
        destructive:
          "bg-fg-feedback-error text-primary-text shadow-sm hover:bg-fg-feedback-error/90 active:bg-fg-feedback-error/80",
        outline:
          "border border-fg-stroke-ui bg-bg-white shadow-sm hover:bg-bg-neutral-subtle hover:text-fg-body",
        secondary:
          "bg-secondary-bg border border-secondary-border text-secondary-text shadow-sm hover:bg-secondary-hover-bg active:bg-secondary-pressed-bg",
        ghost: "bg-ghost-bg text-ghost-text hover:bg-ghost-hover-bg active:bg-ghost-pressed-bg",
        link: "text-fg-link underline-offset-4 hover:underline hover:text-fg-link-secondary",
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

export { Button, buttonVariants }

