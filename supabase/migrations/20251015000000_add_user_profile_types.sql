-- Add profile type and related fields to user_profiles table
-- This migration implements the three-tier profile system:
-- 1. Internal Office (standard CASFID employees)
-- 2. External (contractors/freelancers)
-- 3. Internal Field Operations (CASFID employees with field operations mode)

-- Add profile_type column
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'Internal Office'
CHECK (profile_type IN ('Internal Office', 'External', 'Internal Field Operations'));

-- Add field operations mode flag
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS field_operations_mode_enabled BOOLEAN DEFAULT FALSE;

-- Add salary field for Internal Office users (encrypted/sensitive)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS annual_salary NUMERIC(12,2);

-- Add payment history type indicator
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS payment_history_type TEXT DEFAULT 'invoice'
CHECK (payment_history_type IN ('invoice', 'paye', 'salary'));

-- Add messaging platform handles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS teams_handle TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS slack_handle TEXT;

-- Add line manager relationship (for viewing permissions)
-- manager_id already exists in the table

-- Add access level request tracking
CREATE TABLE IF NOT EXISTS access_level_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    current_access_level TEXT NOT NULL,
    requested_access_level TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_level_requests_user_id
ON access_level_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_access_level_requests_status
ON access_level_requests(status);

-- Add RLS policies for access_level_requests
ALTER TABLE access_level_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own access level requests"
    ON access_level_requests FOR SELECT
    USING (user_id = auth.uid());

-- Users can create their own requests
CREATE POLICY "Users can create access level requests"
    ON access_level_requests FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Master, HR, and Finance users can view all requests
CREATE POLICY "Privileged users can view all requests"
    ON access_level_requests FOR SELECT
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
            AND up.department = 'Finance'
        )
    );

-- Master and HR users can update requests (approve/reject)
CREATE POLICY "Privileged users can update requests"
    ON access_level_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_type IN ('Master', 'HR')
            AND ur.is_active = true
        )
    );

-- Add updated_at trigger for access_level_requests
CREATE OR REPLACE FUNCTION update_access_level_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER access_level_requests_updated_at
    BEFORE UPDATE ON access_level_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_access_level_requests_updated_at();

-- Create notification function for access level requests
CREATE OR REPLACE FUNCTION notify_access_level_request()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be extended to create notifications
    -- For now, it's a placeholder for future notification system integration
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER access_level_request_created
    AFTER INSERT ON access_level_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_access_level_request();

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.profile_type IS 'User profile type: Internal Office, External, or Internal Field Operations';
COMMENT ON COLUMN user_profiles.field_operations_mode_enabled IS 'Whether field operations mode is enabled for Internal Office users';
COMMENT ON COLUMN user_profiles.annual_salary IS 'Annual salary for Internal Office users (sensitive data)';
COMMENT ON COLUMN user_profiles.payment_history_type IS 'Type of payment history: invoice (External), paye (Internal Office), or salary (Internal Office)';
COMMENT ON COLUMN user_profiles.teams_handle IS 'Microsoft Teams handle/username for direct messaging';
COMMENT ON COLUMN user_profiles.slack_handle IS 'Slack handle/username for direct messaging';
COMMENT ON TABLE access_level_requests IS 'Tracks user requests for higher access levels';
