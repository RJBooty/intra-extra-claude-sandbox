// Test Client Creation Script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wyixydnywhpiewgsfimc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXh5ZG55d2hwaWV3Z3NmaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTU5OTIsImV4cCI6MjA3MjU3MTk5Mn0.aIdEtvdALRzYEOJH6jgfVli0wtliDVTZSkTIDW8Su-I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClientCreation() {
  console.log('🧪 TESTING CLIENT CREATION');
  console.log('=========================\n');

  // First, check the clients table schema
  try {
    console.log('1. Checking clients table schema...');
    const { data: testQuery, error: schemaError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.log('❌ Schema check failed:', schemaError);
      return;
    }
    console.log('✅ Clients table accessible');

    // Test data that matches ClientForm
    const testClientData = {
      name: 'Test Contact',
      email: 'test@example.com', 
      phone: '+1234567890',
      company: 'Test Company Inc',
      classification: 'Direct'
    };

    console.log('\n2. Testing client creation...');
    console.log('Test data:', testClientData);

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        ...testClientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.log('❌ Client creation failed:');
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('Error details:', error.details);
      console.log('Error hint:', error.hint);
    } else {
      console.log('✅ Client created successfully:');
      console.log(data);
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }

  // Check RLS policies
  console.log('\n3. Checking RLS policies...');
  try {
    const { data: policies, error: policyError } = await supabase.rpc(
      'get_table_policies', 
      { table_name: 'clients' }
    );
    
    if (policyError) {
      console.log('⚠️ Could not check policies:', policyError.message);
    } else {
      console.log('RLS policies for clients table:', policies);
    }
  } catch (err) {
    console.log('⚠️ Policy check not available');
  }

  // Check current user
  console.log('\n4. Checking authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.log('❌ Not authenticated:', authError?.message);
  } else {
    console.log('✅ Authenticated as:', user.email);
    console.log('User ID:', user.id);
  }
}

testClientCreation();