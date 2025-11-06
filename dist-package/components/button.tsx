import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button component variants using class-variance-authority
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focused-border focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-bg text-primary-text hover:bg-primary-hover-bg active:bg-primary-pressed-bg disabled:bg-primary-disabled-bg",
        secondary: "bg-secondary border border-secondary-border text-secondary-text hover:bg-secondary-hover-bg active:bg-secondary-pressed-bg",
        ghost: "bg-ghost-bg text-ghost-text hover:bg-ghost-hover-bg active:bg-ghost-pressed-bg",
        white: "bg-white text-fg-body border border-fg-stroke-ui hover:bg-neutral-subtle active:bg-neutral-light"
      },
      size: {
        small: "h-8 px-4 py-2 text-xs gap-2",
        base: "h-10 px-4 py-2 text-sm gap-2",
        large: "h-12 px-4 py-2 text-base gap-2"
      },
      state: {
        enabled: "",
        hover: "",
        focused: "ring-2 ring-focused-border ring-offset-2",
        pressed: "",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none"
      },
      icon: {
        none: "",
        left: "flex-row",
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

/**
 * Button component props extending HTML button attributes
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as child component
   */
  asChild?: boolean
  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode
  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode
}

/**
 * Button component for user interactions
 * 
 * @example
 *