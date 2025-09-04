/*
  # Create Base Tables for IntraExtra Platform

  1. New Tables
    - `users` - Platform users with role-based access
    - `clients` - Client management
    - `projects` - Project management
    - `opportunities` - Sales pipeline
    - `opportunity_activities` - Sales activities tracking
    - `project_notifications` - Project-specific notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key constraints

  3. Initial Data
    - Create default admin user
    - Sample data for development
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  role_level text DEFAULT 'user' CHECK (role_level IN ('master', 'senior', 'mid', 'external', 'hr', 'admin', 'user')),
  avatar_url text,
  department text,
  created_at timestamptz DEFAULT now()
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
  USING (auth.uid() = id);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text NOT NULL,
  classification text NOT NULL CHECK (classification IN ('Canopy', 'Direct', 'Partner', 'Vendor')),
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

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
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
  currency text DEFAULT 'EUR',
  stage text NOT NULL DEFAULT 'Contacted' CHECK (stage IN ('Contacted', 'Qualified', 'First Meet Scheduled', 'Proposal Sent', 'Negotiations', 'Contract Signature', 'Kickoff', 'Operations')),
  lead_score integer DEFAULT 0,
  temperature text DEFAULT 'Cold' CHECK (temperature IN ('Hot', 'Warm', 'Cold')),
  client_tier text NOT NULL CHECK (client_tier IN ('Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest')),
  event_type text NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_date date,
  decision_date date,
  win_probability integer DEFAULT 50 CHECK (win_probability >= 0 AND win_probability <= 100),
  created_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  is_previous_client boolean DEFAULT false,
  budget_confirmed boolean DEFAULT false,
  multiple_events boolean DEFAULT false,
  referral_source text,
  decision_maker_engaged boolean DEFAULT false,
  contract_link text,
  contract_signed boolean DEFAULT false,
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

-- Opportunity Activities table
CREATE TABLE IF NOT EXISTS opportunity_activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('Email', 'Call', 'Meeting', 'Note')),
  subject text NOT NULL,
  description text NOT NULL,
  duration integer, -- in minutes for calls/meetings
  participants text[],
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

-- Project Notifications table
CREATE TABLE IF NOT EXISTS project_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('task', 'warning', 'info', 'system')),
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read boolean DEFAULT false,
  action_url text,
  action_label text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  due_date timestamptz
);

ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read project notifications"
  ON project_notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project notifications"
  ON project_notifications
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_opportunity_id ON opportunity_activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_project_notifications_project_id ON project_notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notifications_is_read ON project_notifications(is_read);

-- Insert default admin user (James Tyson)
INSERT INTO users (name, email, role, role_level) VALUES
  ('James Tyson', 'tyson@casfid.com', 'Master User', 'master')
ON CONFLICT (email) DO NOTHING;

-- Insert sample users
INSERT INTO users (name, email, role, role_level) VALUES
  ('John Smith', 'john@casfid.com', 'Sales Manager', 'senior'),
  ('Sarah Johnson', 'sarah@casfid.com', 'Account Executive', 'mid'),
  ('Mike Davis', 'mike@casfid.com', 'Project Manager', 'senior')
ON CONFLICT (email) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (name, email, phone, company, classification) VALUES
  ('John Smith', 'john@techcorp.com', '+1-555-0123', 'Tech Corp', 'Canopy'),
  ('Sarah Johnson', 'sarah@eventsolutions.com', '+1-555-0124', 'Event Solutions', 'Direct'),
  ('Mike Davis', 'mike@festivalgroup.com', '+1-555-0125', 'Festival Group', 'Partner')
ON CONFLICT DO NOTHING;