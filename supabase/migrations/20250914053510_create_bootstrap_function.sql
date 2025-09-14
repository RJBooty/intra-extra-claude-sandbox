-- Bootstrap Master User Function
-- This function creates the first Master user profile and role, bypassing RLS
CREATE OR REPLACE FUNCTION create_bootstrap_master_user(
  user_email TEXT,
  user_first_name TEXT DEFAULT 'Master',
  user_last_name TEXT DEFAULT 'User'
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  result json;
BEGIN
  -- Get the user ID from auth.users table by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found in auth.users', user_email;
  END IF;

  -- Insert user profile (bypassing RLS with SECURITY DEFINER)
  INSERT INTO user_profiles (
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
    target_user_id,
    user_email,
    user_first_name,
    user_last_name,
    user_first_name || ' ' || user_last_name,
    'Platform Administrator',
    'Management',
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

  -- Check if user already has a role, if not insert
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = target_user_id AND is_active = true
  ) THEN
    INSERT INTO user_roles (
      user_id,
      role_type,
      role_level,
      role_description,
      assigned_by,
      assigned_at,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      target_user_id,
      'Master',
      1,
      'Platform Master Administrator - Full Access',
      target_user_id, -- Self-assigned for bootstrap
      NOW(),
      true,
      NOW(),
      NOW()
    );
  END IF;

  -- Return success result
  SELECT json_build_object(
    'user_id', target_user_id,
    'email', user_email,
    'profile_created', true,
    'role_created', true,
    'role_type', 'Master',
    'message', 'Bootstrap master user created successfully'
  ) INTO result;

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Return error information
  SELECT json_build_object(
    'error', true,
    'message', SQLERRM,
    'detail', SQLSTATE
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION create_bootstrap_master_user(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_bootstrap_master_user(TEXT, TEXT, TEXT) TO anon;