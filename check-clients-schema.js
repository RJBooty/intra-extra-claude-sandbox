// Check Clients Table Schema
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wyixydnywhpiewgsfimc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXh5ZG55d2hwaWV3Z3NmaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTU5OTIsImV4cCI6MjA3MjU3MTk5Mn0.aIdEtvdALRzYEOJH6jgfVli0wtliDVTZSkTIDW8Su-I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkClientsSchema() {
  console.log('🔍 CHECKING CLIENTS TABLE SCHEMA');
  console.log('================================\n');

  try {
    // Try to get any existing client record to see the actual columns
    console.log('1. Checking existing clients...');
    const { data: existingClients, error: selectError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (selectError) {
      console.log('❌ Error selecting from clients:', selectError);
    } else {
      console.log(`Found ${existingClients?.length || 0} existing clients`);
      if (existingClients && existingClients.length > 0) {
        console.log('Columns in existing record:', Object.keys(existingClients[0]));
      }
    }

    // Try to insert a minimal record to see what columns are required/available
    console.log('\n2. Testing minimal insert...');
    const minimalClient = {
      name: 'Test Client',
      email: 'test@example.com',
      company: 'Test Company'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('clients')
      .insert([minimalClient])
      .select()
      .single();

    if (insertError) {
      console.log('❌ Minimal insert failed:', insertError);
    } else {
      console.log('✅ Minimal insert succeeded');
      console.log('Available columns:', Object.keys(insertData));
      
      // Clean up test record
      await supabase.from('clients').delete().eq('id', insertData.id);
      console.log('Test record cleaned up');
    }

    // Based on your migrations, the expected schema should be:
    console.log('\n3. Expected vs Actual Schema:');
    console.log('Expected columns from migrations:');
    console.log('- id (uuid, primary key)');
    console.log('- name (text, required)');
    console.log('- email (text, required)');  
    console.log('- phone (text, optional)');
    console.log('- company (text, required)');
    console.log('- classification (text, with check constraint)');
    console.log('- created_at (timestamptz)');
    console.log('- updated_at (timestamptz)');

  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

checkClientsSchema();