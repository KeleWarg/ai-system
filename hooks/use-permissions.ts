'use client'

import { useAuth } from './use-auth'

export interface Permissions {
  // Theme permissions
  canCreateTheme: boolean
  canEditTheme: boolean
  canDeleteTheme: boolean
  canActivateTheme: boolean

  // Component permissions
  canCreateComponent: boolean
  canEditComponent: boolean
  canDeleteComponent: boolean

  // Admin permissions
  canAccessAdmin: boolean
  canManageUsers: boolean
  canManageSettings: boolean

  // Role info
  isAdmin: boolean
  isEditor: boolean
}

export function usePermissions(): Permissions {
  const { dbUser, isAdmin, isEditor } = useAuth()

  if (!dbUser) {
    return {
      canCreateTheme: false,
      canEditTheme: false,
      canDeleteTheme: false,
      canActivateTheme: false,
      canCreateComponent: false,
      canEditComponent: false,
      canDeleteComponent: false,
      canAccessAdmin: false,
      canManageUsers: false,
      canManageSettings: false,
      isAdmin: false,
      isEditor: false,
    }
  }

  const adminPermissions: Permissions = {
    canCreateTheme: true,
    canEditTheme: true,
    canDeleteTheme: true,
    canActivateTheme: true,
    canCreateComponent: true,
    canEditComponent: true,
    canDeleteComponent: true,
    canAccessAdmin: true,
    canManageUsers: true,
    canManageSettings: true,
    isAdmin: true,
    isEditor: false,
  }

  const editorPermissions: Permissions = {
    canCreateTheme: true,
    canEditTheme: true,
    canDeleteTheme: false,
    canActivateTheme: false,
    canCreateComponent: true,
    canEditComponent: true,
    canDeleteComponent: false,
    canAccessAdmin: true,
    canManageUsers: false,
    canManageSettings: false,
    isAdmin: false,
    isEditor: true,
  }

  return isAdmin ? adminPermissions : editorPermissions
}

