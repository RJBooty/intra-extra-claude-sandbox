-- Complete IntraExtra Platform Page Definitions
-- This creates ALL actual pages from your platform structure

-- Clear existing sample data and insert complete platform structure
DELETE FROM public.field_permissions;
DELETE FROM public.section_permissions; 
DELETE FROM public.page_permissions;
DELETE FROM public.field_definitions;
DELETE FROM public.section_definitions;
DELETE FROM public.page_definitions;

-- === PROJECTS MODULE ===
INSERT INTO public.page_definitions (section, page_name, display_name, description, is_critical, route_path, icon_name, sort_order) VALUES

-- Projects main pages
('projects', 'projects-core', 'Core Info', 'Basic project information and settings', false, '/projects/core', 'info', 1),
('projects', 'projects-roi', 'ROI Analysis', 'Financial analysis and ROI calculations', true, '/projects/roi', 'calculator', 2),
('projects', 'projects-logistics', 'Logistics', 'Equipment planning, site allocation, and shipping', false, '/projects/logistics', 'truck', 3),
('projects', 'projects-operations', 'Operations', 'Task management and project phases', false, '/projects/operations', 'cog', 4),
('projects', 'projects-crew', 'Crew Management', 'Team assignment and crew scheduling', false, '/projects/crew', 'users', 5),
('projects', 'projects-documents', 'Documents', 'Project documentation and file management', false, '/projects/documents', 'file-text', 6),
('projects', 'projects-timeline', 'Timeline', 'Project timeline and milestone tracking', false, '/projects/timeline', 'calendar', 7),
('projects', 'projects-settings', 'Project Settings', 'Project configuration and permissions', false, '/projects/settings', 'settings', 8),

-- === SALES MODULE ===
('sales', 'sales-pipeline', 'Sales Pipeline', 'Opportunity tracking and sales management', false, '/sales/pipeline', 'trending-up', 1),
('sales', 'sales-opportunities', 'Opportunities', 'Individual opportunity management', false, '/sales/opportunities', 'target', 2),
('sales', 'sales-activities', 'Activities', 'Sales activities and follow-ups', false, '/sales/activities', 'activity', 3),

-- === DASHBOARD MODULE ===
('dashboard', 'dashboard-main', 'Main Dashboard', 'Primary dashboard with key metrics', false, '/dashboard', 'home', 1),
('dashboard', 'dashboard-stats', 'Quick Stats', 'Real-time statistics and KPIs', false, '/dashboard/stats', 'bar-chart', 2),

-- === TEAM MODULE ===
('team', 'team-all', 'All Profiles', 'Complete team member directory', false, '/team/all', 'users', 1),
('team', 'team-internal', 'Internal Profiles', 'CASFID internal team members', false, '/team/internal', 'user-check', 2),
('team', 'team-spain', 'Spain Profiles', 'Spain-based team members', false, '/team/spain', 'map-pin', 3),
('team', 'team-contractors', 'Contractors', 'External contractors and freelancers', false, '/team/contractors', 'user-plus', 4),

-- === CLIENTS MODULE ===
('clients', 'clients-list', 'Client List', 'Complete client directory', false, '/clients', 'briefcase', 1),
('clients', 'clients-details', 'Client Details', 'Individual client information and history', false, '/clients/details', 'user', 2),

-- === SETTINGS MODULE ===
('settings', 'settings-profile', 'Profile Settings', 'Personal account settings and preferences', false, '/settings/profile', 'user-cog', 1),
('settings', 'settings-system', 'System Settings', 'Platform configuration and system tools', true, '/settings/system', 'settings', 2);

-- === LOGISTICS SECTIONS ===
-- Equipment Planning section
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'equipment-planning', 'Equipment Planning', 'RFID readers, payment terminals, and hardware allocation', false, false, 'EquipmentPlanning', 1
FROM public.page_definitions pd WHERE pd.page_name = 'projects-logistics';

-- Site Allocation section  
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'site-allocation', 'Site Allocation', 'Event site mapping and equipment placement', false, false, 'SiteAllocation', 2
FROM public.page_definitions pd WHERE pd.page_name = 'projects-logistics';

-- Shipping section
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'shipping', 'Shipping', 'Equipment shipping and logistics coordination', false, false, 'Shipping', 3
FROM public.page_definitions pd WHERE pd.page_name = 'projects-logistics';

-- === OPERATIONS SECTIONS (5 Phases) ===
-- Discover Phase
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'phase-discover', 'Discover Phase', 'Requirements gathering and initial planning', false, false, 'PhaseDiscover', 1
FROM public.page_definitions pd WHERE pd.page_name = 'projects-operations';

-- Build Phase
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'phase-build', 'Build Phase', 'Technical setup and system configuration', false, false, 'PhaseBuild', 2
FROM public.page_definitions pd WHERE pd.page_name = 'projects-operations';

-- Prepare Phase
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'phase-prepare', 'Prepare Phase', 'Equipment preparation and crew briefing', false, false, 'PhasePrepare', 3
FROM public.page_definitions pd WHERE pd.page_name = 'projects-operations';

-- Deliver Phase
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'phase-deliver', 'Deliver Phase', 'Live event execution and monitoring', false, false, 'PhaseDeliver', 4
FROM public.page_definitions pd WHERE pd.page_name = 'projects-operations';

-- Roundup Phase
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'phase-roundup', 'Roundup Phase', 'Post-event wrap-up and analysis', false, false, 'PhaseRoundup', 5
FROM public.page_definitions pd WHERE pd.page_name = 'projects-operations';

-- === ROI SECTIONS ===
-- Financial Summary
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'financial-summary', 'Financial Summary', 'High-level financial metrics and totals', true, false, 'FinancialSummary', 1
FROM public.page_definitions pd WHERE pd.page_name = 'projects-roi';

-- Revenue Streams
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'revenue-streams', 'Revenue Streams', 'Income sources and revenue breakdown', true, true, 'RevenueStreams', 2
FROM public.page_definitions pd WHERE pd.page_name = 'projects-roi';

-- Cost Analysis
INSERT INTO public.section_definitions (page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order)
SELECT pd.id, 'cost-analysis', 'Cost Analysis', 'Detailed cost breakdown and analysis', true, true, 'CostAnalysis', 3
FROM public.page_definitions pd WHERE pd.page_name = 'projects-roi';

-- === SAMPLE FIELD DEFINITIONS ===
-- ROI Fields
INSERT INTO public.field_definitions (section_id, field_name, display_name, field_type, data_type, is_required, is_calculated, validation_rules, sort_order)
SELECT 
  sd.id,
  field_data.field_name,
  field_data.display_name,
  field_data.field_type,
  field_data.data_type,
  field_data.is_required,
  field_data.is_calculated,
  field_data.validation_rules,
  field_data.sort_order
FROM public.section_definitions sd
CROSS JOIN (
  VALUES 
    ('total_revenue', 'Total Revenue', 'currency', 'decimal', true, false, '{"min": 0}', 1),
    ('total_costs', 'Total Costs', 'currency', 'decimal', true, false, '{"min": 0}', 2),
    ('profit_margin', 'Profit Margin', 'percentage', 'decimal', false, true, '{"min": 0, "max": 100}', 3),
    ('roi_percentage', 'ROI Percentage', 'percentage', 'decimal', false, true, '{"formula": "(revenue - costs) / costs * 100"}', 4)
) AS field_data(field_name, display_name, field_type, data_type, is_required, is_calculated, validation_rules, sort_order)
WHERE sd.section_name = 'financial-summary';

-- Equipment Planning Fields
INSERT INTO public.field_definitions (section_id, field_name, display_name, field_type, data_type, is_required, is_calculated, validation_rules, sort_order)
SELECT 
  sd.id,
  field_data.field_name,
  field_data.display_name,
  field_data.field_type,
  field_data.data_type,
  field_data.is_required,
  field_data.is_calculated,
  field_data.validation_rules,
  field_data.sort_order
FROM public.section_definitions sd
CROSS JOIN (
  VALUES 
    ('rfid_readers', 'RFID Readers', 'number', 'integer', true, false, '{"min": 0}', 1),
    ('payment_terminals', 'Payment Terminals', 'number', 'integer', true, false, '{"min": 0}', 2),
    ('equipment_cost', 'Equipment Cost', 'currency', 'decimal', false, false, '{"min": 0}', 3)
) AS field_data(field_name, display_name, field_type, data_type, is_required, is_calculated, validation_rules, sort_order)
WHERE sd.section_name = 'equipment-planning';

-- === CREATE DEFAULT PERMISSIONS FOR ALL USER TIERS ===

-- Master permissions (full access to everything)
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_read, can_create, can_update, can_delete, can_approve)
SELECT pd.id, 'master', 'full_control', true, true, true, true, true
FROM public.page_definitions pd;

-- Senior permissions (full access except critical deletions)
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_read, can_create, can_update, can_delete, can_approve)
SELECT pd.id, 'senior', 'full_control', true, true, true, CASE WHEN pd.is_critical THEN false ELSE true END, true
FROM public.page_definitions pd;

-- Mid permissions (standard access, no deletions or approvals)
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_read, can_create, can_update, can_delete, can_approve)
SELECT pd.id, 'mid', 'read_write', true, true, true, false, false
FROM public.page_definitions pd;

-- External permissions (read-only access to non-critical pages)
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_read, can_create, can_update, can_delete, can_approve)
SELECT pd.id, 'external', 'read_only', true, false, false, false, false
FROM public.page_definitions pd
WHERE pd.is_critical = false;

-- HR permissions (access to team and client data, limited project access)
INSERT INTO public.page_permissions (page_id, user_tier, permission_type, can_read, can_create, can_update, can_delete, can_approve)
SELECT 
  pd.id, 
  'hr_finance', 
  CASE 
    WHEN pd.section IN ('team', 'clients') THEN 'full_control'
    WHEN pd.section = 'projects' AND pd.page_name = 'projects-roi' THEN 'read_write'
    ELSE 'read_only'
  END,
  true,
  CASE WHEN pd.section IN ('team', 'clients') THEN true ELSE false END,
  CASE WHEN pd.section IN ('team', 'clients', 'projects') THEN true ELSE false END,
  false,
  CASE WHEN pd.section IN ('team', 'clients') THEN true ELSE false END
FROM public.page_definitions pd;

-- Create section permissions (inherit from page permissions by default)
INSERT INTO public.section_permissions (section_id, user_tier, permission_type, can_read, can_create, can_update, can_delete, can_approve)
SELECT 
  sd.id, 
  pp.user_tier, 
  pp.permission_type,
  pp.can_read,
  pp.can_create,
  pp.can_update,
  pp.can_delete,
  pp.can_approve
FROM public.section_definitions sd
JOIN public.page_definitions pd ON sd.page_id = pd.id
JOIN public.page_permissions pp ON pp.page_id = pd.id;

-- Create field permissions (inherit from section permissions by default)
INSERT INTO public.field_permissions (field_id, user_tier, permission_type, can_read, can_create, can_update, can_delete, can_approve)
SELECT 
  fd.id,
  sp.user_tier,
  sp.permission_type,
  sp.can_read,
  sp.can_create,
  sp.can_update,
  sp.can_delete,
  sp.can_approve
FROM public.field_definitions fd
JOIN public.section_definitions sd ON fd.section_id = sd.id
JOIN public.section_permissions sp ON sp.section_id = sd.id;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_page_permissions_lookup ON public.page_permissions(page_id, user_tier);
CREATE INDEX IF NOT EXISTS idx_section_permissions_lookup ON public.section_permissions(section_id, user_tier);
CREATE INDEX IF NOT EXISTS idx_field_permissions_lookup ON public.field_permissions(field_id, user_tier);