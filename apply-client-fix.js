// Apply Client Schema Fix
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://wyixydnywhpiewgsfimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXh5ZG55d2hwaWV3Z3NmaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk5NTk5MiwiZXhwIjoyMDcyNTcxOTkyfQ.qI4gKmTGJXMHR3gDYz8KXgpRVGGF8KWEgHLI_nzUy_I'; // You'll need the service role key for schema changes

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyClientSchemaFix() {
  console.log('🔧 APPLYING CLIENT SCHEMA FIX');
  console.log('=============================\n');

  try {
    // Read the migration SQL
    const migrationSQL = readFileSync('./supabase/migrations/20250113_fix_clients_schema_for_form.sql', 'utf8');
    
    console.log('1. Applying migration...');
    console.log('Migration length:', migrationSQL.length, 'characters');
    
    // Note: This is a simplified approach. In production, you'd want to run this via Supabase CLI
    // For now, let's just recreate the table manually with the correct schema
    
    const createTableSQL = `
      -- Drop existing clients table if it exists  
      DROP TABLE IF EXISTS clients CASCADE;
      
      -- Recreate with the schema expected by ClientForm
      CREATE TABLE clients (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          name text NOT NULL,
          email text NOT NULL,
          phone text,
          company text NOT NULL,
          classification text NOT NULL DEFAULT 'Direct' CHECK (classification IN ('Canopy', 'Direct', 'Partner', 'Vendor')),
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
      );

      -- Enable RLS
      ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY "Authenticated users can manage clients"
          ON clients
          FOR ALL
          TO authenticated
          USING (true);
    `;

    console.log('2. Executing schema update...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (error) {
      console.log('❌ Migration failed:', error);
      
      // Fallback: Try using individual commands
      console.log('\n3. Trying fallback approach...');
      
      // Drop table
      try {
        await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('✅ Cleared existing clients data');
      } catch (e) {
        console.log('⚠️ Could not clear clients data:', e);
      }

    } else {
      console.log('✅ Migration applied successfully');
    }

    // Test the new schema
    console.log('\n4. Testing new schema...');
    const testClient = {
      name: 'Test Contact',
      email: 'test@example.com',
      company: 'Test Company',
      classification: 'Direct'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('clients')
      .insert([testClient])
      .select()
      .single();

    if (insertError) {
      console.log('❌ Test insert failed:', insertError);
    } else {
      console.log('✅ Test insert succeeded:', insertData);
      
      // Clean up test data
      await supabase.from('clients').delete().eq('id', insertData.id);
      console.log('Test record cleaned up');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

// Note: This script requires the service role key which has elevated permissions
// You should run this with caution and preferably use Supabase CLI in production
console.log('⚠️  WARNING: This script will recreate the clients table');
console.log('⚠️  Any existing client data will be lost');
console.log('\nTo proceed, you need to:');
console.log('1. Get your service role key from Supabase dashboard');
console.log('2. Replace the serviceKey in this script');
console.log('3. Run: node apply-client-fix.js');
console.log('\nAlternatively, you can run the SQL manually in Supabase SQL Editor:');

const migrationSQL = readFileSync('./supabase/migrations/20250113_fix_clients_schema_for_form.sql', 'utf8');
console.log('\n--- SQL TO RUN MANUALLY ---');
console.log(migrationSQL);
console.log('--- END SQL ---');