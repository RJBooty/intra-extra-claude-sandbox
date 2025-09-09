// Quick test to verify Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wyixydnywhpiewgsfimc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXh5ZG55d2hwaWV3Z3NmaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTU5OTIsImV4cCI6MjA3MjU3MTk5Mn0.aIdEtvdALRzYEOJH6jgfVli0wtliDVTZSkTIDW8Su-I'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Testing Supabase connection...')

try {
  const { data, error } = await supabase.from('clients').select('count')
  if (error) {
    console.log('Error (expected if tables don\'t exist):', error.message)
  } else {
    console.log('✅ Supabase connection successful!')
  }
} catch (err) {
  console.log('Connection test result:', err.message)
}