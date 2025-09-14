-- Comprehensive IntraExtra Platform Permissions Sample Data
-- This script creates realistic sample data for testing the permissions dashboard
-- Based on actual platform structure and business rules

-- Clear existing sample data first (optional - remove if you want to keep existing data)
-- DELETE FROM field_permissions WHERE granted_by = 'system';
-- DELETE FROM section_permissions WHERE granted_by = 'system';
-- DELETE FROM page_permissions WHERE granted_by = 'system';
-- DELETE FROM field_definitions WHERE created_at >= CURRENT_DATE;
-- DELETE FROM section_definitions WHERE created_at >= CURRENT_DATE;
-- DELETE FROM page_definitions WHERE created_at >= CURRENT_DATE;

-- ===================================
-- 1. PAGE DEFINITIONS
-- ===================================

INSERT INTO page_definitions (id, section, page_name, display_name, description, is_critical, route_path, icon_name, sort_order, is_active, created_at, updated_at) VALUES
-- Projects Module
('pg_projects_roi', 'projects', 'projects-roi', 'ROI Calculator', 'Project financial modeling and ROI analysis', true, '/projects/roi', 'calculator', 1, true, NOW(), NOW()),
('pg_projects_core', 'projects', 'projects-core', 'Project Core Info', 'Project overview and core information management', false, '/projects/core', 'folder', 2, true, NOW(), NOW()),
('pg_projects_logistics', 'projects', 'projects-logistics', 'Logistics Planning', 'Equipment planning and logistics coordination', false, '/projects/logistics', 'truck', 3, true, NOW(), NOW()),
('pg_projects_operations', 'projects', 'projects-operations', 'Operations Pipeline', 'Project operations and task management', false, '/projects/operations', 'settings', 4, true, NOW(), NOW()),

-- Sales Module
('pg_sales_pipeline', 'sales', 'sales-pipeline', 'Sales Pipeline', 'Sales opportunities and pipeline management', false, '/sales/pipeline', 'trending-up', 5, true, NOW(), NOW()),
('pg_sales_opportunities', 'sales', 'sales-opportunities', 'Opportunity Details', 'Detailed opportunity management and tracking', false, '/sales/opportunities', 'target', 6, true, NOW(), NOW()),

-- Dashboard & Overview
('pg_dashboard_main', 'dashboard', 'dashboard-main', 'Main Dashboard', 'Executive dashboard with key metrics and insights', false, '/dashboard', 'bar-chart-3', 7, true, NOW(), NOW()),

-- Team & People
('pg_team_profiles', 'team', 'team-profiles', 'Team Profiles', 'Team member profiles and role management', false, '/team/profiles', 'users', 8, true, NOW(), NOW()),

-- Client Management
('pg_clients_list', 'clients', 'clients-list', 'Client Management', 'Client information and relationship management', false, '/clients', 'building', 9, true, NOW(), NOW()),

-- Settings & Administration
('pg_settings_system', 'settings', 'settings-system', 'System Settings', 'System-wide configuration and administration', true, '/settings/system', 'server', 10, true, NOW(), NOW()),
('pg_settings_profile', 'settings', 'settings-profile', 'Profile Settings', 'User profile and personal preferences', false, '/settings/profile', 'user', 11, true, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 2. SECTION DEFINITIONS
-- ===================================

-- Projects ROI Sections (Financial - High Security)
INSERT INTO section_definitions (id, page_id, section_name, display_name, description, is_financial, requires_approval, component_name, sort_order, is_active, created_at, updated_at) VALUES
('sc_roi_financial', 'pg_projects_roi', 'financial-summary', 'Financial Summary', 'Project financial overview and key metrics', true, true, 'FinancialSummary', 1, true, NOW(), NOW()),
('sc_roi_revenue', 'pg_projects_roi', 'revenue-streams', 'Revenue Streams', 'Revenue breakdown and projections', true, false, 'RevenueStreams', 2, true, NOW(), NOW()),
('sc_roi_costs', 'pg_projects_roi', 'cost-analysis', 'Cost Analysis', 'Detailed cost breakdown and analysis', true, true, 'CostAnalysis', 3, true, NOW(), NOW()),

-- Projects Core Sections
('sc_core_overview', 'pg_projects_core', 'project-overview', 'Project Overview', 'Basic project information and status', false, false, 'ProjectOverview', 1, true, NOW(), NOW()),
('sc_core_timeline', 'pg_projects_core', 'timeline', 'Project Timeline', 'Project phases and timeline management', false, false, 'Timeline', 2, true, NOW(), NOW()),
('sc_core_resources', 'pg_projects_core', 'resources', 'Resource Allocation', 'Team and resource assignment', false, true, 'Resources', 3, true, NOW(), NOW()),

-- Projects Logistics Sections
('sc_logistics_equipment', 'pg_projects_logistics', 'equipment', 'Equipment Planning', 'Equipment requirements and scheduling', false, false, 'Equipment', 1, true, NOW(), NOW()),
('sc_logistics_venue', 'pg_projects_logistics', 'venue', 'Venue Coordination', 'Venue setup and logistics coordination', false, false, 'VenueCoordination', 2, true, NOW(), NOW()),

-- Projects Operations Sections
('sc_operations_tasks', 'pg_projects_operations', 'task-management', 'Task Management', 'Project task tracking and assignment', false, false, 'TaskManagement', 1, true, NOW(), NOW()),
('sc_operations_delivery', 'pg_projects_operations', 'delivery', 'Delivery Pipeline', 'Project delivery and execution tracking', false, true, 'DeliveryPipeline', 2, true, NOW(), NOW()),

-- Sales Pipeline Sections
('sc_sales_opportunities', 'pg_sales_pipeline', 'opportunities', 'Opportunity Management', 'Sales opportunity tracking and progression', false, false, 'Opportunities', 1, true, NOW(), NOW()),
('sc_sales_pricing', 'pg_sales_pipeline', 'pricing', 'Pricing & Quotes', 'Quote generation and pricing management', true, false, 'Pricing', 2, true, NOW(), NOW()),

-- Sales Opportunities Sections
('sc_opp_details', 'pg_sales_opportunities', 'opportunity-details', 'Opportunity Details', 'Detailed opportunity information and history', false, false, 'OpportunityDetails', 1, true, NOW(), NOW()),
('sc_opp_contacts', 'pg_sales_opportunities', 'client-contacts', 'Client Contacts', 'Client contact management and communication', false, false, 'ClientContacts', 2, true, NOW(), NOW()),

-- Dashboard Sections
('sc_dashboard_metrics', 'pg_dashboard_main', 'key-metrics', 'Key Metrics', 'Executive dashboard key performance indicators', true, false, 'KeyMetrics', 1, true, NOW(), NOW()),
('sc_dashboard_activity', 'pg_dashboard_main', 'recent-activity', 'Recent Activity', 'Recent system activity and updates', false, false, 'RecentActivity', 2, true, NOW(), NOW()),

-- Team Sections
('sc_team_directory', 'pg_team_profiles', 'team-directory', 'Team Directory', 'Company team member directory', false, false, 'TeamDirectory', 1, true, NOW(), NOW()),
('sc_team_roles', 'pg_team_profiles', 'role-management', 'Role Management', 'Team role and permission management', true, true, 'RoleManagement', 2, true, NOW(), NOW()),

-- Client Sections
('sc_clients_info', 'pg_clients_list', 'client-information', 'Client Information', 'Client company and contact information', false, false, 'ClientInformation', 1, true, NOW(), NOW()),
('sc_clients_history', 'pg_clients_list', 'project-history', 'Project History', 'Client project history and relationships', false, false, 'ProjectHistory', 2, true, NOW(), NOW()),

-- Settings Sections
('sc_settings_config', 'pg_settings_system', 'system-config', 'System Configuration', 'System-wide configuration settings', true, true, 'SystemConfiguration', 1, true, NOW(), NOW()),
('sc_settings_users', 'pg_settings_system', 'user-management', 'User Management', 'System user and access management', true, true, 'UserManagement', 2, true, NOW(), NOW()),
('sc_profile_personal', 'pg_settings_profile', 'personal-info', 'Personal Information', 'User personal information and preferences', false, false, 'PersonalInfo', 1, true, NOW(), NOW()),
('sc_profile_preferences', 'pg_settings_profile', 'preferences', 'User Preferences', 'Application preferences and settings', false, false, 'UserPreferences', 2, true, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 3. FIELD DEFINITIONS
-- ===================================

-- ROI Financial Summary Fields (Highly Sensitive)
INSERT INTO field_definitions (id, section_id, field_name, display_name, field_type, description, is_sensitive, is_required, validation_rules, sort_order, is_active, created_at, updated_at) VALUES
('fd_roi_total_revenue', 'sc_roi_financial', 'total_revenue', 'Total Revenue', 'currency', 'Total project revenue amount', true, true, '{"min": 0, "max": 10000000}', 1, true, NOW(), NOW()),
('fd_roi_total_costs', 'sc_roi_financial', 'total_costs', 'Total Costs', 'currency', 'Total project costs and expenses', true, true, '{"min": 0}', 2, true, NOW(), NOW()),
('fd_roi_net_profit', 'sc_roi_financial', 'net_profit', 'Net Profit', 'currency', 'Calculated net profit for project', true, false, null, 3, true, NOW(), NOW()),
('fd_roi_profit_margin', 'sc_roi_financial', 'profit_margin', 'Profit Margin %', 'percentage', 'Project profit margin percentage', true, false, '{"min": -100, "max": 100}', 4, true, NOW(), NOW()),
('fd_roi_break_even', 'sc_roi_financial', 'break_even_date', 'Break Even Date', 'date', 'Projected break-even date', true, false, null, 5, true, NOW(), NOW()),

-- ROI Revenue Streams Fields
('fd_revenue_primary', 'sc_roi_revenue', 'primary_revenue', 'Primary Revenue Stream', 'currency', 'Main revenue source for project', true, true, '{"min": 0}', 1, true, NOW(), NOW()),
('fd_revenue_secondary', 'sc_roi_revenue', 'secondary_revenue', 'Secondary Revenue', 'currency', 'Additional revenue streams', true, false, '{"min": 0}', 2, true, NOW(), NOW()),
('fd_revenue_projections', 'sc_roi_revenue', 'revenue_projections', 'Revenue Projections', 'text', 'Revenue projection methodology and assumptions', false, false, null, 3, true, NOW(), NOW()),

-- ROI Cost Analysis Fields  
('fd_costs_labor', 'sc_roi_costs', 'labor_costs', 'Labor Costs', 'currency', 'Project labor and staffing costs', true, true, '{"min": 0}', 1, true, NOW(), NOW()),
('fd_costs_equipment', 'sc_roi_costs', 'equipment_costs', 'Equipment Costs', 'currency', 'Equipment rental and purchase costs', true, true, '{"min": 0}', 2, true, NOW(), NOW()),
('fd_costs_overhead', 'sc_roi_costs', 'overhead_costs', 'Overhead Costs', 'currency', 'General overhead and administrative costs', true, false, '{"min": 0}', 3, true, NOW(), NOW()),
('fd_costs_contingency', 'sc_roi_costs', 'contingency_percentage', 'Contingency %', 'percentage', 'Contingency percentage for unexpected costs', false, false, '{"min": 0, "max": 50}', 4, true, NOW(), NOW()),

-- Project Core Overview Fields
('fd_core_name', 'sc_core_overview', 'project_name', 'Project Name', 'text', 'Project title and identifier', false, true, null, 1, true, NOW(), NOW()),
('fd_core_client', 'sc_core_overview', 'client_name', 'Client Name', 'text', 'Primary client for the project', false, true, null, 2, true, NOW(), NOW()),
('fd_core_status', 'sc_core_overview', 'project_status', 'Project Status', 'text', 'Current project status', false, true, null, 3, true, NOW(), NOW()),
('fd_core_priority', 'sc_core_overview', 'priority_level', 'Priority Level', 'number', 'Project priority ranking', false, false, '{"min": 1, "max": 5}', 4, true, NOW(), NOW()),

-- Project Timeline Fields
('fd_timeline_start', 'sc_core_timeline', 'start_date', 'Start Date', 'date', 'Project start date', false, true, null, 1, true, NOW(), NOW()),
('fd_timeline_end', 'sc_core_timeline', 'end_date', 'End Date', 'date', 'Project completion date', false, true, null, 2, true, NOW(), NOW()),
('fd_timeline_milestones', 'sc_core_timeline', 'key_milestones', 'Key Milestones', 'text', 'Critical project milestones', false, false, null, 3, true, NOW(), NOW()),

-- Resource Allocation Fields
('fd_resources_team', 'sc_core_resources', 'assigned_team', 'Assigned Team', 'text', 'Team members assigned to project', false, false, null, 1, true, NOW(), NOW()),
('fd_resources_budget', 'sc_core_resources', 'allocated_budget', 'Allocated Budget', 'currency', 'Budget allocated to project resources', true, false, '{"min": 0}', 2, true, NOW(), NOW()),
('fd_resources_utilization', 'sc_core_resources', 'resource_utilization', 'Resource Utilization %', 'percentage', 'Current resource utilization percentage', false, false, '{"min": 0, "max": 200}', 3, true, NOW(), NOW()),

-- Logistics Equipment Fields
('fd_equipment_list', 'sc_logistics_equipment', 'equipment_list', 'Equipment List', 'text', 'List of required equipment', false, true, null, 1, true, NOW(), NOW()),
('fd_equipment_status', 'sc_logistics_equipment', 'equipment_status', 'Equipment Status', 'text', 'Current equipment availability status', false, false, null, 2, true, NOW(), NOW()),
('fd_equipment_cost', 'sc_logistics_equipment', 'equipment_rental_cost', 'Rental Cost', 'currency', 'Equipment rental costs', true, false, '{"min": 0}', 3, true, NOW(), NOW()),

-- Venue Coordination Fields
('fd_venue_name', 'sc_logistics_venue', 'venue_name', 'Venue Name', 'text', 'Event venue name and location', false, true, null, 1, true, NOW(), NOW()),
('fd_venue_contact', 'sc_logistics_venue', 'venue_contact', 'Venue Contact', 'text', 'Venue contact person and details', false, false, null, 2, true, NOW(), NOW()),

-- Operations Task Management Fields
('fd_tasks_active', 'sc_operations_tasks', 'active_tasks', 'Active Tasks', 'number', 'Number of active tasks', false, false, '{"min": 0}', 1, true, NOW(), NOW()),
('fd_tasks_completed', 'sc_operations_tasks', 'completed_tasks', 'Completed Tasks', 'number', 'Number of completed tasks', false, false, '{"min": 0}', 2, true, NOW(), NOW()),
('fd_tasks_overdue', 'sc_operations_tasks', 'overdue_tasks', 'Overdue Tasks', 'number', 'Number of overdue tasks', false, false, '{"min": 0}', 3, true, NOW(), NOW()),

-- Operations Delivery Fields
('fd_delivery_phase', 'sc_operations_delivery', 'delivery_phase', 'Current Phase', 'text', 'Current delivery phase', false, true, null, 1, true, NOW(), NOW()),
('fd_delivery_progress', 'sc_operations_delivery', 'completion_percentage', 'Completion %', 'percentage', 'Project completion percentage', false, false, '{"min": 0, "max": 100}', 2, true, NOW(), NOW()),

-- Sales Opportunity Management Fields
('fd_sales_opp_value', 'sc_sales_opportunities', 'opportunity_value', 'Opportunity Value', 'currency', 'Estimated value of sales opportunity', true, true, '{"min": 0}', 1, true, NOW(), NOW()),
('fd_sales_opp_stage', 'sc_sales_opportunities', 'sales_stage', 'Sales Stage', 'text', 'Current stage in sales pipeline', false, true, null, 2, true, NOW(), NOW()),
('fd_sales_opp_probability', 'sc_sales_opportunities', 'win_probability', 'Win Probability %', 'percentage', 'Probability of winning the opportunity', false, false, '{"min": 0, "max": 100}', 3, true, NOW(), NOW()),
('fd_sales_opp_close_date', 'sc_sales_opportunities', 'expected_close_date', 'Expected Close Date', 'date', 'Expected opportunity close date', false, false, null, 4, true, NOW(), NOW()),

-- Sales Pricing Fields
('fd_pricing_quote_value', 'sc_sales_pricing', 'quote_value', 'Quote Value', 'currency', 'Total quote value', true, true, '{"min": 0}', 1, true, NOW(), NOW()),
('fd_pricing_margins', 'sc_sales_pricing', 'target_margin', 'Target Margin %', 'percentage', 'Target profit margin for quote', true, false, '{"min": 0, "max": 100}', 2, true, NOW(), NOW()),
('fd_pricing_discount', 'sc_sales_pricing', 'discount_percentage', 'Discount %', 'percentage', 'Discount applied to quote', false, false, '{"min": 0, "max": 50}', 3, true, NOW(), NOW()),

-- Opportunity Details Fields
('fd_opp_description', 'sc_opp_details', 'opportunity_description', 'Description', 'text', 'Detailed opportunity description', false, true, null, 1, true, NOW(), NOW()),
('fd_opp_requirements', 'sc_opp_details', 'client_requirements', 'Client Requirements', 'text', 'Specific client requirements and needs', false, false, null, 2, true, NOW(), NOW()),
('fd_opp_competition', 'sc_opp_details', 'competitive_analysis', 'Competitive Analysis', 'text', 'Analysis of competitive landscape', false, false, null, 3, true, NOW(), NOW()),

-- Client Contacts Fields
('fd_contacts_primary', 'sc_opp_contacts', 'primary_contact', 'Primary Contact', 'text', 'Main client contact person', false, true, null, 1, true, NOW(), NOW()),
('fd_contacts_email', 'sc_opp_contacts', 'contact_email', 'Contact Email', 'text', 'Primary contact email address', false, false, null, 2, true, NOW(), NOW()),
('fd_contacts_phone', 'sc_opp_contacts', 'contact_phone', 'Contact Phone', 'text', 'Primary contact phone number', false, false, null, 3, true, NOW(), NOW()),

-- Dashboard Key Metrics Fields
('fd_dashboard_revenue', 'sc_dashboard_metrics', 'total_revenue_ytd', 'YTD Revenue', 'currency', 'Year-to-date total revenue', true, false, null, 1, true, NOW(), NOW()),
('fd_dashboard_projects', 'sc_dashboard_metrics', 'active_projects_count', 'Active Projects', 'number', 'Number of currently active projects', false, false, '{"min": 0}', 2, true, NOW(), NOW()),
('fd_dashboard_pipeline', 'sc_dashboard_metrics', 'pipeline_value', 'Pipeline Value', 'currency', 'Total value in sales pipeline', true, false, '{"min": 0}', 3, true, NOW(), NOW()),

-- Dashboard Activity Fields
('fd_activity_recent', 'sc_dashboard_activity', 'recent_activities', 'Recent Activities', 'text', 'List of recent system activities', false, false, null, 1, true, NOW(), NOW()),
('fd_activity_notifications', 'sc_dashboard_activity', 'pending_notifications', 'Pending Notifications', 'number', 'Number of pending user notifications', false, false, '{"min": 0}', 2, true, NOW(), NOW()),

-- Team Directory Fields
('fd_team_members', 'sc_team_directory', 'team_member_list', 'Team Members', 'text', 'List of team members and roles', false, false, null, 1, true, NOW(), NOW()),
('fd_team_departments', 'sc_team_directory', 'department_structure', 'Department Structure', 'text', 'Organizational department structure', false, false, null, 2, true, NOW(), NOW()),

-- Role Management Fields (Sensitive)
('fd_roles_assignments', 'sc_team_roles', 'role_assignments', 'Role Assignments', 'text', 'Current user role assignments', true, false, null, 1, true, NOW(), NOW()),
('fd_roles_permissions', 'sc_team_roles', 'permission_matrix', 'Permission Matrix', 'text', 'System permission matrix configuration', true, true, null, 2, true, NOW(), NOW()),

-- Client Information Fields
('fd_client_company', 'sc_clients_info', 'company_name', 'Company Name', 'text', 'Client company name', false, true, null, 1, true, NOW(), NOW()),
('fd_client_industry', 'sc_clients_info', 'industry_sector', 'Industry Sector', 'text', 'Client industry sector', false, false, null, 2, true, NOW(), NOW()),
('fd_client_size', 'sc_clients_info', 'company_size', 'Company Size', 'text', 'Client company size category', false, false, null, 3, true, NOW(), NOW()),

-- Client History Fields
('fd_history_projects', 'sc_clients_history', 'project_count', 'Total Projects', 'number', 'Total number of projects with client', false, false, '{"min": 0}', 1, true, NOW(), NOW()),
('fd_history_revenue', 'sc_clients_history', 'total_revenue_client', 'Total Revenue', 'currency', 'Total revenue from client', true, false, '{"min": 0}', 2, true, NOW(), NOW()),
('fd_history_satisfaction', 'sc_clients_history', 'satisfaction_rating', 'Satisfaction Rating', 'number', 'Client satisfaction rating', false, false, '{"min": 1, "max": 5}', 3, true, NOW(), NOW()),

-- System Configuration Fields (Highly Sensitive)
('fd_config_database', 'sc_settings_config', 'database_config', 'Database Configuration', 'text', 'Database connection and configuration', true, true, null, 1, true, NOW(), NOW()),
('fd_config_integrations', 'sc_settings_config', 'integration_settings', 'Integration Settings', 'text', 'Third-party integration configurations', true, false, null, 2, true, NOW(), NOW()),
('fd_config_security', 'sc_settings_config', 'security_settings', 'Security Settings', 'text', 'System security configuration', true, true, null, 3, true, NOW(), NOW()),

-- User Management Fields (Sensitive)
('fd_users_active', 'sc_settings_users', 'active_users_count', 'Active Users', 'number', 'Number of active system users', true, false, '{"min": 0}', 1, true, NOW(), NOW()),
('fd_users_roles', 'sc_settings_users', 'user_role_distribution', 'Role Distribution', 'text', 'Distribution of users across roles', true, false, null, 2, true, NOW(), NOW()),
('fd_users_access_log', 'sc_settings_users', 'recent_access_log', 'Recent Access Log', 'text', 'Recent user access log entries', true, false, null, 3, true, NOW(), NOW()),

-- Profile Personal Info Fields
('fd_profile_name', 'sc_profile_personal', 'full_name', 'Full Name', 'text', 'User full name', false, true, null, 1, true, NOW(), NOW()),
('fd_profile_email', 'sc_profile_personal', 'email_address', 'Email Address', 'text', 'User email address', false, true, null, 2, true, NOW(), NOW()),
('fd_profile_phone', 'sc_profile_personal', 'phone_number', 'Phone Number', 'text', 'User phone number', false, false, null, 3, true, NOW(), NOW()),

-- Profile Preferences Fields
('fd_preferences_theme', 'sc_profile_preferences', 'ui_theme', 'UI Theme', 'text', 'User interface theme preference', false, false, null, 1, true, NOW(), NOW()),
('fd_preferences_notifications', 'sc_profile_preferences', 'notification_settings', 'Notification Settings', 'text', 'User notification preferences', false, false, null, 2, true, NOW(), NOW()),
('fd_preferences_timezone', 'sc_profile_preferences', 'timezone', 'Timezone', 'text', 'User timezone setting', false, false, null, 3, true, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 4. PAGE PERMISSIONS (Business Rules Applied)
-- ===================================

-- ROI Calculator (Financial - Highly Restricted)
INSERT INTO page_permissions (id, page_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve, granted_by, granted_at, reason, created_at, updated_at) VALUES
('pp_roi_master', 'pg_projects_roi', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full financial access', NOW(), NOW()),
('pp_roi_senior', 'pg_projects_roi', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have financial access except delete', NOW(), NOW()),
('pp_roi_hr', 'pg_projects_roi', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only access to financial data', NOW(), NOW()),
('pp_roi_mid', 'pg_projects_roi', 'mid', 'none', false, false, false, false, false, 'system', NOW(), 'Mid users cannot access financial data', NOW(), NOW()),
('pp_roi_ext', 'pg_projects_roi', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'External users cannot access financial data', NOW(), NOW()),

-- Project Core (General Project Access)
('pp_core_master', 'pg_projects_core', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full project access', NOW(), NOW()),
('pp_core_senior', 'pg_projects_core', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have full access except delete', NOW(), NOW()),
('pp_core_hr', 'pg_projects_core', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only project access', NOW(), NOW()),
('pp_core_mid', 'pg_projects_core', 'mid', 'full', true, true, true, false, false, 'system', NOW(), 'Mid users have project access without delete/approve', NOW(), NOW()),
('pp_core_ext', 'pg_projects_core', 'external', 'assigned_only', false, true, true, false, false, 'system', NOW(), 'External users can only access assigned projects', NOW(), NOW()),

-- Project Logistics
('pp_logistics_master', 'pg_projects_logistics', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full logistics access', NOW(), NOW()),
('pp_logistics_senior', 'pg_projects_logistics', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have full logistics access except delete', NOW(), NOW()),
('pp_logistics_hr', 'pg_projects_logistics', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only logistics access', NOW(), NOW()),
('pp_logistics_mid', 'pg_projects_logistics', 'mid', 'full', true, true, true, false, false, 'system', NOW(), 'Mid users have logistics access without delete/approve', NOW(), NOW()),
('pp_logistics_ext', 'pg_projects_logistics', 'external', 'assigned_only', false, true, false, false, false, 'system', NOW(), 'External users have assigned-only logistics access', NOW(), NOW()),

-- Project Operations
('pp_operations_master', 'pg_projects_operations', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full operations access', NOW(), NOW()),
('pp_operations_senior', 'pg_projects_operations', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have full operations access except delete', NOW(), NOW()),
('pp_operations_hr', 'pg_projects_operations', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only operations access', NOW(), NOW()),
('pp_operations_mid', 'pg_projects_operations', 'mid', 'full', true, true, true, false, false, 'system', NOW(), 'Mid users have operations access without delete/approve', NOW(), NOW()),
('pp_operations_ext', 'pg_projects_operations', 'external', 'assigned_only', false, true, true, false, false, 'system', NOW(), 'External users have assigned-only operations access', NOW(), NOW()),

-- Sales Pipeline (Sales Team + Management)
('pp_sales_pipeline_master', 'pg_sales_pipeline', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full sales access', NOW(), NOW()),
('pp_sales_pipeline_senior', 'pg_sales_pipeline', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have full sales access except delete', NOW(), NOW()),
('pp_sales_pipeline_hr', 'pg_sales_pipeline', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only sales access', NOW(), NOW()),
('pp_sales_pipeline_mid', 'pg_sales_pipeline', 'mid', 'full', true, true, true, false, false, 'system', NOW(), 'Mid users have sales access without delete/approve', NOW(), NOW()),
('pp_sales_pipeline_ext', 'pg_sales_pipeline', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'External users cannot access sales data', NOW(), NOW()),

-- Sales Opportunities
('pp_sales_opp_master', 'pg_sales_opportunities', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full opportunity access', NOW(), NOW()),
('pp_sales_opp_senior', 'pg_sales_opportunities', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have full opportunity access except delete', NOW(), NOW()),
('pp_sales_opp_hr', 'pg_sales_opportunities', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only opportunity access', NOW(), NOW()),
('pp_sales_opp_mid', 'pg_sales_opportunities', 'mid', 'own_only', true, true, true, false, false, 'system', NOW(), 'Mid users can only access their own opportunities', NOW(), NOW()),
('pp_sales_opp_ext', 'pg_sales_opportunities', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'External users cannot access opportunity data', NOW(), NOW()),

-- Main Dashboard (Executive Overview)
('pp_dashboard_master', 'pg_dashboard_main', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full dashboard access', NOW(), NOW()),
('pp_dashboard_senior', 'pg_dashboard_main', 'senior', 'full', false, true, true, false, false, 'system', NOW(), 'Senior users have dashboard read/update access', NOW(), NOW()),
('pp_dashboard_hr', 'pg_dashboard_main', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only dashboard access', NOW(), NOW()),
('pp_dashboard_mid', 'pg_dashboard_main', 'mid', 'read_only', false, true, false, false, false, 'system', NOW(), 'Mid users have read-only dashboard access', NOW(), NOW()),
('pp_dashboard_ext', 'pg_dashboard_main', 'external', 'read_only', false, true, false, false, false, 'system', NOW(), 'External users have limited dashboard access', NOW(), NOW()),

-- Team Profiles
('pp_team_master', 'pg_team_profiles', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full team management access', NOW(), NOW()),
('pp_team_senior', 'pg_team_profiles', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have team management access except delete', NOW(), NOW()),
('pp_team_hr', 'pg_team_profiles', 'hr_finance', 'full', true, true, true, false, false, 'system', NOW(), 'HR Finance has team management access', NOW(), NOW()),
('pp_team_mid', 'pg_team_profiles', 'mid', 'read_only', false, true, false, false, false, 'system', NOW(), 'Mid users have read-only team access', NOW(), NOW()),
('pp_team_ext', 'pg_team_profiles', 'external', 'read_only', false, true, false, false, false, 'system', NOW(), 'External users have limited team directory access', NOW(), NOW()),

-- Client Management
('pp_clients_master', 'pg_clients_list', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full client management access', NOW(), NOW()),
('pp_clients_senior', 'pg_clients_list', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have client management access except delete', NOW(), NOW()),
('pp_clients_hr', 'pg_clients_list', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only client access', NOW(), NOW()),
('pp_clients_mid', 'pg_clients_list', 'mid', 'full', true, true, true, false, false, 'system', NOW(), 'Mid users have client management access', NOW(), NOW()),
('pp_clients_ext', 'pg_clients_list', 'external', 'assigned_only', false, true, false, false, false, 'system', NOW(), 'External users can only view assigned clients', NOW(), NOW()),

-- System Settings (Administrative - Highly Restricted)
('pp_settings_sys_master', 'pg_settings_system', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full system administration access', NOW(), NOW()),
('pp_settings_sys_senior', 'pg_settings_system', 'senior', 'read_only', false, true, false, false, false, 'system', NOW(), 'Senior users have read-only system settings access', NOW(), NOW()),
('pp_settings_sys_hr', 'pg_settings_system', 'hr_finance', 'none', false, false, false, false, false, 'system', NOW(), 'HR Finance cannot access system settings', NOW(), NOW()),
('pp_settings_sys_mid', 'pg_settings_system', 'mid', 'none', false, false, false, false, false, 'system', NOW(), 'Mid users cannot access system settings', NOW(), NOW()),
('pp_settings_sys_ext', 'pg_settings_system', 'external', 'none', false, false, false, false, false, 'system', NOW(), 'External users cannot access system settings', NOW(), NOW()),

-- Profile Settings (Personal)
('pp_settings_prof_master', 'pg_settings_profile', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full profile access', NOW(), NOW()),
('pp_settings_prof_senior', 'pg_settings_profile', 'senior', 'own_only', true, true, true, false, false, 'system', NOW(), 'Senior users can manage own profile', NOW(), NOW()),
('pp_settings_prof_hr', 'pg_settings_profile', 'hr_finance', 'own_only', true, true, true, false, false, 'system', NOW(), 'HR Finance can manage own profile', NOW(), NOW()),
('pp_settings_prof_mid', 'pg_settings_profile', 'mid', 'own_only', true, true, true, false, false, 'system', NOW(), 'Mid users can manage own profile', NOW(), NOW()),
('pp_settings_prof_ext', 'pg_settings_profile', 'external', 'own_only', true, true, true, false, false, 'system', NOW(), 'External users can manage own profile', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 5. SECTION PERMISSIONS (Inherit from Pages with Overrides)
-- ===================================

-- ROI Section Permissions (Financial sections - extra restricted)
INSERT INTO section_permissions (id, section_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, can_approve, granted_by, granted_at, reason, created_at, updated_at) VALUES
-- ROI Financial Summary (Most Critical)
('sp_roi_financial_master', 'sc_roi_financial', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full financial summary access', NOW(), NOW()),
('sp_roi_financial_senior', 'sc_roi_financial', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have financial summary access except delete', NOW(), NOW()),
('sp_roi_financial_hr', 'sc_roi_financial', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only financial summary access', NOW(), NOW()),

-- ROI Revenue Streams
('sp_roi_revenue_master', 'sc_roi_revenue', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full revenue access', NOW(), NOW()),
('sp_roi_revenue_senior', 'sc_roi_revenue', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have revenue access except delete', NOW(), NOW()),
('sp_roi_revenue_hr', 'sc_roi_revenue', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only revenue access', NOW(), NOW()),

-- Sales Pricing Section (Financial)
('sp_sales_pricing_master', 'sc_sales_pricing', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full pricing access', NOW(), NOW()),
('sp_sales_pricing_senior', 'sc_sales_pricing', 'senior', 'full', true, true, true, false, true, 'system', NOW(), 'Senior users have pricing access except delete', NOW(), NOW()),
('sp_sales_pricing_hr', 'sc_sales_pricing', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only pricing access', NOW(), NOW()),
('sp_sales_pricing_mid', 'sc_sales_pricing', 'mid', 'read_only', false, true, false, false, false, 'system', NOW(), 'Mid users have read-only pricing access', NOW(), NOW()),

-- Team Role Management (Sensitive)
('sp_team_roles_master', 'sc_team_roles', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full role management access', NOW(), NOW()),
('sp_team_roles_senior', 'sc_team_roles', 'senior', 'read_only', false, true, false, false, false, 'system', NOW(), 'Senior users have read-only role access', NOW(), NOW()),
('sp_team_roles_hr', 'sc_team_roles', 'hr_finance', 'read_only', false, true, false, false, false, 'system', NOW(), 'HR Finance has read-only role access', NOW(), NOW()),

-- System Configuration (Highly Restricted)
('sp_settings_config_master', 'sc_settings_config', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full system configuration access', NOW(), NOW()),
('sp_settings_config_senior', 'sc_settings_config', 'senior', 'read_only', false, true, false, false, false, 'system', NOW(), 'Senior users have read-only system configuration access', NOW(), NOW()),

-- User Management (Sensitive)
('sp_settings_users_master', 'sc_settings_users', 'master', 'full', true, true, true, true, true, 'system', NOW(), 'Master users have full user management access', NOW(), NOW()),
('sp_settings_users_senior', 'sc_settings_users', 'senior', 'read_only', false, true, false, false, false, 'system', NOW(), 'Senior users have read-only user management access', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 6. FIELD PERMISSIONS (Financial and Sensitive Fields)
-- ===================================

-- ROI Financial Fields (Ultra Restricted)
INSERT INTO field_permissions (id, field_id, user_tier, permission_type, can_create, can_read, can_update, can_delete, granted_by, granted_at, reason, created_at, updated_at) VALUES
-- Total Revenue Field
('fp_roi_revenue_master', 'fd_roi_total_revenue', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full revenue field access', NOW(), NOW()),
('fp_roi_revenue_senior', 'fd_roi_total_revenue', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Senior users have revenue field access except delete', NOW(), NOW()),
('fp_roi_revenue_hr', 'fd_roi_total_revenue', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only revenue field access', NOW(), NOW()),

-- Net Profit Field
('fp_roi_profit_master', 'fd_roi_net_profit', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full profit field access', NOW(), NOW()),
('fp_roi_profit_senior', 'fd_roi_net_profit', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Senior users have profit field access except delete', NOW(), NOW()),
('fp_roi_profit_hr', 'fd_roi_net_profit', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only profit field access', NOW(), NOW()),

-- Profit Margin Field
('fp_roi_margin_master', 'fd_roi_profit_margin', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full margin field access', NOW(), NOW()),
('fp_roi_margin_senior', 'fd_roi_profit_margin', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Senior users have margin field access except delete', NOW(), NOW()),
('fp_roi_margin_hr', 'fd_roi_profit_margin', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only margin field access', NOW(), NOW()),

-- Labor Costs Field
('fp_costs_labor_master', 'fd_costs_labor', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full labor costs access', NOW(), NOW()),
('fp_costs_labor_senior', 'fd_costs_labor', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Senior users have labor costs access except delete', NOW(), NOW()),
('fp_costs_labor_hr', 'fd_costs_labor', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only labor costs access', NOW(), NOW()),

-- Client Name Field (Less Sensitive - Broader Access)
('fp_core_client_master', 'fd_core_client', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full client name access', NOW(), NOW()),
('fp_core_client_senior', 'fd_core_client', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Senior users have client name access except delete', NOW(), NOW()),
('fp_core_client_hr', 'fd_core_client', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only client name access', NOW(), NOW()),
('fp_core_client_mid', 'fd_core_client', 'mid', 'full', true, true, true, false, 'system', NOW(), 'Mid users have client name access', NOW(), NOW()),
('fp_core_client_ext', 'fd_core_client', 'external', 'assigned_only', false, true, false, false, 'system', NOW(), 'External users have assigned-only client access', NOW(), NOW()),

-- Resource Budget Field (Financial)
('fp_resources_budget_master', 'fd_resources_budget', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full budget field access', NOW(), NOW()),
('fp_resources_budget_senior', 'fd_resources_budget', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Senior users have budget field access except delete', NOW(), NOW()),
('fp_resources_budget_hr', 'fd_resources_budget', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only budget access', NOW(), NOW()),

-- Sales Opportunity Value (Financial)
('fp_sales_value_master', 'fd_sales_opp_value', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full opportunity value access', NOW(), NOW()),
('fp_sales_value_senior', 'fd_sales_opp_value', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Senior users have opportunity value access except delete', NOW(), NOW()),
('fp_sales_value_hr', 'fd_sales_opp_value', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only opportunity value access', NOW(), NOW()),
('fp_sales_value_mid', 'fd_sales_opp_value', 'mid', 'own_only', true, true, true, false, 'system', NOW(), 'Mid users can only access their opportunity values', NOW(), NOW()),

-- Quote Value Field (Financial)
('fp_pricing_quote_master', 'fd_pricing_quote_value', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full quote value access', NOW(), NOW()),
('fp_pricing_quote_senior', 'fd_pricing_quote_value', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Senior users have quote value access except delete', NOW(), NOW()),
('fp_pricing_quote_hr', 'fd_pricing_quote_value', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only quote value access', NOW(), NOW()),
('fp_pricing_quote_mid', 'fd_pricing_quote_value', 'mid', 'read_only', false, true, false, false, 'system', NOW(), 'Mid users have read-only quote value access', NOW(), NOW()),

-- Dashboard YTD Revenue (Executive Metric)
('fp_dashboard_revenue_master', 'fd_dashboard_revenue', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full YTD revenue access', NOW(), NOW()),
('fp_dashboard_revenue_senior', 'fd_dashboard_revenue', 'senior', 'read_only', false, true, false, false, 'system', NOW(), 'Senior users have read-only YTD revenue access', NOW(), NOW()),
('fp_dashboard_revenue_hr', 'fd_dashboard_revenue', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only YTD revenue access', NOW(), NOW()),

-- Pipeline Value (Sales Metric)
('fp_dashboard_pipeline_master', 'fd_dashboard_pipeline', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full pipeline value access', NOW(), NOW()),
('fp_dashboard_pipeline_senior', 'fd_dashboard_pipeline', 'senior', 'read_only', false, true, false, false, 'system', NOW(), 'Senior users have read-only pipeline value access', NOW(), NOW()),
('fp_dashboard_pipeline_hr', 'fd_dashboard_pipeline', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only pipeline value access', NOW(), NOW()),

-- Role Assignments Field (Highly Sensitive)
('fp_roles_assignments_master', 'fd_roles_assignments', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full role assignments access', NOW(), NOW()),

-- Permission Matrix Field (Ultra Sensitive)
('fp_roles_permissions_master', 'fd_roles_permissions', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full permission matrix access', NOW(), NOW()),

-- Client Revenue History (Financial)
('fp_client_revenue_master', 'fd_history_revenue', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full client revenue history access', NOW(), NOW()),
('fp_client_revenue_senior', 'fd_history_revenue', 'senior', 'full', true, true, true, false, 'system', NOW(), 'Senior users have client revenue history access except delete', NOW(), NOW()),
('fp_client_revenue_hr', 'fd_history_revenue', 'hr_finance', 'read_only', false, true, false, false, 'system', NOW(), 'HR Finance has read-only client revenue history access', NOW(), NOW()),

-- System Configuration Fields (Ultra Sensitive)
('fp_config_database_master', 'fd_config_database', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full database config access', NOW(), NOW()),
('fp_config_security_master', 'fd_config_security', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full security config access', NOW(), NOW()),

-- User Management Fields (Sensitive)
('fp_users_active_master', 'fd_users_active', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full active users access', NOW(), NOW()),
('fp_users_roles_master', 'fd_users_roles', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full user roles access', NOW(), NOW()),
('fp_users_access_master', 'fd_users_access_log', 'master', 'full', true, true, true, true, 'system', NOW(), 'Master users have full access log access', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 7. AUDIT LOG ENTRIES (Sample Entries)
-- ===================================

INSERT INTO permission_audit_log (id, entity_type, entity_id, user_tier, action_type, old_permission, new_permission, changed_by, change_reason, created_at) VALUES
('audit_setup_1', 'page', 'pg_projects_roi', 'master', 'grant', null, '{"permission_type": "full", "can_read": true, "can_create": true, "can_update": true, "can_delete": true, "can_approve": true}', 'system', 'Initial comprehensive permissions setup', NOW()),
('audit_setup_2', 'page', 'pg_projects_roi', 'external', 'grant', null, '{"permission_type": "none", "can_read": false, "can_create": false, "can_update": false, "can_delete": false, "can_approve": false}', 'system', 'Financial data protection for external users', NOW()),
('audit_setup_3', 'field', 'fd_roi_total_revenue', 'hr_finance', 'grant', null, '{"permission_type": "read_only", "can_read": true, "can_create": false, "can_update": false, "can_delete": false}', 'system', 'HR Finance gets read access to revenue data for reporting', NOW()),
('audit_setup_4', 'page', 'pg_settings_system', 'mid', 'grant', null, '{"permission_type": "none", "can_read": false, "can_create": false, "can_update": false, "can_delete": false, "can_approve": false}', 'system', 'System settings restricted to administrative users only', NOW()),
('audit_setup_5', 'section', 'sc_sales_pricing', 'mid', 'grant', null, '{"permission_type": "read_only", "can_read": true, "can_create": false, "can_update": false, "can_delete": false, "can_approve": false}', 'system', 'Mid users get read access to pricing for awareness but not edit rights', NOW())

ON CONFLICT (id) DO NOTHING;

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Show setup summary
SELECT 'COMPREHENSIVE PERMISSIONS DATA SETUP COMPLETE' as status;

SELECT 'SUMMARY OF INSERTED DATA' as section;

SELECT 
  'Pages' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_critical = true THEN 1 END) as critical_count
FROM page_definitions
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
  'Sections' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_financial = true THEN 1 END) as financial_count
FROM section_definitions  
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
  'Fields' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_sensitive = true THEN 1 END) as sensitive_count
FROM field_definitions
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
  'Page Permissions' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN permission_type = 'none' THEN 1 END) as restricted_count
FROM page_permissions
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
  'Field Permissions' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN permission_type = 'full' THEN 1 END) as full_access_count
FROM field_permissions
WHERE created_at >= CURRENT_DATE;

-- Show permission distribution by user tier
SELECT 'PERMISSION DISTRIBUTION BY USER TIER' as analysis;

SELECT 
  user_tier,
  COUNT(*) as total_permissions,
  COUNT(CASE WHEN permission_type = 'full' THEN 1 END) as full_access,
  COUNT(CASE WHEN permission_type = 'read_only' THEN 1 END) as read_only,
  COUNT(CASE WHEN permission_type = 'none' THEN 1 END) as no_access,
  COUNT(CASE WHEN permission_type = 'assigned_only' THEN 1 END) as assigned_only,
  COUNT(CASE WHEN permission_type = 'own_only' THEN 1 END) as own_only
FROM page_permissions 
WHERE created_at >= CURRENT_DATE
GROUP BY user_tier
ORDER BY 
  CASE user_tier 
    WHEN 'master' THEN 1 
    WHEN 'senior' THEN 2 
    WHEN 'hr_finance' THEN 3 
    WHEN 'mid' THEN 4 
    WHEN 'external' THEN 5 
  END;

-- Verify critical business rules
SELECT 'BUSINESS RULE VERIFICATION' as verification;

-- Check that external users cannot access financial pages
SELECT 
  'External users blocked from financial pages' as rule,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS - No external access to financial pages'
    ELSE '❌ FAIL - External users have financial access'
  END as result
FROM page_permissions pp
JOIN page_definitions pd ON pp.page_id = pd.id
WHERE pp.user_tier = 'external' 
  AND pp.permission_type != 'none'
  AND (pd.page_name LIKE '%roi%' OR pd.is_critical = true)
  AND pp.created_at >= CURRENT_DATE;

-- Check that mid users cannot access system settings
SELECT 
  'Mid users blocked from system settings' as rule,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS - Mid users cannot access system settings'
    ELSE '❌ FAIL - Mid users have system settings access'
  END as result
FROM page_permissions pp
JOIN page_definitions pd ON pp.page_id = pd.id
WHERE pp.user_tier = 'mid' 
  AND pp.permission_type != 'none'
  AND pd.page_name LIKE '%settings-system%'
  AND pp.created_at >= CURRENT_DATE;

-- Check that HR Finance has read-only financial access
SELECT 
  'HR Finance has read-only financial access' as rule,
  CASE 
    WHEN COUNT(*) > 0 AND COUNT(CASE WHEN pp.permission_type = 'read_only' THEN 1 END) = COUNT(*) 
    THEN '✅ PASS - HR Finance has appropriate read-only financial access'
    ELSE '❌ FAIL - HR Finance financial permissions incorrect'
  END as result
FROM page_permissions pp
JOIN page_definitions pd ON pp.page_id = pd.id
WHERE pp.user_tier = 'hr_finance' 
  AND pp.permission_type != 'none'
  AND pd.page_name LIKE '%roi%'
  AND pp.created_at >= CURRENT_DATE;

SELECT '🎉 COMPREHENSIVE PERMISSIONS SETUP COMPLETE! Ready for dashboard testing.' as final_status;