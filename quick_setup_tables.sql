-- Quick setup script for user tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wyixydnywhpiewgsfimc/sql/new

-- Check current status
SELECT 'Checking table existence...' as status;

SELECT
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') as profiles_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') as roles_exists;

-- Create tables only if they don't exist
DO $$
BEGIN
  -- Create user_profiles if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    CREATE TABLE public.user_profiles (
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
      manager_id UUID,
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
      availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable', 'on_leave')),
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

    RAISE NOTICE 'Created user_profiles table';

    -- Enable RLS
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view all profiles" ON public.user_profiles
      FOR SELECT USING (auth.role() = 'authenticated');

    CREATE POLICY "Users can update own profile" ON public.user_profiles
      FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY "Users can insert own profile" ON public.user_profiles
      FOR INSERT WITH CHECK (auth.uid() = id);

    RAISE NOTICE 'Created RLS policies for user_profiles';
  ELSE
    RAISE NOTICE 'user_profiles table already exists';
  END IF;

  -- Create user_roles if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    CREATE TABLE public.user_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role_type TEXT NOT NULL CHECK (role_type IN ('Master', 'Senior', 'Mid', 'External', 'HR')),
      role_level INTEGER NOT NULL DEFAULT 5 CHECK (role_level BETWEEN 1 AND 5),
      role_description TEXT,
      assigned_by UUID REFERENCES auth.users(id),
      assigned_at TIMESTAMPTZ DEFAULT NOW(),
      is_active BOOLEAN DEFAULT true,
      valid_from TIMESTAMPTZ DEFAULT NOW(),
      valid_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    RAISE NOTICE 'Created user_roles table';

    -- Enable RLS
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view roles" ON public.user_roles
      FOR SELECT USING (auth.role() = 'authenticated');

    RAISE NOTICE 'Created RLS policies for user_roles';
  ELSE
    RAISE NOTICE 'user_roles table already exists';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON public.user_roles(is_active);

-- Migrate existing auth.users to user_profiles if needed
INSERT INTO public.user_profiles (id, email, display_name, is_active, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', email),
  true,
  created_at,
  NOW()
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.users.id
);

-- Count how many users were migrated
SELECT COUNT(*) as migrated_users FROM public.user_profiles;

-- Give all existing users a default External role if they don't have one
INSERT INTO public.user_roles (user_id, role_type, role_level, role_description, is_active)
SELECT
  id,
  'External',
  5,
  'External contractor',
  true
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = auth.users.id
  AND user_roles.is_active = true
);

-- Set your user (tyson@tundratides.com) as Master
UPDATE public.user_roles
SET is_active = false
WHERE user_id = 'f5b6855d-35ab-4136-b360-7e307fdd325a';

INSERT INTO public.user_roles (user_id, role_type, role_level, role_description, is_active)
VALUES (
  'f5b6855d-35ab-4136-b360-7e307fdd325a',
  'Master',
  1,
  'Platform administrator',
  true
) ON CONFLICT DO NOTHING;

-- Update your profile with proper details
UPDATE public.user_profiles
SET
  first_name = 'James',
  last_name = 'Tyson',
  display_name = 'James Tyson',
  job_title = 'Platform Owner',
  department = 'Management',
  onboarding_completed = true
WHERE id = 'f5b6855d-35ab-4136-b360-7e307fdd325a';

-- Verify the setup
SELECT 'Setup complete! Checking your user:' as status;

SELECT
  p.*,
  r.role_type,
  r.role_level
FROM public.user_profiles p
LEFT JOIN public.user_roles r ON p.id = r.user_id AND r.is_active = true
WHERE p.id = 'f5b6855d-35ab-4136-b360-7e307fdd325a';

SELECT 'Total users with profiles:' as info, COUNT(*) as count FROM public.user_profiles;
SELECT 'Total users with roles:' as info, COUNT(DISTINCT user_id) as count FROM public.user_roles WHERE is_active = true;