-- Fix user roles RLS policies to prevent infinite recursion
-- This migration fixes the circular dependency in user_roles policies

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Master users can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Master users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master/Senior can update profiles" ON public.user_profiles;

-- Disable RLS temporarily to insert the first master user
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Insert James Tyson as master user (safe operation without RLS)
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
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de',
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

-- Insert master role for James Tyson
INSERT INTO public.user_roles (
  user_id,
  role_type,
  role_level,
  assigned_by,
  assigned_at,
  is_active
) VALUES (
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de',
  'Master',
  1,
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de',
  NOW(),
  true
) ON CONFLICT (user_id) DO UPDATE SET
  role_type = EXCLUDED.role_type,
  role_level = EXCLUDED.role_level,
  is_active = EXCLUDED.is_active,
  assigned_at = NOW();

-- Insert default preferences for James Tyson
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
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de',
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

-- Create non-recursive policies
-- Users can always view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can always update their own profile  
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can always view their own role
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Special policy for master users to view all profiles (checks hardcoded master user)
CREATE POLICY "Master users can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = 'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid OR
    auth.uid() = id
  );

-- Special policy for master users to update profiles (checks hardcoded master user)
CREATE POLICY "Master/Senior can update profiles" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() = 'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid OR
    auth.uid() = id
  );

-- Master users can manage all roles (checks hardcoded master user to avoid recursion)
CREATE POLICY "Master users can manage all roles" ON public.user_roles
  FOR ALL USING (
    auth.uid() = 'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid OR
    user_id = auth.uid()
  );

-- Allow master user to insert new roles
CREATE POLICY "Master can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (
    auth.uid() = 'baafa0d7-04b5-4f85-a396-4d1ac159d1de'::uuid
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'User roles RLS policies fixed and James Tyson master user created successfully!';
END $$;