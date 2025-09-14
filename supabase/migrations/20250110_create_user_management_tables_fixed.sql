-- Drop existing tables if needed (be careful with this in production!)
-- DROP TABLE IF EXISTS public.user_roles CASCADE;
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;

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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint only if it doesn't exist
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
DROP POLICY IF EXISTS "Master users can create profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master users can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Master users can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Master users can update roles" ON public.user_roles;

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
        auth.uid() IS NOT NULL AND (
            auth.uid() IN (
                SELECT user_id FROM public.user_roles 
                WHERE role_type = 'Master' 
                AND is_active = true
            )
            OR NOT EXISTS (SELECT 1 FROM public.user_profiles LIMIT 1) -- Allow first user
        )
    );

-- Master users can update any profile
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
-- Everyone can view roles
CREATE POLICY "Roles are viewable by authenticated users" 
    ON public.user_roles FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Only Master users can insert roles (or if no roles exist yet)
CREATE POLICY "Master users can assign roles" 
    ON public.user_roles FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            auth.uid() IN (
                SELECT user_id FROM public.user_roles 
                WHERE role_type = 'Master' 
                AND is_active = true
            )
            OR NOT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1) -- Allow first role
        )
    );

-- Only Master users can update roles
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
    -- Check if the table has an updated_at column
    IF TG_TABLE_NAME = 'user_profiles' OR TG_TABLE_NAME = 'user_roles' THEN
        NEW.updated_at = NOW();
    END IF;
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

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

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
        ) ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            display_name = EXCLUDED.display_name,
            job_title = EXCLUDED.job_title,
            department = EXCLUDED.department,
            is_active = EXCLUDED.is_active;
        
        -- First, check if any role exists for this user
        IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = tyson_id LIMIT 1) THEN
            -- Deactivate any existing non-Master roles
            UPDATE public.user_roles 
            SET is_active = false 
            WHERE user_id = tyson_id 
            AND role_type != 'Master';
            
            -- Check if Master role exists
            IF NOT EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = tyson_id 
                AND role_type = 'Master'
                LIMIT 1
            ) THEN
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
            ELSE
                -- Activate existing Master role
                UPDATE public.user_roles 
                SET is_active = true 
                WHERE user_id = tyson_id 
                AND role_type = 'Master';
            END IF;
        ELSE
            -- No roles exist, create Master role
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
        END IF;
        
        RAISE NOTICE 'Master role ensured for tyson@casfid.com';
    ELSE
        RAISE NOTICE 'User tyson@casfid.com not found in auth.users';
    END IF;
END $$;

-- Verification
DO $$
DECLARE
    profile_count INTEGER;
    role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles;
    SELECT COUNT(*) INTO role_count FROM public.user_roles;
    
    RAISE NOTICE 'Setup complete. Profiles: %, Roles: %', profile_count, role_count;
END $$;