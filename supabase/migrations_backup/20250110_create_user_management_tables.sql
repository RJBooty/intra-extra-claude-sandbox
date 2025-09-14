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
    timezone TEXT,
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, is_active) -- Only one active role per user
);

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

-- Create RLS policies for user_profiles
-- Everyone can view active profiles
CREATE POLICY "Public profiles are viewable by authenticated users" 
    ON public.user_profiles FOR SELECT 
    USING (auth.uid() IS NOT NULL AND is_active = true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.user_profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Master users can insert new profiles
CREATE POLICY "Master users can create profiles" 
    ON public.user_profiles FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role_type = 'Master' 
            AND is_active = true
        )
    );

-- Master users can update any profile
CREATE POLICY "Master users can update any profile" 
    ON public.user_profiles FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role_type = 'Master' 
            AND is_active = true
        )
    );

-- Create RLS policies for user_roles
-- Everyone can view roles
CREATE POLICY "Roles are viewable by authenticated users" 
    ON public.user_roles FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Only Master users can insert roles
CREATE POLICY "Master users can assign roles" 
    ON public.user_roles FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role_type = 'Master' 
            AND is_active = true
        )
    );

-- Only Master users can update roles
CREATE POLICY "Master users can update roles" 
    ON public.user_roles FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role_type = 'Master' 
            AND is_active = true
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create triggers if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at 
            BEFORE UPDATE ON public.user_profiles 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_roles_updated_at') THEN
        CREATE TRIGGER update_user_roles_updated_at 
            BEFORE UPDATE ON public.user_roles 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert default Master role for tyson@casfid.com if they exist
DO $$
DECLARE
    tyson_id UUID;
BEGIN
    -- Get Tyson's user ID
    SELECT id INTO tyson_id 
    FROM auth.users 
    WHERE email = 'tyson@casfid.com' 
    LIMIT 1;
    
    IF tyson_id IS NOT NULL THEN
        -- Create profile if it doesn't exist
        INSERT INTO public.user_profiles (
            id, 
            email, 
            first_name, 
            last_name, 
            display_name,
            job_title,
            department,
            is_active
        ) VALUES (
            tyson_id,
            'tyson@casfid.com',
            'James',
            'Tyson',
            'James Tyson',
            'Platform Owner',
            'Management',
            true
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Deactivate any existing roles
        UPDATE public.user_roles 
        SET is_active = false 
        WHERE user_id = tyson_id;
        
        -- Create Master role
        INSERT INTO public.user_roles (
            user_id,
            role_type,
            role_level,
            role_description,
            is_active
        ) VALUES (
            tyson_id,
            'Master',
            1,
            'Platform Owner - Full system access',
            true
        );
        
        RAISE NOTICE 'Master role created for tyson@casfid.com';
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;