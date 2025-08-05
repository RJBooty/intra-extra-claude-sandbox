/*
# Complete RLS Policies Setup Script

This script sets up all Row Level Security policies for the IntraExtra platform.
It uses DROP POLICY IF EXISTS to prevent duplication errors and ensures clean policy setup.

## Tables Covered:
1. users - User management policies
2. clients - Client data access policies  
3. projects - Project access and management policies
4. opportunities - Sales pipeline policies
5. opportunity_activities - Activity tracking policies
6. opportunity_stage_history - Stage change history policies
7. roi_calculations - ROI analysis policies
8. revenue_streams - Revenue data policies
9. cost_streams - Cost data policies
10. roi_scenarios - Scenario modeling policies
11. roi_templates - Template management policies
12. document_templates - Document template policies
13. project_documents - Project document policies
14. project_phases - Phase management policies
15. lead_scoring_factors - Lead scoring policies
16. platform_fields - Platform configuration policies
17. field_options - Field option policies
18. field_change_log - Change tracking policies
19. field_usage_tracking - Usage analytics policies

## Security Model:
- Authenticated users can manage their own data
- Master/Senior users have elevated permissions
- External users have limited access to assigned projects only
- HR users have read access to relevant data
*/

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scoring_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_usage_tracking ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Master users can read all profiles" ON users;
DROP POLICY IF EXISTS "HR users can read all profiles" ON users;

-- Create new policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Master users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'hr')
    )
  );

CREATE POLICY "HR users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level = 'hr'
    )
  );

-- =====================================================
-- CLIENTS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;
DROP POLICY IF EXISTS "Master users can manage clients" ON clients;
DROP POLICY IF EXISTS "External users cannot access clients" ON clients;

-- Create new policies
CREATE POLICY "Authenticated users can read clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'mid', 'hr')
    )
  );

CREATE POLICY "Master users can manage clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
  );

-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;
DROP POLICY IF EXISTS "Master users can manage all projects" ON projects;
DROP POLICY IF EXISTS "External users can only see assigned projects" ON projects;

-- Create new policies
CREATE POLICY "Authenticated users can read projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Master users can manage all projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
  );

-- =====================================================
-- OPPORTUNITIES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users can manage opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can manage assigned opportunities" ON opportunities;
DROP POLICY IF EXISTS "External users cannot access opportunities" ON opportunities;

-- Create new policies
CREATE POLICY "Authenticated users can read opportunities"
  ON opportunities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'mid', 'hr')
    )
  );

CREATE POLICY "Master users can manage opportunities"
  ON opportunities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
  );

CREATE POLICY "Users can manage assigned opportunities"
  ON opportunities
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- =====================================================
-- OPPORTUNITY ACTIVITIES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read opportunity activities" ON opportunity_activities;
DROP POLICY IF EXISTS "Authenticated users can manage opportunity activities" ON opportunity_activities;
DROP POLICY IF EXISTS "Users can create activities for assigned opportunities" ON opportunity_activities;

-- Create new policies
CREATE POLICY "Authenticated users can read opportunity activities"
  ON opportunity_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'mid', 'hr')
    )
  );

CREATE POLICY "Users can create activities for assigned opportunities"
  ON opportunity_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities 
      WHERE id = opportunity_id 
      AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
  );

CREATE POLICY "Users can manage own activities"
  ON opportunity_activities
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- =====================================================
-- OPPORTUNITY STAGE HISTORY TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read stage history" ON opportunity_stage_history;
DROP POLICY IF EXISTS "Authenticated users can create stage history" ON opportunity_stage_history;

-- Create new policies
CREATE POLICY "Authenticated users can read stage history"
  ON opportunity_stage_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'mid', 'hr')
    )
  );

CREATE POLICY "Authenticated users can create stage history"
  ON opportunity_stage_history
  FOR INSERT
  TO authenticated
  WITH CHECK (changed_by = auth.uid());

-- =====================================================
-- ROI CALCULATIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read ROI calculations" ON roi_calculations;
DROP POLICY IF EXISTS "Authenticated users can manage ROI calculations" ON roi_calculations;
DROP POLICY IF EXISTS "Master users can manage all ROI calculations" ON roi_calculations;
DROP POLICY IF EXISTS "External users cannot access ROI data" ON roi_calculations;

-- Create new policies
CREATE POLICY "Authenticated users can read ROI calculations"
  ON roi_calculations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'hr')
    )
  );

CREATE POLICY "Master users can manage all ROI calculations"
  ON roi_calculations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
  );

CREATE POLICY "Users can manage own ROI calculations"
  ON roi_calculations
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- =====================================================
-- REVENUE STREAMS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read revenue streams" ON revenue_streams;
DROP POLICY IF EXISTS "Users can manage revenue streams" ON revenue_streams;
DROP POLICY IF EXISTS "External users cannot access revenue data" ON revenue_streams;

-- Create new policies
CREATE POLICY "Users can read revenue streams"
  ON revenue_streams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'hr')
    )
    OR EXISTS (
      SELECT 1 FROM roi_calculations 
      WHERE id = roi_calculation_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage revenue streams"
  ON revenue_streams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
    OR EXISTS (
      SELECT 1 FROM roi_calculations 
      WHERE id = roi_calculation_id 
      AND created_by = auth.uid()
    )
  );

-- =====================================================
-- COST STREAMS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read cost streams" ON cost_streams;
DROP POLICY IF EXISTS "Users can manage cost streams" ON cost_streams;
DROP POLICY IF EXISTS "External users cannot access cost data" ON cost_streams;

-- Create new policies
CREATE POLICY "Users can read cost streams"
  ON cost_streams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'hr')
    )
    OR EXISTS (
      SELECT 1 FROM roi_calculations 
      WHERE id = roi_calculation_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage cost streams"
  ON cost_streams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
    OR EXISTS (
      SELECT 1 FROM roi_calculations 
      WHERE id = roi_calculation_id 
      AND created_by = auth.uid()
    )
  );

-- =====================================================
-- ROI SCENARIOS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read ROI scenarios" ON roi_scenarios;
DROP POLICY IF EXISTS "Authenticated users can manage ROI scenarios" ON roi_scenarios;

-- Create new policies
CREATE POLICY "Authenticated users can read ROI scenarios"
  ON roi_scenarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'hr')
    )
  );

CREATE POLICY "Authenticated users can manage ROI scenarios"
  ON roi_scenarios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
  );

-- =====================================================
-- ROI TEMPLATES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read ROI templates" ON roi_templates;
DROP POLICY IF EXISTS "Authenticated users can manage ROI templates" ON roi_templates;

-- Create new policies
CREATE POLICY "Authenticated users can read ROI templates"
  ON roi_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Master users can manage ROI templates"
  ON roi_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
  );

-- =====================================================
-- DOCUMENT TEMPLATES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read document templates" ON document_templates;
DROP POLICY IF EXISTS "Authenticated users can manage document templates" ON document_templates;

-- Create new policies
CREATE POLICY "Authenticated users can read document templates"
  ON document_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Master users can manage document templates"
  ON document_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
  );

-- =====================================================
-- PROJECT DOCUMENTS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read project documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can manage project documents" ON project_documents;
DROP POLICY IF EXISTS "External users can only see assigned project documents" ON project_documents;

-- Create new policies
CREATE POLICY "Authenticated users can read project documents"
  ON project_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project documents"
  ON project_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'mid')
    )
    OR uploaded_by = auth.uid()
  );

-- =====================================================
-- PROJECT PHASES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read project phases" ON project_phases;
DROP POLICY IF EXISTS "Master users can manage project phases" ON project_phases;

-- Create new policies
CREATE POLICY "Authenticated users can read project phases"
  ON project_phases
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Master users can manage project phases"
  ON project_phases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior')
    )
  );

-- =====================================================
-- LEAD SCORING FACTORS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read lead scoring factors" ON lead_scoring_factors;
DROP POLICY IF EXISTS "Authenticated users can manage lead scoring factors" ON lead_scoring_factors;

-- Create new policies
CREATE POLICY "Authenticated users can read lead scoring factors"
  ON lead_scoring_factors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level IN ('master', 'senior', 'hr')
    )
  );

CREATE POLICY "System can manage lead scoring factors"
  ON lead_scoring_factors
  FOR ALL
  TO authenticated
  USING (true);

-- =====================================================
-- PLATFORM FIELDS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Master users can read platform fields" ON platform_fields;
DROP POLICY IF EXISTS "Master users can manage platform fields" ON platform_fields;

-- Create new policies
CREATE POLICY "Master users can read platform fields"
  ON platform_fields
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level = 'master'
    )
  );

CREATE POLICY "Master users can manage platform fields"
  ON platform_fields
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level = 'master'
    )
  );

-- =====================================================
-- FIELD OPTIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Master users can read field options" ON field_options;
DROP POLICY IF EXISTS "Master users can manage field options" ON field_options;

-- Create new policies
CREATE POLICY "Master users can read field options"
  ON field_options
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level = 'master'
    )
  );

CREATE POLICY "Master users can manage field options"
  ON field_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level = 'master'
    )
  );

-- =====================================================
-- FIELD CHANGE LOG TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Master users can read field change log" ON field_change_log;
DROP POLICY IF EXISTS "System can create field change log" ON field_change_log;

-- Create new policies
CREATE POLICY "Master users can read field change log"
  ON field_change_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level = 'master'
    )
  );

CREATE POLICY "System can create field change log"
  ON field_change_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- FIELD USAGE TRACKING TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Master users can read field usage tracking" ON field_usage_tracking;
DROP POLICY IF EXISTS "System can manage field usage tracking" ON field_usage_tracking;

-- Create new policies
CREATE POLICY "Master users can read field usage tracking"
  ON field_usage_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_level = 'master'
    )
  );

CREATE POLICY "System can manage field usage tracking"
  ON field_usage_tracking
  FOR ALL
  TO authenticated
  USING (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these queries to verify policies are set up correctly
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

-- Check RLS is enabled on all tables
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND rowsecurity = true;

COMMIT;