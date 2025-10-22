'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-bg-neutral rounded">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
})

interface ComponentEditorProps {
  component: {
    id: string
    name: string
    slug: string
    description: string
    category: string
    code: string | null
    variants?: Record<string, string[]>
    ai_prompt?: string | null
    ai_documentation?: string | null
  }
}

export function ComponentEditor({ component }: ComponentEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: component.name,
    description: component.description,
    category: component.category,
    code: component.code || '',
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/components/${component.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update component')
      }

      // Refresh and redirect
      router.refresh()
      router.push(`/admin/components/${component.slug}/preview`)
    } catch (error) {
      console.error('Save error:', error)
      alert(error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">Component Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-2"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Label>Component Code</Label>
        <div className="mt-2 border rounded-md overflow-hidden">
          <MonacoEditor
            height="500px"
            defaultLanguage="typescript"
            theme="vs-dark"
            value={formData.code}
            onChange={(value) =>
              setFormData({ ...formData, code: value || '' })
            }
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              rulers: [80],
              wordWrap: 'on',
              tabSize: 2,
            }}
          />
        </div>
      </Card>

      {component.variants && Object.keys(component.variants).length > 0 && (
        <Card className="p-6">
          <Label>Variants (Read-only)</Label>
          <pre className="mt-2 p-4 bg-bg-neutral rounded text-sm overflow-x-auto">
            {JSON.stringify(component.variants, null, 2)}
          </pre>
          <p className="text-xs text-fg-caption mt-2">
            Variants cannot be edited directly. Regenerate the component to update
            variants.
          </p>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/components')}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

