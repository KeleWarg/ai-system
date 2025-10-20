import { requireAuth } from '@/lib/auth-helpers'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Box, User, CheckCircle } from 'lucide-react'

async function getDashboardStats() {
  const supabase = createClient()

  // Get counts
  const [themesResult, componentsResult, usersResult] = await Promise.all([
    supabase.from('themes').select('*', { count: 'exact', head: true }),
    supabase.from('components').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  // Get active theme
  const { data: activeTheme } = await supabase
    .from('themes')
    .select('name')
    .eq('is_active', true)
    .single()

  return {
    themes: themesResult.count || 0,
    components: componentsResult.count || 0,
    users: usersResult.count || 0,
    activeTheme: activeTheme?.name || 'None',
  }
}

export default async function AdminDashboard() {
  await requireAuth()
  const stats = await getDashboardStats()

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to the AI-Powered Design System admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Themes</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.themes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Design system themes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Components
            </CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.components}</div>
            <p className="text-xs text-muted-foreground mt-1">
              UI components available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Admin and editor accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Theme</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{stats.activeTheme}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently applied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Create a Theme</h3>
              <p className="text-sm text-muted-foreground">
                Define your color palette, typography, and spacing in the Themes section
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Upload Component Specs</h3>
              <p className="text-sm text-muted-foreground">
                Upload PNG spec sheets and let AI extract component specifications
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Generate with AI</h3>
              <p className="text-sm text-muted-foreground">
                AI automatically generates React code, props, and documentation
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Publish & Share</h3>
              <p className="text-sm text-muted-foreground">
                Components are instantly available in the public docs with copy-paste code
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

