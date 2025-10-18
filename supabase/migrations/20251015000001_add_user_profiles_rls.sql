-- Add Row Level Security policies to user_profiles table
-- This ensures that users can only access/modify their own data unless they have elevated permissions

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (safety check)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Privileged users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Master users can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Line managers can view direct reports" ON user_profiles;
DROP POLICY IF EXISTS "No deletes allowed" ON user_profiles;

-- =====================================================
-- SELECT (View) Policies
-- =====================================================

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (id = auth.uid());

-- 2. Privileged users (Master, HR, Finance) can view all profiles
CREATE POLICY "Privileged users can view all profiles"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_type IN ('Master', 'HR')
            AND ur.is_active = true
        )
        OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.department IN ('Finance', 'HR', 'Management')
        )
    );

-- 3. Line managers can view their direct reports' profiles
CREATE POLICY "Line managers can view direct reports"
    ON user_profiles FOR SELECT
    USING (
        manager_id = auth.uid()
    );

-- =====================================================
-- INSERT Policies
-- =====================================================

-- Users can insert their own profile (on first login/signup)
CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- =====================================================
-- UPDATE Policies
-- =====================================================

-- 1. Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 2. Master users can update any profile
CREATE POLICY "Master users can update any profile"
    ON user_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_type = 'Master'
            AND ur.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_type = 'Master'
            AND ur.is_active = true
        )
    );

-- =====================================================
-- DELETE Policy
-- =====================================================

-- No one can delete user profiles - they should be deactivated instead using is_active flag
-- This policy explicitly denies all deletes
CREATE POLICY "No deletes allowed"
    ON user_profiles FOR DELETE
    USING (false);

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON POLICY "Users can view own profile" ON user_profiles IS
'Allows users to view their own profile data';

COMMENT ON POLICY "Privileged users can view all profiles" ON user_profiles IS
'Allows Master, HR, Finance, and Management users to view all user profiles';

COMMENT ON POLICY "Line managers can view direct reports" ON user_profiles IS
'Allows managers to view profiles of users who report to them';

COMMENT ON POLICY "Users can insert own profile" ON user_profiles IS
'Allows users to create their own profile on first login';

COMMENT ON POLICY "Users can update own profile" ON user_profiles IS
'Allows users to update only their own profile data';

COMMENT ON POLICY "Master users can update any profile" ON user_profiles IS
'Allows Master users to update any user profile for administrative purposes';

COMMENT ON POLICY "No deletes allowed" ON user_profiles IS
'Prevents deletion of user profiles - use is_active flag to deactivate instead';
