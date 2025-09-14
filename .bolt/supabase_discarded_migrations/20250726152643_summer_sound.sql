/*
  # Platform Configuration System Database Schema

  1. New Tables
    - `platform_fields` - Configurable fields across the platform
    - `field_change_log` - Audit trail for field modifications
    - `field_options` - Individual options for each field
    - `field_usage_tracking` - Track where fields are used

  2. Security
    - Enable RLS on all tables
    - Add policies for Master-level access
    - Proper foreign key constraints

  3. Changes
    - Add role_level to users table for Master access control
*/

-- Add role_level to users table for Master access control
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role_level'
  ) THEN
    ALTER TABLE users ADD COLUMN role_level text DEFAULT 'user' 
      CHECK (role_level IN ('master', 'senior', 'mid', 'external', 'hr', 'admin'));
  END IF;
END $$;

-- Platform Fields table
CREATE TABLE IF NOT EXISTS platform_fields (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('dropdown', 'multiselect', 'radio', 'checkbox', 'tags')),
  module text NOT NULL,
  section text NOT NULL,
  component text,
  data_attribute text, -- for data-configurable discovery
  is_required boolean DEFAULT false,
  default_value text,
  is_locked boolean DEFAULT false, -- system fields that cannot be edited
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  validation_rules jsonb DEFAULT '{}',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module, section, field_name)
);

ALTER TABLE platform_fields ENABLE ROW LEVEL SECURITY;

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

-- Field Options table
CREATE TABLE IF NOT EXISTS field_options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id uuid NOT NULL REFERENCES platform_fields(id) ON DELETE CASCADE,
  option_value text NOT NULL,
  option_label text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE field_options ENABLE ROW LEVEL SECURITY;

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

-- Field Change Log table
CREATE TABLE IF NOT EXISTS field_change_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id uuid REFERENCES platform_fields(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('CREATED', 'MODIFIED', 'REMOVED', 'RESTORED', 'OPTION_ADDED', 'OPTION_REMOVED', 'OPTION_MODIFIED')),
  old_value jsonb,
  new_value jsonb,
  change_description text,
  version_number integer DEFAULT 1,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  changed_at timestamptz DEFAULT now()
);

ALTER TABLE field_change_log ENABLE ROW LEVEL SECURITY;

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

-- Field Usage Tracking table
CREATE TABLE IF NOT EXISTS field_usage_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id uuid NOT NULL REFERENCES platform_fields(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  column_name text NOT NULL,
  record_count integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(field_id, table_name, column_name)
);

ALTER TABLE field_usage_tracking ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_platform_fields_module ON platform_fields(module);
CREATE INDEX IF NOT EXISTS idx_platform_fields_section ON platform_fields(section);
CREATE INDEX IF NOT EXISTS idx_platform_fields_active ON platform_fields(is_active);
CREATE INDEX IF NOT EXISTS idx_field_options_field_id ON field_options(field_id);
CREATE INDEX IF NOT EXISTS idx_field_options_active ON field_options(is_active);
CREATE INDEX IF NOT EXISTS idx_field_change_log_field_id ON field_change_log(field_id);
CREATE INDEX IF NOT EXISTS idx_field_change_log_changed_at ON field_change_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_field_usage_tracking_field_id ON field_usage_tracking(field_id);

-- Insert sample platform fields
INSERT INTO platform_fields (field_name, field_type, module, section, created_by) VALUES
  ('Project Status', 'dropdown', 'Projects', 'Project Info', '550e8400-e29b-41d4-a716-446655440001'),
  ('Client Type', 'dropdown', 'Clients', 'Client Details', '550e8400-e29b-41d4-a716-446655440001'),
  ('Task Priority', 'dropdown', 'Pipeline', 'Task Details', '550e8400-e29b-41d4-a716-446655440001'),
  ('User Role', 'dropdown', 'Team', 'User Management', '550e8400-e29b-41d4-a716-446655440001'),
  ('Widget Type', 'dropdown', 'Dashboard', 'Performance', '550e8400-e29b-41d4-a716-446655440001'),
  ('Deal Stage', 'dropdown', 'Pipeline', 'Deal Details', '550e8400-e29b-41d4-a716-446655440001'),
  ('Guard Certification', 'multiselect', 'Guards', 'Certification', '550e8400-e29b-41d4-a716-446655440001'),
  ('Report Type', 'dropdown', 'Reports', 'Analytics', '550e8400-e29b-41d4-a716-446655440001'),
  ('Notification Preference', 'radio', 'Settings', 'Account', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (module, section, field_name) DO NOTHING;

-- Insert sample field options
DO $$
DECLARE
    field_record RECORD;
BEGIN
    -- Project Status options
    SELECT id INTO field_record FROM platform_fields WHERE field_name = 'Project Status' LIMIT 1;
    IF FOUND THEN
        INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
            (field_record.id, 'not_started', 'Not Started', 1),
            (field_record.id, 'in_progress', 'In Progress', 2),
            (field_record.id, 'on_hold', 'On Hold', 3),
            (field_record.id, 'completed', 'Completed', 4),
            (field_record.id, 'cancelled', 'Cancelled', 5)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Client Type options
    SELECT id INTO field_record FROM platform_fields WHERE field_name = 'Client Type' LIMIT 1;
    IF FOUND THEN
        INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
            (field_record.id, 'canopy', 'Canopy', 1),
            (field_record.id, 'direct', 'Direct', 2),
            (field_record.id, 'partner', 'Partner', 3)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Task Priority options
    SELECT id INTO field_record FROM platform_fields WHERE field_name = 'Task Priority' LIMIT 1;
    IF FOUND THEN
        INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
            (field_record.id, 'critical', 'Critical', 1),
            (field_record.id, 'high', 'High', 2),
            (field_record.id, 'normal', 'Normal', 3),
            (field_record.id, 'low', 'Low', 4)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Widget Type options
    SELECT id INTO field_record FROM platform_fields WHERE field_name = 'Widget Type' LIMIT 1;
    IF FOUND THEN
        INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
            (field_record.id, 'bar_chart', 'Bar Chart', 1),
            (field_record.id, 'line_chart', 'Line Chart', 2),
            (field_record.id, 'pie_chart', 'Pie Chart', 3),
            (field_record.id, 'table', 'Table', 4),
            (field_record.id, 'metric', 'Metric', 5),
            (field_record.id, 'funnel', 'Funnel', 6)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Update James Tyson to Master role
UPDATE users SET role_level = 'master' WHERE email = 'tyson@casfid.com';