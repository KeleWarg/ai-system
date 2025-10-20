'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Loader2, Sparkles } from 'lucide-react'

interface AIGenerateButtonProps {
  onGenerate: () => Promise<void>
  label?: string
  disabled?: boolean
}

export function AIGenerateButton({
  onGenerate,
  label = 'Generate with AI',
  disabled = false,
}: AIGenerateButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onGenerate()
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  )
}

