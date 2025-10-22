import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-focused-border focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-bg text-primary-text shadow hover:bg-primary-hover-bg",
        secondary:
          "border-transparent bg-bg-neutral text-fg-body hover:bg-bg-neutral-light",
        destructive:
          "border-transparent bg-fg-feedback-error text-primary-text shadow hover:bg-fg-feedback-error/80",
        outline: "text-fg-body border-fg-stroke-ui",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

