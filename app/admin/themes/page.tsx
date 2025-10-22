import { requireAuth } from '@/lib/auth-helpers'
import { getThemes } from '@/lib/db/themes'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { Plus, Palette } from 'lucide-react'
import Link from 'next/link'
import { ThemeListItem } from '@/components/theme-list-item'

export default async function ThemesPage() {
  await requireAuth()
  const result = await getThemes()
  const themes = result.data

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
          <p className="text-fg-caption mt-1">
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
        <EmptyState
          icon={Palette}
          title="No themes yet"
          description="Create your first theme to get started with your design system."
          action={{
            label: "Create Theme",
            href: "/admin/themes/new"
          }}
        />
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

