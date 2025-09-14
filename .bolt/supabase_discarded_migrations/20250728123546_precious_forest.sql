/*
  # Add Sales Pipeline Tables

  1. New Tables
    - `opportunities`
      - Complete opportunity tracking with stages, scoring, and client information
    - `opportunity_activities`
      - Activity tracking for opportunities (emails, calls, meetings, notes)
    - `opportunity_stage_history`
      - Historical tracking of stage changes
    - `lead_scoring_factors`
      - Detailed lead scoring breakdown

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage sales data
*/

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  event_name text NOT NULL,
  deal_value numeric DEFAULT 0 NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  stage text DEFAULT 'Contacted' NOT NULL CHECK (stage IN ('Contacted', 'Qualified', 'First Meet Scheduled', 'Proposal Sent', 'Negotiations', 'Contract Signature', 'Kickoff', 'Operations')),
  lead_score integer DEFAULT 0 NOT NULL,
  temperature text DEFAULT 'Cold' NOT NULL CHECK (temperature IN ('Hot', 'Warm', 'Cold')),
  client_tier text DEFAULT 'Sapling' NOT NULL CHECK (client_tier IN ('Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest')),
  event_type text NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  event_date date,
  decision_date date,
  win_probability integer DEFAULT 50 NOT NULL CHECK (win_probability >= 0 AND win_probability <= 100),
  is_previous_client boolean DEFAULT false,
  budget_confirmed boolean DEFAULT false,
  multiple_events boolean DEFAULT false,
  referral_source text,
  decision_maker_engaged boolean DEFAULT false,
  contract_link text,
  contract_signed boolean DEFAULT false,
  created_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  last_activity_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create opportunity activities table
CREATE TABLE IF NOT EXISTS opportunity_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('Email', 'Call', 'Meeting', 'Note')),
  subject text NOT NULL,
  description text NOT NULL,
  duration integer,
  participants text[],
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create opportunity stage history table
CREATE TABLE IF NOT EXISTS opportunity_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  from_stage text NOT NULL,
  to_stage text NOT NULL,
  changed_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_at timestamptz DEFAULT now(),
  reason text
);

-- Create lead scoring factors table
CREATE TABLE IF NOT EXISTS lead_scoring_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  factor_type text NOT NULL,
  points integer NOT NULL,
  calculated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_client_id ON opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_temperature ON opportunities(temperature);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_opportunity_id ON opportunity_activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_stage_history_opportunity_id ON opportunity_stage_history(opportunity_id);

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scoring_factors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users can manage opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users can read opportunity activities" ON opportunity_activities;
DROP POLICY IF EXISTS "Authenticated users can manage opportunity activities" ON opportunity_activities;
DROP POLICY IF EXISTS "Authenticated users can read stage history" ON opportunity_stage_history;
DROP POLICY IF EXISTS "Authenticated users can create stage history" ON opportunity_stage_history;
DROP POLICY IF EXISTS "Authenticated users can read lead scoring factors" ON lead_scoring_factors;
DROP POLICY IF EXISTS "Authenticated users can manage lead scoring factors" ON lead_scoring_factors;

-- Create policies for opportunities table
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

-- Create policies for opportunity activities table
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

-- Create policies for opportunity stage history table
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

-- Create policies for lead scoring factors table
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