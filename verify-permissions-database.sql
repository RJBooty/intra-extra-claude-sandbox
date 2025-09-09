-- PERMISSIONS DATABASE VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify your permissions system setup

-- 1. CHECK IF ALL 6 PERMISSION TABLES EXIST
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'page_definitions',
  'section_definitions', 
  'field_definitions',
  'page_permissions',
  'section_permissions',
  'field_permissions'
)
ORDER BY table_name;

-- 2. VERIFY PERMISSION_AUDIT_LOG TABLE EXISTS
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name = 'permission_audit_log';

-- 3. CHECK ROW LEVEL SECURITY (RLS) POLICIES
SELECT 
  tablename,
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'page_definitions',
  'section_definitions', 
  'field_definitions',
  'page_permissions',
  'section_permissions',
  'field_permissions',
  'permission_audit_log'
)
ORDER BY tablename, policyname;

-- 4. VERIFY SAMPLE DATA WAS INSERTED
SELECT 'SAMPLE DATA VERIFICATION' as check_type;

-- Check sample pages
SELECT 
  'Pages' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN page_name LIKE 'projects-roi' THEN 1 END) as roi_count,
  COUNT(CASE WHEN page_name LIKE 'sales-pipeline' THEN 1 END) as sales_count
FROM page_definitions;

-- Check sample sections  
SELECT 
  'Sections' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_financial = true THEN 1 END) as financial_count,
  COUNT(CASE WHEN is_financial = false THEN 1 END) as non_financial_count
FROM section_definitions;

-- Check sample fields
SELECT 
  'Fields' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_sensitive = true THEN 1 END) as sensitive_count,
  COUNT(CASE WHEN field_type = 'currency' THEN 1 END) as currency_count
FROM field_definitions;

-- 5. VERIFY PERMISSION MATRIX DATA
SELECT 'PERMISSION MATRIX VERIFICATION' as check_type;

-- Page permissions by user tier
SELECT 
  user_tier,
  COUNT(*) as page_permissions,
  COUNT(CASE WHEN permission_type = 'full' THEN 1 END) as full_access,
  COUNT(CASE WHEN permission_type = 'read_only' THEN 1 END) as read_only,
  COUNT(CASE WHEN permission_type = 'none' THEN 1 END) as no_access
FROM page_permissions 
GROUP BY user_tier
ORDER BY 
  CASE user_tier 
    WHEN 'master' THEN 1 
    WHEN 'senior' THEN 2 
    WHEN 'hr_finance' THEN 3 
    WHEN 'mid' THEN 4 
    WHEN 'external' THEN 5 
  END;

-- Field permissions by user tier
SELECT 
  user_tier,
  COUNT(*) as field_permissions,
  COUNT(CASE WHEN permission_type = 'full' THEN 1 END) as full_access,
  COUNT(CASE WHEN permission_type = 'read_only' THEN 1 END) as read_only,
  COUNT(CASE WHEN permission_type = 'none' THEN 1 END) as no_access
FROM field_permissions 
GROUP BY user_tier
ORDER BY 
  CASE user_tier 
    WHEN 'master' THEN 1 
    WHEN 'senior' THEN 2 
    WHEN 'hr_finance' THEN 3 
    WHEN 'mid' THEN 4 
    WHEN 'external' THEN 5 
  END;

-- 6. TEST BASIC PERMISSION QUERY
SELECT 'BASIC PERMISSION QUERY TEST' as check_type;

-- Test ROI page access for different user tiers
SELECT 
  pp.user_tier,
  pd.display_name as page_name,
  pp.permission_type,
  pp.can_read,
  pp.can_create,
  pp.can_update,
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

-- 7. TEST FIELD PERMISSION QUERY
-- Test financial field access (should be restricted)
SELECT 
  fp.user_tier,
  fd.display_name as field_name,
  fp.permission_type,
  fp.can_read,
  fp.can_update
FROM field_permissions fp
JOIN field_definitions fd ON fp.field_id = fd.id
WHERE fd.field_name = 'total_revenue'
ORDER BY 
  CASE fp.user_tier 
    WHEN 'master' THEN 1 
    WHEN 'senior' THEN 2 
    WHEN 'hr_finance' THEN 3 
    WHEN 'mid' THEN 4 
    WHEN 'external' THEN 5 
  END;

-- 8. VERIFY FOREIGN KEY CONSTRAINTS
SELECT 'FOREIGN KEY CONSTRAINTS' as check_type;

SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'page_permissions',
    'section_permissions',
    'field_permissions',
    'section_definitions',
    'field_definitions'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- 9. CHECK INDEXES FOR PERFORMANCE
SELECT 'INDEX VERIFICATION' as check_type;

SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'page_permissions',
    'section_permissions',
    'field_permissions'
  )
ORDER BY tablename, indexname;

-- 10. SUMMARY STATUS
SELECT 'DATABASE SETUP STATUS SUMMARY' as check_type;

WITH table_counts AS (
  SELECT 
    (SELECT COUNT(*) FROM page_definitions) as pages,
    (SELECT COUNT(*) FROM section_definitions) as sections,
    (SELECT COUNT(*) FROM field_definitions) as fields,
    (SELECT COUNT(*) FROM page_permissions) as page_perms,
    (SELECT COUNT(*) FROM section_permissions) as section_perms,
    (SELECT COUNT(*) FROM field_permissions) as field_perms
)
SELECT 
  CASE 
    WHEN pages >= 4 AND sections >= 5 AND fields >= 7 
         AND page_perms >= 15 AND field_perms >= 25
    THEN '✅ DATABASE SETUP COMPLETE'
    ELSE '❌ MISSING DATA - Check sample-permissions-data.sql'
  END as status,
  pages || ' pages, ' || 
  sections || ' sections, ' || 
  fields || ' fields, ' ||
  page_perms || ' page permissions, ' ||
  field_perms || ' field permissions' as details
FROM table_counts;