'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({ code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-lg border border-fg-stroke-ui bg-bg-neutral/50">
      {filename && (
        <div className="flex items-center justify-between border-b border-fg-stroke-ui px-4 py-2 text-sm text-fg-caption">
          <span>{filename}</span>
        </div>
      )}
      <div className="relative">
        <pre className="overflow-x-auto p-4">
          <code className="text-sm">{code}</code>
        </pre>
        <Button
          size="sm"
          variant="ghost"
          className="absolute right-2 top-2"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

