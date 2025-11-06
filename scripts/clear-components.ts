import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: join(process.cwd(), '.env.local') })

async function clearComponents() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🗑️  Clearing all components...\n')

  const { data: components, error: fetchError } = await supabase
    .from('components')
    .select('slug, name')

  if (fetchError) {
    console.error('❌ Error fetching components:', fetchError.message)
    process.exit(1)
  }

  console.log(`Found ${components.length} components to delete:`)
  components.forEach(c => console.log(`  - ${c.slug} (${c.name})`))
  console.log('')

  const { error: deleteError } = await supabase
    .from('components')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (deleteError) {
    console.error('❌ Error deleting components:', deleteError.message)
    process.exit(1)
  }

  console.log('✅ All components deleted from database\n')
}

clearComponents()
