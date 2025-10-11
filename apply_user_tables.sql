-- ============================================
-- USER PROFILES AND ROLES SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    job_title TEXT,
    department TEXT CHECK (department IN ('Operations', 'Sales', 'Technical', 'Finance', 'HR', 'Management')),
    office_location TEXT CHECK (office_location IN ('UK', 'Spain', 'Remote', 'Client Site')),
    employee_id TEXT,
    start_date DATE,
    manager_id UUID REFERENCES public.user_profiles(id),
    preferred_communication TEXT CHECK (preferred_communication IN ('email', 'phone', 'teams', 'slack')),
    timezone TEXT DEFAULT 'Europe/London',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    skills TEXT[],
    certifications TEXT[],
    languages TEXT[],
    daily_rate DECIMAL(10,2),
    currency TEXT DEFAULT 'GBP',
    tax_status TEXT CHECK (tax_status IN ('PAYE', 'Self-Employed', 'Limited Company', 'Overseas')),
    availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'unavailable', 'on_leave')) DEFAULT 'available',
    next_available_date DATE,
    travel_willingness TEXT CHECK (travel_willingness IN ('local', 'national', 'international', 'any')),
    passport_expiry DATE,
    visa_requirements TEXT[],
    insurance_valid_until DATE,
    dbs_check_date DATE,
    projects_completed INTEGER DEFAULT 0,
    total_days_worked INTEGER DEFAULT 0,
    average_client_rating DECIMAL(3,2),
    last_performance_review DATE,
    is_active BOOLEAN DEFAULT true,
    profile_completion_percentage INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_type TEXT NOT NULL CHECK (role_type IN ('Master', 'Senior', 'Mid', 'External', 'HR')),
    role_level INTEGER NOT NULL CHECK (role_level BETWEEN 1 AND 5),
    role_description TEXT,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint for one active role per user
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_roles_user_id_is_active_key'
    ) THEN
        ALTER TABLE public.user_roles
        ADD CONSTRAINT user_roles_user_id_is_active_key
        UNIQUE(user_id, is_active);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON public.user_profiles(department);
CREATE INDEX IF NOT EXISTS idx_user_profiles_office_location ON public.user_profiles(office_location);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON public.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type ON public.user_roles(role_type);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Master users can create profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master users can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Master users can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Master users can update roles" ON public.user_roles;

-- Create RLS policies for user_profiles
CREATE POLICY "Authenticated users can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Master users can update any profile"
    ON public.user_profiles FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles
            WHERE role_type = 'Master'
            AND is_active = true
        )
    );

-- Create RLS policies for user_roles
CREATE POLICY "Users can view roles"
    ON public.user_roles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Master users can assign roles"
    ON public.user_roles FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            auth.uid() IN (
                SELECT user_id FROM public.user_roles
                WHERE role_type = 'Master'
                AND is_active = true
            )
            OR NOT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1)
        )
    );

CREATE POLICY "Master users can update roles"
    ON public.user_roles FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_roles
            WHERE role_type = 'Master'
            AND is_active = true
        )
    );

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;

-- Create new triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    display_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      )
    ),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'User profiles and roles tables created successfully!';
    RAISE NOTICE 'Next step: Create your first user account, then run the bootstrap script';
END $$;
