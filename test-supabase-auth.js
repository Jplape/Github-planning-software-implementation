import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// Load environment variables
dotenv.config({ path: 'c:/Users/jplapeyre/OneDrive/2 Création application/Planning software implementation/Github-planning-software-implementation/.env' })

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
    // Test basic table access
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1)
      
    if (tasksError) {
      console.error('Error accessing tasks table:')
      console.error(tasksError)
    } else {
      console.log('\nTasks table data:')
      console.log(tasksData)
    }
  } catch (error) {
    console.error('Error testing Supabase:')
    console.error(error)
  }
}

testAuth()
