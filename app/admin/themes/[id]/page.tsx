import { requireAuth } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { ThemeForm } from '@/components/theme-form'
import type { Theme } from '@/lib/supabase'

async function getTheme(id: string): Promise<Theme | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Theme
}

export default async function EditThemePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()
  const { id } = await params
  const theme = await getTheme(id)

  if (!theme) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Theme</h1>
        <p className="text-muted-foreground mt-1">
          Update theme colors, typography, and settings
        </p>
      </div>

      <ThemeForm theme={theme} />
    </div>
  )
}

