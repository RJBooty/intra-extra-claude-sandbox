-- Check if equipment tables exist
SELECT
    table_name,
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_name = t.table_name
     AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
    'equipment_categories',
    'equipment_items',
    'equipment_bundles',
    'equipment_bundle_items',
    'project_equipment_planning',
    'project_site_locations',
    'project_site_equipment'
)
ORDER BY table_name;
