-- Migration: Add missing RLS policies for ROI tables
-- This fixes the "new row violates row-level security policy" error

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view ROI" ON project_roi_calculations;
DROP POLICY IF EXISTS "Authenticated users can insert ROI" ON project_roi_calculations;
DROP POLICY IF EXISTS "Authenticated users can update ROI" ON project_roi_calculations;
DROP POLICY IF EXISTS "Authenticated users can delete ROI" ON project_roi_calculations;

-- ROI Calculations policies
CREATE POLICY "Authenticated users can view ROI"
  ON project_roi_calculations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert ROI"
  ON project_roi_calculations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update ROI"
  ON project_roi_calculations FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete ROI"
  ON project_roi_calculations FOR DELETE
  USING (auth.role() = 'authenticated');

-- ROI Revenue policies
DROP POLICY IF EXISTS "Authenticated users can view revenue" ON project_roi_revenue;
DROP POLICY IF EXISTS "Authenticated users can insert revenue" ON project_roi_revenue;
DROP POLICY IF EXISTS "Authenticated users can update revenue" ON project_roi_revenue;
DROP POLICY IF EXISTS "Authenticated users can delete revenue" ON project_roi_revenue;

CREATE POLICY "Authenticated users can view revenue"
  ON project_roi_revenue FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert revenue"
  ON project_roi_revenue FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update revenue"
  ON project_roi_revenue FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete revenue"
  ON project_roi_revenue FOR DELETE
  USING (auth.role() = 'authenticated');

-- ROI Costs policies
DROP POLICY IF EXISTS "Authenticated users can view costs" ON project_roi_costs;
DROP POLICY IF EXISTS "Authenticated users can insert costs" ON project_roi_costs;
DROP POLICY IF EXISTS "Authenticated users can update costs" ON project_roi_costs;
DROP POLICY IF EXISTS "Authenticated users can delete costs" ON project_roi_costs;

CREATE POLICY "Authenticated users can view costs"
  ON project_roi_costs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert costs"
  ON project_roi_costs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update costs"
  ON project_roi_costs FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete costs"
  ON project_roi_costs FOR DELETE
  USING (auth.role() = 'authenticated');

-- ROI Scenarios policies
DROP POLICY IF EXISTS "Authenticated users can view scenarios" ON project_roi_scenarios;
DROP POLICY IF EXISTS "Authenticated users can insert scenarios" ON project_roi_scenarios;
DROP POLICY IF EXISTS "Authenticated users can update scenarios" ON project_roi_scenarios;
DROP POLICY IF EXISTS "Authenticated users can delete scenarios" ON project_roi_scenarios;

CREATE POLICY "Authenticated users can view scenarios"
  ON project_roi_scenarios FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert scenarios"
  ON project_roi_scenarios FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update scenarios"
  ON project_roi_scenarios FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete scenarios"
  ON project_roi_scenarios FOR DELETE
  USING (auth.role() = 'authenticated');
