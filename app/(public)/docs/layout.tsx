import { DocsSidebar } from '@/components/docs-sidebar'
import { getComponents } from '@/lib/db/components'

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const components = await getComponents()

  return (
    <div className="w-full flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-6">
      <aside className="fixed top-14 z-30 -ml-6 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
        <DocsSidebar components={components} />
      </aside>
      <main className="relative py-6 lg:gap-10 lg:py-8 flex justify-center">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </main>
    </div>
  )
}

