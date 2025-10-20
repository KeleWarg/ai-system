'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Package, Home, Palette } from 'lucide-react'

interface Component {
  id: string
  name: string
  slug: string
  category: string
}

interface DocsSidebarProps {
  components: Component[]
}

export function DocsSidebar({ components }: DocsSidebarProps) {
  const pathname = usePathname()

  // Group components by category
  const componentsByCategory = components.reduce((acc, component) => {
    const category = component.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(component)
    return acc
  }, {} as Record<string, Component[]>)

  const categoryLabels: Record<string, string> = {
    buttons: 'Buttons',
    inputs: 'Inputs',
    navigation: 'Navigation',
    feedback: 'Feedback',
    'data-display': 'Data Display',
    overlays: 'Overlays',
    layout: 'Layout',
    forms: 'Forms',
    other: 'Other',
  }

  return (
    <div className="w-full">
      <ScrollArea className="h-[calc(100vh-3.5rem)] py-6 pr-6 lg:py-8">
        <div className="space-y-6">
          {/* Getting Started */}
          <div>
            <h4 className="mb-3 rounded-md px-2 text-sm font-semibold">
              Getting Started
            </h4>
            <div className="grid gap-1">
              <Link
                href="/"
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === "/" ? "bg-accent" : "transparent"
                )}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
              <Link
                href="/docs/components"
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === "/docs/components" ? "bg-accent" : "transparent"
                )}
              >
                <Package className="mr-2 h-4 w-4" />
                All Components
              </Link>
              <Link
                href="/docs/themes"
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname.startsWith("/docs/themes") ? "bg-accent" : "transparent"
                )}
              >
                <Palette className="mr-2 h-4 w-4" />
                Themes
              </Link>
            </div>
          </div>

          <Separator />

          {/* Component Categories */}
          {Object.entries(componentsByCategory).map(([category, categoryComponents]) => (
            <div key={category}>
              <h4 className="mb-3 rounded-md px-2 text-sm font-semibold">
                {categoryLabels[category] || category}
              </h4>
              <div className="grid gap-1">
                {categoryComponents.map((component) => (
                  <Link
                    key={component.id}
                    href={`/docs/components/${component.slug}`}
                    className={cn(
                      "group flex items-center rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                      pathname === `/docs/components/${component.slug}`
                        ? "bg-accent font-medium"
                        : "transparent text-muted-foreground"
                    )}
                  >
                    {component.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {components.length === 0 && (
            <div className="px-2 text-sm text-muted-foreground">
              No components yet. Create some in the admin panel!
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

