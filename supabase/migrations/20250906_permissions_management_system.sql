-- IntraExtra Permission Management System Migration
-- Integrates with existing platform_user_roles table
-- Creates hierarchical permissions for pages, sections, and fields

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Page Definitions - Top level pages/modules
CREATE TABLE IF NOT EXISTS public.page_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR(50) NOT NULL, -- 'projects', 'sales', 'roi', 'logistics', 'crew', 'settings'
  page_name VARCHAR(100) NOT NULL, -- 'projects-roi', 'sales-pipeline', 'logistics-equipment'
  display_name VARCHAR(100) NOT NULL, -- 'ROI Calculator', 'Sales Pipeline'
  description TEXT,
  is_critical BOOLEAN DEFAULT FALSE, -- Critical pages require special permissions
  route_path VARCHAR(200), -- '/projects/roi', '/sales/pipeline'
  icon_name VARCHAR(50), -- Icon identifier for UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique page names within sections
  UNIQUE(section, page_name)
);

-- 2. Section Definitions - Subsections within pages
CREATE TABLE IF NOT EXISTS public.section_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.page_definitions(id) ON DELETE CASCADE,
  section_name VARCHAR(100) NOT NULL, -- 'financial-summary', 'revenue-streams', 'cost-analysis'
  display_name VARCHAR(100) NOT NULL, -- 'Financial Summary', 'Revenue Streams'
  description TEXT,
  is_financial BOOLEAN DEFAULT FALSE, -- Marks financial data sections
  requires_approval BOOLEAN DEFAULT FALSE, -- Requires approval to modify
  component_name VARCHAR(100), -- React component name for UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique section names within pages
  UNIQUE(page_id, section_name)
);

-- 3. Field Definitions - Individual fields within sections
CREATE TABLE IF NOT EXISTS public.field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.section_definitions(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL, -- 'total_revenue', 'profit_margin', 'cost_breakdown'
  display_name VARCHAR(100) NOT NULL, -- 'Total Revenue', 'Profit Margin'
  field_type VARCHAR(50) NOT NULL, -- 'currency', 'percentage', 'text', 'number', 'date'
  description TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE, -- Sensitive data requires higher permissions
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB, -- Field validation rules
  default_value TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique field names within sections
  UNIQUE(section_id, field_name)
);

-- 4. Page Permissions - Permission matrix for pages
CREATE TABLE IF NOT EXISTS public.page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.page_definitions(id) ON DELETE CASCADE,
  user_tier VARCHAR(20) NOT NULL, -- 'master', 'senior', 'mid', 'external', 'hr_finance'
  permission_type VARCHAR(20) NOT NULL DEFAULT 'none', -- 'full', 'none', 'assigned_only', 'own_only', 'read_only'
  can_create BOOLEAN DEFAULT FALSE,
  can_read BOOLEAN DEFAULT FALSE,
  can_update BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_approve BOOLEAN DEFAULT FALSE, -- For workflows requiring approval
  granted_by UUID REFERENCES auth.users(id), -- Who granted this permission
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration
  reason TEXT, -- Reason for permission grant/restriction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique permissions per page-tier combination
  UNIQUE(page_id, user_tier),
  
  -- Check valid permission types
  CHECK (permission_type IN ('full', 'none', 'assigned_only', 'own_only', 'read_only')),
  
  -- Check valid user tiers (matching your existing system)
  CHECK (user_tier IN ('master', 'senior', 'mid', 'external', 'hr_finance'))
);

-- 5. Section Permissions - Permission matrix for sections
CREATE TABLE IF NOT EXISTS public.section_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.section_definitions(id) ON DELETE CASCADE,
  user_tier VARCHAR(20) NOT NULL,
  permission_type VARCHAR(20) NOT NULL DEFAULT 'none',
  can_create BOOLEAN DEFAULT FALSE,
  can_read BOOLEAN DEFAULT FALSE,
  can_update BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_approve BOOLEAN DEFAULT FALSE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(section_id, user_tier),
  CHECK (permission_type IN ('full', 'none', 'assigned_only', 'own_only', 'read_only')),
  CHECK (user_tier IN ('master', 'senior', 'mid', 'external', 'hr_finance'))
);

-- 6. Field Permissions - Permission matrix for individual fields
CREATE TABLE IF NOT EXISTS public.field_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.field_definitions(id) ON DELETE CASCADE,
  user_tier VARCHAR(20) NOT NULL,
  permission_type VARCHAR(20) NOT NULL DEFAULT 'none',
  can_create BOOLEAN DEFAULT FALSE,
  can_read BOOLEAN DEFAULT FALSE,
  can_update BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(field_id, user_tier),
  CHECK (permission_type IN ('full', 'none', 'assigned_only', 'own_only', 'read_only')),
  CHECK (user_tier IN ('master', 'senior', 'mid', 'external', 'hr_finance'))
);

-- 7. Permission Audit Log - Track all permission changes
CREATE TABLE IF NOT EXISTS public.permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL, -- 'page', 'section', 'field'
  entity_id UUID NOT NULL, -- ID of the page/section/field
  user_tier VARCHAR(20) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'grant', 'revoke', 'modify', 'create', 'delete'
  old_permission JSONB, -- Previous permission state
  new_permission JSONB, -- New permission state
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (entity_type IN ('page', 'section', 'field')),
  CHECK (user_tier IN ('master', 'senior', 'mid', 'external', 'hr_finance'))
);

-- Enable Row Level Security on all tables
ALTER TABLE public.page_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- All authenticated users can read definitions and permissions
CREATE POLICY "Everyone can read page definitions" ON public.page_definitions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can read section definitions" ON public.section_definitions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can read field definitions" ON public.field_definitions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can read page permissions" ON public.page_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can read section permissions" ON public.section_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can read field permissions" ON public.field_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can read audit log" ON public.permission_audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only master users can modify permission definitions (will be enforced at app level)
CREATE POLICY "Masters can manage page definitions" ON public.page_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_user_roles 
      WHERE user_id = auth.uid() 
      AND role_level = 'master'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_definitions_section ON public.page_definitions(section);
CREATE INDEX IF NOT EXISTS idx_page_definitions_active ON public.page_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_section_definitions_page_id ON public.section_definitions(page_id);
CREATE INDEX IF NOT EXISTS idx_section_definitions_financial ON public.section_definitions(is_financial);
CREATE INDEX IF NOT EXISTS idx_field_definitions_section_id ON public.field_definitions(section_id);
CREATE INDEX IF NOT EXISTS idx_field_definitions_sensitive ON public.field_definitions(is_sensitive);
CREATE INDEX IF NOT EXISTS idx_page_permissions_user_tier ON public.page_permissions(user_tier);
CREATE INDEX IF NOT EXISTS idx_page_permissions_page_tier ON public.page_permissions(page_id, user_tier);
CREATE INDEX IF NOT EXISTS idx_section_permissions_user_tier ON public.section_permissions(user_tier);
CREATE INDEX IF NOT EXISTS idx_section_permissions_section_tier ON public.section_permissions(section_id, user_tier);
CREATE INDEX IF NOT EXISTS idx_field_permissions_user_tier ON public.field_permissions(user_tier);
CREATE INDEX IF NOT EXISTS idx_field_permissions_field_tier ON public.field_permissions(field_id, user_tier);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.permission_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.permission_audit_log(created_at DESC);

-- Insert sample data for "projects-roi" page structure
-- This creates a complete permission matrix for testing

-- 1. Create ROI page definition
INSERT INTO public.page_definitions (section, page_name, display_name, description, is_critical, route_path, icon_name, sort_order) VALUES
('projects', 'projects-roi', 'ROI Calculator', 'Financial analysis and ROI calculations for projects', true, '/projects/roi', 'calculator', 1),
('projects', 'projects-overview', 'Project Overview', 'General project information and status', false, '/projects/overview', 'folder', 0),
('sales', 'sales-pipeline', 'Sales Pipeline', 'Opportunity tracking and sales management', false, '/sales/pipeline', 'trending-up', 0),
('logistics', 'logistics-equipment', 'Equipment Management', 'Equipment allocation and tracking', false, '/logistics/equipment', 'package', 0);

-- 2. Create sections for ROI page
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT 
  pd.id,
  section_data.section_name,
  section_data.display_name,
  section_data.description,
  section_data.is_financial,
  section_data.requires_approval,
  section_data.component_name,
  section_data.sort_order
FROM public.page_definitions pd
CROSS JOIN (
  VALUES 
    ('financial-summary', 'Financial Summary', 'High-level financial metrics and totals', true, false, 'FinancialSummary', 1),
    ('revenue-streams', 'Revenue Streams', 'Detailed revenue breakdown by category', true, true, 'RevenueStreams', 2),
    ('cost-analysis', 'Cost Analysis', 'Detailed cost breakdown and analysis', true, true, 'CostAnalysis', 3),
    ('roi-scenarios', 'ROI Scenarios', 'Best, expected, and worst case scenarios', true, true, 'ROIScenarios', 4),
    ('approval-workflow', 'Approval Workflow', 'ROI approval status and workflow', false, false, 'ApprovalWorkflow', 5)
) AS section_data(section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
WHERE pd.page_name = 'projects-roi';

-- 3. Create fields for financial summary section
INSERT INTO public.field_definitions (section_id, field_name, display_name, field_type, description, is_sensitive, is_required, sort_order)
SELECT 
  sd.id,
  field_data.field_name,
  field_data.display_name,
  field_data.field_type,
  field_data.description,
  field_data.is_sensitive,
  field_data.is_required,
  field_data.sort_order
FROM public.section_definitions sd
CROSS JOIN (
  VALUES 
    ('total_revenue_estimate', 'Total Revenue (Estimate)', 'currency', 'Estimated total revenue for the project', true, true, 1),
    ('total_revenue_actual', 'Total Revenue (Actual)', 'currency', 'Actual total revenue received', true, false, 2),
    ('total_costs_estimate', 'Total Costs (Estimate)', 'currency', 'Estimated total costs for the project', true, true, 3),
    ('total_costs_actual', 'Total Costs (Actual)', 'currency', 'Actual total costs incurred', true, false, 4),
    ('profit_margin', 'Profit Margin', 'percentage', 'Calculated profit margin percentage', true, false, 5),
    ('roi_percentage', 'ROI Percentage', 'percentage', 'Return on investment percentage', true, false, 6),
    ('project_status', 'Project Status', 'text', 'Current status of the ROI calculation', false, true, 7)
) AS field_data(field_name, display_name, field_type, description, is_sensitive, is_required, sort_order)
WHERE sd.section_name = 'financial-summary';

-- 4. Create hierarchical permission matrix
-- Master users get full access to everything
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  pd.id,
  'master',
  'full',
  true, true, true, true, true
FROM public.page_definitions pd;

INSERT INTO public.section_permissions (section_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  sd.id,
  'master',
  'full',
  true, true, true, true, true
FROM public.section_definitions sd;

INSERT INTO public.field_permissions (field_id, user_tier, permission_type, can_create, can_read, can_update, can_delete)
SELECT 
  fd.id,
  'master',
  'full',
  true, true, true, true
FROM public.field_definitions fd;

-- Senior users get full access except deletion and some approvals
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  pd.id,
  'senior',
  'full',
  true, true, true, false, true
FROM public.page_definitions pd;

INSERT INTO public.section_permissions (section_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  sd.id,
  'senior',
  'full',
  true, true, true, false, CASE WHEN sd.is_financial THEN true ELSE false END
FROM public.section_definitions sd;

INSERT INTO public.field_permissions (field_id, user_tier, permission_type, can_create, can_read, can_update, can_delete)
SELECT 
  fd.id,
  'senior',
  'full',
  true, true, true, false
FROM public.field_definitions fd;

-- HR Finance users get read/write access to financial data only
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  pd.id,
  'hr_finance',
  'read_only',
  false, true, CASE WHEN pd.section = 'projects' THEN true ELSE false END, false, false
FROM public.page_definitions pd;

INSERT INTO public.section_permissions (section_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  sd.id,
  'hr_finance',
  CASE WHEN sd.is_financial THEN 'full' ELSE 'read_only' END,
  sd.is_financial, true, sd.is_financial, false, false
FROM public.section_definitions sd;

INSERT INTO public.field_permissions (field_id, user_tier, permission_type, can_create, can_read, can_update, can_delete)
SELECT 
  fd.id,
  'hr_finance',
  CASE WHEN fd.is_sensitive THEN 'full' ELSE 'read_only' END,
  fd.is_sensitive, true, fd.is_sensitive, false
FROM public.field_definitions fd;

-- Mid users get no access to financial data
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  pd.id,
  'mid',
  CASE WHEN pd.is_critical THEN 'none' ELSE 'read_only' END,
  false, CASE WHEN pd.is_critical THEN false ELSE true END, false, false, false
FROM public.page_definitions pd;

INSERT INTO public.section_permissions (section_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  sd.id,
  'mid',
  CASE WHEN sd.is_financial THEN 'none' ELSE 'read_only' END,
  false, CASE WHEN sd.is_financial THEN false ELSE true END, false, false, false
FROM public.section_definitions sd;

INSERT INTO public.field_permissions (field_id, user_tier, permission_type, can_create, can_read, can_update, can_delete)
SELECT 
  fd.id,
  'mid',
  CASE WHEN fd.is_sensitive THEN 'none' ELSE 'read_only' END,
  false, CASE WHEN fd.is_sensitive THEN false ELSE true END, false, false
FROM public.field_definitions fd;

-- External users get assigned_only access to non-financial sections
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  pd.id,
  'external',
  CASE WHEN pd.is_critical THEN 'none' ELSE 'assigned_only' END,
  false, CASE WHEN pd.is_critical THEN false ELSE true END, false, false, false
FROM public.page_definitions pd;

INSERT INTO public.section_permissions (section_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve)
SELECT 
  sd.id,
  'external',
  CASE WHEN sd.is_financial THEN 'none' ELSE 'assigned_only' END,
  false, CASE WHEN sd.is_financial THEN false ELSE true END, false, false, false
FROM public.section_definitions sd;

INSERT INTO public.field_permissions (field_id, user_tier, permission_type, can_create, can_read, can_update, can_delete)
SELECT 
  fd.id,
  'external',
  CASE WHEN fd.is_sensitive THEN 'none' ELSE 'assigned_only' END,
  false, CASE WHEN fd.is_sensitive THEN false ELSE true END, false, false
FROM public.field_definitions fd;

-- Create helper functions for permission checking
-- Function to check if user has page access
CREATE OR REPLACE FUNCTION public.check_page_permission(
  p_user_id UUID,
  p_page_name VARCHAR,
  p_action VARCHAR DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role VARCHAR(20);
  page_perm RECORD;
BEGIN
  -- Get user role from your existing table
  SELECT role_level INTO user_role 
  FROM platform_user_roles 
  WHERE user_id = p_user_id;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get page permission
  SELECT pp.*, pd.is_critical 
  INTO page_perm
  FROM page_permissions pp
  JOIN page_definitions pd ON pp.page_id = pd.id
  WHERE pd.page_name = p_page_name 
    AND pp.user_tier = user_role;
  
  IF page_perm IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check specific action permission
  CASE p_action
    WHEN 'read' THEN RETURN page_perm.can_read;
    WHEN 'create' THEN RETURN page_perm.can_create;
    WHEN 'update' THEN RETURN page_perm.can_update;
    WHEN 'delete' THEN RETURN page_perm.can_delete;
    WHEN 'approve' THEN RETURN page_perm.can_approve;
    ELSE RETURN FALSE;
  END CASE;
END;
$$;

-- Function to get user's effective permissions for a page
CREATE OR REPLACE FUNCTION public.get_user_page_permissions(
  p_user_id UUID,
  p_page_name VARCHAR
)
RETURNS TABLE (
  permission_type VARCHAR,
  can_create BOOLEAN,
  can_read BOOLEAN,
  can_update BOOLEAN,
  can_delete BOOLEAN,
  can_approve BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  -- Get user role
  SELECT role_level INTO user_role 
  FROM platform_user_roles 
  WHERE user_id = p_user_id;
  
  IF user_role IS NULL THEN
    RETURN QUERY SELECT 'none'::VARCHAR, false, false, false, false, false;
    RETURN;
  END IF;
  
  -- Return user's permissions for the page
  RETURN QUERY
  SELECT 
    pp.permission_type,
    pp.can_create,
    pp.can_read,
    pp.can_update,
    pp.can_delete,
    pp.can_approve
  FROM page_permissions pp
  JOIN page_definitions pd ON pp.page_id = pd.id
  WHERE pd.page_name = p_page_name 
    AND pp.user_tier = user_role;
END;
$$;

-- Insert initial audit log entry
INSERT INTO public.permission_audit_log (entity_type, entity_id, user_tier, action_type, new_permission, changed_by, change_reason)
VALUES 
('page', (SELECT id FROM page_definitions WHERE page_name = 'projects-roi'), 'master', 'create', 
 '{"permission_type": "full", "reason": "Initial system setup"}', 
 (SELECT id FROM auth.users LIMIT 1), 
 'Initial permission system setup');

-- Grant necessary permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_page_permission(UUID, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_page_permissions(UUID, VARCHAR) TO authenticated;