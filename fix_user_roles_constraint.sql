-- ============================================
-- FIX USER ROLES CONSTRAINT
-- This fixes the unique constraint to only enforce
-- one ACTIVE role per user, not one inactive role
-- ============================================

-- Drop the problematic constraint
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_is_active_key;

-- Create a better constraint using a partial unique index
-- This only enforces uniqueness for is_active = true
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_one_active_per_user
ON public.user_roles (user_id)
WHERE is_active = true;

-- Verify the constraint
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_roles';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Constraint fixed! Now only one active role per user is enforced.';
    RAISE NOTICE 'Users can have multiple inactive roles in their history.';
END $$;
