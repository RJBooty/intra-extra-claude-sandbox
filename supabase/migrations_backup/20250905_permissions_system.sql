-- IntraExtra Hierarchical Permissions System
-- This migration creates a comprehensive permissions system for Master users to control access

-- 1. Permissions Registry - Defines all available permissions in the system
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module VARCHAR(50) NOT NULL, -- 'roi', 'projects', 'sales', 'logistics', 'crew'
  section VARCHAR(50) NOT NULL, -- 'financial_data', 'client_info', 'documents'
  action VARCHAR(50) NOT NULL, -- 'view', 'edit', 'delete', 'create', 'approve'
  resource_type VARCHAR(50), -- 'all', 'assigned_only', 'own_only'
  description TEXT,
  is_financial BOOLEAN DEFAULT FALSE, -- Marks financial data permissions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique permissions
  UNIQUE(module, section, action)
);

-- 2. Role Permissions - Maps roles to specific permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type VARCHAR(20) NOT NULL, -- 'master', 'senior', 'mid', 'external', 'hr_finance'
  permission_id UUID NOT NULL REFERENCES public.permissions(id),
  is_granted BOOLEAN DEFAULT TRUE,
  granted_by UUID REFERENCES auth.users(id), -- Who granted this permission
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no duplicate role-permission mappings
  UNIQUE(role_type, permission_id)
);

-- 3. User Project Assignments - For External users assigned to specific projects
CREATE TABLE IF NOT EXISTS public.user_project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  role_on_project VARCHAR(50), -- 'technician', 'coordinator', 'observer'
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  
  -- Prevent duplicate assignments
  UNIQUE(user_id, project_id)
);

-- 4. Permission Overrides - Individual user permission overrides
CREATE TABLE IF NOT EXISTS public.user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  permission_id UUID NOT NULL REFERENCES public.permissions(id),
  is_granted BOOLEAN NOT NULL,
  reason TEXT,
  override_by UUID NOT NULL REFERENCES auth.users(id), -- Master user who made override
  expires_at TIMESTAMPTZ, -- Optional expiration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no duplicate overrides
  UNIQUE(user_id, permission_id)
);

-- 5. Permission Audit Log - Track all permission changes
CREATE TABLE IF NOT EXISTS public.permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) NOT NULL, -- 'grant', 'revoke', 'override', 'assign_project'
  target_user_id UUID REFERENCES auth.users(id),
  permission_id UUID REFERENCES public.permissions(id),
  project_id UUID REFERENCES public.projects(id),
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all permissions tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only authenticated users can read, only Masters can modify
CREATE POLICY "Anyone can view permissions" ON public.permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view role permissions" ON public.role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view project assignments" ON public.user_project_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own overrides" ON public.user_permission_overrides
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can view audit log" ON public.permission_audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert base permissions for the system
INSERT INTO public.permissions (module, section, action, resource_type, description, is_financial) VALUES
  -- ROI Module (Financial Data)
  ('roi', 'financial_data', 'view', 'all', 'View all ROI calculations and financial data', true),
  ('roi', 'financial_data', 'edit', 'all', 'Edit ROI calculations', true),
  ('roi', 'financial_data', 'approve', 'all', 'Approve ROI calculations', true),
  ('roi', 'financial_data', 'create', 'all', 'Create new ROI calculations', true),
  ('roi', 'scenarios', 'view', 'all', 'View ROI scenarios and forecasts', true),
  ('roi', 'scenarios', 'edit', 'all', 'Edit ROI scenarios', true),
  
  -- Projects Module
  ('projects', 'basic_info', 'view', 'all', 'View all project basic information', false),
  ('projects', 'basic_info', 'view', 'assigned_only', 'View assigned projects only', false),
  ('projects', 'basic_info', 'edit', 'all', 'Edit project information', false),
  ('projects', 'basic_info', 'create', 'all', 'Create new projects', false),
  ('projects', 'financial_data', 'view', 'all', 'View project financial data', true),
  ('projects', 'documents', 'view', 'all', 'View project documents', false),
  ('projects', 'documents', 'upload', 'all', 'Upload project documents', false),
  
  -- Sales Pipeline Module
  ('sales', 'opportunities', 'view', 'all', 'View all sales opportunities', false),
  ('sales', 'opportunities', 'view', 'own_only', 'View own opportunities only', false),
  ('sales', 'opportunities', 'edit', 'all', 'Edit opportunities', false),
  ('sales', 'opportunities', 'create', 'all', 'Create new opportunities', false),
  ('sales', 'financial_data', 'view', 'all', 'View deal values and financial metrics', true),
  
  -- Logistics Module
  ('logistics', 'equipment', 'view', 'all', 'View equipment and logistics data', false),
  ('logistics', 'equipment', 'edit', 'all', 'Edit equipment assignments', false),
  ('logistics', 'costs', 'view', 'all', 'View logistics costs', true),
  
  -- Crew Management Module
  ('crew', 'assignments', 'view', 'all', 'View crew assignments', false),
  ('crew', 'assignments', 'edit', 'all', 'Edit crew assignments', false),
  ('crew', 'rates', 'view', 'all', 'View crew rates and costs', true),
  
  -- System Administration
  ('system', 'users', 'manage', 'all', 'Manage users and permissions', false),
  ('system', 'settings', 'edit', 'all', 'Edit system settings', false)
ON CONFLICT (module, section, action) DO NOTHING;

-- Insert default role permissions based on hierarchy
INSERT INTO public.role_permissions (role_type, permission_id, granted_by) 
SELECT 'master', id, NULL FROM public.permissions -- Master gets all permissions
ON CONFLICT (role_type, permission_id) DO NOTHING;

-- Senior role permissions (all except user management)
INSERT INTO public.role_permissions (role_type, permission_id, granted_by)
SELECT 'senior', id, NULL FROM public.permissions 
WHERE NOT (module = 'system' AND section = 'users')
ON CONFLICT (role_type, permission_id) DO NOTHING;

-- Mid role permissions (no financial data)
INSERT INTO public.role_permissions (role_type, permission_id, granted_by)
SELECT 'mid', id, NULL FROM public.permissions 
WHERE is_financial = FALSE
ON CONFLICT (role_type, permission_id) DO NOTHING;

-- External role permissions (only assigned projects, no financial data)
INSERT INTO public.role_permissions (role_type, permission_id, granted_by)
SELECT 'external', id, NULL FROM public.permissions 
WHERE is_financial = FALSE 
  AND resource_type IN ('assigned_only', 'own_only')
  AND action IN ('view')
ON CONFLICT (role_type, permission_id) DO NOTHING;

-- HR Finance role permissions (financial data + basic operations)
INSERT INTO public.role_permissions (role_type, permission_id, granted_by)
SELECT 'hr_finance', id, NULL FROM public.permissions 
WHERE is_financial = TRUE 
  OR (module IN ('projects', 'crew') AND action IN ('view', 'edit'))
ON CONFLICT (role_type, permission_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permissions_module_section ON public.permissions(module, section);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_type);
CREATE INDEX IF NOT EXISTS idx_user_assignments_user ON public.user_project_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assignments_project ON public.user_project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_user ON public.user_permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.permission_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.permission_audit_log(created_at);

-- Create a function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_user_id UUID,
  p_module VARCHAR,
  p_section VARCHAR,
  p_action VARCHAR,
  p_project_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role VARCHAR(20);
  permission_record RECORD;
  has_permission BOOLEAN := FALSE;
  has_project_access BOOLEAN := FALSE;
BEGIN
  -- Get user role
  SELECT role_type INTO user_role 
  FROM user_roles 
  WHERE user_id = p_user_id AND is_active = TRUE;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the permission
  SELECT p.*, rp.is_granted INTO permission_record
  FROM permissions p
  LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_type = user_role
  WHERE p.module = p_module 
    AND p.section = p_section 
    AND p.action = p_action;
  
  IF permission_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check base role permission
  has_permission := COALESCE(permission_record.is_granted, FALSE);
  
  -- Check for user-specific overrides
  SELECT is_granted INTO has_permission
  FROM user_permission_overrides
  WHERE user_id = p_user_id 
    AND permission_id = permission_record.id
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- If no permission, return false
  IF NOT has_permission THEN
    RETURN FALSE;
  END IF;
  
  -- Check resource-level access for project-specific permissions
  IF permission_record.resource_type = 'assigned_only' AND p_project_id IS NOT NULL THEN
    SELECT COUNT(*) > 0 INTO has_project_access
    FROM user_project_assignments
    WHERE user_id = p_user_id 
      AND project_id = p_project_id 
      AND active = TRUE;
    
    RETURN has_project_access;
  END IF;
  
  RETURN has_permission;
END;
$$;