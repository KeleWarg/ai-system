import { requireAuth } from '@/lib/auth-helpers'
import { getComponents } from '@/lib/db/components'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Box } from 'lucide-react'
import Link from 'next/link'

export default async function ComponentsPage() {
  await requireAuth()
  const components = await getComponents()

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Components</h1>
          <p className="text-muted-foreground mt-1">
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
        <Card className="flex flex-col items-center justify-center p-12">
          <Box className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No components yet</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Upload a PNG spec sheet to create your first component
          </p>
          <Link href="/admin/components/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Component
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {components.map((component) => (
            <Card key={component.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{component.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {component.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-accent px-2 py-1 rounded">
                      {component.category}
                    </span>
                  </div>
                </div>
                <Link href={`/docs/components/${component.slug}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

