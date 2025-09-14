-- Setup user profile for tyson@casfid.com
-- This will create the user profile and assign Master role

-- Insert user profile
INSERT INTO public.user_profiles (
  id,
  email,
  first_name,
  last_name,
  display_name,
  job_title,
  department,
  is_active
) VALUES (
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de',
  'tyson@casfid.com',
  'James',
  'Tyson',
  'James Tyson',
  'Platform Owner',
  'Technology',
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  display_name = EXCLUDED.display_name,
  job_title = EXCLUDED.job_title,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert user role (Master)
INSERT INTO public.user_roles (
  user_id,
  role_type,
  role_level,
  assigned_by,
  is_active
) VALUES (
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de',
  'Master',
  1,
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de',
  true
) ON CONFLICT (user_id) DO UPDATE SET
  role_type = EXCLUDED.role_type,
  role_level = EXCLUDED.role_level,
  is_active = EXCLUDED.is_active,
  assigned_at = NOW();

-- Insert user preferences
INSERT INTO public.user_preferences (
  user_id,
  theme,
  language,
  date_format,
  time_format,
  email_notifications,
  push_notifications,
  project_updates,
  system_alerts
) VALUES (
  'baafa0d7-04b5-4f85-a396-4d1ac159d1de',
  'light',
  'en',
  'DD/MM/YYYY',
  '24h',
  true,
  true,
  true,
  true
) ON CONFLICT (user_id) DO UPDATE SET
  theme = EXCLUDED.theme,
  updated_at = NOW();

-- Success message
SELECT 'User profile for James Tyson (tyson@casfid.com) has been created successfully!' as result;