'use client'

import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type { User as DBUser } from '@/lib/supabase'

async function fetchUserData() {
  try {
    const response = await fetch('/api/auth/me')
    if (!response.ok) return { user: null, dbUser: null }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching user data:', error)
    return { user: null, dbUser: null }
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [dbUser, setDbUser] = useState<DBUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user data
    fetchUserData().then(({ user, dbUser }) => {
      setUser(user)
      setDbUser(dbUser)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Fetch updated db user data after auth change
        fetchUserData().then(({ dbUser }) => {
          setDbUser(dbUser)
        })
      } else {
        setDbUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    dbUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: dbUser?.role === 'admin',
    isEditor: dbUser?.role === 'editor',
  }
}

