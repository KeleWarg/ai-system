'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Upload, Sparkles, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Component } from '@/lib/supabase'

interface PropertyEditorPageProps {
  params: Promise<{ slug: string }>
}

interface PropertyChange {
  name: string
  type: string
  description: string
  action: 'add' | 'remove' | 'modify'
  oldType?: string
}

interface AnalysisResult {
  propertiesToAdd: PropertyChange[]
  propertiesToRemove: string[]
  propertiesToModify: Array<{
    name: string
    oldType: string
    newType: string
    description: string
  }>
  variantsToAdd: Record<string, string[]>
  variantsToRemove: string[]
}

export default function PropertyEditorPage({ params }: PropertyEditorPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [component, setComponent] = useState<Component | null>(null)
  
  // Spec sheet upload
  const [specImage, setSpecImage] = useState<string | null>(null)
  const [specFile, setSpecFile] = useState<File | null>(null)
  
  // Analysis results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set())
  
  // Regenerated code
  const [newCode, setNewCode] = useState<string | null>(null)

  useEffect(() => {
    loadComponent()
  }, [slug])

  async function loadComponent() {
    try {
      const res = await fetch(`/api/components?search=${slug}&limit=1`)
      if (!res.ok) throw new Error('Failed to load component')
      
      const result = await res.json()
      const compData = result.data?.[0]
      
      if (!compData) throw new Error('Component not found')
      
      setComponent(compData)
    } catch (error) {
      console.error('Error loading component:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load component')
      setTimeout(() => router.push('/admin/components'), 2000)
    } finally {
      setLoading(false)
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB')
      return
    }
    
    setSpecFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setSpecImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function analyzeChanges() {
    if (!component || !specImage) return
    
    setAnalyzing(true)
    const toastId = toast.loading('Analyzing spec sheet...')
    
    try {
      const res = await fetch('/api/ai/analyze-component-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentCode: component.code,
          componentProps: component.props,
          componentVariants: component.variants,
          specImage,
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to analyze changes')
      }
      
      const result = await res.json()
      setAnalysis(result)
      
      // Select all changes by default
      const allChangeIds = new Set<string>()
      result.propertiesToAdd.forEach((p: PropertyChange) => allChangeIds.add(`add-${p.name}`))
      result.propertiesToRemove.forEach((name: string) => allChangeIds.add(`remove-${name}`))
      result.propertiesToModify.forEach((p: any) => allChangeIds.add(`modify-${p.name}`))
      Object.keys(result.variantsToAdd).forEach((name: string) => allChangeIds.add(`variant-add-${name}`))
      result.variantsToRemove.forEach((name: string) => allChangeIds.add(`variant-remove-${name}`))
      setSelectedChanges(allChangeIds)
      
      toast.success('Analysis complete!', { id: toastId })
    } catch (error) {
      console.error('Error analyzing:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze changes', { id: toastId })
    } finally {
      setAnalyzing(false)
    }
  }

  function toggleChange(changeId: string) {
    setSelectedChanges(prev => {
      const newSet = new Set(prev)
      if (newSet.has(changeId)) {
        newSet.delete(changeId)
      } else {
        newSet.add(changeId)
      }
      return newSet
    })
  }

  async function regenerateComponent() {
    if (!component || !analysis) return
    
    setRegenerating(true)
    const toastId = toast.loading('Regenerating component...')
    
    try {
      // Build selected changes object
      const changes = {
        propertiesToAdd: analysis.propertiesToAdd.filter(p => selectedChanges.has(`add-${p.name}`)),
        propertiesToRemove: analysis.propertiesToRemove.filter(name => selectedChanges.has(`remove-${name}`)),
        propertiesToModify: analysis.propertiesToModify.filter(p => selectedChanges.has(`modify-${p.name}`)),
        variantsToAdd: Object.fromEntries(
          Object.entries(analysis.variantsToAdd).filter(([name]) => selectedChanges.has(`variant-add-${name}`))
        ),
        variantsToRemove: analysis.variantsToRemove.filter(name => selectedChanges.has(`variant-remove-${name}`)),
      }
      
      const res = await fetch('/api/ai/regenerate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalCode: component.code,
          changes,
          componentName: component.component_name,
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to regenerate component')
      }
      
      const result = await res.json()
      setNewCode(result.code)
      
      toast.success('Component regenerated!', { id: toastId })
    } catch (error) {
      console.error('Error regenerating:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate component', { id: toastId })
    } finally {
      setRegenerating(false)
    }
  }

  async function saveChanges() {
    if (!component || !newCode) return
    
    const toastId = toast.loading('Saving changes...')
    
    try {
      const res = await fetch(`/api/components/${component.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save changes')
      }
      
      // Update filesystem
      try {
        await fetch('/api/registry/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            code: newCode,
            componentName: component.component_name,
            variants: component.variants,
          }),
        })
      } catch (registryError) {
        console.warn('Registry update failed:', registryError)
      }
      
      toast.success('Changes saved successfully!', { id: toastId })
      router.push(`/docs/components/${slug}`)
    } catch (error) {
      console.error('Error saving:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save changes', { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">Loading component...</div>
      </div>
    )
  }

  if (!component) return null

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Properties</h1>
            <p className="text-fg-caption">
              Use a spec sheet to modify component properties
            </p>
          </div>
        </div>
      </div>

      {/* Current Component Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{component.name}</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Current Properties</Label>
            <div className="mt-2 space-y-2">
              {component.props && component.props.length > 0 ? (
                component.props.map((prop, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <code className="bg-bg-neutral px-2 py-1 rounded">{prop.name}</code>
                    <span className="text-fg-caption">{prop.type}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-fg-caption">No props defined</p>
              )}
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Current Variants</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {component.variants && Object.keys(component.variants).length > 0 ? (
                Object.keys(component.variants).map((variant) => (
                  <Badge key={variant} variant="outline">{variant}</Badge>
                ))
              ) : (
                <p className="text-sm text-fg-caption">No variants defined</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Spec Sheet Upload */}
      {!analysis && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Upload New Spec Sheet</h2>
            <p className="text-sm text-fg-caption">
              Upload a spec sheet with updated requirements to analyze changes
            </p>
          </div>
          
          {!specImage ? (
            <div className="border-2 border-dashed border-fg-stroke-ui rounded-lg p-12 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="spec-upload"
              />
              <label htmlFor="spec-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-fg-caption" />
                <p className="font-medium">Click to upload spec sheet</p>
                <p className="text-sm text-fg-caption mt-1">PNG, JPG, or WebP (max 10MB)</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <img
                src={specImage}
                alt="Spec sheet"
                className="max-h-96 mx-auto rounded-lg border border-fg-stroke-ui"
              />
              <div className="flex gap-2">
                <Button
                  onClick={analyzeChanges}
                  disabled={analyzing}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {analyzing ? 'Analyzing...' : 'Analyze Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSpecImage(null)
                    setSpecFile(null)
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && !newCode && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Suggested Changes</h2>
            <p className="text-sm text-fg-caption">
              Review and select which changes to apply
            </p>
          </div>

          {/* Properties to Add */}
          {analysis.propertiesToAdd.length > 0 && (
            <div>
              <h3 className="font-medium text-green-600 mb-3">Properties to Add</h3>
              <div className="space-y-2">
                {analysis.propertiesToAdd.map((prop) => (
                  <label
                    key={prop.name}
                    className="flex items-start gap-3 p-3 border border-fg-stroke-ui rounded-md cursor-pointer hover:bg-bg-accent/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChanges.has(`add-${prop.name}`)}
                      onChange={() => toggleChange(`add-${prop.name}`)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{prop.name}</code>
                        <Badge variant="secondary" className="text-xs">{prop.type}</Badge>
                      </div>
                      <p className="text-sm text-fg-caption mt-1">{prop.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Properties to Remove */}
          {analysis.propertiesToRemove.length > 0 && (
            <div>
              <h3 className="font-medium text-red-600 mb-3">Properties to Remove</h3>
              <div className="space-y-2">
                {analysis.propertiesToRemove.map((name) => (
                  <label
                    key={name}
                    className="flex items-center gap-3 p-3 border border-fg-stroke-ui rounded-md cursor-pointer hover:bg-bg-accent/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChanges.has(`remove-${name}`)}
                      onChange={() => toggleChange(`remove-${name}`)}
                    />
                    <code className="text-sm font-mono">{name}</code>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Properties to Modify */}
          {analysis.propertiesToModify.length > 0 && (
            <div>
              <h3 className="font-medium text-blue-600 mb-3">Properties to Modify</h3>
              <div className="space-y-2">
                {analysis.propertiesToModify.map((prop) => (
                  <label
                    key={prop.name}
                    className="flex items-start gap-3 p-3 border border-fg-stroke-ui rounded-md cursor-pointer hover:bg-bg-accent/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChanges.has(`modify-${prop.name}`)}
                      onChange={() => toggleChange(`modify-${prop.name}`)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <code className="text-sm font-mono">{prop.name}</code>
                      <div className="text-sm text-fg-caption mt-1">
                        <span className="line-through">{prop.oldType}</span>
                        {' → '}
                        <span className="text-fg-body">{prop.newType}</span>
                      </div>
                      <p className="text-sm text-fg-caption mt-1">{prop.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={regenerateComponent}
            disabled={regenerating || selectedChanges.size === 0}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {regenerating ? 'Regenerating...' : 'Regenerate Component with Selected Changes'}
          </Button>
        </Card>
      )}

      {/* Regenerated Code Preview */}
      {newCode && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Updated Component</h2>
            <p className="text-sm text-fg-caption">
              Review the regenerated code before saving
            </p>
          </div>
          
          <div className="max-h-96 overflow-auto border border-fg-stroke-ui rounded-md">
            <pre className="p-4 text-sm">
              <code>{newCode}</code>
            </pre>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={saveChanges} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNewCode(null)
                setAnalysis(null)
                setSpecImage(null)
              }}
            >
              Start Over
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

