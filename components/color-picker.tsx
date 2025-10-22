'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  id?: string
}

export function ColorPicker({ label, value, onChange, id }: ColorPickerProps) {
  const [localValue, setLocalValue] = useState(value || '0 0% 0%')

  const handleColorChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  // Validate HSL format: "H S% L%" (e.g., "221 83% 53%")
  const isValidHSL = (hsl: string) => {
    if (hsl === 'transparent') return true
    // Match: number (0-360), space, number%, space, number%
    return /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/.test(hsl.trim())
  }

  // Convert HSL to hex for preview swatch
  const hslToHex = (hsl: string): string => {
    if (hsl === 'transparent') return '#00000000'
    
    const match = hsl.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/)
    if (!match) return '#000000'
    
    const h = parseInt(match[1]) / 360
    const s = parseInt(match[2]) / 100
    const l = parseInt(match[3]) / 100
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255)
    const g = Math.round(hue2rgb(p, q, h) * 255)
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255)
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <div className="flex gap-2 items-start">
        <div className="relative">
          <div
            className="h-9 w-12 rounded border-2 border-fg-stroke-ui"
            style={{ backgroundColor: hslToHex(localValue) }}
            title="Color preview"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Input
            id={id}
            type="text"
            value={localValue}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="221 83% 53%"
            className="font-mono text-sm"
          />
          {!isValidHSL(localValue) && (
            <p className="text-xs text-fg-feedback-error">
              Invalid HSL color (use format: H S% L%, e.g., &quot;221 83% 53%&quot;)
            </p>
          )}
          <p className="text-xs text-fg-caption">
            HSL format: Hue (0-360), Saturation (0-100%), Lightness (0-100%)
          </p>
        </div>
      </div>
    </div>
  )
}
