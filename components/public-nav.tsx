'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { ThemeSwitcher } from './theme-switcher'
import { Box } from 'lucide-react'

export function PublicNav() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Components', href: '/docs/components' },
    { name: 'Admin', href: '/admin' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-fg-stroke-ui bg-bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-bg-white/60">
      <div className="flex h-14 items-center px-6 md:px-12 lg:px-24">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-bg text-primary-text">
            <Box className="h-4 w-4" />
          </div>
          <span className="font-bold">Design System</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm flex-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-fg-body/80',
                pathname === item.href
                  ? 'text-fg-body font-medium'
                  : 'text-fg-body/60'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

