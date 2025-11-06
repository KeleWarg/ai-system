import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const zipcodeFormVariants = cva(
  "bg-surface-primary border border-fg-stroke-ui rounded-lg p-6 flex gap-4",
  {
    variants: {
      state: {
        default: "",
        focus: "ring-2 ring-primary-focus",
        hover: "shadow-md"
      },
      layout: {
        horizontal: "flex-row items-center"
      }
    },
    defaultVariants: {
      state: "default",
      layout: "horizontal"
    }
  }
);

const inputVariants = cva(
  "bg-surface-secondary border border-fg-stroke-ui rounded-lg px-4 py-3 text-fg-body placeholder:text-fg-placeholder focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-primary-border",
  {
    variants: {
      state: {
        default: "",
        focus: "ring-2 ring-primary-focus border-primary-border",
        hover: "border-fg-stroke-ui-hover"
      }
    },
    defaultVariants: {
      state: "default"
    }
  }
);

const buttonVariants = cva(
  "bg-neutral-strong text-fg-on-primary px-6 py-3 rounded-lg font-medium hover:bg-neutral-stronger focus:outline-none focus:ring-2 focus:ring-primary-focus transition-colors",
  {
    variants: {
      state: {
        default: "",
        focus: "ring-2 ring-primary-focus",
        hover: "bg-neutral-stronger"
      }
    },
    defaultVariants: {
      state: "default"
    }
  }
);

export interface ZipcodeFormProps 
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'>,
    VariantProps<typeof zipcodeFormVariants> {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  onSubmit?: (zipcode: string) => void;
}

const ZipcodeForm = React.forwardRef<HTMLDivElement, ZipcodeFormProps>(
  ({ 
    className, 
    state, 
    layout, 
    title = "Enter Your Zipcode",
    description = "Find services and information available in your area by entering your zipcode below.",
    placeholder = "Enter zipcode",
    buttonText = "Submit",
    onSubmit,
    ...props 
  }, ref) => {
    const [zipcode, setZipcode] = React.useState("");
    const [inputState, setInputState] = React.useState<"default" | "focus" | "hover">("default");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (zipcode.trim() && onSubmit) {
        onSubmit(zipcode.trim());
      }
    };

    return (
      <div
        ref={ref}
        className={cn(zipcodeFormVariants({ state, layout }), className)}
        {...props}
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-fg-body mb-2">
            {title}
          </h3>
          <p className="text-fg-secondary text-sm leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              onFocus={() => setInputState("focus")}
              onBlur={() => setInputState("default")}
              onMouseEnter={() => setInputState(inputState === "focus" ? "focus" : "hover")}
              onMouseLeave={() => setInputState(inputState === "focus" ? "focus" : "default")}
              placeholder={placeholder}
              className={cn(inputVariants({ state: inputState }), "w-32")}
              pattern="[0-9]{5}(-[0-9]{4})?"
              maxLength={10}
              aria-label="Zipcode input"
              aria-describedby="zipcode-description"
            />
            <button
              type="submit"
              className={cn(buttonVariants({ state }))}
              disabled={!zipcode.trim()}
              aria-label={`${buttonText} zipcode form`}
            >
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    );
  }
);

ZipcodeForm.displayName = "ZipcodeForm";

export { ZipcodeForm, zipcodeFormVariants };
export type { ZipcodeFormProps };