-- Safe migration that handles existing tables
-- This script will update existing tables or create them if they don't exist

-- Create user_profiles table if it doesn't exist, or add missing columns
DO $$ 
BEGIN
  -- Create table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    
    -- Work Information
    job_title TEXT,
    department TEXT,
    office_location TEXT,
    start_date DATE,
    manager_id UUID REFERENCES public.user_profiles(id),
    
    -- Contact Preferences
    preferred_communication TEXT CHECK (preferred_communication IN ('email', 'phone', 'teams', 'slack')),
    timezone TEXT DEFAULT 'UTC',
    
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Add missing columns if they don't exist
  BEGIN
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS department TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS office_location TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS start_date DATE;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.user_profiles(id);
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS preferred_communication TEXT CHECK (preferred_communication IN ('email', 'phone', 'teams', 'slack'));
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
  EXCEPTION
    WHEN duplicate_column THEN
      NULL; -- Column already exists, ignore
  END;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('Master', 'Senior', 'Mid', 'External', 'HR')),
  role_level INTEGER NOT NULL CHECK (role_level BETWEEN 1 AND 5),
  assigned_by UUID REFERENCES public.user_profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_id)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- UI Preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  project_updates BOOLEAN DEFAULT true,
  system_alerts BOOLEAN DEFAULT true,
  
  -- Dashboard Preferences
  default_view TEXT DEFAULT 'dashboard',
  items_per_page INTEGER DEFAULT 25,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Master users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master/Senior can update profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Master users can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Master users can view all sessions" ON public.user_sessions;

-- Create RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Master users can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role_type = 'Master' 
      AND ur.is_active = true
    )
  );

CREATE POLICY "Master/Senior can update profiles" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role_type IN ('Master', 'Senior') 
      AND ur.is_active = true
    )
  );

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Master users can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role_type = 'Master' 
      AND ur.is_active = true
    )
  );

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Master users can view all sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role_type = 'Master' 
      AND ur.is_active = true
    )
  );

-- Create indexes (safe to run multiple times with IF NOT EXISTS equivalent)
DO $$ 
BEGIN
  -- Create indexes if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_user_profiles_email' AND n.nspname = 'public') THEN
    CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_user_profiles_department' AND n.nspname = 'public') THEN
    CREATE INDEX idx_user_profiles_department ON public.user_profiles(department);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_user_roles_user_id' AND n.nspname = 'public') THEN
    CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_user_preferences_user_id' AND n.nspname = 'public') THEN
    CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_user_sessions_user_id' AND n.nspname = 'public') THEN
    CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
  END IF;
  
  -- Create unique partial index for active roles (one active role per user)
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_user_roles_unique_active' AND n.nspname = 'public') THEN
    CREATE UNIQUE INDEX idx_user_roles_unique_active 
    ON public.user_roles(user_id) 
    WHERE is_active = true;
  END IF;
  
  -- Create partial indexes for active sessions
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_user_sessions_active' AND n.nspname = 'public') THEN
    CREATE INDEX idx_user_sessions_active 
    ON public.user_sessions(user_id, is_active) 
    WHERE is_active = true;
  END IF;
END $$;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_last_login() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role_level(UUID);
DROP FUNCTION IF EXISTS public.check_user_permission(UUID, TEXT);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  -- Create default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  -- Assign default role (External = level 4)
  INSERT INTO public.user_roles (user_id, role_type, role_level)
  VALUES (NEW.id, 'External', 4);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user's last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_sign_in_at > OLD.last_sign_in_at THEN
    UPDATE public.user_profiles 
    SET last_login = NEW.last_sign_in_at,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_user_login ON auth.users;

-- Create trigger to update last login
CREATE TRIGGER on_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.update_last_login();

-- Function to get user role level
CREATE OR REPLACE FUNCTION public.get_user_role_level(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  role_level INTEGER;
BEGIN
  SELECT ur.role_level INTO role_level
  FROM public.user_roles ur
  WHERE ur.user_id = $1 AND ur.is_active = true;
  
  RETURN COALESCE(role_level, 4); -- Default to External (4) if no role found
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION public.check_user_permission(
  user_id UUID,
  required_role TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  role_hierarchy TEXT[] := ARRAY['Master', 'Senior', 'Mid', 'External', 'HR'];
  user_position INTEGER;
  required_position INTEGER;
BEGIN
  -- Get user's current role
  SELECT ur.role_type INTO user_role
  FROM public.user_roles ur
  WHERE ur.user_id = $1 AND ur.is_active = true;
  
  -- If no role found, deny access
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Special case: HR can only access HR-specific functions
  IF user_role = 'HR' AND required_role != 'HR' THEN
    RETURN FALSE;
  END IF;
  
  -- Find positions in hierarchy
  SELECT array_position(role_hierarchy, user_role) INTO user_position;
  SELECT array_position(role_hierarchy, required_role) INTO required_position;
  
  -- Lower number = higher access (Master = 1, External = 4)
  RETURN user_position <= required_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'User profile system migration completed successfully!';
END $$;