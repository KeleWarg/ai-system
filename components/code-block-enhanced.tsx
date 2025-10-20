'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Check, Copy } from 'lucide-react'
import { codeToHtml } from 'shiki'
import { useEffect } from 'react'

interface CodeBlockEnhancedProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
}

export function CodeBlockEnhanced({ 
  code, 
  language = 'tsx', 
  filename,
  showLineNumbers = true 
}: CodeBlockEnhancedProps) {
  const [copied, setCopied] = useState(false)
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    async function highlight() {
      try {
        const highlighted = await codeToHtml(code, {
          lang: language,
          theme: 'github-dark',
          structure: 'inline',
        })
        setHtml(highlighted)
      } catch (error) {
        console.error('Syntax highlighting error:', error)
        setHtml(`<pre><code>${code}</code></pre>`)
      }
    }
    
    highlight()
  }, [code, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative rounded-lg border border-border bg-zinc-950 dark:bg-zinc-900">
      {filename && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm">
          <span className="font-mono text-zinc-400">{filename}</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      )}
      <div className="relative">
        {!filename && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2 h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        )}
        <div 
          className="overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}

