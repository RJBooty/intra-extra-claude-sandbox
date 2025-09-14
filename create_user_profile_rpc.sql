-- Create RPC function to create user profile
CREATE OR REPLACE FUNCTION create_user_profile_safe(
  user_email TEXT,
  first_name_input TEXT,
  last_name_input TEXT
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  result json;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Insert or update user profile
  INSERT INTO user_profiles (
    id,
    email,
    first_name,
    last_name,
    display_name,
    created_at,
    updated_at
  ) VALUES (
    current_user_id,
    user_email,
    first_name_input,
    last_name_input,
    first_name_input || ' ' || last_name_input,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    updated_at = NOW()
  RETURNING to_json(user_profiles.*) INTO result;

  -- Also create or update user role
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
    current_user_id,
    'external', -- Default role
    5,
    current_user_id,
    NOW(),
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW()
  WHERE user_roles.user_id = current_user_id;

  RETURN result;
END;
$$;