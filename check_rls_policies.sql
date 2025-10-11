-- Check RLS policies for equipment tables
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN (
    'equipment_categories',
    'equipment_items',
    'equipment_bundles',
    'equipment_bundle_items'
)
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'equipment_categories',
    'equipment_items',
    'equipment_bundles',
    'equipment_bundle_items'
);
