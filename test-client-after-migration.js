// Test Client Creation After Migration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wyixydnywhpiewgsfimc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXh5ZG55d2hwaWV3Z3NmaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTU5OTIsImV4cCI6MjA3MjU3MTk5Mn0.aIdEtvdALRzYEOJH6jgfVli0wtliDVTZSkTIDW8Su-I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClientCreationAfterMigration() {
  console.log('🧪 TESTING CLIENT CREATION AFTER MIGRATION');
  console.log('==========================================\n');

  try {
    // 1. Check if clients table has correct schema
    console.log('1. Checking clients table schema...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.log('❌ Schema check failed:', schemaError);
      return;
    }
    
    if (schemaTest && schemaTest.length > 0) {
      console.log('✅ Clients table accessible, columns:', Object.keys(schemaTest[0]));
    } else {
      console.log('✅ Clients table accessible, no records yet');
    }

    // 2. Test client creation with exact ClientForm data structure
    console.log('\n2. Testing client creation...');
    const testClient = {
      name: 'Test User',
      email: 'test@company.com',
      phone: '+1234567890',
      company: 'Test Company Ltd',
      classification: 'Direct',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Test data:', testClient);

    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert([testClient])
      .select()
      .single();

    if (createError) {
      console.log('❌ Client creation failed:');
      console.log('Error code:', createError.code);
      console.log('Error message:', createError.message);
      console.log('Error details:', createError.details);
      console.log('Error hint:', createError.hint);
    } else {
      console.log('✅ Client created successfully:', newClient);
      
      // Clean up
      await supabase.from('clients').delete().eq('id', newClient.id);
      console.log('Test client cleaned up');
    }

    // 3. Check project-client relationships
    console.log('\n3. Checking project-client relationships...');
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        project_id,
        client_id,
        clients (
          id,
          company,
          name
        )
      `)
      .limit(3);

    if (projectError) {
      console.log('❌ Project relationship check failed:', projectError);
    } else {
      console.log('✅ Project relationships working:');
      projects.forEach(project => {
        const clientInfo = project.clients ? 
          `${project.clients.company} (${project.clients.name})` : 
          'No client';
        console.log(`- ${project.project_id}: ${clientInfo}`);
      });
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

testClientCreationAfterMigration();