'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { EXPECTED_TOKENS, validateRuntimeColors } from '@/scripts/validate-runtime-colors'
import type { RuntimeValidationResult } from '@/scripts/validate-runtime-colors'

export default function TestColorsPage() {
  const [results, setResults] = useState<RuntimeValidationResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Run validation after a short delay to ensure theme is loaded
    setTimeout(() => {
      const validationResults = validateRuntimeColors()
      setResults(validationResults)
      setLoading(false)
    }, 500)
  }, [])

  const validCount = results.filter(r => r.valid).length
  const missingCount = results.filter(r => !r.defined).length
  const invalidCount = results.filter(r => r.defined && !r.valid).length
  const totalCount = results.length

  const allPassed = missingCount === 0 && invalidCount === 0

  return (
    <div className="container mx-auto p-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Color System Validation</h1>
        <p className="text-fg-caption">
          Runtime validation of all {EXPECTED_TOKENS.length} CSS color variables
        </p>
      </div>

      {/* Summary Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Summary</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-fg-caption">Validating color system...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-bg-white border border-fg-stroke-ui rounded-lg">
                  <div className="text-3xl font-bold">{validCount}</div>
                  <div className="text-sm text-fg-caption">Valid</div>
                </div>
                <div className="text-center p-4 bg-bg-white border border-fg-stroke-ui rounded-lg">
                  <div className="text-3xl font-bold text-red-500">{missingCount}</div>
                  <div className="text-sm text-fg-caption">Missing</div>
                </div>
                <div className="text-center p-4 bg-bg-white border border-fg-stroke-ui rounded-lg">
                  <div className="text-3xl font-bold text-yellow-500">{invalidCount}</div>
                  <div className="text-sm text-fg-caption">Invalid Format</div>
                </div>
                <div className="text-center p-4 bg-bg-white border border-fg-stroke-ui rounded-lg">
                  <div className="text-3xl font-bold">{totalCount}</div>
                  <div className="text-sm text-fg-caption">Total</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {allPassed ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span className="font-semibold text-green-600">All tests passed!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-500" />
                      <span className="font-semibold text-red-600">Issues found</span>
                    </>
                  )}
                </div>
                <Button onClick={() => setResults(validateRuntimeColors())} variant="outline">
                  Re-validate
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Results Table */}
      {!loading && (
        <>
          {/* Missing Variables */}
          {missingCount > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Missing CSS Variables ({missingCount})
              </h2>
              <div className="space-y-2">
                {results
                  .filter(r => !r.defined)
                  .map((result) => (
                    <div key={result.token} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                      <code className="text-sm font-mono">--{result.token}</code>
                      <Badge variant="destructive">Not Defined</Badge>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Invalid Format */}
          {invalidCount > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Invalid Format ({invalidCount})
              </h2>
              <div className="space-y-2">
                {results
                  .filter(r => r.defined && !r.valid)
                  .map((result) => (
                    <div key={result.token} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                      <div>
                        <code className="text-sm font-mono block">--{result.token}</code>
                        <span className="text-xs text-fg-caption">{result.value}</span>
                      </div>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                        Invalid HSL
                      </Badge>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Valid Variables */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Valid Variables ({validCount})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {results
                .filter(r => r.valid)
                .map((result) => (
                  <div key={result.token} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                    <div
                      className="w-8 h-8 rounded border border-fg-stroke-ui flex-shrink-0"
                      style={{ backgroundColor: `hsl(${result.value})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <code className="text-xs font-mono block truncate">--{result.token}</code>
                      <span className="text-xs text-fg-caption">{result.value}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </>
      )}

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">How to Use This Page</h3>
        <ul className="text-sm space-y-1 text-fg-caption">
          <li>• This page validates all {EXPECTED_TOKENS.length} color tokens are defined in CSS</li>
          <li>• Run this AFTER implementing the 60+ token system</li>
          <li>• All tokens should show as "Valid" with green badges</li>
          <li>• If any are missing, check <code className="text-xs bg-white dark:bg-black px-1 py-0.5 rounded">app/globals.css</code></li>
          <li>• If any are invalid format, ensure values are HSL format: <code className="text-xs bg-white dark:bg-black px-1 py-0.5 rounded">H S% L%</code></li>
        </ul>
      </Card>
    </div>
  )
}

