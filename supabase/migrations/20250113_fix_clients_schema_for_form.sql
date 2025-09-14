-- Fix clients table schema to match ClientForm expectations
-- This ensures the client creation functionality works properly

-- Drop and recreate clients table with the correct schema for the ClientForm
-- WARNING: This will remove any existing client data
DO $$
BEGIN
    -- Drop existing clients table if it exists
    DROP TABLE IF EXISTS clients CASCADE;
    
    -- Recreate with the schema expected by ClientForm
    CREATE TABLE clients (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,  -- Maps to ClientForm 'name' field
        email text NOT NULL, -- Maps to ClientForm 'email' field  
        phone text,          -- Maps to ClientForm 'phone' field
        company text NOT NULL, -- Maps to ClientForm 'company' field
        classification text NOT NULL DEFAULT 'Direct' CHECK (classification IN ('Canopy', 'Direct', 'Partner', 'Vendor')), -- Maps to ClientForm 'classification' field
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies for authenticated users
    CREATE POLICY "Authenticated users can read clients"
        ON clients
        FOR SELECT
        TO authenticated
        USING (true);

    CREATE POLICY "Authenticated users can create clients"
        ON clients
        FOR INSERT
        TO authenticated
        WITH CHECK (true);

    CREATE POLICY "Authenticated users can update clients"
        ON clients
        FOR UPDATE
        TO authenticated
        USING (true);

    CREATE POLICY "Authenticated users can delete clients"
        ON clients
        FOR DELETE
        TO authenticated
        USING (true);

    -- Create indexes for performance
    CREATE INDEX idx_clients_company ON clients(company);
    CREATE INDEX idx_clients_email ON clients(email);
    CREATE INDEX idx_clients_classification ON clients(classification);

    -- Recreate the foreign key constraint in projects table
    -- First check if projects table has client_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'client_id' 
        AND table_schema = 'public'
    ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
        -- Add the constraint back
        ALTER TABLE projects ADD CONSTRAINT projects_client_id_fkey 
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;

    RAISE NOTICE 'Clients table recreated with ClientForm-compatible schema';
END $$;