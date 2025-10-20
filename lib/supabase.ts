import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// TypeScript types
export interface Theme {
  id: string
  name: string
  slug: string
  colors: Record<string, string>
  typography?: Record<string, unknown>
  spacing?: Record<string, unknown>
  radius?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Component {
  id: string
  name: string
  slug: string
  description: string
  category: string
  code: string
  variants: Record<string, string[]>
  props: Array<{
    name: string
    type: string
    required: boolean
    description: string
    default?: string
  }>
  prompts: {
    basic?: string[]
    advanced?: string[]
    useCases?: Array<{
      scenario: string
      prompt: string
      output?: string
    }>
  }
  installation: {
    dependencies?: string[]
    devDependencies?: string[]
    files?: Array<{
      path: string
      content: string
    }>
  }
  theme_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'editor'
  created_at: string
  updated_at: string
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      themes: {
        Row: Theme
        Insert: Omit<Theme, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Theme, 'id' | 'created_at' | 'updated_at'>>
      }
      components: {
        Row: Component
        Insert: Omit<Component, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Component, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

// Browser client (for client components)
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client (for server components and API routes)
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Admin client (for server-side admin operations)
export function createAdminClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

