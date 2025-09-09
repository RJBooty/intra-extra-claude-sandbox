-- Test Script for Permission Management System
-- Run this in Supabase SQL Editor after running the migration

-- 1. Verify tables were created
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN (
  'page_definitions', 
  'section_definitions', 
  'field_definitions',
  'page_permissions',
  'section_permissions', 
  'field_permissions',
  'permission_audit_log'
)
ORDER BY table_name, ordinal_position;

-- 2. Check sample data was inserted
SELECT 
  'Pages' as entity,
  COUNT(*) as count
FROM page_definitions
UNION ALL
SELECT 
  'Sections' as entity,
  COUNT(*) as count  
FROM section_definitions
UNION ALL
SELECT 
  'Fields' as entity,
  COUNT(*) as count
FROM field_definitions
UNION ALL
SELECT 
  'Page Permissions' as entity,
  COUNT(*) as count
FROM page_permissions
UNION ALL
SELECT 
  'Section Permissions' as entity,
  COUNT(*) as count
FROM section_permissions
UNION ALL  
SELECT 
  'Field Permissions' as entity,
  COUNT(*) as count
FROM field_permissions;

-- 3. View permission matrix for projects-roi page
SELECT 
  pd.page_name,
  pp.user_tier,
  pp.permission_type,
  pp.can_read,
  pp.can_update,
  pp.can_create,
  pp.can_delete,
  pp.can_approve
FROM page_permissions pp
JOIN page_definitions pd ON pp.page_id = pd.id
WHERE pd.page_name = 'projects-roi'
ORDER BY 
  CASE pp.user_tier 
    WHEN 'master' THEN 1
    WHEN 'senior' THEN 2  
    WHEN 'hr_finance' THEN 3
    WHEN 'mid' THEN 4
    WHEN 'external' THEN 5
  END;

-- 4. View financial section permissions
SELECT 
  sd.section_name,
  sd.display_name,
  sd.is_financial,
  sp.user_tier,
  sp.permission_type,
  sp.can_read,
  sp.can_update
FROM section_permissions sp
JOIN section_definitions sd ON sp.section_id = sd.id
JOIN page_definitions pd ON sd.page_id = pd.id
WHERE pd.page_name = 'projects-roi'
  AND sd.is_financial = true
ORDER BY sd.sort_order, sp.user_tier;

-- 5. View sensitive field permissions  
SELECT 
  fd.field_name,
  fd.display_name,
  fd.is_sensitive,
  fp.user_tier,
  fp.permission_type,
  fp.can_read,
  fp.can_update
FROM field_permissions fp
JOIN field_definitions fd ON fp.field_id = fd.id
JOIN section_definitions sd ON fd.section_id = sd.id
JOIN page_definitions pd ON sd.page_id = pd.id
WHERE pd.page_name = 'projects-roi'
  AND fd.is_sensitive = true
ORDER BY fd.sort_order, fp.user_tier;

-- 6. Test permission checking function
-- (Replace 'test-user-id' with an actual user ID from auth.users if available)
SELECT 
  'projects-roi' as page,
  'read' as action,
  check_page_permission(
    'test-user-id'::uuid, 
    'projects-roi', 
    'read'
  ) as has_permission;

-- 7. Test user permission retrieval function
SELECT * FROM get_user_page_permissions(
  'test-user-id'::uuid,
  'projects-roi'
);

-- 8. View audit log entries
SELECT 
  entity_type,
  user_tier,
  action_type,
  change_reason,
  created_at
FROM permission_audit_log
ORDER BY created_at DESC
LIMIT 5;

-- 9. Performance test - check indexes exist
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN (
  'page_definitions',
  'section_definitions', 
  'field_definitions',
  'page_permissions',
  'section_permissions',
  'field_permissions'
)
ORDER BY tablename, indexname;

-- 10. RLS Policy verification
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN (
  'page_definitions',
  'section_definitions',
  'field_definitions', 
  'page_permissions',
  'section_permissions',
  'field_permissions',
  'permission_audit_log'
)
ORDER BY tablename, policyname;

-- Expected Results Summary:
-- - 4 pages created (projects-roi, projects-overview, sales-pipeline, logistics-equipment)
-- - 5 sections created for projects-roi page
-- - 7 fields created for financial-summary section
-- - 20 page permissions (4 pages × 5 user tiers)  
-- - 25 section permissions (5 sections × 5 user tiers)
-- - 35 field permissions (7 fields × 5 user tiers)
-- - All user tiers should have different access levels:
--   * master: full access to everything
--   * senior: full access except some deletions  
--   * hr_finance: financial data access, read-only for others
--   * mid: no financial access, read-only for basic data
--   * external: no critical/financial access, assigned_only for basic data