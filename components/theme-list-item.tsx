'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Check, Edit, Trash2, Loader2 } from 'lucide-react'
import type { Theme } from '@/lib/supabase'
import { usePermissions } from '@/hooks/use-permissions'

interface ThemeListItemProps {
  theme: Theme
}

export function ThemeListItem({ theme }: ThemeListItemProps) {
  const router = useRouter()
  const { canDeleteTheme, canActivateTheme } = usePermissions()
  const [isActivating, setIsActivating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleActivate = async () => {
    if (!canActivateTheme) return
    
    setIsActivating(true)
    try {
      const response = await fetch('/api/themes/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: theme.id }),
      })

      if (!response.ok) throw new Error('Failed to activate theme')

      router.refresh()
    } catch (error) {
      console.error('Error activating theme:', error)
      alert('Failed to activate theme')
    } finally {
      setIsActivating(false)
    }
  }

  const handleDelete = async () => {
    if (!canDeleteTheme) return
    if (!confirm(`Are you sure you want to delete "${theme.name}"?`)) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/themes/${theme.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete theme')

      router.refresh()
    } catch (error) {
      console.error('Error deleting theme:', error)
      alert('Failed to delete theme')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{theme.name}</CardTitle>
          {theme.is_active && (
            <div className="flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
              <Check className="h-3 w-3" />
              Active
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Color Preview */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Object.entries(theme.colors).slice(0, 8).map(([key, value]) => (
            <div
              key={key}
              className="h-8 rounded border border-border"
              style={{ backgroundColor: `hsl(${value})` }}
              title={key}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/admin/themes/${theme.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          {!theme.is_active && canActivateTheme && (
            <Button
              variant="default"
              size="sm"
              onClick={handleActivate}
              disabled={isActivating}
            >
              {isActivating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Activate'
              )}
            </Button>
          )}

          {canDeleteTheme && !theme.is_active && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

