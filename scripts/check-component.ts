import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: join(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { data, error } = await supabase
  .from('components')
  .select('slug, name, component_name')
  .eq('slug', 'zipcode-entry-form')
  .single()

if (error) {
  console.error('Error:', error.message)
} else {
  console.log('Component data:')
  console.log('  slug:', data.slug)
  console.log('  name:', data.name)
  console.log('  component_name:', data.component_name || '(null)')
}
