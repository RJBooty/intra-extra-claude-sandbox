-- ============================================
-- CLEANUP SCRIPT FOR PARTIAL MIGRATION
-- Run this FIRST if previous migration failed partway
-- ============================================

-- Drop indexes that may have been created
DROP INDEX IF EXISTS idx_project_notifications_project CASCADE;
DROP INDEX IF EXISTS idx_project_notifications_user CASCADE;
DROP INDEX IF EXISTS idx_project_notifications_read CASCADE;
DROP INDEX IF EXISTS idx_project_feedback_project CASCADE;
DROP INDEX IF EXISTS idx_project_incidents_project CASCADE;
DROP INDEX IF EXISTS idx_project_documents_project CASCADE;
DROP INDEX IF EXISTS idx_project_documents_type CASCADE;
DROP INDEX IF EXISTS idx_project_phases_project CASCADE;
DROP INDEX IF EXISTS idx_project_tasks_project CASCADE;
DROP INDEX IF EXISTS idx_project_tasks_assigned CASCADE;
DROP INDEX IF EXISTS idx_project_tasks_status CASCADE;
DROP INDEX IF EXISTS idx_project_assignments_project CASCADE;
DROP INDEX IF EXISTS idx_project_assignments_user CASCADE;
DROP INDEX IF EXISTS idx_crew_compliance_project CASCADE;
DROP INDEX IF EXISTS idx_crew_flights_project CASCADE;
DROP INDEX IF EXISTS idx_crew_accommodation_project CASCADE;
DROP INDEX IF EXISTS idx_crew_rota_project_date CASCADE;
DROP INDEX IF EXISTS idx_roi_calculations_project CASCADE;
DROP INDEX IF EXISTS idx_roi_revenue_calculation CASCADE;
DROP INDEX IF EXISTS idx_roi_costs_calculation CASCADE;
DROP INDEX IF EXISTS idx_project_equipment_project CASCADE;
DROP INDEX IF EXISTS idx_project_equipment_item CASCADE;
DROP INDEX IF EXISTS idx_site_locations_project CASCADE;
DROP INDEX IF EXISTS idx_site_equipment_location CASCADE;
DROP INDEX IF EXISTS idx_logistics_comments_project CASCADE;
DROP INDEX IF EXISTS idx_equipment_items_category CASCADE;
DROP INDEX IF EXISTS idx_equipment_items_sku CASCADE;
DROP INDEX IF EXISTS idx_equipment_items_is_active CASCADE;
DROP INDEX IF EXISTS idx_equipment_bundle_items_bundle CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS project_notifications CASCADE;
DROP TABLE IF EXISTS project_documents CASCADE;
DROP TABLE IF EXISTS project_incidents CASCADE;
DROP TABLE IF EXISTS project_client_feedback CASCADE;
DROP TABLE IF EXISTS project_internal_debrief CASCADE;
DROP TABLE IF EXISTS project_integrations CASCADE;
DROP TABLE IF EXISTS project_tasks CASCADE;
DROP TABLE IF EXISTS project_phases CASCADE;
DROP TABLE IF EXISTS project_crew_rota CASCADE;
DROP TABLE IF EXISTS project_crew_accommodation CASCADE;
DROP TABLE IF EXISTS project_crew_travel_drives CASCADE;
DROP TABLE IF EXISTS project_crew_travel_flights CASCADE;
DROP TABLE IF EXISTS project_crew_compliance CASCADE;
DROP TABLE IF EXISTS project_assignments CASCADE;
DROP TABLE IF EXISTS project_roi_scenarios CASCADE;
DROP TABLE IF EXISTS project_roi_costs CASCADE;
DROP TABLE IF EXISTS project_roi_revenue CASCADE;
DROP TABLE IF EXISTS project_roi_calculations CASCADE;
DROP TABLE IF EXISTS project_logistics_comments CASCADE;
DROP TABLE IF EXISTS project_jue_status CASCADE;
DROP TABLE IF EXISTS project_site_equipment CASCADE;
DROP TABLE IF EXISTS project_site_locations CASCADE;
DROP TABLE IF EXISTS project_equipment_planning CASCADE;
DROP TABLE IF EXISTS equipment_bundle_items CASCADE;
DROP TABLE IF EXISTS equipment_bundles CASCADE;
DROP TABLE IF EXISTS equipment_items CASCADE;
DROP TABLE IF EXISTS equipment_categories CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_equipment_availability() CASCADE;
DROP FUNCTION IF EXISTS update_roi_totals() CASCADE;
DROP FUNCTION IF EXISTS create_project_roi() CASCADE;

-- Note: We DON'T drop the projects table or user_profiles table as they contain existing data

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Cleanup completed. You can now run the main migration script.';
END $$;
