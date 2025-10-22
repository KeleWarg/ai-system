import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button component variants using class-variance-authority
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-primary font-medium transition-colors focus-visible:outline-none focus-visible:ring-primary focus-visible:ring-ring focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      type: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:bg-primary/90 active:bg-primary/95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:bg-secondary/80 active:bg-secondary/70",
        ghost: "bg-transparent text-muted-foreground hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground active:bg-secondary/80",
        white: "bg-background text-muted-foreground border border-border hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground active:bg-secondary/80",
      },
      size: {
        small: "h-8 px-4 py-2 text-primary gap-2",
        base: "h-10 px-4 py-2 text-primary gap-2",
        large: "h-12 px-6 py-3 text-primary gap-2",
      },
      state: {
        enabled: "",
        hover: "",
        focused: "",
        pressed: "",
        disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
      },
      icon: {
        none: "",
        left: "",
        right: "flex-row-reverse",
      },
    },
    defaultVariants: {
      type: "primary",
      size: "base",
      state: "enabled",
      icon: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as a different element or component
   */
  asChild?: boolean;
  /**
   * Icon element to display in the button
   */
  iconElement?: React.ReactNode;
}

/**
 * Button component with multiple variants, states, and icon support
 * 
 * @example
 * <Button type="primary" size="base">Click me</Button>
 * <Button type="secondary" size="large" icon="left" iconElement={<Icon />}>
 *   With Icon
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    type, 
    size, 
    state, 
    icon, 
    asChild = false, 
    iconElement,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Apply disabled state variant when disabled prop is true
    const appliedState = disabled ? "disabled" : state;

    return (
      <Comp
        className={cn(buttonVariants({ type, size, state: appliedState, icon, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {iconElement && icon !== "none" && (
          <span className="w-4 h-4 flex items-center justify-center">
            {iconElement}
          </span>
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export type ButtonVariants = VariantProps<typeof buttonVariants>;