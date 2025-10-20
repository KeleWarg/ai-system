import { getComponents } from '@/lib/db/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Box } from 'lucide-react'

export default async function ComponentsPage() {
  const components = await getComponents()

  // Group components by category
  const componentsByCategory = components.reduce((acc, component) => {
    const category = component.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(component)
    return acc
  }, {} as Record<string, typeof components>)

  const categoryNames: Record<string, string> = {
    buttons: 'Buttons',
    inputs: 'Inputs',
    navigation: 'Navigation',
    feedback: 'Feedback',
    'data-display': 'Data Display',
    overlays: 'Overlays',
    other: 'Other',
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Browse our collection of AI-generated components. Copy the code and paste
          into your project. All components are built with TypeScript, Tailwind CSS,
          and designed to work with your theme system.
        </p>
      </div>

      {/* Components by Category */}
      {components.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Box className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg mb-2">No components yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Components will appear here once they&apos;re created in the admin panel.
              </p>
              <Link href="/admin">
                <Button>
                  Go to Admin Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-12">
          {Object.entries(componentsByCategory).map(([category, categoryComponents]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-4">
                {categoryNames[category] || category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryComponents.map((component) => (
                  <Link
                    key={component.id}
                    href={`/docs/components/${component.slug}`}
                  >
                    <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle>{component.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {component.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(component.variants || {}).slice(0, 3).map((variant) => (
                            <span
                              key={variant}
                              className="text-xs bg-accent px-2 py-1 rounded"
                            >
                              {variant}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

