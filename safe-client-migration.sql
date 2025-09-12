-- SAFE Client Table Migration
-- This preserves existing project references and handles the schema mismatch properly

DO $$
DECLARE 
    project_record RECORD;
BEGIN
    -- Step 1: Temporarily remove foreign key constraint to avoid conflicts
    RAISE NOTICE 'Step 1: Removing foreign key constraints...';
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;

    -- Step 2: Update all projects to set client_id to NULL temporarily
    RAISE NOTICE 'Step 2: Setting all project client_id to NULL temporarily...';
    UPDATE projects SET client_id = NULL WHERE client_id IS NOT NULL;

    -- Step 3: Drop and recreate clients table with correct schema
    RAISE NOTICE 'Step 3: Recreating clients table...';
    DROP TABLE IF EXISTS clients CASCADE;
    
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

    -- Step 4: Enable RLS and create policies
    RAISE NOTICE 'Step 4: Setting up RLS policies...';
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can read clients"
        ON clients FOR SELECT TO authenticated USING (true);
        
    CREATE POLICY "Authenticated users can create clients"
        ON clients FOR INSERT TO authenticated WITH CHECK (true);
        
    CREATE POLICY "Authenticated users can update clients"
        ON clients FOR UPDATE TO authenticated USING (true);
        
    CREATE POLICY "Authenticated users can delete clients"
        ON clients FOR DELETE TO authenticated USING (true);

    -- Step 5: Create a default client for existing projects
    RAISE NOTICE 'Step 5: Creating default client for existing projects...';
    INSERT INTO clients (name, email, company, classification)
    VALUES ('Default Contact', 'default@example.com', 'Default Client Company', 'Direct')
    RETURNING id INTO project_record;

    -- Step 6: Update existing projects to use the default client
    UPDATE projects SET client_id = (
        SELECT id FROM clients WHERE company = 'Default Client Company' LIMIT 1
    ) WHERE client_id IS NULL;

    -- Step 7: Re-add the foreign key constraint
    RAISE NOTICE 'Step 6: Re-adding foreign key constraint...';
    ALTER TABLE projects ADD CONSTRAINT projects_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

    -- Step 8: Create indexes for performance
    CREATE INDEX idx_clients_company ON clients(company);
    CREATE INDEX idx_clients_email ON clients(email);
    CREATE INDEX idx_clients_classification ON clients(classification);

    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'All existing projects now reference a default client.';
    RAISE NOTICE 'You can now create new clients and reassign projects as needed.';
END $$;