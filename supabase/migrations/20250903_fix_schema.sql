-- First, create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT NOT NULL,
  classification TEXT CHECK (classification IN ('Canopy', 'Direct', 'Partner', 'Vendor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now add missing columns to existing projects table
DO $$
BEGIN
  -- Add client_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'client_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN client_id UUID REFERENCES public.clients(id);
  END IF;

  -- Add project_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'project_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN project_id TEXT;
  END IF;

  -- Add event_start_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'event_start_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN event_start_date DATE;
  END IF;

  -- Add event_end_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'event_end_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN event_end_date DATE;
  END IF;

  -- Add expected_attendance if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'expected_attendance'
  ) THEN
    ALTER TABLE projects ADD COLUMN expected_attendance INTEGER;
  END IF;

  -- Add event_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'event_type'
  ) THEN
    ALTER TABLE projects ADD COLUMN event_type TEXT;
  END IF;

  -- Add status columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'current_phase'
  ) THEN
    ALTER TABLE projects ADD COLUMN current_phase INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'phase_progress'
  ) THEN
    ALTER TABLE projects ADD COLUMN phase_progress INTEGER DEFAULT 25;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'Active';
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create opportunities table for sales pipeline
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  deal_value DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  stage TEXT NOT NULL,
  lead_score INTEGER DEFAULT 0,
  temperature TEXT CHECK (temperature IN ('Hot', 'Warm', 'Cold')),
  client_tier TEXT CHECK (client_tier IN ('Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest')),
  event_type TEXT,
  owner_id UUID,
  event_date DATE,
  decision_date DATE,
  win_probability INTEGER DEFAULT 50,
  created_project_id UUID REFERENCES public.projects(id),
  is_previous_client BOOLEAN DEFAULT FALSE,
  budget_confirmed BOOLEAN DEFAULT FALSE,
  multiple_events BOOLEAN DEFAULT FALSE,
  referral_source TEXT,
  decision_maker_engaged BOOLEAN DEFAULT FALSE,
  contract_link TEXT,
  contract_signed BOOLEAN DEFAULT FALSE,
  last_activity_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities(stage);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for development)
DO $$
BEGIN
  -- Clients policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON public.clients
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' 
    AND policyname = 'Enable insert for all users'
  ) THEN
    CREATE POLICY "Enable insert for all users" ON public.clients
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' 
    AND policyname = 'Enable update for all users'
  ) THEN
    CREATE POLICY "Enable update for all users" ON public.clients
      FOR UPDATE USING (true);
  END IF;

  -- Projects policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON public.projects
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Enable insert for all users'
  ) THEN
    CREATE POLICY "Enable insert for all users" ON public.projects
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Enable update for all users'
  ) THEN
    CREATE POLICY "Enable update for all users" ON public.projects
      FOR UPDATE USING (true);
  END IF;

  -- Opportunities policies  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'opportunities' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON public.opportunities
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'opportunities' 
    AND policyname = 'Enable insert for all users'
  ) THEN
    CREATE POLICY "Enable insert for all users" ON public.opportunities
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'opportunities' 
    AND policyname = 'Enable update for all users'
  ) THEN
    CREATE POLICY "Enable update for all users" ON public.opportunities
      FOR UPDATE USING (true);
  END IF;
END $$;