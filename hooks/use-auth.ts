'use client'

import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type { User as DBUser } from '@/lib/supabase'
import { getUser } from '@/lib/db/users'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [dbUser, setDbUser] = useState<DBUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        getUser(user.id).then((dbUser) => {
          setDbUser(dbUser)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getUser(session.user.id).then(setDbUser)
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

