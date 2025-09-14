-- Create profile for tyson@casfid.com and assign Master role
-- Run this in Supabase Dashboard → SQL Editor

-- First, let's check if the profile exists
DO $$
DECLARE
    user_id UUID;
    profile_exists BOOLEAN := FALSE;
    role_exists BOOLEAN := FALSE;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'tyson@casfid.com';
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User tyson@casfid.com not found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user ID: %', user_id;
    
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE id = user_id) INTO profile_exists;
    
    -- Create profile if it doesn't exist
    IF NOT profile_exists THEN
        RAISE NOTICE 'Creating user profile...';
        INSERT INTO public.user_profiles (
            id, 
            email, 
            first_name, 
            last_name, 
            display_name, 
            job_title, 
            department,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            'tyson@casfid.com',
            'James',
            'Tyson', 
            'James Tyson',
            'Platform Owner',
            'Technology',
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Profile created successfully';
    ELSE
        RAISE NOTICE 'Profile already exists, updating...';
        UPDATE public.user_profiles 
        SET 
            first_name = 'James',
            last_name = 'Tyson',
            display_name = 'James Tyson',
            job_title = 'Platform Owner',
            department = 'Technology',
            updated_at = NOW()
        WHERE id = user_id;
        RAISE NOTICE 'Profile updated successfully';
    END IF;
    
    -- Create preferences if they don't exist
    INSERT INTO public.user_preferences (user_id) 
    VALUES (user_id)
    ON CONFLICT (user_id) DO NOTHING;
    RAISE NOTICE 'Preferences ensured';
    
    -- Check if role exists
    SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = user_id AND is_active = true) INTO role_exists;
    
    -- Create or update role
    IF NOT role_exists THEN
        RAISE NOTICE 'Creating Master role...';
        INSERT INTO public.user_roles (user_id, role_type, role_level, assigned_by, is_active)
        VALUES (user_id, 'Master', 1, user_id, true);
        RAISE NOTICE 'Master role created successfully';
    ELSE
        RAISE NOTICE 'Updating existing role to Master...';
        UPDATE public.user_roles 
        SET 
            role_type = 'Master',
            role_level = 1,
            is_active = true,
            assigned_at = NOW(),
            assigned_by = user_id
        WHERE user_id = user_id;
        RAISE NOTICE 'Role updated to Master successfully';
    END IF;
    
END $$;

-- Verify the setup
SELECT 
    'Profile Check' as check_type,
    up.id,
    up.email,
    up.first_name,
    up.last_name,
    up.display_name,
    up.job_title,
    up.department,
    up.is_active
FROM public.user_profiles up
WHERE up.email = 'tyson@casfid.com'

UNION ALL

SELECT 
    'Role Check' as check_type,
    ur.user_id::text as id,
    ur.role_type as email,
    ur.role_level::text as first_name,
    ur.is_active::text as last_name,
    ur.assigned_at::text as display_name,
    '' as job_title,
    '' as department,
    true as is_active
FROM public.user_roles ur
JOIN public.user_profiles up ON up.id = ur.user_id
WHERE up.email = 'tyson@casfid.com' AND ur.is_active = true;

-- Final verification query
SELECT 
    'FINAL VERIFICATION' as status,
    up.email,
    up.display_name,
    ur.role_type,
    ur.role_level,
    CASE WHEN up.id IS NOT NULL THEN 'Profile Exists' ELSE 'Profile Missing' END as profile_status,
    CASE WHEN ur.id IS NOT NULL THEN 'Role Exists' ELSE 'Role Missing' END as role_status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
LEFT JOIN public.user_roles ur ON au.id = ur.user_id AND ur.is_active = true
WHERE au.email = 'tyson@casfid.com';