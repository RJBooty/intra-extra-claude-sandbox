-- Complete User Profile Fix
-- Handles current user AND all future users

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    job_title VARCHAR(100),
    department VARCHAR(100),
    office_location VARCHAR(255),
    timezone VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    gender VARCHAR(50),
    date_of_birth DATE,
    nationality VARCHAR(100),
    bio TEXT,
    home_address TEXT,
    work_phone VARCHAR(50),
    job_description TEXT,
    primary_role VARCHAR(100),
    secondary_role VARCHAR(100),
    years_experience VARCHAR(50),
    passport_number VARCHAR(100),
    passport_expiry DATE,
    passport_country VARCHAR(100),
    license_number VARCHAR(100),
    license_country VARCHAR(100),
    license_expiry DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_relationship_other VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    allergies TEXT,
    dietary_requirements VARCHAR(100),
    dietary_requirements_other VARCHAR(100),
    general_notes TEXT,
    preferred_communication VARCHAR(50),
    start_date DATE,
    manager_id UUID,
    last_login TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;

-- Insert the current user profile
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
) VALUES (
    'f5b6855d-35ab-4136-b360-7e307fdd325a',
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
) ON CONFLICT (id) DO NOTHING;

-- Create profiles for ALL existing auth users that don't have profiles
INSERT INTO public.user_profiles (id, email, display_name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as display_name,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Create function to automatically create user profile on new user signup
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
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile for future users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();