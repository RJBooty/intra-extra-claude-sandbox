/*
  # Platform Configuration System

  1. New Tables
    - `platform_fields` - Core configurable fields
    - `field_options` - Individual options for each field
    - `field_change_log` - Complete audit trail
    - `field_usage_tracking` - Track field usage across platform

  2. Security
    - Enable RLS on all new tables
    - Add Master-level access policies
    - Audit trail policies for transparency

  3. Changes
    - Add role_level to users table for Master access control
    - Create indexes for performance
    - Set up proper foreign key relationships
*/

-- Add role_level to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role_level'
  ) THEN
    ALTER TABLE users ADD COLUMN role_level text DEFAULT 'user' 
      CHECK (role_level IN ('master', 'senior', 'mid', 'external', 'hr', 'admin', 'user'));
  END IF;
END $$;

-- Create platform_fields table
CREATE TABLE IF NOT EXISTS platform_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('dropdown', 'multiselect', 'radio', 'checkbox', 'tags')),
  module text NOT NULL,
  section text NOT NULL,
  component text,
  data_attribute text,
  is_required boolean DEFAULT false,
  default_value text,
  is_locked boolean DEFAULT false,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  validation_rules jsonb DEFAULT '{}',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create field_options table
CREATE TABLE IF NOT EXISTS field_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES platform_fields(id) ON DELETE CASCADE,
  option_value text NOT NULL,
  option_label text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create field_change_log table
CREATE TABLE IF NOT EXISTS field_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES platform_fields(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('CREATED', 'MODIFIED', 'REMOVED', 'RESTORED', 'OPTION_ADDED', 'OPTION_REMOVED', 'OPTION_MODIFIED')),
  old_value jsonb,
  new_value jsonb,
  change_description text,
  version_number integer DEFAULT 1,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  changed_at timestamptz DEFAULT now()
);

-- Create field_usage_tracking table
CREATE TABLE IF NOT EXISTS field_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES platform_fields(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  column_name text NOT NULL,
  record_count integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_fields_module ON platform_fields(module);
CREATE INDEX IF NOT EXISTS idx_platform_fields_section ON platform_fields(section);
CREATE INDEX IF NOT EXISTS idx_platform_fields_active ON platform_fields(is_active);
CREATE INDEX IF NOT EXISTS idx_field_options_field_id ON field_options(field_id);
CREATE INDEX IF NOT EXISTS idx_field_options_active ON field_options(is_active);
CREATE INDEX IF NOT EXISTS idx_field_change_log_field_id ON field_change_log(field_id);
CREATE INDEX IF NOT EXISTS idx_field_change_log_changed_at ON field_change_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_field_usage_tracking_field_id ON field_usage_tracking(field_id);

-- Enable Row Level Security
ALTER TABLE platform_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Platform Fields Policies (Master-level access only)
CREATE POLICY "Master users can manage platform fields"
  ON platform_fields
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role_level = 'master'
    )
  );

CREATE POLICY "Master users can read platform fields"
  ON platform_fields
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role_level = 'master'
    )
  );

-- Field Options Policies
CREATE POLICY "Master users can manage field options"
  ON field_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role_level = 'master'
    )
  );

CREATE POLICY "Master users can read field options"
  ON field_options
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role_level = 'master'
    )
  );

-- Field Change Log Policies (Read-only for transparency)
CREATE POLICY "Master users can read field change log"
  ON field_change_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role_level = 'master'
    )
  );

CREATE POLICY "System can create field change log"
  ON field_change_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Field Usage Tracking Policies
CREATE POLICY "Master users can read field usage tracking"
  ON field_usage_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role_level = 'master'
    )
  );

CREATE POLICY "System can manage field usage tracking"
  ON field_usage_tracking
  FOR ALL
  TO authenticated
  USING (true);

-- Insert sample data for testing
INSERT INTO platform_fields (field_name, field_type, module, section, is_locked, created_by) VALUES
  ('Project Status', 'dropdown', 'Projects', 'Project Info', true, (SELECT id FROM users WHERE email = 'tyson@casfid.com' LIMIT 1)),
  ('Client Classification', 'dropdown', 'Clients', 'Client Details', true, (SELECT id FROM users WHERE email = 'tyson@casfid.com' LIMIT 1)),
  ('Deal Stage', 'dropdown', 'Pipeline', 'Deal Details', true, (SELECT id FROM users WHERE email = 'tyson@casfid.com' LIMIT 1)),
  ('User Role', 'dropdown', 'Team', 'User Management', true, (SELECT id FROM users WHERE email = 'tyson@casfid.com' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample options
DO $$
DECLARE
  project_status_id uuid;
  client_class_id uuid;
  deal_stage_id uuid;
  user_role_id uuid;
BEGIN
  -- Get field IDs
  SELECT id INTO project_status_id FROM platform_fields WHERE field_name = 'Project Status' LIMIT 1;
  SELECT id INTO client_class_id FROM platform_fields WHERE field_name = 'Client Classification' LIMIT 1;
  SELECT id INTO deal_stage_id FROM platform_fields WHERE field_name = 'Deal Stage' LIMIT 1;
  SELECT id INTO user_role_id FROM platform_fields WHERE field_name = 'User Role' LIMIT 1;

  -- Insert options for Project Status
  IF project_status_id IS NOT NULL THEN
    INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
      (project_status_id, 'active', 'Active', 1),
      (project_status_id, 'completed', 'Completed', 2),
      (project_status_id, 'on_hold', 'On Hold', 3),
      (project_status_id, 'cancelled', 'Cancelled', 4)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert options for Client Classification
  IF client_class_id IS NOT NULL THEN
    INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
      (client_class_id, 'canopy', 'Canopy', 1),
      (client_class_id, 'direct', 'Direct', 2),
      (client_class_id, 'partner', 'Partner', 3),
      (client_class_id, 'vendor', 'Vendor', 4)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert options for Deal Stage
  IF deal_stage_id IS NOT NULL THEN
    INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
      (deal_stage_id, 'contacted', 'Contacted', 1),
      (deal_stage_id, 'qualified', 'Qualified', 2),
      (deal_stage_id, 'proposal_sent', 'Proposal Sent', 3),
      (deal_stage_id, 'negotiations', 'Negotiations', 4),
      (deal_stage_id, 'contract_signature', 'Contract Signature', 5),
      (deal_stage_id, 'kickoff', 'Kickoff', 6),
      (deal_stage_id, 'operations', 'Operations', 7)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert options for User Role
  IF user_role_id IS NOT NULL THEN
    INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
      (user_role_id, 'master', 'Master User', 1),
      (user_role_id, 'senior', 'Senior User', 2),
      (user_role_id, 'mid', 'Mid User', 3),
      (user_role_id, 'external', 'External User', 4),
      (user_role_id, 'hr', 'HR User', 5),
      (user_role_id, 'admin', 'Admin', 6)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;