import { requireAuth } from '@/lib/auth-helpers'
import { ThemeForm } from '@/components/theme-form'

export default async function NewThemePage() {
  await requireAuth()

  return (
    <div className="flex flex-col gap-6 p-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Theme</h1>
        <p className="text-muted-foreground mt-1">
          Create a new theme with custom colors, typography, and spacing
        </p>
      </div>

      <ThemeForm />
    </div>
  )
}

