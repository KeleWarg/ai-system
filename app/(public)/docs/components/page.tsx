import { getComponents } from '@/lib/db/components'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import Link from 'next/link'
import { ArrowRight, Box, Sparkles } from 'lucide-react'

export default async function ComponentsPage() {
  const result = await getComponents()
  const components = result.data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <Badge variant="secondary" className="text-xs">
            {components.length} Components
          </Badge>
        </div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Beautifully designed AI-generated components. Built with Radix UI and Tailwind CSS.
          Copy and paste into your apps.
        </p>
      </div>

      {/* Components Grid */}
      {components.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No components yet"
          description="Components will appear here once they're created in the admin panel. Start by uploading a design spec."
          action={{
            label: "Create Component",
            href: "/admin/components/new"
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((component) => (
            <Link
              key={component.id}
              href={`/docs/components/${component.slug}`}
              className="group relative flex flex-col rounded-lg border bg-card p-6 hover:border-primary transition-all hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Box className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {component.category || 'other'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold leading-none tracking-tight">
                    {component.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {component.description || 'No description available'}
                  </p>
                </div>
                {Object.keys(component.variants || {}).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(component.variants || {}).slice(0, 3).map((variant) => (
                      <Badge key={variant} variant="secondary" className="text-xs">
                        {variant}
                      </Badge>
                    ))}
                    {Object.keys(component.variants || {}).length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{Object.keys(component.variants || {}).length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-auto pt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View component
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

