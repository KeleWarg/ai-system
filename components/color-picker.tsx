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
  const [localValue, setLocalValue] = useState(value || '#000000')

  const handleColorChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  const isValidHex = (hex: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex) || hex === 'transparent'
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <div className="flex gap-2 items-start">
        <div className="relative">
          <input
            type="color"
            value={localValue === 'transparent' ? '#000000' : localValue}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border-2 border-input bg-background"
            title="Pick color"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Input
            id={id}
            type="text"
            value={localValue}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#000000 or transparent"
            className="font-mono text-sm"
          />
          {!isValidHex(localValue) && localValue !== 'transparent' && (
            <p className="text-xs text-destructive">
              Invalid hex color (use #000000 format or &quot;transparent&quot;)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
