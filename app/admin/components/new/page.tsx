'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function NewComponentPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [generatedCode, setGeneratedCode] = useState('')
  const [componentName, setComponentName] = useState('')
  const [themes, setThemes] = useState<any[]>([])
  const [selectedTheme, setSelectedTheme] = useState<any>(null)
  const [error, setError] = useState('')
  
  // Load themes on mount
  useEffect(() => {
    async function loadThemes() {
      try {
        const res = await fetch('/api/themes')
        const data = await res.json()
        setThemes(data)
        
        // Set active theme as default
        const activeTheme = data.find((t: any) => t.is_active)
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
        throw new Error('Failed to extract spec sheet')
      }
      
      const data = await res.json()
      setExtractedData(data)
      setComponentName(data.name || '')
    } catch (error) {
      console.error('Upload failed:', error)
      setError('Failed to extract spec sheet. Please try again.')
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
        throw new Error('Failed to generate component')
      }
      
      const { code } = await codeRes.json()
      setGeneratedCode(code)
    } catch (error) {
      console.error('Generation failed:', error)
      setError('Failed to generate component. Please try again.')
    } finally {
      setGenerating(false)
    }
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
            name: componentName,
            description: extractedData.description,
            variants: extractedData.variants,
          }),
        }),
        fetch('/api/ai/generate-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: componentName,
            code: generatedCode,
            variants: extractedData.variants,
          }),
        }),
      ])
      
      if (!promptsRes.ok || !docsRes.ok) {
        throw new Error('Failed to generate documentation')
      }
      
      const prompts = await promptsRes.json()
      const docs = await docsRes.json()
      
      // Save to database via API
      const saveRes = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: componentName,
          slug: slugify(componentName),
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
        throw new Error('Failed to save component')
      }
      
      const component = await saveRes.json()
      router.push(`/docs/components/${component.slug}`)
    } catch (error) {
      console.error('Save failed:', error)
      setError('Failed to save component. Please try again.')
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
            setSelectedTheme(theme)
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
          Generated components will use this theme's color tokens
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

