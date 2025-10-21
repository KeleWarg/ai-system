/**
 * Theme-Aware Mapping Input Components
 */

import { Label } from './label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Input } from './input'
import { AlertCircle } from 'lucide-react'

interface ColorMappingInputProps {
  title: string
  specRequirement: string
  currentValue: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function ColorMappingInput({
  title,
  specRequirement,
  currentValue,
  options,
  value,
  onChange,
}: ColorMappingInputProps) {
  return (
    <div className="space-y-3 pb-6 border-b last:border-0 last:pb-0">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Replace hardcoded color with a theme token for consistency
          </p>
        </div>
      </div>
      
      <div className="ml-7 space-y-2">
        <Label className="text-sm">Map to theme color</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Select theme color..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {currentValue.startsWith('#') && value && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border border-border" 
                style={{ background: currentValue }}
              />
              <span className="text-muted-foreground">Spec color</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded border border-border ${value}`} />
              <span className="text-muted-foreground">Your theme</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface SpacingMappingInputProps {
  title: string
  specRequirement: string
  suggestedFix: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function SpacingMappingInput({
  title,
  specRequirement,
  suggestedFix,
  options,
  value,
  onChange,
}: SpacingMappingInputProps) {
  return (
    <div className="space-y-3 pb-6 border-b last:border-0 last:pb-0">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Set the spacing to match the design specification
          </p>
        </div>
      </div>
      
      <div className="ml-7 space-y-2">
        <Label className="text-sm">Select spacing value</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Select spacing..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Recommended: {suggestedFix}
        </p>
      </div>
    </div>
  )
}

interface VariantMappingInputProps {
  title: string
  specRequirement: string
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
}

export function VariantMappingInput({
  title,
  specRequirement,
  options,
  selectedValues,
  onChange,
}: VariantMappingInputProps) {
  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }
  
  return (
    <div className="space-y-3 pb-6 border-b last:border-0 last:pb-0">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Add these variant options to match the design system
          </p>
        </div>
      </div>
      
      <div className="ml-7 space-y-2">
        <Label className="text-sm">Include variant values</Label>
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => toggleValue(option)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Expected: {specRequirement}
        </p>
      </div>
    </div>
  )
}

