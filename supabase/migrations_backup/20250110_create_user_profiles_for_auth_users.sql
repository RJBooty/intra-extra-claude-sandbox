-- Create user profiles for all existing authenticated users
-- This ensures every auth user has a corresponding profile record

-- First, create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    job_title VARCHAR(100),
    department VARCHAR(100),
    office_location VARCHAR(255),
    start_date DATE,
    manager_id UUID REFERENCES auth.users(id),
    preferred_communication VARCHAR(50),
    timezone VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Personal information columns
    gender VARCHAR(50),
    date_of_birth DATE,
    nationality VARCHAR(100),
    bio TEXT,
    home_address TEXT,
    work_phone VARCHAR(50),
    
    -- Job related columns
    job_description TEXT,
    primary_role VARCHAR(100),
    secondary_role VARCHAR(100),
    years_experience VARCHAR(50),
    
    -- Document columns
    passport_number VARCHAR(100),
    passport_expiry DATE,
    passport_country VARCHAR(100),
    license_number VARCHAR(100),
    license_country VARCHAR(100),
    license_expiry DATE,
    
    -- Emergency contact columns
    emergency_contact_name VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_relationship_other VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    
    -- Medical information
    allergies TEXT,
    dietary_requirements VARCHAR(100),
    dietary_requirements_other VARCHAR(100),
    
    -- Other columns
    general_notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- Insert profiles for all existing auth users that don't have a profile yet
INSERT INTO public.user_profiles (id, email, display_name, created_at, updated_at)
SELECT 
    auth.users.id,
    auth.users.email,
    COALESCE(auth.users.raw_user_meta_data->>'full_name', auth.users.email),
    auth.users.created_at,
    NOW()
FROM auth.users
LEFT JOIN public.user_profiles ON auth.users.id = public.user_profiles.id
WHERE public.user_profiles.id IS NULL;

-- Update existing profiles with email if missing
UPDATE public.user_profiles
SET email = auth.users.email
FROM auth.users
WHERE public.user_profiles.id = auth.users.id
AND public.user_profiles.email IS NULL;

-- Create or replace function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        email,
        display_name,
        created_at,
        updated_at
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- Add specific profile data for known users
UPDATE public.user_profiles
SET 
    first_name = 'Tundra',
    last_name = 'Tides',
    display_name = 'Tundra Tides',
    job_title = 'Senior Project Manager',
    department = 'Operations',
    office_location = 'London, UK',
    timezone = 'Europe/London',
    is_active = true
WHERE email = 'tyson@tundratides.com';

UPDATE public.user_profiles
SET 
    first_name = 'James',
    last_name = 'Tyson',
    display_name = 'James Tyson',
    job_title = 'Platform Owner',
    department = 'Executive',
    office_location = 'London, UK',
    timezone = 'Europe/London',
    is_active = true
WHERE email = 'tyson@casfid.com';

-- Add comment documenting the table
COMMENT ON TABLE public.user_profiles IS 'User profile information for the IntraExtra platform, automatically created for each auth user';