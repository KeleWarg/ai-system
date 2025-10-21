import { getThemes } from '@/lib/db/themes'
import { ThemePreview } from '@/components/theme-preview'

export default async function ThemesPage() {
  const result = await getThemes()
  const themes = result.data

  return <ThemePreview themes={themes} />
}
