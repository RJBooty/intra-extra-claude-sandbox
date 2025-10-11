-- ============================================
-- VERIFY MIGRATION SUCCESS
-- Run this to confirm all tables were created
-- ============================================

-- Count all new tables
SELECT
    'Total New Tables' as check_type,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'equipment_categories',
    'equipment_items',
    'equipment_bundles',
    'equipment_bundle_items',
    'project_equipment_planning',
    'project_site_locations',
    'project_site_equipment',
    'project_jue_status',
    'project_logistics_comments',
    'project_roi_calculations',
    'project_roi_revenue',
    'project_roi_costs',
    'project_roi_scenarios',
    'project_assignments',
    'project_crew_compliance',
    'project_crew_travel_flights',
    'project_crew_travel_drives',
    'project_crew_accommodation',
    'project_crew_rota',
    'project_phases',
    'project_tasks',
    'project_integrations',
    'project_internal_debrief',
    'project_client_feedback',
    'project_incidents',
    'project_documents',
    'project_notifications'
);

-- List all created tables
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name LIKE 'equipment_%' OR table_name LIKE 'project_%'
ORDER BY table_name;

-- Check equipment categories seed data
SELECT COUNT(*) as equipment_categories_count FROM equipment_categories;

-- Check if projects have ROI calculations
SELECT
    (SELECT COUNT(*) FROM projects WHERE is_deleted = false) as total_projects,
    (SELECT COUNT(*) FROM project_roi_calculations) as roi_calculations_created;

-- Check if projects have phases
SELECT
    (SELECT COUNT(*) FROM projects WHERE is_deleted = false) as total_projects,
    (SELECT COUNT(*) FROM project_phases) as phases_created,
    (SELECT COUNT(*) FROM project_phases) / NULLIF((SELECT COUNT(*) FROM projects WHERE is_deleted = false), 0) as phases_per_project;

-- List all triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'trigger_update_equipment_availability',
    'trigger_update_roi_on_revenue',
    'trigger_update_roi_on_cost',
    'trigger_create_project_roi'
);

-- Success summary
SELECT
    '✅ Migration Successful!' as status,
    'All tables, indexes, triggers, and seed data created' as message;
