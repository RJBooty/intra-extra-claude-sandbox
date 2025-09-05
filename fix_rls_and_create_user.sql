-- Run this in your Supabase SQL Editor to fix the RLS issues and create your user profile
-- This will fix the infinite recursion and create James Tyson as master user

-- Temporarily disable RLS to avoid recursion
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop problematic policies
DROP POLICY IF EXISTS "Master users can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Master users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master/Senior can update profiles" ON public.user_profiles;

-- Insert James Tyson's profile
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
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid,
  'tyson@casfid.com',
  'James',
  'Tyson',
  'James Tyson',
  'Platform Owner',
  'Technology',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  display_name = EXCLUDED.display_name,
  job_title = EXCLUDED.job_title,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert James Tyson's master role
INSERT INTO public.user_roles (
  user_id,
  role_type,
  role_level,
  assigned_by,
  assigned_at,
  is_active
) VALUES (
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid,
  'Master',
  1,
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid,
  NOW(),
  true
) ON CONFLICT (user_id) DO UPDATE SET
  role_type = EXCLUDED.role_type,
  role_level = EXCLUDED.role_level,
  is_active = EXCLUDED.is_active,
  assigned_at = NOW();

-- Insert James Tyson's preferences
INSERT INTO public.user_preferences (
  user_id,
  theme,
  language,
  date_format,
  time_format,
  email_notifications,
  push_notifications,
  project_updates,
  system_alerts,
  created_at,
  updated_at
) VALUES (
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid,
  'light',
  'en',
  'DD/MM/YYYY',
  '24h',
  true,
  true,
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  theme = EXCLUDED.theme,
  updated_at = NOW();

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create safe policies that don't cause recursion
-- Hard-code James Tyson's UUID to avoid recursive policy checks

-- Master users can view all profiles (using hardcoded UUID)
CREATE POLICY "Master users can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = 'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid OR
    auth.uid() = id
  );

-- Master/Senior can update profiles (using hardcoded UUID)
CREATE POLICY "Master/Senior can update profiles" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() = 'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid OR
    auth.uid() = id
  );

-- Master users can manage all roles (using hardcoded UUID to avoid recursion)
CREATE POLICY "Master users can manage all roles" ON public.user_roles
  FOR ALL USING (
    auth.uid() = 'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid OR
    user_id = auth.uid()
  );

-- Success message
SELECT 'James Tyson user profile created successfully! RLS policies fixed.' as result;