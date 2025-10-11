-- Fix Projects Table Schema Issues
-- This migration safely adds missing columns and creates indexes

-- First, let's check if projects table exists and what columns it has
DO $$
DECLARE
    table_exists boolean := false;
    client_id_exists boolean := false;
    status_exists boolean := false;
BEGIN
    -- Check if projects table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'projects' AND table_schema = 'public'
    ) INTO table_exists;

    IF table_exists THEN
        -- Check if client_id column exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'client_id' AND table_schema = 'public'
        ) INTO client_id_exists;

        -- Check if status column exists  
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'status' AND table_schema = 'public'
        ) INTO status_exists;

        -- Add client_id column if it doesn't exist
        IF NOT client_id_exists THEN
            RAISE NOTICE 'Adding client_id column to projects table';
            -- First ensure clients table exists
            CREATE TABLE IF NOT EXISTS clients (
                id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                name text NOT NULL,
                email text,
                phone text,
                address text,
                tier text DEFAULT 'Seed' CHECK (tier IN ('Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest')),
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now()
            );
            
            ALTER TABLE projects ADD COLUMN client_id uuid REFERENCES clients(id) ON DELETE SET NULL;
        END IF;

        -- Add status column if it doesn't exist
        IF NOT status_exists THEN
            RAISE NOTICE 'Adding status column to projects table';
            ALTER TABLE projects ADD COLUMN status text DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'On Hold', 'Cancelled'));
        END IF;

        -- Add other commonly missing columns that might be referenced
        -- Check and add current_phase if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'current_phase' AND table_schema = 'public') THEN
            ALTER TABLE projects ADD COLUMN current_phase integer DEFAULT 1;
        END IF;

        -- Check and add phase_progress if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'phase_progress' AND table_schema = 'public') THEN
            ALTER TABLE projects ADD COLUMN phase_progress integer DEFAULT 0;
        END IF;

        -- Check and add updated_at if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at' AND table_schema = 'public') THEN
            ALTER TABLE projects ADD COLUMN updated_at timestamptz DEFAULT now();
        END IF;

    ELSE
        -- If projects table doesn't exist, create it with all necessary columns
        RAISE NOTICE 'Creating projects table from scratch';
        
        -- Create clients table first if it doesn't exist
        CREATE TABLE IF NOT EXISTS clients (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            name text NOT NULL,
            email text,
            phone text,
            address text,
            tier text DEFAULT 'Seed' CHECK (tier IN ('Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest')),
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );

        -- Create full projects table
        CREATE TABLE projects (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id text UNIQUE NOT NULL,
            client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
            event_location text NOT NULL,
            event_start_date date NOT NULL,
            event_end_date date NOT NULL,
            expected_attendance integer NOT NULL,
            event_type text NOT NULL CHECK (event_type IN ('Conference', 'Festival', 'Exhibition', 'Sports', 'Corporate', 'Other')),
            
            -- Additional metadata fields
            onsite_start_date date,
            onsite_end_date date,
            show_start_date date,
            show_end_date date,
            voucher_sale_start date,
            voucher_sale_end date,
            topup_start date,
            topup_end date,
            refund_window_start date,
            refund_window_end date,
            delivery_address text,
            delivery_contact_name text,
            delivery_contact_phone text,
            delivery_contact_email text,
            wristband_order_deadline date,
            load_in_date date,
            load_out_date date,
            qr_code_url text,
            
            -- Project status and phase
            current_phase integer DEFAULT 1,
            phase_progress integer DEFAULT 0,
            status text DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'On Hold', 'Cancelled')),
            
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;
END $$;

-- Enable RLS on projects table if not already enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Enable RLS on clients table if not already enabled  
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create indexes only after confirming columns exist
DO $$
BEGIN
    -- Create client_id index if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
    END IF;

    -- Create status index if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    END IF;

    -- Create other useful indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_id' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_project_id ON projects(project_id);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'current_phase' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_current_phase ON projects(current_phase);
    END IF;
END $$;

-- Create basic RLS policies
DO $$
BEGIN
    -- Projects policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can read projects') THEN
        CREATE POLICY "Users can read projects"
            ON projects
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can create projects') THEN
        CREATE POLICY "Users can create projects"
            ON projects
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can update projects') THEN
        CREATE POLICY "Users can update projects"
            ON projects
            FOR UPDATE
            TO authenticated
            USING (true);
    END IF;

    -- Clients policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can read clients') THEN
        CREATE POLICY "Users can read clients"
            ON clients
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can create clients') THEN
        CREATE POLICY "Users can create clients"
            ON clients
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can update clients') THEN
        CREATE POLICY "Users can update clients"
            ON clients
            FOR UPDATE
            TO authenticated
            USING (true);
    END IF;
END $$;

-- Log what we accomplished
DO $$
DECLARE
    projects_columns text;
BEGIN
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) 
    INTO projects_columns
    FROM information_schema.columns 
    WHERE table_name = 'projects' AND table_schema = 'public';
    
    RAISE NOTICE 'Projects table now has columns: %', projects_columns;
END $$;