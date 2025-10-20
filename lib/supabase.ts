import { createBrowserClient } from '@supabase/ssr'

// TypeScript types
export interface ThemeFont {
  name: string
  family: string
  weights: string[]
  url?: string // For custom fonts
  fallback?: string // e.g., 'sans-serif', 'serif'
}

export interface ResponsiveValue {
  desktop: string
  tablet: string
  mobile: string
}

export interface Typography {
  fonts?: ThemeFont[]
  fontSize?: Record<string, ResponsiveValue>
  lineHeight?: Record<string, ResponsiveValue>
  fontWeight?: Record<string, string>
  letterSpacing?: Record<string, string>
}

export interface Theme {
  id: string
  name: string
  slug: string
  colors: Record<string, string> // Hex colors
  typography?: Typography
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

// Admin client (for server-side admin operations)
export function createAdminClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

