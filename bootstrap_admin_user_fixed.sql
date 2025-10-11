-- ============================================
-- BOOTSTRAP ADMIN USER (FIXED)
-- Run this AFTER creating tyson@casfid.com account
-- Run this in Supabase SQL Editor
-- ============================================

-- Bootstrap tyson@casfid.com as Master user
DO $$
DECLARE
    tyson_id UUID;
BEGIN
    -- Get Tyson's user ID
    SELECT id INTO tyson_id
    FROM auth.users
    WHERE email = 'tyson@casfid.com'
    LIMIT 1;

    IF tyson_id IS NULL THEN
        RAISE EXCEPTION 'User tyson@casfid.com not found. Please create the account first.';
    END IF;

    -- Create or update user profile
    INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        display_name,
        job_title,
        department,
        is_active,
        onboarding_completed
    ) VALUES (
        tyson_id,
        'tyson@casfid.com',
        'James',
        'Tyson',
        'James Tyson',
        'Platform Owner',
        'Management',
        true,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        display_name = EXCLUDED.display_name,
        job_title = EXCLUDED.job_title,
        department = EXCLUDED.department,
        is_active = true,
        onboarding_completed = true,
        updated_at = NOW();

    -- Delete all existing roles for this user (to avoid constraint issues)
    DELETE FROM public.user_roles
    WHERE user_id = tyson_id;

    -- Create Master role
    INSERT INTO public.user_roles (
        user_id,
        role_type,
        role_level,
        role_description,
        is_active
    ) VALUES (
        tyson_id,
        'Master',
        1,
        'Platform administrator with full access',
        true
    );

    RAISE NOTICE 'Successfully bootstrapped tyson@casfid.com as Master user';
    RAISE NOTICE 'User ID: %', tyson_id;
END $$;

-- Verify the setup
SELECT
    up.email,
    up.display_name,
    up.job_title,
    ur.role_type,
    ur.role_level,
    ur.is_active
FROM public.user_profiles up
JOIN public.user_roles ur ON up.id = ur.user_id
WHERE up.email = 'tyson@casfid.com';
