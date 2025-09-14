-- Add missing columns to user_profiles table for Profile Settings page
-- This migration adds all the columns that are being used in the UserProfilePage component

-- Add personal information columns
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS home_address TEXT,
ADD COLUMN IF NOT EXISTS work_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS office_location VARCHAR(255),

-- Job related columns
ADD COLUMN IF NOT EXISTS job_description TEXT,
ADD COLUMN IF NOT EXISTS primary_role VARCHAR(100),
ADD COLUMN IF NOT EXISTS secondary_role VARCHAR(100),
ADD COLUMN IF NOT EXISTS years_experience VARCHAR(50),

-- Document columns
ADD COLUMN IF NOT EXISTS passport_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS passport_expiry DATE,
ADD COLUMN IF NOT EXISTS passport_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_expiry DATE,

-- Emergency contact columns
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_relationship_other VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),

-- Medical information
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS dietary_requirements VARCHAR(100),
ADD COLUMN IF NOT EXISTS dietary_requirements_other VARCHAR(100),

-- Other columns
ADD COLUMN IF NOT EXISTS general_notes TEXT,
ADD COLUMN IF NOT EXISTS preferred_communication VARCHAR(50),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES auth.users(id);

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON public.user_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nationality ON public.user_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_user_profiles_office_location ON public.user_profiles(office_location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- Update RLS policies to include new columns
-- Allow users to update their own profile with all new fields
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to view profiles based on permissions
DROP POLICY IF EXISTS "Users can view profiles based on permissions" ON public.user_profiles;
CREATE POLICY "Users can view profiles based on permissions" ON public.user_profiles
    FOR SELECT
    USING (
        auth.uid() = id -- Users can always view their own profile
        OR EXISTS ( -- Or check if they have permission to view others
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role_type IN ('Master', 'Senior', 'Mid')
        )
    );

-- Add comment to document the purpose of these columns
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information for the IntraExtra platform';
COMMENT ON COLUMN public.user_profiles.gender IS 'User gender preference';
COMMENT ON COLUMN public.user_profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.user_profiles.nationality IS 'User nationality';
COMMENT ON COLUMN public.user_profiles.bio IS 'User biography/introduction';
COMMENT ON COLUMN public.user_profiles.emergency_contact_name IS 'Emergency contact full name';
COMMENT ON COLUMN public.user_profiles.emergency_contact_relationship IS 'Relationship to emergency contact';
COMMENT ON COLUMN public.user_profiles.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN public.user_profiles.allergies IS 'Medical allergies information';
COMMENT ON COLUMN public.user_profiles.dietary_requirements IS 'Dietary requirements or restrictions';