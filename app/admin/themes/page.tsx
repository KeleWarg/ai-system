import { requireAuth } from '@/lib/auth-helpers'
import { getThemes } from '@/lib/db/themes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Palette } from 'lucide-react'
import Link from 'next/link'
import { ThemeListItem } from '@/components/theme-list-item'

export default async function ThemesPage() {
  await requireAuth()
  const themes = await getThemes()

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your design system themes and color palettes
          </p>
        </div>
        <Link href="/admin/themes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Theme
          </Button>
        </Link>
      </div>

      {/* Themes List */}
      {themes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12">
          <Palette className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No themes yet</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Create your first theme to get started with your design system
          </p>
          <Link href="/admin/themes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Theme
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <ThemeListItem key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </div>
  )
}

