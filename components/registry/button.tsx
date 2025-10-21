import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      type: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        white: "bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        small: "h-8 px-3 text-sm",
        base: "h-10 px-4 text-sm",
        large: "h-12 px-5 text-base",
      },
      state: {
        enabled: "",
        hover: "",
        focused: "ring-2 ring-ring ring-offset-2",
        pressed: "scale-95",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none",
      },
      icon: {
        none: "",
        left: "gap-2",
        right: "gap-2 flex-row-reverse",
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
  asChild?: boolean;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type, size, state, icon, asChild = false, children, leftIcon, rightIcon, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const iconElement = leftIcon || rightIcon;
    const iconPosition = leftIcon ? "left" : rightIcon ? "right" : "none";
    
    return (
      <Comp
        className={cn(buttonVariants({ type, size, state, icon: iconElement ? iconPosition : icon, className }))}
        ref={ref}
        {...props}
      >
        {leftIcon && <span className="w-4 h-4">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="w-4 h-4">{rightIcon}</span>}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };