-- ALTERNATIVE: Clean Projects Table Reset
-- Use this if the safe fix doesn't work and you want to start fresh

-- WARNING: This will drop existing projects data!
-- Only use if you're okay losing existing project records

-- Uncomment the lines below if you want to do a complete reset:

/*
-- Drop existing projects table and recreate from scratch
DROP TABLE IF EXISTS projects CASCADE;

-- Ensure clients table exists first
CREATE TABLE IF NOT EXISTS clients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text,
    phone text,
    company text,
    classification text DEFAULT 'Direct',
    address text,
    tier text DEFAULT 'Seed' CHECK (tier IN ('Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create projects table with ALL required columns
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

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create all indexes
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_project_id ON projects(project_id);
CREATE INDEX idx_projects_current_phase ON projects(current_phase);

-- Create RLS policies
CREATE POLICY "Users can read projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update projects" ON projects FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update clients" ON clients FOR UPDATE TO authenticated USING (true);

*/

-- This file is commented out by default for safety.
-- To use it, uncomment the code above and run the migration.