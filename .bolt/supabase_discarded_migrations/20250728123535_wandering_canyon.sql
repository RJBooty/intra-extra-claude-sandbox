/*
  # Add Projects Table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `project_id` (text, unique)
      - `client_id` (uuid, foreign key to clients)
      - `event_location` (text)
      - `event_start_date` (date)
      - `event_end_date` (date)
      - `expected_attendance` (integer)
      - `classification` (text)
      - Additional metadata fields for event management
      - `current_phase` (integer, foreign key to project_phases)
      - `phase_progress` (integer, 0-100)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on projects table
    - Add policies for authenticated users to manage projects
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text UNIQUE NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  event_location text NOT NULL,
  event_start_date date NOT NULL,
  event_end_date date NOT NULL,
  expected_attendance integer DEFAULT 0 NOT NULL,
  classification text DEFAULT 'Conference' NOT NULL CHECK (classification IN ('Conference', 'Festival', 'Exhibition', 'Sports', 'Corporate', 'Other')),
  
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
  current_phase integer DEFAULT 1 NOT NULL REFERENCES project_phases(id),
  phase_progress integer DEFAULT 25 NOT NULL CHECK (phase_progress >= 0 AND phase_progress <= 100),
  status text DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Completed', 'On Hold', 'Cancelled')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_current_phase ON projects(current_phase);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;

-- Create policies for projects table
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