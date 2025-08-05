/*
  # Operations Pipeline Database Schema

  1. New Tables
    - `project_phases` - Project phase management and tracking
    - `project_tasks` - Task management with dependencies
    - `task_comments` - Task collaboration and communication
    - `project_risks` - Risk identification and mitigation
    - `resource_allocations` - Equipment and crew allocation
    - `team_members` - Extended team member information
    - `key_documents` - Project document management
    - `integration_logs` - External system integration tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key constraints
*/

-- Team Members table (extended from users)
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  avatar text,
  department text,
  skills text[] DEFAULT '{}',
  availability_status text NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (true);

-- Project Phases table
CREATE TABLE IF NOT EXISTS project_phases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_name text NOT NULL CHECK (phase_name IN ('discover', 'build', 'prepare', 'deliver', 'roundup')),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'complete')),
  progress_percentage integer NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  start_date date,
  end_date date,
  checklist_items text[] NOT NULL DEFAULT '{}',
  checklist_completed boolean[] NOT NULL DEFAULT '{}',
  can_complete boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assignee_id uuid REFERENCES team_members(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read project phases"
  ON project_phases
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project phases"
  ON project_phases
  FOR ALL
  TO authenticated
  USING (true);

-- Project Tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES project_phases(id) ON DELETE SET NULL,
  task_name text NOT NULL,
  description text NOT NULL,
  assignee_id uuid REFERENCES team_members(id) ON DELETE SET NULL,
  due_date date,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'complete')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  estimated_hours numeric,
  actual_hours numeric DEFAULT 0,
  dependencies uuid[] DEFAULT '{}',
  is_critical_path boolean DEFAULT false,
  jira_ticket_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read project tasks"
  ON project_tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project tasks"
  ON project_tasks
  FOR ALL
  TO authenticated
  USING (true);

-- Task Comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment text NOT NULL,
  mentions uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read task comments"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage task comments"
  ON task_comments
  FOR ALL
  TO authenticated
  USING (true);

-- Project Risks table
CREATE TABLE IF NOT EXISTS project_risks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  risk_category text NOT NULL CHECK (risk_category IN ('technical', 'logistics', 'personnel', 'weather', 'client')),
  description text NOT NULL,
  probability integer NOT NULL CHECK (probability >= 1 AND probability <= 5),
  impact integer NOT NULL CHECK (impact >= 1 AND impact <= 5),
  mitigation_plan text NOT NULL,
  status text NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'mitigating', 'resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read project risks"
  ON project_risks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project risks"
  ON project_risks
  FOR ALL
  TO authenticated
  USING (true);

-- Resource Allocations table
CREATE TABLE IF NOT EXISTS resource_allocations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('equipment', 'crew')),
  resource_id text NOT NULL,
  resource_name text NOT NULL,
  allocated_from date NOT NULL,
  allocated_to date NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  rms_sync_status text NOT NULL DEFAULT 'pending' CHECK (rms_sync_status IN ('pending', 'synced', 'error')),
  jue_ticket_id text,
  qr_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read resource allocations"
  ON resource_allocations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage resource allocations"
  ON resource_allocations
  FOR ALL
  TO authenticated
  USING (true);

-- Key Documents table
CREATE TABLE IF NOT EXISTS key_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('staff_advance', 'client_info_pack', 'device_allocation', 'menus', 'ticketing_matrix', 'access_matrix', 'rams', 'site_map')),
  document_name text NOT NULL,
  document_url text,
  upload_status text NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploaded', 'linked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE key_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read key documents"
  ON key_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage key documents"
  ON key_documents
  FOR ALL
  TO authenticated
  USING (true);

-- Integration Logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  integration_type text NOT NULL CHECK (integration_type IN ('roi', 'jira', 'jue', 'rms', 'crew_db')),
  action text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message text,
  request_data jsonb,
  response_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read integration logs"
  ON integration_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create integration logs"
  ON integration_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_status ON project_phases(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_phase_id ON project_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_id ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_critical_path ON project_tasks(is_critical_path);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_project_id ON project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_project_id ON resource_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_key_documents_project_id ON key_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_project_id ON integration_logs(project_id);

-- Insert sample team members
INSERT INTO team_members (id, name, email, role, department, skills, availability_status) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', 'Sophia Carter', 'sophia@casfid.com', 'Project Manager', 'Operations', '{"Project Management", "Risk Assessment", "Team Leadership"}', 'available'),
  ('550e8400-e29b-41d4-a716-446655440102', 'Ethan Bennett', 'ethan@casfid.com', 'Technical Lead', 'Technical', '{"System Architecture", "Integration", "Troubleshooting"}', 'busy'),
  ('550e8400-e29b-41d4-a716-446655440103', 'Olivia Hayes', 'olivia@casfid.com', 'Operations Coordinator', 'Operations', '{"Logistics", "Coordination", "Documentation"}', 'available'),
  ('550e8400-e29b-41d4-a716-446655440104', 'Liam Foster', 'liam@casfid.com', 'Resource Manager', 'Resources', '{"Resource Planning", "Inventory Management", "Procurement"}', 'available'),
  ('550e8400-e29b-41d4-a716-446655440105', 'Ava Harper', 'ava@casfid.com', 'Team Lead', 'Operations', '{"Team Management", "Quality Assurance", "Training"}', 'available')
ON CONFLICT (id) DO NOTHING;