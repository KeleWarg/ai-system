import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer className="border-t border-fg-stroke-ui bg-bg-white mt-auto">
      <div className="flex flex-col items-center justify-between gap-4 py-10 px-6 md:h-24 md:flex-row md:py-0 md:px-12 lg:px-24">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-fg-caption md:text-left">
            Built with Next.js, Supabase, and Claude AI. Powered by{' '}
            <Link
              href="/admin"
              className="font-medium underline underline-offset-4"
            >
              AI-Powered Design System
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-fg-caption">
          <Link href="/docs/components" className="hover:text-fg-body">
            Documentation
          </Link>
          <Link href="/admin" className="hover:text-fg-body">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}

