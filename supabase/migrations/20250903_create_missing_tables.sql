-- Create clients table
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

-- Create projects table if not exists with all required fields
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  project_code TEXT UNIQUE,
  client_id UUID REFERENCES public.clients(id),
  event_location TEXT,
  event_start_date DATE,
  event_end_date DATE,
  expected_attendance INTEGER,
  event_type TEXT CHECK (event_type IN ('Conference', 'Festival', 'Exhibition', 'Sports', 'Corporate', 'Other')),
  
  -- Additional metadata fields
  onsite_start_date TIMESTAMPTZ,
  onsite_end_date TIMESTAMPTZ,
  show_start_date TIMESTAMPTZ,
  show_end_date TIMESTAMPTZ,
  voucher_sale_start TIMESTAMPTZ,
  voucher_sale_end TIMESTAMPTZ,
  topup_start TIMESTAMPTZ,
  topup_end TIMESTAMPTZ,
  refund_window_start TIMESTAMPTZ,
  refund_window_end TIMESTAMPTZ,
  delivery_address TEXT,
  delivery_contact_name TEXT,
  delivery_contact_phone TEXT,
  delivery_contact_email TEXT,
  wristband_order_deadline DATE,
  load_in_date TIMESTAMPTZ,
  load_out_date TIMESTAMPTZ,
  qr_code_url TEXT,
  
  -- Project status and phase
  current_phase INTEGER DEFAULT 1,
  phase_progress INTEGER DEFAULT 25,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'On Hold', 'Cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add project_code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'project_code'
  ) THEN
    ALTER TABLE projects ADD COLUMN project_code TEXT UNIQUE;
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
CREATE INDEX IF NOT EXISTS idx_projects_project_code ON public.projects(project_code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities(stage);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for development)
-- In production, these should be more restrictive
CREATE POLICY "Enable read access for all users" ON public.clients
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.clients
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.projects
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.opportunities
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.opportunities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.opportunities
  FOR UPDATE USING (true);