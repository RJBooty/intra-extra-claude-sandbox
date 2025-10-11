-- Create system_settings table for configuration management
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_type TEXT NOT NULL CHECK (setting_type IN ('boolean', 'string', 'number', 'object')),
  description TEXT,
  category TEXT DEFAULT 'general',
  is_system BOOLEAN DEFAULT false,
  requires_restart BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (only authenticated users can read, only masters can write)
CREATE POLICY "Anyone can view system settings" ON public.system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Masters can manage settings (we'll check role in the application)
CREATE POLICY "Authenticated users can manage system settings" ON public.system_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);

-- Insert default security settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, category, is_system) VALUES
  ('email_verification_enabled', 'false', 'boolean', 'Require email verification for new user registrations', 'security', true),
  ('password_reset_enabled', 'true', 'boolean', 'Allow users to reset passwords via email', 'security', true),
  ('session_timeout_minutes', '480', 'number', 'Session timeout in minutes (8 hours default)', 'security', true),
  ('max_failed_login_attempts', '5', 'number', 'Maximum failed login attempts before lockout', 'security', true),
  ('lockout_duration_minutes', '30', 'number', 'Account lockout duration in minutes', 'security', true),
  ('require_strong_passwords', 'true', 'boolean', 'Enforce strong password requirements', 'security', true),
  ('two_factor_available', 'false', 'boolean', 'Enable two-factor authentication options', 'security', false),
  ('audit_log_retention_days', '90', 'number', 'Number of days to retain audit logs', 'security', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to get system setting
CREATE OR REPLACE FUNCTION public.get_system_setting(key_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_val TEXT;
BEGIN
  SELECT setting_value::text INTO setting_val
  FROM public.system_settings
  WHERE setting_key = key_name;

  RETURN COALESCE(setting_val, 'null');
END;
$$;

-- Create function to update system setting (with master user check)
CREATE OR REPLACE FUNCTION public.update_system_setting(
  key_name TEXT,
  new_value JSONB,
  user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  is_master BOOLEAN := false;
BEGIN
  -- Check if user is master
  SELECT role_type INTO user_role
  FROM public.user_roles
  WHERE user_roles.user_id = update_system_setting.user_id
    AND is_active = true;

  IF user_role = 'Master' THEN
    is_master := true;
  END IF;

  -- Only masters can update system settings
  IF NOT is_master THEN
    RAISE EXCEPTION 'Insufficient permissions. Only Master users can update system settings.';
  END IF;

  -- Update the setting
  UPDATE public.system_settings
  SET
    setting_value = new_value,
    updated_by = user_id,
    updated_at = NOW()
  WHERE setting_key = key_name;

  -- Return true if a row was updated
  RETURN FOUND;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_system_settings_updated_at();

SELECT 'System settings table created successfully!' as status;