import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button2 component variants using class-variance-authority
 */
const button2Variants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focused-border focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        Primary: "bg-primary-bg text-primary-text hover:bg-primary-bg/90 focus:bg-primary-bg/90 active:bg-primary-bg/80",
        Secondary: "bg-secondary-bg border border-secondary-border text-secondary-text hover:bg-secondary-hover-bg focus:bg-secondary-hover-bg active:bg-secondary-pressed-bg",
        Ghost: "hover:bg-ghost-hover-bg hover:text-ghost-text focus:bg-ghost-hover-bg focus:text-ghost-text active:bg-ghost-pressed-bg",
        White: "bg-bg-white text-fg-body border border-fg-stroke-ui hover:bg-bg-neutral focus:bg-bg-neutral active:bg-bg-neutral/80",
      },
      size: {
        Small: "h-8 px-3 text-xs",
        Base: "h-10 px-4 py-2",
        Large: "h-12 px-6 text-base",
      },
      icon: {
        None: "",
        Left: "",
        Right: "",
      },
      state: {
        Enabled: "",
        Hover: "",
        Focused: "",
        Pressed: "",
        Disabled: "disabled:opacity-50 disabled:pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "Primary",
      size: "Base",
      icon: "None",
      state: "Enabled",
    },
  }
)

/**
 * Props for the Button2 component
 */
export interface Button2Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    VariantProps<typeof button2Variants> {
  /**
   * Icon element to display in the button
   */
  iconElement?: React.ReactNode
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean
  /**
   * HTML button type
   */
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Interactive UI element that triggers actions when clicked or pressed
 * 
 * @example
 * <Button2 type="Primary">Click me</Button2>
 * <Button2 type="Secondary" size="Large">Large Button</Button2>
 */
const Button2 = React.forwardRef<HTMLButtonElement, Button2Props>(
  ({ className, variant, size, icon, state, iconElement, loading, children, disabled, type, ...props }, ref) => {
    const isDisabled = disabled || state === "Disabled" || loading

    return (
      <button
        className={cn(button2Variants({ variant, size, icon, state, className }))}
        ref={ref}
        disabled={isDisabled}
        type={type}
        {...props}
      >
        {icon === "Left" && iconElement && <span className="mr-2">{iconElement}</span>}
        {loading && <span className="mr-2 animate-spin">⏳</span>}
        {children}
        {icon === "Right" && iconElement && <span className="ml-2">{iconElement}</span>}
      </button>
    )
  }
)
Button2.displayName = "Button2"

export { Button2, button2Variants }