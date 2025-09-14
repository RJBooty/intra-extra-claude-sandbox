-- Fix User Profile for tyson@tundratides.com
-- Creates the missing user profile record

-- First, ensure the user_profiles table exists with basic structure
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

-- Insert profile for the specific user if it doesn't exist
-- Replace f5b6855d-35ab-4136-b360-7e307fdd325a with the actual user ID from your logs
INSERT INTO public.user_profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    job_title, 
    department, 
    office_location, 
    timezone, 
    is_active,
    created_at, 
    updated_at
) 
SELECT 
    'f5b6855d-35ab-4136-b360-7e307fdd325a'::uuid,
    'tyson@tundratides.com',
    'Tundra',
    'Tides', 
    'Tundra Tides',
    'Senior Project Manager',
    'Operations',
    'London, UK',
    'Europe/London',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = 'f5b6855d-35ab-4136-b360-7e307fdd325a'::uuid
);

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
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comment
COMMENT ON TABLE public.user_profiles IS 'User profile information for the IntraExtra platform, automatically created for each auth user';