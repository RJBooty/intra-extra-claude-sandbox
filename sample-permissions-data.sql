-- Sample Permissions Data for Testing
-- Run this after the permissions migration to populate test data

-- First, ensure we have sample pages
INSERT INTO page_definitions (id, section, page_name, display_name, description, is_critical, route_path, icon_name, sort_order, is_active, created_at, updated_at) VALUES
('pg_roi', 'projects', 'projects-roi', 'ROI Calculator', 'Project ROI analysis and financial modeling', true, '/projects/roi', 'calculator', 1, true, NOW(), NOW()),
('pg_sales', 'sales', 'sales-pipeline', 'Sales Pipeline', 'Sales opportunities and pipeline management', false, '/sales/pipeline', 'trending-up', 2, true, NOW(), NOW()),
('pg_logistics', 'logistics', 'logistics-equipment', 'Equipment Management', 'Logistics and equipment tracking', false, '/logistics/equipment', 'truck', 3, true, NOW(), NOW()),
('pg_overview', 'projects', 'projects-overview', 'Projects Overview', 'Project listing and overview dashboard', false, '/projects/overview', 'folder', 4, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add sample sections for projects-roi page
INSERT INTO section_definitions (id, page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order, is_active, created_at, updated_at) VALUES
('sc_financial', 'pg_roi', 'financial-summary', 'Financial Summary', 'Overview of project financials', true, true, 'FinancialSummary', 1, true, NOW(), NOW()),
('sc_revenue', 'pg_roi', 'revenue-streams', 'Revenue Streams', 'Project revenue breakdown', true, false, 'RevenueStreams', 2, true, NOW(), NOW()),
('sc_costs', 'pg_roi', 'cost-breakdown', 'Cost Breakdown', 'Detailed cost analysis', true, true, 'CostBreakdown', 3, true, NOW(), NOW()),
('sc_margins', 'pg_roi', 'profit-margins', 'Profit Margins', 'Profit margin calculations', true, true, 'ProfitMargins', 4, true, NOW(), NOW()),
('sc_scenarios', 'pg_roi', 'scenario-modeling', 'Scenario Modeling', 'Financial scenario analysis', true, true, 'ScenarioModeling', 5, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add sample sections for sales-pipeline page
INSERT INTO section_definitions (id, page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order, is_active, created_at, updated_at) VALUES
('sc_opportunities', 'pg_sales', 'opportunities', 'Opportunities', 'Sales opportunities management', false, false, 'Opportunities', 1, true, NOW(), NOW()),
('sc_pricing', 'pg_sales', 'pricing', 'Pricing', 'Deal pricing and quotes', true, false, 'Pricing', 2, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add sample fields for financial-summary section
INSERT INTO field_definitions (id, section_id, field_name, display_name, field_type, description, is_sensitive, is_required, validation_rules, sort_order, is_active, created_at, updated_at) VALUES
('fd_total_revenue', 'sc_financial', 'total_revenue', 'Total Revenue', 'currency', 'Total project revenue', true, true, '{"min": 0}', 1, true, NOW(), NOW()),
('fd_total_costs', 'sc_financial', 'total_costs_actual', 'Total Costs (Actual)', 'currency', 'Actual project costs', true, true, '{"min": 0}', 2, true, NOW(), NOW()),
('fd_costs_est', 'sc_financial', 'total_costs_estimate', 'Total Costs (Estimate)', 'currency', 'Estimated project costs', true, false, '{"min": 0}', 3, true, NOW(), NOW()),
('fd_profit', 'sc_financial', 'profit_actual', 'Profit (Actual)', 'currency', 'Actual project profit', true, false, null, 4, true, NOW(), NOW()),
('fd_margin', 'sc_financial', 'profit_margin', 'Profit Margin', 'percentage', 'Project profit margin percentage', true, false, '{"min": -100, "max": 100}', 5, true, NOW(), NOW()),
('fd_client_name', 'sc_opportunities', 'client_name', 'Client Name', 'text', 'Name of the client', false, true, null, 1, true, NOW(), NOW()),
('fd_deal_value', 'sc_pricing', 'deal_value', 'Deal Value', 'currency', 'Total deal value', true, true, '{"min": 0}', 1, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- PAGE PERMISSIONS
-- ROI Page: Master/Senior=full, HR_Finance=read_only, Mid/External=none
INSERT INTO page_permissions (id, page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve, granted_by, granted_at, reason, created_at, updated_at) VALUES
-- Master: Full access to ROI
('pp_roi_master', 'pg_roi', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
-- Senior: Full access except delete
('pp_roi_senior', 'pg_roi', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
-- HR Finance: Read-only access to financial data
('pp_roi_hr', 'pg_roi', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
-- Mid: No access to ROI
('pp_roi_mid', 'pg_roi', 'mid', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
-- External: No access to ROI
('pp_roi_ext', 'pg_roi', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sales Pipeline Page: Master/Senior/Mid=full, External=none, HR=read_only
INSERT INTO page_permissions (id, page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve, granted_by, granted_at, reason, created_at, updated_at) VALUES
-- Master: Full access
('pp_sales_master', 'pg_sales', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
-- Senior: Full access except delete
('pp_sales_senior', 'pg_sales', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
-- Mid: Full access except delete and approve
('pp_sales_mid', 'pg_sales', 'mid', 'full', true, true, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
-- HR Finance: Read-only
('pp_sales_hr', 'pg_sales', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW'),
-- External: No access
('pp_sales_ext', 'pg_sales', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Projects Overview: Everyone can read, Master/Senior can edit
INSERT INTO page_permissions (id, page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve, granted_by, granted_at, reason, created_at, updated_at) VALUES
('pp_overview_master', 'pg_overview', 'master', 'full', true, true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('pp_overview_senior', 'pg_overview', 'senior', 'full', true, true, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('pp_overview_mid', 'pg_overview', 'mid', 'read_only', false, true, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('pp_overview_hr', 'pg_overview', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('pp_overview_ext', 'pg_overview', 'external', 'assigned_only', false, true, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Logistics: Master/Senior=full, others=none
INSERT INTO page_permissions (id, page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve, granted_by, granted_at, reason, created_at, updated_at) VALUES
('pp_logistics_master', 'pg_logistics', 'master', 'full', true, true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('pp_logistics_senior', 'pg_logistics', 'senior', 'full', true, true, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('pp_logistics_mid', 'pg_logistics', 'mid', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('pp_logistics_hr', 'pg_logistics', 'hr_finance', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('pp_logistics_ext', 'pg_logistics', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- SECTION PERMISSIONS
-- Financial sections: Same pattern as pages but for sections
INSERT INTO section_permissions (id, section_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve, granted_by, granted_at, reason, created_at, updated_at) VALUES
-- Financial Summary section
('sp_financial_master', 'sc_financial', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_financial_senior', 'sc_financial', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_financial_hr', 'sc_financial', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_financial_mid', 'sc_financial', 'mid', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_financial_ext', 'sc_financial', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),

-- Revenue Streams section
('sp_revenue_master', 'sc_revenue', 'master', 'full', true, true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_revenue_senior', 'sc_revenue', 'senior', 'full', true, true, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_revenue_hr', 'sc_revenue', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_revenue_mid', 'sc_revenue', 'mid', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_revenue_ext', 'sc_revenue', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),

-- Opportunities section (non-financial)
('sp_opp_master', 'sc_opportunities', 'master', 'full', true, true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_opp_senior', 'sc_opportunities', 'senior', 'full', true, true, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_opp_mid', 'sc_opportunities', 'mid', 'full', true, true, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_opp_hr', 'sc_opportunities', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('sp_opp_ext', 'sc_opportunities', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- FIELD PERMISSIONS
-- Total Revenue field (highly sensitive)
INSERT INTO field_permissions (id, field_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, granted_by, granted_at, reason, created_at, updated_at) VALUES
('fp_revenue_master', 'fd_total_revenue', 'master', 'full', true, true, true, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_revenue_senior', 'fd_total_revenue', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_revenue_hr', 'fd_total_revenue', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_revenue_mid', 'fd_total_revenue', 'mid', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_revenue_ext', 'fd_total_revenue', 'external', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),

-- Total Costs Actual field
('fp_costs_act_master', 'fd_total_costs', 'master', 'full', true, true, true, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_costs_act_senior', 'fd_total_costs', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_costs_act_hr', 'fd_total_costs', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_costs_act_mid', 'fd_total_costs', 'mid', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_costs_act_ext', 'fd_total_costs', 'external', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),

-- Total Costs Estimate field
('fp_costs_est_master', 'fd_costs_est', 'master', 'full', true, true, true, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_costs_est_senior', 'fd_costs_est', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_costs_est_hr', 'fd_costs_est', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_costs_est_mid', 'fd_costs_est', 'mid', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_costs_est_ext', 'fd_costs_est', 'external', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW'),

-- Profit Actual field
('fp_profit_master', 'fd_profit', 'master', 'full', true, true, true, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_profit_senior', 'fd_profit', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_profit_hr', 'fd_profit', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_profit_mid', 'fd_profit', 'mid', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_profit_ext', 'fd_profit', 'external', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),

-- Client Name field (less sensitive, more access)
('fp_client_master', 'fd_client_name', 'master', 'full', true, true, true, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_client_senior', 'fd_client_name', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_client_mid', 'fd_client_name', 'mid', 'read_only', false, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_client_hr', 'fd_client_name', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_client_ext', 'fd_client_name', 'external', 'assigned_only', false, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),

-- Deal Value field (financial, restricted)
('fp_deal_master', 'fd_deal_value', 'master', 'full', true, true, true, true, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_deal_senior', 'fd_deal_value', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_deal_hr', 'fd_deal_value', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_deal_mid', 'fd_deal_value', 'mid', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW()),
('fp_deal_ext', 'fd_deal_value', 'external', 'none', false, false, false, false, 'system', NOW(), 'Default permissions setup', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add some audit log entries for demonstration
INSERT INTO permission_audit_log (id, entity_type, entity_id, user_tier, action_type, old_permission, new_permission, changed_by, change_reason, created_at) VALUES
('audit_1', 'page', 'pg_roi', 'master', 'grant', null, '{"permission_type": "full", "can_read": true, "can_create": true, "can_update": true, "can_delete": true, "can_approve": true}', 'system', 'Initial system setup', NOW()),
('audit_2', 'page', 'pg_sales', 'external', 'grant', null, '{"permission_type": "none", "can_read": false, "can_create": false, "can_update": false, "can_delete": false, "can_approve": false}', 'system', 'Initial system setup', NOW()),
('audit_3', 'field', 'fd_total_revenue', 'hr_finance', 'grant', null, '{"permission_type": "read_only", "can_read": true, "can_create": false, "can_update": false, "can_delete": false}', 'system', 'HR Finance gets read access to financial data', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify data was inserted
SELECT 'Sample data insertion completed!' as status;

-- Show summary of inserted data
SELECT 
  'Pages' as entity_type,
  COUNT(*) as count
FROM page_definitions
UNION ALL
SELECT 
  'Sections' as entity_type,
  COUNT(*) as count
FROM section_definitions
UNION ALL
SELECT 
  'Fields' as entity_type,
  COUNT(*) as count
FROM field_definitions
UNION ALL
SELECT 
  'Page Permissions' as entity_type,
  COUNT(*) as count
FROM page_permissions
UNION ALL
SELECT 
  'Section Permissions' as entity_type,
  COUNT(*) as count
FROM section_permissions
UNION ALL
SELECT 
  'Field Permissions' as entity_type,
  COUNT(*) as count
FROM field_permissions;