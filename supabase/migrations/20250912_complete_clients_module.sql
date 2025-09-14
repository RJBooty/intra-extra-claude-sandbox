-- ===================================
-- CLIENTS MODULE - COMPLETE DATABASE DESIGN
-- ===================================

-- Drop existing inconsistent clients table if it exists
DROP TABLE IF EXISTS public.clients CASCADE;

-- ===================================
-- 1. MAIN CLIENTS TABLE
-- ===================================

CREATE TABLE public.clients (
    -- Primary Key & Identifiers
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_code text UNIQUE NOT NULL GENERATED ALWAYS AS (
        'CLI-' || UPPER(LEFT(REPLACE(company, ' ', ''), 3)) || '-' || 
        TO_CHAR(ROW_NUMBER() OVER (ORDER BY created_at), 'FM0000')
    ) STORED,
    
    -- Company Information
    company text NOT NULL,
    trading_name text,  -- Different from legal company name
    business_registration_number text,
    tax_registration_number text,
    
    -- Contact Information
    primary_contact_name text NOT NULL,
    primary_contact_email text NOT NULL,
    primary_contact_phone text,
    primary_contact_position text,
    
    -- Address Information
    billing_address_line1 text,
    billing_address_line2 text,
    billing_city text,
    billing_state text,
    billing_postal_code text,
    billing_country text DEFAULT 'United Kingdom',
    
    delivery_address_line1 text,
    delivery_address_line2 text,
    delivery_city text,
    delivery_state text,
    delivery_postal_code text,
    delivery_country text DEFAULT 'United Kingdom',
    same_as_billing boolean DEFAULT true,
    
    -- CASFID Business Classification
    client_tier text NOT NULL DEFAULT 'Seed' CHECK (
        client_tier IN ('Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest')
    ),
    
    -- Industry & Business Details
    industry_sector text,
    company_size text CHECK (
        company_size IN ('Startup', 'Small', 'Medium', 'Large', 'Enterprise')
    ),
    annual_events_count integer DEFAULT 0,
    typical_event_attendance integer,
    
    -- Financial Information
    credit_limit decimal(12,2) DEFAULT 0,
    payment_terms_days integer DEFAULT 30,
    preferred_currency text DEFAULT 'GBP',
    
    -- Relationship Status
    client_status text NOT NULL DEFAULT 'Active' CHECK (
        client_status IN ('Prospect', 'Active', 'Inactive', 'Suspended')
    ),
    relationship_start_date date DEFAULT CURRENT_DATE,
    last_project_date date,
    
    -- Marketing & Sales
    lead_source text,
    referral_source text,
    marketing_consent boolean DEFAULT false,
    
    -- System Fields
    created_by uuid,
    updated_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Additional Notes
    notes text,
    internal_comments text  -- Only visible to CASFID team
);

-- ===================================
-- 2. CLIENT CONTACTS TABLE
-- ===================================

CREATE TABLE public.client_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Contact Details
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    mobile_phone text,
    position text,
    department text,
    
    -- Contact Type & Status
    contact_type text NOT NULL CHECK (
        contact_type IN ('Primary', 'Financial', 'Technical', 'Management', 'Emergency')
    ),
    is_decision_maker boolean DEFAULT false,
    is_active boolean DEFAULT true,
    
    -- Communication Preferences
    preferred_contact_method text DEFAULT 'Email' CHECK (
        preferred_contact_method IN ('Email', 'Phone', 'Mobile', 'Teams')
    ),
    timezone text DEFAULT 'Europe/London',
    
    -- System Fields
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ===================================
-- 3. CLIENT REQUIREMENTS TABLE
-- ===================================

CREATE TABLE public.client_requirements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- CASFID Service Requirements
    rfid_access_control boolean DEFAULT false,
    cashless_payments boolean DEFAULT false,
    ticketing_system boolean DEFAULT false,
    data_analytics boolean DEFAULT false,
    
    -- Technical Requirements
    integration_requirements text,
    special_compliance_needs text,
    data_retention_requirements text,
    
    -- Event Specifications
    typical_venue_types text[], -- Array of venue types
    peak_concurrent_users integer,
    multi_day_events boolean DEFAULT false,
    international_events boolean DEFAULT false,
    
    -- System Fields
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ===================================
-- 4. CLIENT TIER HISTORY TABLE
-- ===================================

CREATE TABLE public.client_tier_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    previous_tier text,
    new_tier text NOT NULL,
    change_reason text,
    
    -- Business Metrics at Time of Change
    projects_completed integer DEFAULT 0,
    total_revenue_generated decimal(12,2) DEFAULT 0,
    avg_project_value decimal(12,2) DEFAULT 0,
    
    changed_by uuid,
    changed_at timestamptz DEFAULT now()
);

-- ===================================
-- 5. CLIENT SATISFACTION TRACKING
-- ===================================

CREATE TABLE public.client_satisfaction (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id uuid,  -- Link to specific project
    
    -- NPS & Satisfaction Metrics
    nps_score integer CHECK (nps_score >= 0 AND nps_score <= 10),
    overall_satisfaction integer CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
    
    -- Service-Specific Ratings
    service_quality_rating integer CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
    technical_support_rating integer CHECK (technical_support_rating >= 1 AND technical_support_rating <= 5),
    communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
    
    -- Feedback
    positive_feedback text,
    areas_for_improvement text,
    would_recommend boolean,
    
    -- Survey Details
    survey_type text CHECK (survey_type IN ('Post-Event', 'Annual', 'Ad-Hoc')),
    surveyed_by uuid,
    surveyed_at timestamptz DEFAULT now()
);

-- ===================================
-- 6. INDEXES FOR PERFORMANCE
-- ===================================

-- Primary lookup indexes
CREATE INDEX idx_clients_company ON public.clients(company);
CREATE INDEX idx_clients_client_code ON public.clients(client_code);
CREATE INDEX idx_clients_primary_email ON public.clients(primary_contact_email);
CREATE INDEX idx_clients_tier ON public.clients(client_tier);
CREATE INDEX idx_clients_status ON public.clients(client_status);

-- Relationship indexes
CREATE INDEX idx_client_contacts_client_id ON public.client_contacts(client_id);
CREATE INDEX idx_client_contacts_email ON public.client_contacts(email);
CREATE INDEX idx_client_requirements_client_id ON public.client_requirements(client_id);
CREATE INDEX idx_client_tier_history_client_id ON public.client_tier_history(client_id);
CREATE INDEX idx_client_satisfaction_client_id ON public.client_satisfaction(client_id);

-- Composite indexes for common queries
CREATE INDEX idx_clients_tier_status ON public.clients(client_tier, client_status);
CREATE INDEX idx_clients_industry_size ON public.clients(industry_sector, company_size);

-- ===================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES  
-- ===================================

-- Enable RLS on all client tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_satisfaction ENABLE ROW LEVEL SECURITY;

-- Master/Senior: Full access to all client data
CREATE POLICY "clients_master_senior_full_access" ON public.clients
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.raw_app_meta_data->>'user_tier' IN ('master', 'senior')
        )
    );

-- Mid: Read-only access to all clients
CREATE POLICY "clients_mid_read_only" ON public.clients
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.raw_app_meta_data->>'user_tier' = 'mid'
        )
    );

-- HR/Finance: Read-only access for reporting
CREATE POLICY "clients_hr_finance_read" ON public.clients
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.raw_app_meta_data->>'user_tier' = 'hr_finance'
        )
    );

-- External: No access to client data
-- (No policy needed - default deny)

-- Similar policies for related tables (abbreviated for space)
CREATE POLICY "client_contacts_master_senior_full" ON public.client_contacts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.raw_app_meta_data->>'user_tier' IN ('master', 'senior')
        )
    );

-- ===================================
-- 8. FUNCTIONS AND TRIGGERS
-- ===================================

-- Function to automatically update client tier based on business metrics
CREATE OR REPLACE FUNCTION update_client_tier()
RETURNS TRIGGER AS $$
DECLARE
    projects_count integer;
    total_revenue decimal(12,2);
    avg_project_value decimal(12,2);
    new_tier text;
    old_tier text;
BEGIN
    -- Get current metrics for the client
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_value), 0),
        COALESCE(AVG(total_value), 0)
    INTO projects_count, total_revenue, avg_project_value
    FROM projects 
    WHERE client_id = NEW.id AND status = 'Completed';
    
    -- Store old tier
    old_tier := OLD.client_tier;
    
    -- Determine new tier based on business rules
    IF total_revenue >= 500000 OR projects_count >= 20 THEN
        new_tier := 'Rainforest';
    ELSIF total_revenue >= 200000 OR projects_count >= 10 THEN
        new_tier := 'Jungle';
    ELSIF total_revenue >= 50000 OR projects_count >= 5 THEN
        new_tier := 'Canopy';
    ELSIF total_revenue >= 10000 OR projects_count >= 2 THEN
        new_tier := 'Sapling';
    ELSE
        new_tier := 'Seed';
    END IF;
    
    -- Update tier if it changed
    IF new_tier != old_tier THEN
        NEW.client_tier := new_tier;
        
        -- Log the tier change
        INSERT INTO client_tier_history (
            client_id, previous_tier, new_tier, change_reason,
            projects_completed, total_revenue_generated, avg_project_value,
            changed_by
        ) VALUES (
            NEW.id, old_tier, new_tier, 'Automatic based on business metrics',
            projects_count, total_revenue, avg_project_value,
            auth.uid()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update client tier
CREATE TRIGGER trigger_update_client_tier
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_client_tier();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to all tables
CREATE TRIGGER clients_updated_at 
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER client_contacts_updated_at 
    BEFORE UPDATE ON public.client_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER client_requirements_updated_at 
    BEFORE UPDATE ON public.client_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===================================
-- 9. SAMPLE DATA FOR TESTING
-- ===================================

-- Insert sample clients with different tiers
INSERT INTO public.clients (
    company, primary_contact_name, primary_contact_email, 
    client_tier, industry_sector, company_size
) VALUES 
(
    'London Festival Productions Ltd',
    'Sarah Johnson',
    'sarah.johnson@londonfest.co.uk',
    'Canopy',
    'Entertainment & Events',
    'Medium'
),
(
    'Global Music Events Corp',
    'Michael Chen',
    'mike.chen@globalmusic.com',
    'Jungle',
    'Music & Entertainment',
    'Large'
),
(
    'Local Community Events',
    'Emma Wilson',
    'emma@communityevents.org',
    'Seed',
    'Community Services',
    'Small'
);

-- Insert sample client contacts
INSERT INTO public.client_contacts (client_id, full_name, email, contact_type, is_decision_maker)
SELECT 
    c.id,
    'Technical Contact',
    'tech@' || LOWER(REPLACE(c.company, ' ', '')) || '.com',
    'Technical',
    false
FROM public.clients c;

-- Insert sample client requirements
INSERT INTO public.client_requirements (
    client_id, rfid_access_control, cashless_payments, ticketing_system
)
SELECT 
    id,
    true,
    CASE WHEN client_tier IN ('Canopy', 'Jungle', 'Rainforest') THEN true ELSE false END,
    CASE WHEN client_tier IN ('Jungle', 'Rainforest') THEN true ELSE false END
FROM public.clients;