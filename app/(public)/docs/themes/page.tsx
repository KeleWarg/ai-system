import { getThemes } from '@/lib/db/themes'
import { ThemePreview } from '@/components/theme-preview'

export default async function ThemesPage() {
  const themes = await getThemes()

  return <ThemePreview themes={themes} />
}
