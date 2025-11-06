'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { 
  LayoutDashboard, 
  Palette, 
  Box, 
  Settings, 
  LogOut,
  Loader2,
  Home,
  ExternalLink
} from 'lucide-react'
import { Button } from './ui/button'
import { ThemeSwitcherAdmin } from './theme-switcher-admin'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Themes',
    href: '/admin/themes',
    icon: Palette,
  },
  {
    name: 'Components',
    href: '/admin/components',
    icon: Box,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { dbUser, loading } = useAuth()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-fg-stroke-ui bg-bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-fg-stroke-ui px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-bg text-primary-text">
            <Box className="h-5 w-5" />
          </div>
          <span className="font-semibold">Design System</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-bg-accent text-fg-body'
                  : 'text-fg-caption hover:bg-bg-accent/50 hover:text-fg-body'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
        
        {/* View Public Site Link */}
        <div className="pt-4 mt-4 border-t border-fg-stroke-ui">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-fg-caption hover:bg-bg-accent/50 hover:text-fg-body'
            )}
          >
            <Home className="h-5 w-5" />
            <span>View Public Site</span>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Link>
        </div>
      </nav>

      {/* Theme Switcher */}
      <div className="border-t border-fg-stroke-ui p-4">
        <ThemeSwitcherAdmin />
      </div>

      {/* User section */}
      <div className="border-t border-fg-stroke-ui p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-fg-caption">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : dbUser ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-bg text-primary-text text-xs font-medium">
                {dbUser.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{dbUser.email}</p>
                <p className="text-xs text-fg-caption capitalize">
                  {dbUser.role}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

