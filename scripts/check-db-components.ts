#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkComponents() {
  const { data, error } = await supabase
    .from('components')
    .select('slug, component_name, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`\nComponents in database: ${data?.length || 0}\n`)
    data?.forEach(c => {
      console.log(`  - ${c.slug} (${c.component_name}) - ${new Date(c.created_at).toLocaleString()}`)
    })
  }
}

checkComponents()

