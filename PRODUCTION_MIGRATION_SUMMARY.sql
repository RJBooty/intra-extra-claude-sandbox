-- PRODUCTION DEPLOYMENT: Complete Permission System Migration
-- This consolidates all the fixes and enhancements we've made
-- Run this after the base migrations are applied

-- ===== FIXED MIGRATIONS APPLIED =====
-- ✅ 20250904150403_sweet_recipe.sql - FIXED (safe index creation)
-- ✅ 20250905_permissions_system.sql - FIXED (ON CONFLICT handling)  
-- ✅ 20250906_permissions_management_system.sql - Complete permissions
-- ✅ 20250909_complete_platform_pages.sql - All platform pages
-- ✅ 20250909_fix_projects_table.sql - Schema safety fixes

-- ===== VERIFICATION QUERIES =====
-- Run these to verify your production deployment

-- 1. Check all permission tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename LIKE '%permission%' 
   OR tablename LIKE '%definition%'
ORDER BY tablename;

-- 2. Check projects table has required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND table_schema = 'public'
  AND column_name IN ('client_id', 'status', 'current_phase', 'phase_progress')
ORDER BY ordinal_position;

-- 3. Count permission data
SELECT 
    'page_definitions' as table_name,
    COUNT(*) as record_count
FROM page_definitions
UNION ALL
SELECT 
    'section_definitions' as table_name,
    COUNT(*) as record_count  
FROM section_definitions
UNION ALL
SELECT 
    'field_definitions' as table_name,
    COUNT(*) as record_count
FROM field_definitions
UNION ALL
SELECT 
    'page_permissions' as table_name,
    COUNT(*) as record_count
FROM page_permissions;

-- 4. Check indexes exist
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('projects', 'page_permissions', 'section_permissions', 'field_permissions')
ORDER BY tablename, indexname;

-- 5. Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('projects', 'clients', 'page_definitions', 'page_permissions')
ORDER BY tablename;

-- 6. Test permission hierarchy (should return data for each user tier)
SELECT 
    user_tier,
    COUNT(*) as permission_count
FROM page_permissions 
GROUP BY user_tier
ORDER BY 
    CASE user_tier 
        WHEN 'master' THEN 1
        WHEN 'senior' THEN 2  
        WHEN 'mid' THEN 3
        WHEN 'external' THEN 4
        WHEN 'hr_finance' THEN 5
    END;

-- ===== SUCCESS INDICATORS =====
-- If all queries above return expected data, your deployment succeeded:

-- Expected Results:
-- 1. Should show ~8+ permission-related tables
-- 2. Projects should have: client_id, status, current_phase, phase_progress columns
-- 3. Should show: 15+ pages, 30+ sections, 50+ fields, 75+ page permissions  
-- 4. Should show multiple indexes on permission tables
-- 5. All permission tables should have rowsecurity = true
-- 6. Should show permission counts for all 5 user tiers

-- ===== PRODUCTION HEALTH CHECK =====
-- Run this query periodically to monitor system health

SELECT 
    'PERMISSION SYSTEM HEALTH CHECK - ' || NOW() as check_time,
    (SELECT COUNT(*) FROM page_definitions) as total_pages,
    (SELECT COUNT(*) FROM section_definitions) as total_sections,
    (SELECT COUNT(*) FROM field_definitions) as total_fields,
    (SELECT COUNT(*) FROM page_permissions) as total_page_permissions,
    (SELECT COUNT(DISTINCT user_tier) FROM page_permissions) as active_user_tiers,
    CASE 
        WHEN (SELECT COUNT(*) FROM page_definitions) >= 15 
         AND (SELECT COUNT(*) FROM page_permissions) >= 75
         AND (SELECT COUNT(DISTINCT user_tier) FROM page_permissions) = 5
        THEN '✅ SYSTEM HEALTHY'
        ELSE '⚠️ SYSTEM NEEDS ATTENTION'
    END as health_status;