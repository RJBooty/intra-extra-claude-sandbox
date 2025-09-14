-- Create user profile for the current authenticated user
INSERT INTO user_profiles (
  id,
  email,
  first_name,
  last_name,
  display_name,
  created_at,
  updated_at
) VALUES (
  'bbcb684b-5895-4aeb-bb89-dea8bc200df4',
  'j.r.tyson@outlook.com',
  'JR',
  'TY',
  'JR TY',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  display_name = EXCLUDED.display_name,
  updated_at = NOW();

-- Also create a user role entry
INSERT INTO user_roles (
  user_id,
  role_type,
  role_level,
  assigned_by,
  assigned_at,
  is_active,
  created_at,
  updated_at
) VALUES (
  'bbcb684b-5895-4aeb-bb89-dea8bc200df4',
  'master',
  1,
  'bbcb684b-5895-4aeb-bb89-dea8bc200df4',
  NOW(),
  true,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  role_type = EXCLUDED.role_type,
  role_level = EXCLUDED.role_level,
  updated_at = NOW();