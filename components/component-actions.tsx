'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { MoreVertical, Eye, Trash2, Edit, Palette } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ComponentActionsProps {
  componentId: string
  componentName: string
  componentSlug: string
}

export function ComponentActions({
  componentId,
  componentName,
  componentSlug,
}: ComponentActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    const toastId = toast.loading('Deleting component...')
    
    try {
      const res = await fetch(`/api/components/${componentId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete component')
      }

      toast.success('Component deleted successfully', { id: toastId })
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete component',
        { id: toastId }
      )
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link 
              href={`/admin/components/${componentSlug}/preview`}
              className="flex items-center cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link 
              href={`/admin/components/${componentSlug}/properties`}
              className="flex items-center cursor-pointer"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Properties
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              href={`/admin/components/${componentSlug}/remap`}
              className="flex items-center cursor-pointer"
            >
              <Palette className="h-4 w-4 mr-2" />
              Remap Styles
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onSelect={(e) => {
              e.preventDefault()
              setShowDeleteDialog(true)
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Component"
        description={`Are you sure you want to delete "${componentName}"? This will remove the component from the database and delete its files. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}

