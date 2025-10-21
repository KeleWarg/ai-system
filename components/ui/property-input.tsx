'use client'

/**
 * Property Input Components
 * Specialized inputs for editing component properties visually
 */

import { useState, useEffect } from 'react'
import { Input } from './input'
import { Label } from './label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Button } from './button'
import { Badge } from './badge'
import { X, Plus } from 'lucide-react'
import { 
  pixelsToTailwind,
  tailwindToPixels,
  getSpacingOptions,
  getFontSizeOptions,
  getFontWeightOptions,
} from '@/lib/tailwind-converter'

interface BaseInputProps {
  label: string
  hasIssue?: boolean
  recommendation?: string
}

/**
 * Spacing Input - Tailwind class + pixel value with bidirectional conversion
 */
interface SpacingInputProps extends BaseInputProps {
  tailwindValue: string
  pixelValue: number
  property: string
  onChange: (tailwindClass: string, pixels: number) => void
}

export function SpacingInput({
  label,
  tailwindValue,
  pixelValue,
  property,
  hasIssue,
  recommendation,
  onChange,
}: SpacingInputProps) {
  const [tw, setTw] = useState(tailwindValue)
  const [px, setPx] = useState(pixelValue)
  
  const options = getSpacingOptions()
  
  // Find closest Tailwind option or use arbitrary value
  const currentOption = options.find((opt) => opt.pixels === px)
  
  useEffect(() => {
    setTw(tailwindValue)
    setPx(pixelValue)
  }, [tailwindValue, pixelValue])
  
  const handlePixelChange = (value: string) => {
    const pixels = parseInt(value, 10)
    if (isNaN(pixels)) return
    
    setPx(pixels)
    const tailwind = pixelsToTailwind(property, pixels)
    setTw(tailwind)
    onChange(tailwind, pixels)
  }
  
  const handleTailwindChange = (value: string) => {
    setTw(value)
    const pixels = tailwindToPixels(property, value) || px
    setPx(pixels)
    onChange(value, pixels)
  }
  
  return (
    <div className={`space-y-2 p-3 rounded-lg border ${hasIssue ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <Label className={hasIssue ? 'text-red-600' : ''}>{label}</Label>
        {hasIssue && <Badge variant="destructive" className="text-xs">Issue</Badge>}
      </div>
      
      {recommendation && (
        <p className="text-xs text-red-600">{recommendation}</p>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Tailwind Class</Label>
          <Select value={currentOption?.value || 'custom'} onValueChange={(val) => {
            if (val === 'custom') return
            const opt = options.find((o) => o.value === val)
            if (opt) {
              handleTailwindChange(pixelsToTailwind(property, opt.pixels))
            }
          }}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground">Pixels</Label>
          <Input
            type="number"
            value={px}
            onChange={(e) => handlePixelChange(e.target.value)}
            className="h-8"
          />
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Current: <code className="bg-muted px-1 rounded">{tw}</code>
      </div>
    </div>
  )
}

/**
 * Color Input - Theme token selector with color preview
 */
interface ColorInputProps extends BaseInputProps {
  currentValue: string
  hexValue?: string
  onChange: (value: string) => void
  useThemeTokens?: boolean
}

export function ColorInput({
  label,
  currentValue,
  hexValue,
  hasIssue,
  recommendation,
  onChange,
  useThemeTokens = true,
}: ColorInputProps) {
  const themeTokens = [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-muted',
    'bg-background',
    'text-primary',
    'text-secondary',
    'text-foreground',
    'text-muted-foreground',
    'border-border',
    'border-input',
  ]
  
  return (
    <div className={`space-y-2 p-3 rounded-lg border ${hasIssue ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <Label className={hasIssue ? 'text-red-600' : ''}>{label}</Label>
        {hasIssue && <Badge variant="destructive" className="text-xs">Issue</Badge>}
      </div>
      
      {recommendation && (
        <p className="text-xs text-red-600">{recommendation}</p>
      )}
      
      {useThemeTokens ? (
        <Select value={currentValue} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {themeTokens.map((token) => (
              <SelectItem key={token} value={token}>
                {token}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="text"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      )}
      
      {hexValue && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded border" style={{ backgroundColor: hexValue }} />
          <span>{hexValue}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Typography Input - Font size/weight selector
 */
interface TypographyInputProps extends BaseInputProps {
  tailwindValue: string
  pixelValue: number
  property: 'fontSize' | 'fontWeight'
  onChange: (value: string) => void
}

export function TypographyInput({
  label,
  tailwindValue,
  pixelValue,
  property,
  hasIssue,
  recommendation,
  onChange,
}: TypographyInputProps) {
  const options = property === 'fontSize' ? getFontSizeOptions() : getFontWeightOptions()
  
  return (
    <div className={`space-y-2 p-3 rounded-lg border ${hasIssue ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <Label className={hasIssue ? 'text-red-600' : ''}>{label}</Label>
        {hasIssue && <Badge variant="destructive" className="text-xs">Issue</Badge>}
      </div>
      
      {recommendation && (
        <p className="text-xs text-red-600">{recommendation}</p>
      )}
      
      <Select value={tailwindValue} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="text-xs text-muted-foreground">
        Current: <code className="bg-muted px-1 rounded">{tailwindValue}</code> ({pixelValue}{property === 'fontSize' ? 'px' : ''})
      </div>
    </div>
  )
}

/**
 * Variant Manager - Add/remove variant values
 */
interface VariantManagerProps extends BaseInputProps {
  variantKey: string
  values: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}

export function VariantManager({
  label,
  variantKey,
  values,
  hasIssue,
  recommendation,
  onAdd,
  onRemove,
}: VariantManagerProps) {
  const [newValue, setNewValue] = useState('')
  
  const handleAdd = () => {
    if (!newValue.trim()) return
    onAdd(newValue.trim())
    setNewValue('')
  }
  
  return (
    <div className={`space-y-2 p-3 rounded-lg border ${hasIssue ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <Label className={hasIssue ? 'text-red-600' : ''}>{label}</Label>
        {hasIssue && <Badge variant="destructive" className="text-xs">Issue</Badge>}
      </div>
      
      {recommendation && (
        <p className="text-xs text-red-600">{recommendation}</p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge key={value} variant="secondary" className="gap-1">
            {value}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onRemove(value)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add variant value..."
          className="h-8"
        />
        <Button size="sm" onClick={handleAdd} className="h-8">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Variant key: <code className="bg-muted px-1 rounded">{variantKey}</code>
      </p>
    </div>
  )
}

