// Database Structure Audit Script for Claude Code
// Run this with: node database-audit.js

import { createClient } from '@supabase/supabase-js';

// Using environment variables from .env file
const supabaseUrl = 'https://wyixydnywhpiewgsfimc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXh5ZG55d2hwaWV3Z3NmaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTU5OTIsImV4cCI6MjA3MjU3MTk5Mn0.aIdEtvdALRzYEOJH6jgfVli0wtliDVTZSkTIDW8Su-I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditDatabaseStructure() {
    console.log('🔍 SUPABASE DATABASE STRUCTURE AUDIT');
    console.log('=====================================\n');

    try {
        // 1. Check all tables in public schema
        console.log('📋 ALL TABLES IN PUBLIC SCHEMA:');
        console.log('--------------------------------');
        const { data: tables, error: tablesError } = await supabase.rpc('get_all_tables');
        
        if (tablesError) {
            // Fallback: Try to query information_schema
            const { data: tablesFallback, error: fallbackError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public')
                .order('table_name');
                
            if (fallbackError) {
                console.log('❌ Could not retrieve tables:', fallbackError.message);
            } else {
                tablesFallback.forEach(table => console.log(`- ${table.table_name}`));
            }
        } else {
            tables.forEach(table => console.log(`- ${table}`));
        }

        console.log('\n');

        // 2. Check specific client-related tables
        console.log('👥 CLIENT-RELATED TABLES:');
        console.log('-------------------------');
        
        const clientTables = ['clients', 'client_contacts', 'client_requirements', 'client_satisfaction', 'client_tier_history'];
        
        for (const tableName of clientTables) {
            try {
                const { data, error, count } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    console.log(`❌ ${tableName}: Does not exist or no access`);
                } else {
                    console.log(`✅ ${tableName}: Exists with ${count || 0} records`);
                }
            } catch (err) {
                console.log(`❌ ${tableName}: Error checking - ${err.message}`);
            }
        }

        console.log('\n');

        // 3. Check project-related tables
        console.log('📁 PROJECT-RELATED TABLES:');
        console.log('--------------------------');
        
        const projectTables = ['projects', 'project_phases', 'project_documents', 'project_team_assignments', 'opportunities'];
        
        for (const tableName of projectTables) {
            try {
                const { data, error, count } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    console.log(`❌ ${tableName}: Does not exist or no access`);
                } else {
                    console.log(`✅ ${tableName}: Exists with ${count || 0} records`);
                }
            } catch (err) {
                console.log(`❌ ${tableName}: Error checking - ${err.message}`);
            }
        }

        console.log('\n');

        // 4. If projects table exists, check its schema
        console.log('🏗️  PROJECTS TABLE SCHEMA:');
        console.log('---------------------------');
        
        try {
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('*')
                .limit(1);
            
            if (!projectsError && projectsData && projectsData.length > 0) {
                const columns = Object.keys(projectsData[0]);
                console.log('Columns found in projects table:');
                columns.forEach(col => console.log(`- ${col}`));
                
                console.log('\nSample project data:');
                console.log(JSON.stringify(projectsData[0], null, 2));
            } else {
                console.log('No projects data found or table doesn\'t exist');
            }
        } catch (err) {
            console.log(`Error examining projects table: ${err.message}`);
        }

        console.log('\n');

        // 5. If clients table exists, check its schema  
        console.log('👤 CLIENTS TABLE SCHEMA:');
        console.log('------------------------');
        
        try {
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*')
                .limit(1);
            
            if (!clientsError && clientsData && clientsData.length > 0) {
                const columns = Object.keys(clientsData[0]);
                console.log('Columns found in clients table:');
                columns.forEach(col => console.log(`- ${col}`));
                
                console.log('\nSample client data:');
                console.log(JSON.stringify(clientsData[0], null, 2));
            } else {
                console.log('No clients data found or table doesn\'t exist');
            }
        } catch (err) {
            console.log(`Error examining clients table: ${err.message}`);
        }

        console.log('\n');

        // 6. Check relationships between clients and projects
        console.log('🔗 CLIENT-PROJECT RELATIONSHIPS:');
        console.log('--------------------------------');
        
        try {
            const { data: relationshipData, error: relError } = await supabase
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
                .limit(5);
            
            if (!relError && relationshipData) {
                console.log('✅ Client-Project relationships working:');
                relationshipData.forEach(project => {
                    const clientInfo = project.clients ? 
                        `${project.clients.company} (Contact: ${project.clients.name})` : 
                        'No client linked';
                    console.log(`- ${project.project_id}: ${clientInfo}`);
                });
            } else {
                console.log('❌ Could not test relationships:', relError?.message);
            }
        } catch (err) {
            console.log(`Error testing relationships: ${err.message}`);
        }

        console.log('\n');

        // 7. Check for permission system tables
        console.log('🔐 PERMISSION SYSTEM TABLES:');
        console.log('----------------------------');
        
        const permissionTables = [
            'page_definitions', 
            'section_definitions', 
            'field_definitions',
            'page_permissions',
            'section_permissions', 
            'field_permissions',
            'user_roles'
        ];
        
        for (const tableName of permissionTables) {
            try {
                const { data, error, count } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    console.log(`❌ ${tableName}: Does not exist`);
                } else {
                    console.log(`✅ ${tableName}: Exists with ${count || 0} records`);
                }
            } catch (err) {
                console.log(`❌ ${tableName}: Error checking`);
            }
        }

        console.log('\n');
        console.log('🎯 AUDIT COMPLETE');
        console.log('=================');
        console.log('Next steps based on findings:');
        console.log('1. Review which tables are missing');
        console.log('2. Check if existing schemas match requirements');
        console.log('3. Identify what needs to be created vs modified');

    } catch (error) {
        console.error('❌ Audit failed:', error.message);
        console.log('\n💡 Make sure your SUPABASE_URL and SUPABASE_ANON_KEY are set correctly');
    }
}

// Run the audit
auditDatabaseStructure();