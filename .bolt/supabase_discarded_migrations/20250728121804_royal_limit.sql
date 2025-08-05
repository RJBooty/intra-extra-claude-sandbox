/*
  # Platform Configuration System

  1. New Tables
    - `platform_fields` - Core configurable fields with metadata
    - `field_options` - Individual options for dropdown/select fields  
    - `field_change_log` - Complete audit trail of all changes
    - `field_usage_tracking` - Analytics on field usage across the platform

  2. User Role Enhancement
    - Adds `role_level` column to users table for granular permissions
    - Supports: master, senior, mid, external, hr, admin, user

  3. Security
    - Enable RLS on all new tables
    - Master-only access to platform configuration management
    - Read-only audit trail for transparency
    - Proper permission enforcement

  4. Sample Data
    - Pre-populated with common configurable fields
    - Ready-to-use options for immediate testing
*/

-- Add role_level to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role_level'
  ) THEN
    ALTER TABLE users ADD COLUMN role_level text DEFAULT 'user';
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
  created_by text,
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
  field_id uuid REFERENCES platform_fields(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('CREATED', 'MODIFIED', 'REMOVED', 'RESTORED', 'OPTION_ADDED', 'OPTION_REMOVED', 'OPTION_MODIFIED')),
  old_value jsonb,
  new_value jsonb,
  change_description text,
  version_number integer DEFAULT 1,
  changed_by text,
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

-- Enable RLS on all new tables
ALTER TABLE platform_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for platform_fields
CREATE POLICY "Master users can manage platform fields"
  ON platform_fields
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role_level = 'master'
    )
  );

CREATE POLICY "All authenticated users can read platform fields"
  ON platform_fields
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for field_options
CREATE POLICY "Master users can manage field options"
  ON field_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role_level = 'master'
    )
  );

CREATE POLICY "All authenticated users can read field options"
  ON field_options
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for field_change_log
CREATE POLICY "Master users can read change log"
  ON field_change_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role_level IN ('master', 'senior')
    )
  );

CREATE POLICY "System can insert change log"
  ON field_change_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for field_usage_tracking
CREATE POLICY "Master users can manage usage tracking"
  ON field_usage_tracking
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role_level = 'master'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_fields_module ON platform_fields(module);
CREATE INDEX IF NOT EXISTS idx_platform_fields_section ON platform_fields(section);
CREATE INDEX IF NOT EXISTS idx_platform_fields_active ON platform_fields(is_active);
CREATE INDEX IF NOT EXISTS idx_field_options_field_id ON field_options(field_id);
CREATE INDEX IF NOT EXISTS idx_field_change_log_field_id ON field_change_log(field_id);
CREATE INDEX IF NOT EXISTS idx_field_change_log_changed_at ON field_change_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_field_usage_tracking_field_id ON field_usage_tracking(field_id);

-- Insert sample platform fields
INSERT INTO platform_fields (field_name, field_type, module, section, is_required, default_value, is_locked, created_by) VALUES
  ('Project Status', 'dropdown', 'Projects', 'Project Info', false, 'Active', false, 'system'),
  ('Client Classification', 'dropdown', 'Clients', 'Client Details', true, 'Canopy', false, 'system'),
  ('Event Type', 'dropdown', 'Projects', 'Project Info', true, 'Conference', false, 'system'),
  ('Deal Stage', 'dropdown', 'Pipeline', 'Deal Details', true, 'Contacted', false, 'system'),
  ('Client Tier', 'dropdown', 'Pipeline', 'Deal Details', true, 'Sapling', false, 'system')
ON CONFLICT DO NOTHING;

-- Insert sample field options
DO $$
DECLARE
  project_status_id uuid;
  client_classification_id uuid;
  event_type_id uuid;
  deal_stage_id uuid;
  client_tier_id uuid;
BEGIN
  -- Get field IDs
  SELECT id INTO project_status_id FROM platform_fields WHERE field_name = 'Project Status' LIMIT 1;
  SELECT id INTO client_classification_id FROM platform_fields WHERE field_name = 'Client Classification' LIMIT 1;
  SELECT id INTO event_type_id FROM platform_fields WHERE field_name = 'Event Type' LIMIT 1;
  SELECT id INTO deal_stage_id FROM platform_fields WHERE field_name = 'Deal Stage' LIMIT 1;
  SELECT id INTO client_tier_id FROM platform_fields WHERE field_name = 'Client Tier' LIMIT 1;

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
  IF client_classification_id IS NOT NULL THEN
    INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
      (client_classification_id, 'canopy', 'Canopy', 1),
      (client_classification_id, 'direct', 'Direct', 2),
      (client_classification_id, 'partner', 'Partner', 3),
      (client_classification_id, 'vendor', 'Vendor', 4)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert options for Event Type
  IF event_type_id IS NOT NULL THEN
    INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
      (event_type_id, 'conference', 'Conference', 1),
      (event_type_id, 'festival', 'Festival', 2),
      (event_type_id, 'exhibition', 'Exhibition', 3),
      (event_type_id, 'sports', 'Sports', 4),
      (event_type_id, 'corporate', 'Corporate', 5),
      (event_type_id, 'other', 'Other', 6)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert options for Deal Stage
  IF deal_stage_id IS NOT NULL THEN
    INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
      (deal_stage_id, 'contacted', 'Contacted', 1),
      (deal_stage_id, 'qualified', 'Qualified', 2),
      (deal_stage_id, 'first_meet_scheduled', 'First Meet Scheduled', 3),
      (deal_stage_id, 'proposal_sent', 'Proposal Sent', 4),
      (deal_stage_id, 'negotiations', 'Negotiations', 5),
      (deal_stage_id, 'contract_signature', 'Contract Signature', 6),
      (deal_stage_id, 'kickoff', 'Kickoff', 7),
      (deal_stage_id, 'operations', 'Operations', 8)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert options for Client Tier
  IF client_tier_id IS NOT NULL THEN
    INSERT INTO field_options (field_id, option_value, option_label, sort_order) VALUES
      (client_tier_id, 'seed', 'Seed', 1),
      (client_tier_id, 'sapling', 'Sapling', 2),
      (client_tier_id, 'canopy', 'Canopy', 3),
      (client_tier_id, 'jungle', 'Jungle', 4),
      (client_tier_id, 'rainforest', 'Rainforest', 5)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;