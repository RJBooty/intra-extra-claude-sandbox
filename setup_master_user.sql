-- Setup tyson@casfid.com as Master user
-- Run this in Supabase Dashboard → SQL Editor if Role Management doesn't appear in settings

-- First, find the user ID for tyson@casfid.com
WITH user_lookup AS (
  SELECT id, email FROM auth.users WHERE email = 'tyson@casfid.com'
)
-- Update or insert Master role
INSERT INTO public.user_roles (user_id, role_type, role_level, assigned_by, is_active)
SELECT 
  u.id,
  'Master',
  1,
  u.id, -- Self-assigned for initial setup
  true
FROM user_lookup u
ON CONFLICT (user_id) 
DO UPDATE SET 
  role_type = 'Master',
  role_level = 1,
  is_active = true,
  assigned_at = NOW();

-- Verify the role was assigned
SELECT 
  up.email,
  ur.role_type,
  ur.role_level,
  ur.is_active,
  ur.assigned_at
FROM public.user_profiles up
JOIN public.user_roles ur ON up.id = ur.user_id
WHERE up.email = 'tyson@casfid.com';