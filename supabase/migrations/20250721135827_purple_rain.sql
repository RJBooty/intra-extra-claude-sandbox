/*
  # ROI Analysis Module Database Schema

  1. New Tables
    - `roi_calculations` - Main ROI calculation records
    - `revenue_streams` - Individual revenue line items
    - `cost_streams` - Individual cost line items
    - `roi_templates` - Reusable calculation templates
    - `roi_scenarios` - Scenario modeling data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key constraints
*/

-- ROI Calculations table
CREATE TABLE IF NOT EXISTS roi_calculations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  calculation_type text NOT NULL DEFAULT 'quick' CHECK (calculation_type IN ('quick', 'detailed', 'comprehensive')),
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  
  -- Revenue totals
  total_revenue_estimate numeric NOT NULL DEFAULT 0,
  total_revenue_forecast numeric NOT NULL DEFAULT 0,
  total_revenue_actual numeric NOT NULL DEFAULT 0,
  
  -- Cost totals
  total_costs_estimate numeric NOT NULL DEFAULT 0,
  total_costs_forecast numeric NOT NULL DEFAULT 0,
  total_costs_actual numeric NOT NULL DEFAULT 0,
  
  -- Calculated metrics
  margin_percentage numeric NOT NULL DEFAULT 0,
  roi_percentage numeric NOT NULL DEFAULT 0,
  
  -- Approval tracking
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;

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

-- Revenue Streams table
CREATE TABLE IF NOT EXISTS revenue_streams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  roi_calculation_id uuid NOT NULL REFERENCES roi_calculations(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('ticketing_mains', 'ticketing_addons', 'cashless', 'access_accreditation', 'wristbands_devices', 'plans_insurance', 'insights_data', 'commercial_modules')),
  item_name text NOT NULL,
  unit_price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  fee_percentage numeric NOT NULL DEFAULT 0,
  performance_percentage numeric NOT NULL DEFAULT 100,
  
  -- Calculated values
  estimate_value numeric NOT NULL DEFAULT 0,
  forecast_value numeric NOT NULL DEFAULT 0,
  actual_value numeric NOT NULL DEFAULT 0,
  
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE revenue_streams ENABLE ROW LEVEL SECURITY;

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

-- Cost Streams table
CREATE TABLE IF NOT EXISTS cost_streams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  roi_calculation_id uuid NOT NULL REFERENCES roi_calculations(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('hardware', 'staffing', 'logistics', 'development', 'misc')),
  item_name text NOT NULL,
  unit_cost numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  days integer DEFAULT 1,
  
  -- Calculated values
  estimate_value numeric NOT NULL DEFAULT 0,
  forecast_value numeric NOT NULL DEFAULT 0,
  actual_value numeric NOT NULL DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cost_streams ENABLE ROW LEVEL SECURITY;

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

-- ROI Templates table
CREATE TABLE IF NOT EXISTS roi_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name text NOT NULL,
  event_type text NOT NULL,
  event_size text NOT NULL,
  revenue_presets jsonb NOT NULL DEFAULT '{}',
  cost_presets jsonb NOT NULL DEFAULT '{}',
  is_custom boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roi_templates ENABLE ROW LEVEL SECURITY;

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

-- ROI Scenarios table
CREATE TABLE IF NOT EXISTS roi_scenarios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  roi_calculation_id uuid NOT NULL REFERENCES roi_calculations(id) ON DELETE CASCADE,
  scenario_type text NOT NULL CHECK (scenario_type IN ('best', 'expected', 'worst')),
  attendance_variance numeric DEFAULT 0,
  adoption_rate_variance numeric DEFAULT 0,
  weather_impact numeric DEFAULT 0,
  technical_issues_allowance numeric DEFAULT 0,
  currency_fluctuation numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roi_scenarios ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roi_calculations_project_id ON roi_calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_status ON roi_calculations(status);
CREATE INDEX IF NOT EXISTS idx_revenue_streams_calculation_id ON revenue_streams(roi_calculation_id);
CREATE INDEX IF NOT EXISTS idx_cost_streams_calculation_id ON cost_streams(roi_calculation_id);
CREATE INDEX IF NOT EXISTS idx_roi_scenarios_calculation_id ON roi_scenarios(roi_calculation_id);

-- Insert default ROI templates
INSERT INTO roi_templates (template_name, event_type, event_size, revenue_presets, cost_presets, created_by) VALUES
  (
    'Conference Template - Small',
    'Conference',
    'Small (500-1000)',
    '{"ticketing_mains": [{"name": "General Admission", "price": 50, "capacity": 800, "fee": 10, "performance": 85}], "cashless": [{"name": "Transaction Fee", "price": 0.25, "transactions": 5000, "fee": 100, "performance": 90}]}',
    '{"hardware": [{"name": "Scanners", "cost": 50, "quantity": 5, "days": 3}], "staffing": [{"name": "Technical Support", "cost": 200, "quantity": 2, "days": 3}]}',
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    'Festival Template - Medium',
    'Festival',
    'Medium (1000-5000)',
    '{"ticketing_mains": [{"name": "General Admission", "price": 75, "capacity": 3000, "fee": 10, "performance": 90}], "wristbands_devices": [{"name": "Generic Wristbands", "price": 2, "quantity": 3500, "fee": 100, "performance": 95}]}',
    '{"hardware": [{"name": "Wristbands", "cost": 1.5, "quantity": 3500, "days": 1}], "staffing": [{"name": "Event Crew", "cost": 150, "quantity": 8, "days": 4}]}',
    '550e8400-e29b-41d4-a716-446655440001'
  )
ON CONFLICT DO NOTHING;