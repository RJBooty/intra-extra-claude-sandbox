-- Create user_profiles table
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

-- Create user_roles table
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
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type ON public.user_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON public.user_roles(is_active);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view all profiles (for team page)
CREATE POLICY "Authenticated users can view all profiles" ON public.user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for user_roles

-- Allow users to view roles
CREATE POLICY "Users can view roles" ON public.user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow service role to manage roles (admins will use service role key)
-- No INSERT/UPDATE/DELETE policies for regular users

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

-- Create function to bootstrap admin user
CREATE OR REPLACE FUNCTION public.create_bootstrap_master_user(
  user_email TEXT,
  user_first_name TEXT,
  user_last_name TEXT
)
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the user ID from email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;

  -- Create or update user profile
  INSERT INTO public.user_profiles (
    id, email, first_name, last_name, display_name,
    job_title, department, is_active, onboarding_completed
  ) VALUES (
    user_id,
    user_email,
    user_first_name,
    user_last_name,
    CONCAT(user_first_name, ' ', user_last_name),
    'Platform Owner',
    'Management',
    true,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    job_title = EXCLUDED.job_title,
    department = EXCLUDED.department,
    is_active = true,
    onboarding_completed = true,
    updated_at = NOW();

  -- Deactivate any existing roles
  UPDATE public.user_roles
  SET is_active = false
  WHERE user_id = user_id;

  -- Create Master role
  INSERT INTO public.user_roles (
    user_id, role_type, role_level, role_description, is_active
  ) VALUES (
    user_id,
    'Master',
    1,
    'Platform administrator with full access',
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bootstrap the tyson@casfid.com user immediately if they exist
DO $$
DECLARE
  tyson_id UUID;
BEGIN
  SELECT id INTO tyson_id FROM auth.users WHERE email = 'tyson@casfid.com';

  IF tyson_id IS NOT NULL THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.user_profiles (
      id, email, first_name, last_name, display_name,
      job_title, department, is_active, onboarding_completed
    ) VALUES (
      tyson_id,
      'tyson@casfid.com',
      'James',
      'Tyson',
      'James Tyson',
      'Platform Owner',
      'Management',
      true,
      true
    ) ON CONFLICT (id) DO NOTHING;

    -- Ensure Master role
    UPDATE public.user_roles SET is_active = false WHERE user_id = tyson_id;

    INSERT INTO public.user_roles (
      user_id, role_type, role_level, role_description, is_active
    ) VALUES (
      tyson_id,
      'Master',
      1,
      'Platform administrator with full access',
      true
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Successfully bootstrapped tyson@casfid.com as Master user';
  END IF;
END;
$$;