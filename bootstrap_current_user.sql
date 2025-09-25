-- Bootstrap script for current logged-in user
-- Run this in your Supabase SQL editor

-- First, let's see what users exist
SELECT 'Current users in auth.users:' as info;
SELECT email, id, created_at FROM auth.users ORDER BY created_at;

-- Check if tables exist
SELECT 'Checking if user_profiles table exists:' as info;
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'user_profiles'
) as user_profiles_exists;

SELECT 'Checking if user_roles table exists:' as info;
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'user_roles'
) as user_roles_exists;

-- Bootstrap the current user (tyson@tundratides.com)
DO $$
DECLARE
  tyson_id UUID := 'f5b6855d-35ab-4136-b360-7e307fdd325a';
  tyson_email TEXT := 'tyson@tundratides.com';
BEGIN
  -- Check if tables exist first
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    -- Create/update profile
    INSERT INTO public.user_profiles (
      id, email, first_name, last_name, display_name,
      job_title, department, is_active, onboarding_completed,
      created_at, updated_at
    ) VALUES (
      tyson_id,
      tyson_email,
      'James',
      'Tyson',
      'James Tyson',
      'Platform Owner',
      'Management',
      true,
      true,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      first_name = 'James',
      last_name = 'Tyson',
      display_name = 'James Tyson',
      job_title = 'Platform Owner',
      department = 'Management',
      is_active = true,
      onboarding_completed = true,
      updated_at = NOW();

    RAISE NOTICE 'User profile updated for %', tyson_email;
  ELSE
    RAISE NOTICE 'user_profiles table does not exist - please run the main setup script first';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    -- Deactivate existing roles
    UPDATE public.user_roles SET is_active = false WHERE user_id = tyson_id;

    -- Create Master role
    INSERT INTO public.user_roles (
      user_id, role_type, role_level, role_description, is_active,
      created_at, updated_at
    ) VALUES (
      tyson_id,
      'Master',
      1,
      'Platform administrator with full access',
      true,
      NOW(),
      NOW()
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Master role assigned to %', tyson_email;
  ELSE
    RAISE NOTICE 'user_roles table does not exist - please run the main setup script first';
  END IF;
END;
$$;

-- Verify the setup
SELECT 'Verification - User Profile:' as info;
SELECT * FROM public.user_profiles WHERE id = 'f5b6855d-35ab-4136-b360-7e307fdd325a';

SELECT 'Verification - User Role:' as info;
SELECT * FROM public.user_roles WHERE user_id = 'f5b6855d-35ab-4136-b360-7e307fdd325a' AND is_active = true;