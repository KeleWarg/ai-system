import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const zipcodeInputFormVariants = cva(
  'bg-neutral-subtle border border-fg-stroke-ui rounded-lg p-6 flex gap-8',
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        base: '',
      },
      state: {
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'base',
      state: 'default',
    },
  }
)

export interface ZipcodeInputFormProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof zipcodeInputFormVariants> {
  title?: string
  description?: string
  rating?: number
  placeholder?: string
  buttonText?: string
  onSubmit?: (zipcode: string) => void
}

const ZipcodeInputForm = React.forwardRef<HTMLDivElement, ZipcodeInputFormProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    title = "Find Service in Your Area",
    description = "Enter your zipcode to see available services and pricing in your location. Our coverage spans across major metropolitan areas.",
    rating = 4.8,
    placeholder = "Enter zipcode",
    buttonText = "Get Started",
    onSubmit,
    ...props 
  }, ref) => {
    const [zipcode, setZipcode] = React.useState('')

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (onSubmit && zipcode.trim()) {
        onSubmit(zipcode.trim())
      }
    }

    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'text-lg',
            i < Math.floor(rating) ? 'text-warning-text' : 'text-fg-subtle'
          )}
        >
          ★
        </span>
      ))
    }

    return (
      <div
        ref={ref}
        className={cn(zipcodeInputFormVariants({ variant, size, state, className }))}
        {...props}
      >
        {/* Left Section */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-fg-body mb-3">
              {title}
            </h3>
            <p className="text-fg-body-subtle leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex">
              {renderStars(rating)}
            </div>
            <span className="text-sm text-fg-body-subtle ml-1">
              {rating} out of 5 stars
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="zipcode-input" className="block text-sm font-medium text-fg-body mb-2">
                Zipcode
              </label>
              <input
                id="zipcode-input"
                type="text"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-surface border border-fg-stroke-ui rounded-lg px-4 py-3 text-fg-body placeholder-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary-bg focus:border-transparent"
                maxLength={10}
                pattern="[0-9]{5}(-[0-9]{4})?"
                aria-describedby="zipcode-help"
              />
              <p id="zipcode-help" className="text-xs text-fg-body-subtle mt-1">
                Enter 5-digit zipcode (e.g., 12345)
              </p>
            </div>
            
            <button
              type="submit"
              disabled={!zipcode.trim()}
              className="w-full bg-primary-bg text-primary-text font-medium py-3 px-6 rounded-lg hover:bg-primary-bg-hover focus:outline-none focus:ring-2 focus:ring-primary-bg focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    )
  }
)

ZipcodeInputForm.displayName = 'ZipcodeInputForm'

export { ZipcodeInputForm, zipcodeInputFormVariants }
export type { ZipcodeInputFormProps }