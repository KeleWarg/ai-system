import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      type: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 focus:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90 focus:bg-secondary/80',
        ghost: 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/90 focus:bg-accent',
        white: 'bg-background text-foreground border border-border hover:bg-accent hover:text-accent-foreground active:bg-accent/90 focus:bg-accent'
      },
      size: {
        small: 'h-8 px-3 text-sm',
        base: 'h-10 px-4 text-sm',
        large: 'h-12 px-5 text-base'
      },
      state: {
        enabled: '',
        hover: '',
        focused: '',
        pressed: '',
        disabled: 'opacity-50 cursor-not-allowed pointer-events-none'
      },
      icon: {
        none: '',
        left: 'gap-2',
        right: 'gap-2 flex-row-reverse'
      }
    },
    defaultVariants: {
      type: 'primary',
      size: 'base',
      state: 'enabled',
      icon: 'none'
    }
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
  htmlType?: 'button' | 'submit' | 'reset'
}

/**
 * Interactive button component with multiple variants, states, and icon placement options
 * 
 * @example
 * <Button type="primary" size="base">Click me</Button>
 * <Button type="secondary" size="large" leftIcon={<Icon />}>With Icon</Button>
 * <Button type="ghost" disabled>Disabled</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    type, 
    size, 
    state, 
    icon,
    asChild = false, 
    leftIcon,
    rightIcon,
    children,
    disabled,
    htmlType = 'button',
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    // Determine icon variant based on props
    const iconVariant = leftIcon ? 'left' : rightIcon ? 'right' : icon || 'none'
    
    // Handle disabled state
    const stateVariant = disabled ? 'disabled' : state || 'enabled'
    
    const iconSize = size === 'small' ? 16 : 20
    
    const renderIcon = (iconElement: React.ReactNode) => {
      if (React.isValidElement(iconElement)) {
        return React.cloneElement(iconElement as React.ReactElement<any>, {
          size: iconSize,
          className: cn('shrink-0', (iconElement as any).props?.className)
        } as any)
      }
      return iconElement
    }

    return (
      <Comp
        className={cn(buttonVariants({ type, size, state: stateVariant, icon: iconVariant }), className)}
        ref={ref}
        disabled={disabled || stateVariant === 'disabled'}
        type={asChild ? undefined : htmlType}
        {...props}
      >
        {leftIcon && renderIcon(leftIcon)}
        {children}
        {rightIcon && renderIcon(rightIcon)}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export type { VariantProps }