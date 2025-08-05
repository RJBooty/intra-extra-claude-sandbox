/*
  # IntraCasfid Platform Database Schema

  1. New Tables
    - `users` - System users for authentication and assignment
    - `clients` - Client companies and contacts
    - `projects` - Project management and tracking
    - `opportunities` - Sales pipeline opportunities
    - `opportunity_activities` - Activity tracking for opportunities
    - `opportunity_stage_history` - Stage change history
    - `lead_scoring_factors` - Lead scoring calculation factors
    - `document_templates` - Document templates for proposals/contracts
    - `project_documents` - Documents associated with projects
    - `project_phases` - Configurable project phases

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key constraints
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text NOT NULL,
  classification text NOT NULL DEFAULT 'Canopy' CHECK (classification IN ('Canopy', 'Direct', 'Partner', 'Vendor')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (true);

-- Project phases configuration
CREATE TABLE IF NOT EXISTS project_phases (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  "order" integer NOT NULL UNIQUE
);

ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read project phases"
  ON project_phases
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default project phases
INSERT INTO project_phases (id, name, description, "order") VALUES
  (1, 'Initial Contact', 'First client interaction and requirements gathering', 1),
  (2, 'Proposal Development', 'Creating and refining the project proposal', 2),
  (3, 'Contract Negotiation', 'Finalizing terms and conditions', 3),
  (4, 'Project Execution', 'Active project implementation', 4)
ON CONFLICT (id) DO NOTHING;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id text UNIQUE NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  event_location text NOT NULL,
  event_start_date date NOT NULL,
  event_end_date date NOT NULL,
  expected_attendance integer NOT NULL DEFAULT 0,
  classification text NOT NULL DEFAULT 'Conference' CHECK (classification IN ('Conference', 'Festival', 'Exhibition', 'Sports', 'Corporate', 'Other')),
  
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
  current_phase integer NOT NULL DEFAULT 1 REFERENCES project_phases(id),
  phase_progress integer NOT NULL DEFAULT 25 CHECK (phase_progress >= 0 AND phase_progress <= 100),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'On Hold', 'Cancelled')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (true);

-- Opportunities table (Sales Pipeline)
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name text NOT NULL,
  event_name text NOT NULL,
  deal_value numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  stage text NOT NULL DEFAULT 'Contacted' CHECK (stage IN ('Contacted', 'Qualified', 'First Meet Scheduled', 'Proposal Sent', 'Negotiations', 'Contract Signature', 'Kickoff', 'Operations')),
  lead_score integer NOT NULL DEFAULT 0,
  temperature text NOT NULL DEFAULT 'Cold' CHECK (temperature IN ('Hot', 'Warm', 'Cold')),
  client_tier text NOT NULL DEFAULT 'Sapling' CHECK (client_tier IN ('Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest')),
  event_type text NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Dates
  event_date date,
  decision_date date,
  
  -- Probability and factors
  win_probability integer NOT NULL DEFAULT 50 CHECK (win_probability >= 0 AND win_probability <= 100),
  is_previous_client boolean DEFAULT false,
  budget_confirmed boolean DEFAULT false,
  multiple_events boolean DEFAULT false,
  referral_source text,
  decision_maker_engaged boolean DEFAULT false,
  
  -- Contract and project linking
  contract_link text,
  contract_signed boolean DEFAULT false,
  created_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Activity tracking
  last_activity_date timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read opportunities"
  ON opportunities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunities"
  ON opportunities
  FOR ALL
  TO authenticated
  USING (true);

-- Opportunity activities table
CREATE TABLE IF NOT EXISTS opportunity_activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('Email', 'Call', 'Meeting', 'Note')),
  subject text NOT NULL,
  description text NOT NULL,
  duration integer, -- in minutes, for calls/meetings
  participants text[], -- array of participant names/emails
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read opportunity activities"
  ON opportunity_activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunity activities"
  ON opportunity_activities
  FOR ALL
  TO authenticated
  USING (true);

-- Opportunity stage history table
CREATE TABLE IF NOT EXISTS opportunity_stage_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  from_stage text NOT NULL,
  to_stage text NOT NULL,
  changed_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_at timestamptz DEFAULT now(),
  reason text
);

ALTER TABLE opportunity_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read stage history"
  ON opportunity_stage_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create stage history"
  ON opportunity_stage_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Lead scoring factors table
CREATE TABLE IF NOT EXISTS lead_scoring_factors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  factor_type text NOT NULL,
  points integer NOT NULL,
  calculated_at timestamptz DEFAULT now()
);

ALTER TABLE lead_scoring_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lead scoring factors"
  ON lead_scoring_factors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage lead scoring factors"
  ON lead_scoring_factors
  FOR ALL
  TO authenticated
  USING (true);

-- Document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('proposal', 'contract', 'custom')),
  template_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read document templates"
  ON document_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage document templates"
  ON document_templates
  FOR ALL
  TO authenticated
  USING (true);

-- Insert default document templates
INSERT INTO document_templates (name, description, category) VALUES
  ('Standard Event Proposal', 'Template for general events', 'proposal'),
  ('Conference Proposal', 'Template for conference events', 'proposal'),
  ('Exhibition Proposal', 'Template for exhibition events', 'proposal'),
  ('Standard Service Contract', 'Template for service agreements', 'contract'),
  ('Event Management Contract', 'Template for event management services', 'contract')
ON CONFLICT DO NOTHING;

-- Project documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  template_id uuid REFERENCES document_templates(id) ON DELETE SET NULL,
  document_name text NOT NULL,
  document_url text NOT NULL,
  document_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read project documents"
  ON project_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project documents"
  ON project_documents
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_current_phase ON projects(current_phase);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_client_id ON opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_temperature ON opportunities(temperature);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_opportunity_id ON opportunity_activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_stage_history_opportunity_id ON opportunity_stage_history(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);

-- Insert sample data for development
INSERT INTO users (id, name, email, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john@casfid.com', 'Sales Manager'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah@casfid.com', 'Account Executive'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mike Davis', 'mike@casfid.com', 'Project Manager')
ON CONFLICT (email) DO NOTHING;

INSERT INTO clients (id, name, email, phone, company, classification) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'John Smith', 'john@techcorp.com', '+1-555-0123', 'Tech Corp', 'Canopy'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Sarah Johnson', 'sarah@eventsolutions.com', '+1-555-0124', 'Event Solutions', 'Direct'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Mike Davis', 'mike@festivalgroup.com', '+1-555-0125', 'Festival Group', 'Partner')
ON CONFLICT (id) DO NOTHING;

INSERT INTO opportunities (
  id, company_name, event_name, deal_value, currency, stage, lead_score, temperature, 
  client_tier, event_type, owner_id, event_date, win_probability, is_previous_client, 
  budget_confirmed, created_at
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440021',
    'Tech Corp',
    'Annual Technology Conference',
    50000,
    'USD',
    'Contacted',
    85,
    'Hot',
    'Canopy',
    'Conference',
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-06-15',
    75,
    true,
    true,
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    'Event Solutions',
    'Product Launch Event',
    30000,
    'USD',
    'Qualified',
    65,
    'Warm',
    'Sapling',
    'Corporate',
    '550e8400-e29b-41d4-a716-446655440002',
    '2024-07-10',
    50,
    false,
    false,
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440023',
    'Festival Group',
    'Summer Music Festival',
    75000,
    'USD',
    'Proposal Sent',
    90,
    'Hot',
    'Jungle',
    'Festival',
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-08-20',
    80,
    true,
    true,
    now()
  )
ON CONFLICT (id) DO NOTHING;