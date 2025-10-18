-- Add preference fields to user_profiles table
-- These fields are used in the Preferences tab

-- Event and Role Preferences
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_event_type TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_role_type TEXT;

-- Work Preferences (boolean flags)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS willing_to_work_unsociable_hours BOOLEAN DEFAULT false;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS interested_in_team_leader_roles BOOLEAN DEFAULT false;

-- Communication Preferences (boolean flags)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email_job_alerts BOOLEAN DEFAULT true;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS receive_newsletter BOOLEAN DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.preferred_event_type IS 'User''s preferred event type (Corporate Events, Music Festivals, etc.)';
COMMENT ON COLUMN user_profiles.preferred_role_type IS 'User''s preferred role type (Technical, Logistics, etc.)';
COMMENT ON COLUMN user_profiles.willing_to_work_unsociable_hours IS 'User is willing to work unsociable hours';
COMMENT ON COLUMN user_profiles.interested_in_team_leader_roles IS 'User is interested in team leader roles';
COMMENT ON COLUMN user_profiles.email_job_alerts IS 'User wants to receive email job alerts';
COMMENT ON COLUMN user_profiles.sms_notifications IS 'User wants to receive SMS notifications for urgent updates';
COMMENT ON COLUMN user_profiles.receive_newsletter IS 'User wants to receive company newsletter';
