-- Test query to verify our profile data exists
-- Run this in Supabase Dashboard → SQL Editor to verify everything is set up correctly

-- Check if your profile exists
SELECT 'Profile Check' as test_name, 
       CASE WHEN EXISTS(
         SELECT 1 FROM public.user_profiles 
         WHERE email = 'tyson@casfid.com'
       ) THEN '✅ Profile EXISTS' ELSE '❌ Profile MISSING' END as result;

-- Check if your role exists  
SELECT 'Role Check' as test_name,
       CASE WHEN EXISTS(
         SELECT 1 FROM public.user_roles ur
         JOIN public.user_profiles up ON ur.user_id = up.id
         WHERE up.email = 'tyson@casfid.com' 
         AND ur.is_active = true
       ) THEN '✅ Role EXISTS' ELSE '❌ Role MISSING' END as result;

-- Show your actual profile data
SELECT 'Profile Data' as test_name,
       up.email,
       up.display_name,
       up.first_name,
       up.last_name,
       ur.role_type,
       ur.role_level
FROM public.user_profiles up
LEFT JOIN public.user_roles ur ON up.id = ur.user_id AND ur.is_active = true
WHERE up.email = 'tyson@casfid.com';

-- Test the exact query the app is trying to run
SELECT 'App Query Test' as test_name,
       up.*,
       json_build_object(
         'id', ur.id,
         'role_type', ur.role_type,
         'role_level', ur.role_level,
         'assigned_by', ur.assigned_by,
         'assigned_at', ur.assigned_at,
         'is_active', ur.is_active
       ) as role,
       json_build_object(
         'theme', pref.theme,
         'language', pref.language
       ) as preferences
FROM public.user_profiles up
LEFT JOIN public.user_roles ur ON up.id = ur.user_id AND ur.is_active = true  
LEFT JOIN public.user_preferences pref ON up.id = pref.user_id
WHERE up.id = (SELECT id FROM auth.users WHERE email = 'tyson@casfid.com');