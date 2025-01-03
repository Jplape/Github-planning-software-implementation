import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

async function testAuth() {
  try {
    // Test authentication
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) throw error
    
    console.log('Users in database:')
    console.log(users)
    
    // Test table access
    const { data: tableData, error: tableError } = await supabase
      .from('users')
      .select('*')
      
    if (tableError) throw tableError
    
    console.log('\nUsers table data:')
    console.log(tableData)
  } catch (error) {
    console.error('Error testing Supabase:')
    console.error(error)
  }
}

testAuth()
