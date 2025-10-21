import { requireAuth } from '@/lib/auth-helpers'
import { getComponentBySlug } from '@/lib/db/components'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ComponentPreviewReal } from '@/components/component-preview-real'
import { CodeBlockEnhanced } from '@/components/code-block-enhanced'

export default async function AdminComponentPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await requireAuth()
  const { slug } = await params
  const component = await getComponentBySlug(slug)

  if (!component) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/components">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Components
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{component.name}</h1>
            <p className="text-muted-foreground mt-1">{component.description}</p>
          </div>
        </div>
        <Link href={`/admin/components/${slug}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Component Info */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Slug:</span>
            <span className="ml-2 font-mono">{component.slug}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>
            <span className="ml-2">{component.category}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>
            <span className="ml-2">
              {new Date(component.created_at).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Updated:</span>
            <span className="ml-2">
              {new Date(component.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Live Preview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <ComponentPreviewReal
          slug={component.slug}
          componentName={component.slug
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')}
          componentCode={component.code || ''}
          variants={component.variants || {}}
          description={component.description}
        />
      </Card>

      {/* Code */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Component Code</h2>
        <CodeBlockEnhanced
          code={component.code || ''}
          language="typescript"
          showLineNumbers={true}
        />
      </Card>

      {/* Variants */}
      {component.variants && Object.keys(component.variants).length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Variants</h2>
          <pre className="p-4 bg-muted rounded text-sm overflow-x-auto">
            {JSON.stringify(component.variants, null, 2)}
          </pre>
        </Card>
      )}

    </div>
  )
}

