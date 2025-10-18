-- Add missing columns to user_profiles table
-- These fields are used in the User Profile UI but weren't in the original schema

-- Personal Information Fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS gender TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS nationality TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS home_address TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS work_phone TEXT;

-- Emergency Contact Fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Health & Dietary Fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS allergies TEXT;

-- Document & Compliance Fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS passport_number TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS passport_country TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS license_number TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS license_country TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS license_expiry DATE;

-- Job Information Fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS job_description TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS primary_role TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS secondary_role TEXT;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- Notes Field
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS general_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.bio IS 'User biography or professional summary';
COMMENT ON COLUMN user_profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN user_profiles.gender IS 'User gender';
COMMENT ON COLUMN user_profiles.nationality IS 'User nationality';
COMMENT ON COLUMN user_profiles.home_address IS 'User home address';
COMMENT ON COLUMN user_profiles.work_phone IS 'Work phone number';
COMMENT ON COLUMN user_profiles.emergency_contact_relationship IS 'Relationship to emergency contact';
COMMENT ON COLUMN user_profiles.dietary_requirements IS 'Dietary restrictions or requirements';
COMMENT ON COLUMN user_profiles.allergies IS 'Known allergies';
COMMENT ON COLUMN user_profiles.passport_number IS 'Passport number';
COMMENT ON COLUMN user_profiles.passport_country IS 'Passport issuing country';
COMMENT ON COLUMN user_profiles.license_number IS 'Driving license number';
COMMENT ON COLUMN user_profiles.license_country IS 'Driving license issuing country';
COMMENT ON COLUMN user_profiles.license_expiry IS 'Driving license expiry date';
COMMENT ON COLUMN user_profiles.job_description IS 'Detailed job description';
COMMENT ON COLUMN user_profiles.primary_role IS 'Primary role in events/projects';
COMMENT ON COLUMN user_profiles.secondary_role IS 'Secondary role in events/projects';
COMMENT ON COLUMN user_profiles.years_experience IS 'Years of experience in the field';
COMMENT ON COLUMN user_profiles.general_notes IS 'General notes about the user';
