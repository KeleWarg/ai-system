import { requireAuth } from '@/lib/auth-helpers'
import { getComponents } from '@/lib/db/components'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { Plus, Box } from 'lucide-react'
import Link from 'next/link'
import { ComponentActions } from '@/components/component-actions'

export default async function ComponentsPage() {
  await requireAuth()
  const result = await getComponents()
  const components = result.data

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Components</h1>
          <p className="text-fg-caption mt-1">
            Manage your design system components
          </p>
        </div>
        <Link href="/admin/components/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Component
          </Button>
        </Link>
      </div>

      {/* Components List */}
      {components.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No components yet"
          description="Upload a PNG spec sheet to create your first component."
          action={{
            label: "Create Component",
            href: "/admin/components/new"
          }}
        />
      ) : (
        <div className="grid gap-4">
          {components.map((component) => (
            <Card key={component.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{component.name}</h3>
                  <p className="text-sm text-fg-caption mt-1">
                    {component.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-bg-accent px-2 py-1 rounded">
                      {component.category}
                    </span>
                    <span className="text-xs bg-bg-neutral px-2 py-1 rounded">
                      {component.slug}
                    </span>
                  </div>
                </div>
                <ComponentActions 
                  componentId={component.id}
                  componentName={component.name}
                  componentSlug={component.slug}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

