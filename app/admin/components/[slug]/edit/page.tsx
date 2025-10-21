import { requireAuth } from '@/lib/auth-helpers'
import { getComponentBySlug } from '@/lib/db/components'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ComponentEditor } from '@/components/component-editor'

export default async function AdminComponentEditPage({
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
      <div className="flex items-center gap-4">
        <Link href="/admin/components">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Components
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit {component.name}</h1>
          <p className="text-muted-foreground mt-1">
            Update component details and code
          </p>
        </div>
      </div>

      {/* Editor */}
      <ComponentEditor component={component} />
    </div>
  )
}

