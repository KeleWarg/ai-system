'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { VisualParameterEditor } from '@/components/visual-parameter-editor'
import type { ComponentAnalysis } from '@/lib/ai/spec-validator'

interface ExtractedData {
  name: string
  description: string
  category: string
  variants?: Record<string, string[]>
  colors?: string[]
  spacing?: string[]
}

interface Theme {
  id: string
  name: string
  is_active: boolean
  colors: Record<string, string>
  spacing?: Record<string, string>
}

// Use ComponentAnalysis type from spec-validator
type ValidationAnalysis = ComponentAnalysis

export default function NewComponentPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [validating, setValidating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [generatedCode, setGeneratedCode] = useState('')
  const [componentName, setComponentName] = useState('')
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [error, setError] = useState('')
  const [validation, setValidation] = useState<ValidationAnalysis | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [fixingSuggestion, setFixingSuggestion] = useState(false)
  const [suggestedFix, setSuggestedFix] = useState('')
  const [showFixModal, setShowFixModal] = useState(false)
  const [isEditingCode, setIsEditingCode] = useState(false)
  const [showVisualEditor, setShowVisualEditor] = useState(false)
  
  // Load themes on mount
  useEffect(() => {
    async function loadThemes() {
      try {
        const res = await fetch('/api/themes')
        const data = await res.json()
        setThemes(data)
        
        // Set active theme as default
        const activeTheme = data.find((t: Theme) => t.is_active)
        if (activeTheme) {
          setSelectedTheme(activeTheme)
        }
      } catch (err) {
        console.error('Failed to load themes:', err)
      }
    }
    
    loadThemes()
  }, [])
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      if (selectedTheme) {
        formData.append('theme', JSON.stringify(selectedTheme))
      }
      
      const res = await fetch('/api/ai/extract-spec', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to extract spec sheet')
      }
      
      const data = await res.json()
      setExtractedData(data)
      setComponentName(data.name || '')
    } catch (error) {
      console.error('Upload failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract spec sheet. Please try again.'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }
  
  const handleGenerate = async () => {
    if (!extractedData) return
    
    setGenerating(true)
    setError('')
    
    try {
      // Generate component code
      const codeRes = await fetch('/api/ai/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...extractedData,
          name: componentName,
          theme: selectedTheme,
        }),
      })
      
      if (!codeRes.ok) {
        const errorData = await codeRes.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate component')
      }
      
      const { code } = await codeRes.json()
      setGeneratedCode(code)
      
      // Automatically validate the generated component
      await validateComponent(code, extractedData)
    } catch (error) {
      console.error('Generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate component. Please try again.'
      setError(errorMessage)
    } finally {
      setGenerating(false)
    }
  }
  
  const validateComponent = async (code: string, spec: ExtractedData) => {
    setValidating(true)
    try {
      const res = await fetch('/api/ai/validate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentCode: code,
          spec,
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setValidation(data.analysis)
        setShowValidation(true)
        console.log('✅ Validation complete:', data.analysis)
        
        // If validation failed significantly, offer AI fix
        if (data.analysis.overallMatch < 80) {
          console.log('⚠️ Low validation score, AI fix available')
        }
      }
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setValidating(false)
    }
  }
  
  const requestAIFix = async () => {
    if (!generatedCode || !extractedData || !validation) return
    
    setFixingSuggestion(true)
    setError('')
    
    try {
      const res = await fetch('/api/ai/suggest-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentCode: generatedCode,
          spec: extractedData,
          analysis: validation,
        }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to generate fix')
      }
      
      const data = await res.json()
      setSuggestedFix(data.fixedCode)
      setShowFixModal(true)
      console.log('🔧 AI fix generated:', data.changes)
    } catch (error) {
      console.error('Failed to generate fix:', error)
      setError('Failed to generate AI fix. Please try manual editing.')
    } finally {
      setFixingSuggestion(false)
    }
  }
  
  const applyAIFix = async () => {
    if (!suggestedFix || !extractedData) return
    
    // Apply the fix
    setGeneratedCode(suggestedFix)
    setShowFixModal(false)
    
    // Re-validate the fixed code
    await validateComponent(suggestedFix, extractedData)
  }
  
  const manualEdit = () => {
    setIsEditingCode(true)
    setShowFixModal(false)
  }
  
  const handleSave = async () => {
    if (!generatedCode || !extractedData) return
    
    setSaving(true)
    setError('')
    
    try {
      // Generate prompts and docs
      const [promptsRes, docsRes] = await Promise.all([
        fetch('/api/ai/generate-prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            componentName: componentName,
            componentCode: generatedCode,
            variants: extractedData.variants,
          }),
        }),
        fetch('/api/ai/generate-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            componentName: componentName,
            componentCode: generatedCode,
          }),
        }),
      ])
      
      if (!promptsRes.ok || !docsRes.ok) {
        const errorData = await (promptsRes.ok ? docsRes : promptsRes).json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate documentation')
      }
      
      const prompts = await promptsRes.json()
      const docs = await docsRes.json()
      
      const slug = slugify(componentName)
      
      // ⚠️ ATOMIC WRITE: Write to file system FIRST, then DB
      // This prevents orphaned DB entries if file write fails
      
      // Step 1: Write component to file system (shadcn approach)
      const writeRes = await fetch('/api/registry/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          code: generatedCode,
          componentName: componentName,
          variants: extractedData.variants || {},
        }),
      })
      
      if (!writeRes.ok) {
        const errorData = await writeRes.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to write component file to registry')
      }
      
      console.log('✅ Component written to file system')
      
      // Step 2: Save to database (with rollback on failure)
      try {
        const saveRes = await fetch('/api/components', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: componentName,
            slug,
            component_name: componentName, // Exact TypeScript export name
            description: extractedData.description || '',
            category: extractedData.category || 'general',
            code: generatedCode,
            variants: extractedData.variants || {},
            props: docs.api?.props || {},
            prompts,
            installation: docs.installation || '',
            theme_id: selectedTheme?.id || null,
          }),
        })
        
        if (!saveRes.ok) {
          const errorData = await saveRes.json().catch(() => ({}))
          
          // Rollback: Delete the file we just wrote
          try {
            await fetch('/api/registry/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug }),
            })
            console.log('🔄 Rolled back file write after DB save failure')
          } catch (rollbackError) {
            console.error('Failed to rollback file write:', rollbackError)
          }
          
          throw new Error(errorData.error || 'Failed to save component to database')
        }
        
        const component = await saveRes.json()
        
        // Show success message with git instructions
        if (typeof window !== 'undefined') {
          const isLocal = window.location.hostname === 'localhost'
          if (isLocal && !writeRes.ok) {
            alert(`✅ Component created successfully!\n\n⚠️ IMPORTANT: To see this component in production:\n1. Commit the new file: git add components/registry/${slug}.tsx\n2. Push to GitHub: git push\n3. Vercel will auto-deploy\n\nLocal preview available now at /docs/components/${component.slug}`)
          }
        }
        
        router.push(`/docs/components/${component.slug}`)
      } catch (dbError) {
        // Re-throw DB errors after rollback attempt
        throw dbError
      }
    } catch (error) {
      console.error('Save failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save component. Please try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }
  
  const resetForm = () => {
    setExtractedData(null)
    setGeneratedCode('')
    setComponentName('')
    setError('')
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Create Component</h1>
        <p className="text-muted-foreground mt-1">
          Upload a PNG spec sheet to generate a new component
        </p>
      </div>
      
      {error && (
        <div className="p-4 border border-red-500 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Theme Selector */}
      <Card className="p-6">
        <Label htmlFor="theme-select" className="text-base font-semibold mb-4 block">
          Select Theme
        </Label>
        <select
          id="theme-select"
          value={selectedTheme?.id || ''}
          onChange={(e) => {
            const theme = themes.find(t => t.id === e.target.value)
            setSelectedTheme(theme || null)
          }}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        >
          {themes.map(theme => (
            <option key={theme.id} value={theme.id}>
              {theme.name} {theme.is_active ? '(Active)' : ''}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground mt-2">
          Generated components will use this theme&apos;s color tokens
        </p>
      </Card>
      
      {/* Upload */}
      {!extractedData && (
        <Card className="border-2 border-dashed p-12 text-center">
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
            id="spec-upload"
          />
          <label
            htmlFor="spec-upload"
            className="cursor-pointer inline-flex flex-col items-center"
          >
            <div className="text-4xl mb-4">📸</div>
            <div className="text-lg font-medium mb-2">
              {uploading ? 'Extracting spec data...' : 'Upload Spec Sheet'}
            </div>
            <div className="text-sm text-muted-foreground">
              PNG, JPG, or WebP (max 10MB)
            </div>
          </label>
        </Card>
      )}
      
      {/* Extracted Data */}
      {extractedData && !generatedCode && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Extracted Data</h2>
              <Button variant="outline" size="sm" onClick={resetForm}>
                Start Over
              </Button>
            </div>
            
            <div>
              <Label htmlFor="component-name">Component Name</Label>
              <Input
                id="component-name"
                type="text"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="e.g., PrimaryButton"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <p className="mt-2 text-sm text-muted-foreground">
                {extractedData.description || 'No description extracted'}
              </p>
            </div>
            
            <div>
              <Label>Category</Label>
              <p className="mt-2 text-sm">
                {extractedData.category || 'general'}
              </p>
            </div>
            
            {extractedData.variants && Object.keys(extractedData.variants).length > 0 && (
              <div>
                <Label>Variants</Label>
                <pre className="mt-2 p-3 bg-muted rounded text-sm overflow-x-auto">
                  {JSON.stringify(extractedData.variants, null, 2)}
                </pre>
              </div>
            )}
            
            {extractedData.colors && extractedData.colors.length > 0 && (
              <div>
                <Label>Detected Colors</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {extractedData.colors.map((color: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1 border border-border rounded"
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          
          <Button
            onClick={handleGenerate}
            disabled={generating || !componentName.trim()}
            className="w-full"
            size="lg"
          >
            {generating ? 'Generating Component...' : 'Generate Component'}
          </Button>
        </div>
      )}
      
      {/* Generated Code */}
      {generatedCode && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generated Code</h2>
              <Button variant="outline" size="sm" onClick={resetForm}>
                Start Over
              </Button>
            </div>
            
            <div className="relative">
              <pre className="p-4 bg-muted rounded text-sm overflow-x-auto max-h-96 overflow-y-auto">
                <code>{generatedCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode)
                }}
              >
                Copy
              </Button>
            </div>
          </Card>
          
          {/* Validation Results */}
          {showValidation && validation && (
            <Card className={`p-6 border-2 ${
              validation.overallMatch >= 90 
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                : validation.overallMatch >= 75
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                : 'border-red-500 bg-red-50 dark:bg-red-950/20'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {validation.overallMatch >= 90 ? '✅' : validation.overallMatch >= 75 ? '⚠️' : '❌'}
                    Spec Validation
                  </h2>
                  <div className="text-3xl font-bold">
                    {validation.overallMatch}/100
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-3 rounded ${validation.hasRequiredVariants ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <div className="text-sm font-medium">Variants</div>
                    <div className="text-xs">{validation.hasRequiredVariants ? 'All present' : `${validation.missingVariants.length} missing`}</div>
                  </div>
                  <div className={`p-3 rounded ${validation.hasCorrectSpacing ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <div className="text-sm font-medium">Spacing</div>
                    <div className="text-xs">{validation.hasCorrectSpacing ? 'Matches spec' : `${validation.spacingIssues.length} issues`}</div>
                  </div>
                  <div className={`p-3 rounded ${validation.hasThemeColors ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <div className="text-sm font-medium">Colors</div>
                    <div className="text-xs">{validation.hasThemeColors ? 'Theme tokens' : `${validation.colorIssues.length} issues`}</div>
                  </div>
                </div>
                
                {validation.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Recommendations:</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {validation.recommendations.map((rec, i) => (
                        <li key={i} className="text-muted-foreground">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validation.overallMatch < 90 && (
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground bg-white dark:bg-background p-3 rounded border">
                      <strong>⚠️ Validation Issues Detected</strong>
                      <p className="mt-1">The generated component doesn&apos;t fully match the spec sheet. You have options:</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={requestAIFix}
                        disabled={fixingSuggestion}
                        variant="default"
                        size="sm"
                      >
                        {fixingSuggestion ? 'Generating Fix...' : '🤖 AI Auto-Fix'}
                      </Button>
                      <Button
                        onClick={() => setShowVisualEditor(true)}
                        variant="default"
                        size="sm"
                      >
                        🎨 Visual Editor
                      </Button>
                      <Button
                        onClick={manualEdit}
                        variant="outline"
                        size="sm"
                      >
                        ✏️ Manual Edit
                      </Button>
                      <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        variant="outline"
                        size="sm"
                      >
                        🔄 Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {/* AI Fix Modal */}
          {showFixModal && suggestedFix && (
            <Card className="p-6 border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    🤖 AI Suggested Fix
                  </h2>
                  <Button
                    onClick={() => setShowFixModal(false)}
                    variant="ghost"
                    size="sm"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground bg-white dark:bg-background p-3 rounded">
                  <strong>Changes Applied:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {validation?.missingVariants.length ? (
                      <li>Fixed {validation.missingVariants.length} missing variant(s)</li>
                    ) : null}
                    {validation?.spacingIssues.length ? (
                      <li>Corrected {validation.spacingIssues.length} spacing issue(s)</li>
                    ) : null}
                    {validation?.colorIssues.length ? (
                      <li>Replaced {validation.colorIssues.length} hardcoded color(s) with theme tokens</li>
                    ) : null}
                  </ul>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  <Label>Fixed Code Preview:</Label>
                  <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-x-auto">
                    {suggestedFix}
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={applyAIFix}
                    variant="default"
                    className="flex-1"
                  >
                    ✅ Apply Fix & Re-Validate
                  </Button>
                  <Button
                    onClick={() => setShowFixModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    ❌ Reject
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {/* Visual Parameter Editor */}
          {showVisualEditor && extractedData && validation && (
            <VisualParameterEditor
              componentCode={generatedCode}
              spec={extractedData}
              validation={validation}
              onApply={async (updatedCode) => {
                setGeneratedCode(updatedCode)
                setShowVisualEditor(false)
                await validateComponent(updatedCode, extractedData)
              }}
              onCancel={() => setShowVisualEditor(false)}
            />
          )}
          
          {/* Manual Code Editor */}
          {isEditingCode && generatedCode && (
            <Card className="p-6 border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    ✏️ Manual Code Editor
                  </h2>
                  <Button
                    onClick={() => setIsEditingCode(false)}
                    variant="ghost"
                    size="sm"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground bg-white dark:bg-background p-3 rounded">
                  <strong>💡 Edit Tips:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                    <li>Match spacing values exactly from the spec sheet</li>
                    <li>Ensure all variants are present in the cva() configuration</li>
                    <li>Use theme tokens (bg-primary, text-foreground) instead of hex colors</li>
                    <li>Check Tailwind class names for typos</li>
                  </ul>
                </div>
                
                <div>
                  <Label>Component Code:</Label>
                  <textarea
                    value={generatedCode}
                    onChange={(e) => setGeneratedCode(e.target.value)}
                    className="mt-2 w-full h-[500px] p-4 font-mono text-xs border rounded bg-background"
                    spellCheck={false}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      if (extractedData) {
                        await validateComponent(generatedCode, extractedData)
                        setIsEditingCode(false)
                      }
                    }}
                    variant="default"
                    className="flex-1"
                  >
                    ✅ Save & Re-Validate
                  </Button>
                  <Button
                    onClick={() => setIsEditingCode(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {validating && (
            <div className="text-center text-sm text-muted-foreground">
              Validating component against spec sheet...
            </div>
          )}
          
          <div className="flex gap-4">
            <Button
              onClick={handleGenerate}
              disabled={generating}
              variant="outline"
              className="flex-1"
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
              size="lg"
            >
              {saving ? 'Saving...' : 'Save Component'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

