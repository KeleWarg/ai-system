import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button2 component variants using class-variance-authority
 */
const button2Variants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      type: {
        Primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80",
        Secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:bg-secondary/80 active:bg-secondary/70",
        Ghost: "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:bg-accent/80",
        White: "bg-background text-foreground border border-border hover:bg-muted focus:bg-muted active:bg-muted/80",
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
      type: "Primary",
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button2Variants> {
  /**
   * Icon element to display in the button
   */
  iconElement?: React.ReactNode
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean
}

/**
 * Interactive UI element that triggers actions when clicked or pressed
 * 
 * @example
 * <Button2 type="Primary">Click me</Button2>
 * <Button2 type="Secondary" size="Large">Large Button</Button2>
 */
const Button2 = React.forwardRef<HTMLButtonElement, Button2Props>(
  ({ className, type, size, icon, state, iconElement, loading, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || state === "Disabled" || loading

    return (
      <button
        className={cn(button2Variants({ type, size, icon, state, className }))}
        ref={ref}
        disabled={isDisabled}
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