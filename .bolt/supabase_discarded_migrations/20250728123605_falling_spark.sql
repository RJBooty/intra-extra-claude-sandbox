/*
  # Add ROI Analysis Tables

  1. New Tables
    - `roi_calculations`
      - Main ROI calculation records with totals and status
    - `revenue_streams`
      - Individual revenue line items with categories and calculations
    - `cost_streams`
      - Individual cost line items with categories and calculations
    - `roi_templates`
      - Reusable templates for different event types
    - `roi_scenarios`
      - Scenario modeling for best/expected/worst case analysis

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage ROI data
*/

-- Create ROI calculations table
CREATE TABLE IF NOT EXISTS roi_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  calculation_type text DEFAULT 'quick' NOT NULL CHECK (calculation_type IN ('quick', 'detailed', 'comprehensive')),
  version integer DEFAULT 1 NOT NULL,
  status text DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'submitted', 'approved')),
  
  -- Revenue totals
  total_revenue_estimate numeric DEFAULT 0 NOT NULL,
  total_revenue_forecast numeric DEFAULT 0 NOT NULL,
  total_revenue_actual numeric DEFAULT 0 NOT NULL,
  
  -- Cost totals
  total_costs_estimate numeric DEFAULT 0 NOT NULL,
  total_costs_forecast numeric DEFAULT 0 NOT NULL,
  total_costs_actual numeric DEFAULT 0 NOT NULL,
  
  -- Calculated metrics
  margin_percentage numeric DEFAULT 0 NOT NULL,
  roi_percentage numeric DEFAULT 0 NOT NULL,
  
  -- Approval tracking
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create revenue streams table
CREATE TABLE IF NOT EXISTS revenue_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roi_calculation_id uuid NOT NULL REFERENCES roi_calculations(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('ticketing_mains', 'ticketing_addons', 'cashless', 'access_accreditation', 'wristbands_devices', 'plans_insurance', 'insights_data', 'commercial_modules')),
  item_name text NOT NULL,
  unit_price numeric DEFAULT 0 NOT NULL,
  quantity integer DEFAULT 0 NOT NULL,
  fee_percentage numeric DEFAULT 0 NOT NULL,
  performance_percentage numeric DEFAULT 100 NOT NULL,
  
  -- Calculated values
  estimate_value numeric DEFAULT 0 NOT NULL,
  forecast_value numeric DEFAULT 0 NOT NULL,
  actual_value numeric DEFAULT 0 NOT NULL,
  
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cost streams table
CREATE TABLE IF NOT EXISTS cost_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roi_calculation_id uuid NOT NULL REFERENCES roi_calculations(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('hardware', 'staffing', 'logistics', 'development', 'misc')),
  item_name text NOT NULL,
  unit_cost numeric DEFAULT 0 NOT NULL,
  quantity integer DEFAULT 0 NOT NULL,
  days integer DEFAULT 1,
  
  -- Calculated values
  estimate_value numeric DEFAULT 0 NOT NULL,
  forecast_value numeric DEFAULT 0 NOT NULL,
  actual_value numeric DEFAULT 0 NOT NULL,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ROI templates table
CREATE TABLE IF NOT EXISTS roi_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  event_type text NOT NULL,
  event_size text NOT NULL,
  revenue_presets jsonb DEFAULT '{}' NOT NULL,
  cost_presets jsonb DEFAULT '{}' NOT NULL,
  is_custom boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create ROI scenarios table
CREATE TABLE IF NOT EXISTS roi_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roi_calculation_id uuid NOT NULL REFERENCES roi_calculations(id) ON DELETE CASCADE,
  scenario_type text NOT NULL CHECK (scenario_type IN ('best', 'expected', 'worst')),
  attendance_variance numeric DEFAULT 0,
  adoption_rate_variance numeric DEFAULT 0,
  weather_impact numeric DEFAULT 0,
  technical_issues_allowance numeric DEFAULT 0,
  currency_fluctuation numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roi_calculations_project_id ON roi_calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_status ON roi_calculations(status);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_calculation_id ON revenue_streams(roi_calculation_id);
CREATE INDEX IF NOT EXISTS idx_cost_streams_calculation_id ON cost_streams(roi_calculation_id);
CREATE INDEX IF NOT EXISTS idx_roi_scenarios_calculation_id ON roi_scenarios(roi_calculation_id);

-- Enable RLS
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_scenarios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read ROI calculations" ON roi_calculations;
DROP POLICY IF EXISTS "Authenticated users can manage ROI calculations" ON roi_calculations;
DROP POLICY IF EXISTS "Authenticated users can read revenue streams" ON revenue_streams;
DROP POLICY IF EXISTS "Authenticated users can manage revenue streams" ON revenue_streams;
DROP POLICY IF EXISTS "Authenticated users can read cost streams" ON cost_streams;
DROP POLICY IF EXISTS "Authenticated users can manage cost streams" ON cost_streams;
DROP POLICY IF EXISTS "Authenticated users can read ROI templates" ON roi_templates;
DROP POLICY IF EXISTS "Authenticated users can manage ROI templates" ON roi_templates;
DROP POLICY IF EXISTS "Authenticated users can read ROI scenarios" ON roi_scenarios;
DROP POLICY IF EXISTS "Authenticated users can manage ROI scenarios" ON roi_scenarios;

-- Create policies for ROI calculations table
CREATE POLICY "Authenticated users can read ROI calculations"
  ON roi_calculations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage ROI calculations"
  ON roi_calculations
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for revenue streams table
CREATE POLICY "Authenticated users can read revenue streams"
  ON revenue_streams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage revenue streams"
  ON revenue_streams
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for cost streams table
CREATE POLICY "Authenticated users can read cost streams"
  ON cost_streams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage cost streams"
  ON cost_streams
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for ROI templates table
CREATE POLICY "Authenticated users can read ROI templates"
  ON roi_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage ROI templates"
  ON roi_templates
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for ROI scenarios table
CREATE POLICY "Authenticated users can read ROI scenarios"
  ON roi_scenarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage ROI scenarios"
  ON roi_scenarios
  FOR ALL
  TO authenticated
  USING (true);