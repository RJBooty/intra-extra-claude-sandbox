-- Sequential Project Code Generation System
-- Implements proper ISO 3166-1 alpha-2 country codes with per-country sequential numbering
-- Format: {CountryCode}-{FourDigitNumber} (e.g., UK-0001, ES-0001)

-- Create a table to track project code sequences per country
CREATE TABLE IF NOT EXISTS public.project_code_sequences (
    country_code VARCHAR(2) PRIMARY KEY,
    current_sequence INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on project_code_sequences
ALTER TABLE public.project_code_sequences ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read sequences
CREATE POLICY "Allow authenticated users to read sequences" ON public.project_code_sequences
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to update sequences
CREATE POLICY "Allow authenticated users to update sequences" ON public.project_code_sequences
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow authenticated users to insert new sequences
CREATE POLICY "Allow authenticated users to insert sequences" ON public.project_code_sequences
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.project_code_sequences TO authenticated;

-- Updated function to extract country code from location using ISO 3166-1 alpha-2
CREATE OR REPLACE FUNCTION public.extract_country_code(p_location text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT 
        CASE
            -- Null/empty handling
            WHEN p_location IS NULL OR TRIM(p_location) = '' THEN 'XX'
            
            -- Europe - ISO 3166-1 alpha-2 codes
            WHEN p_location ILIKE '%united kingdom%' OR 
                 p_location ILIKE '%uk%' OR 
                 p_location ILIKE '%england%' OR 
                 p_location ILIKE '%scotland%' OR 
                 p_location ILIKE '%wales%' OR 
                 p_location ILIKE '%northern ireland%' OR
                 p_location ILIKE '%britain%' THEN 'GB'
            WHEN p_location ILIKE '%spain%' OR p_location ILIKE '%españa%' THEN 'ES'
            WHEN p_location ILIKE '%france%' THEN 'FR'
            WHEN p_location ILIKE '%germany%' OR p_location ILIKE '%deutschland%' THEN 'DE'
            WHEN p_location ILIKE '%italy%' OR p_location ILIKE '%italia%' THEN 'IT'
            WHEN p_location ILIKE '%netherlands%' OR p_location ILIKE '%holland%' THEN 'NL'
            WHEN p_location ILIKE '%belgium%' THEN 'BE'
            WHEN p_location ILIKE '%portugal%' THEN 'PT'
            WHEN p_location ILIKE '%ireland%' THEN 'IE'
            WHEN p_location ILIKE '%sweden%' THEN 'SE'
            WHEN p_location ILIKE '%norway%' THEN 'NO'
            WHEN p_location ILIKE '%denmark%' THEN 'DK'
            WHEN p_location ILIKE '%finland%' THEN 'FI'
            WHEN p_location ILIKE '%switzerland%' THEN 'CH'
            WHEN p_location ILIKE '%austria%' THEN 'AT'
            WHEN p_location ILIKE '%poland%' THEN 'PL'
            WHEN p_location ILIKE '%czech%' THEN 'CZ'
            WHEN p_location ILIKE '%hungary%' THEN 'HU'
            
            -- Americas
            WHEN p_location ILIKE '%united states%' OR 
                 p_location ILIKE '%usa%' OR 
                 p_location ILIKE '%america%' OR
                 p_location ILIKE '%u.s.%' THEN 'US'
            WHEN p_location ILIKE '%canada%' THEN 'CA'
            WHEN p_location ILIKE '%mexico%' OR p_location ILIKE '%méxico%' THEN 'MX'
            WHEN p_location ILIKE '%brazil%' OR p_location ILIKE '%brasil%' THEN 'BR'
            WHEN p_location ILIKE '%argentina%' THEN 'AR'
            WHEN p_location ILIKE '%colombia%' THEN 'CO'
            WHEN p_location ILIKE '%chile%' THEN 'CL'
            WHEN p_location ILIKE '%peru%' OR p_location ILIKE '%perú%' THEN 'PE'
            
            -- Asia-Pacific
            WHEN p_location ILIKE '%australia%' THEN 'AU'
            WHEN p_location ILIKE '%new zealand%' THEN 'NZ'
            WHEN p_location ILIKE '%japan%' THEN 'JP'
            WHEN p_location ILIKE '%china%' THEN 'CN'
            WHEN p_location ILIKE '%india%' THEN 'IN'
            WHEN p_location ILIKE '%singapore%' THEN 'SG'
            WHEN p_location ILIKE '%south korea%' OR p_location ILIKE '%korea%' THEN 'KR'
            WHEN p_location ILIKE '%thailand%' THEN 'TH'
            WHEN p_location ILIKE '%malaysia%' THEN 'MY'
            WHEN p_location ILIKE '%indonesia%' THEN 'ID'
            WHEN p_location ILIKE '%philippines%' THEN 'PH'
            
            -- Middle East & Africa
            WHEN p_location ILIKE '%dubai%' OR 
                 p_location ILIKE '%uae%' OR 
                 p_location ILIKE '%emirates%' THEN 'AE'
            WHEN p_location ILIKE '%saudi arabia%' THEN 'SA'
            WHEN p_location ILIKE '%qatar%' THEN 'QA'
            WHEN p_location ILIKE '%kuwait%' THEN 'KW'
            WHEN p_location ILIKE '%israel%' THEN 'IL'
            WHEN p_location ILIKE '%turkey%' THEN 'TR'
            WHEN p_location ILIKE '%south africa%' THEN 'ZA'
            WHEN p_location ILIKE '%egypt%' THEN 'EG'
            WHEN p_location ILIKE '%morocco%' THEN 'MA'
            
            -- Default for unknown locations
            ELSE 'XX'
        END;
$$;

-- Function to generate sequential project code with concurrency handling
CREATE OR REPLACE FUNCTION public.generate_sequential_project_code(p_location text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    v_country_code text;
    v_next_sequence integer;
    v_project_code text;
    v_attempts integer := 0;
    v_max_attempts integer := 10;
BEGIN
    -- Extract country code from location
    v_country_code := public.extract_country_code(p_location);
    
    -- Handle concurrent access with retry logic
    LOOP
        v_attempts := v_attempts + 1;
        
        -- Exit if too many attempts
        IF v_attempts > v_max_attempts THEN
            RAISE EXCEPTION 'Failed to generate project code after % attempts', v_max_attempts;
        END IF;
        
        BEGIN
            -- Get next sequence number for this country (with row locking for concurrency)
            SELECT current_sequence + 1
            INTO v_next_sequence
            FROM public.project_code_sequences
            WHERE country_code = v_country_code
            FOR UPDATE;
            
            -- If no sequence exists for this country, create it
            IF v_next_sequence IS NULL THEN
                INSERT INTO public.project_code_sequences (country_code, current_sequence)
                VALUES (v_country_code, 1)
                ON CONFLICT (country_code) DO UPDATE SET
                    current_sequence = public.project_code_sequences.current_sequence + 1,
                    updated_at = NOW()
                RETURNING current_sequence INTO v_next_sequence;
            ELSE
                -- Update the sequence
                UPDATE public.project_code_sequences
                SET current_sequence = v_next_sequence,
                    updated_at = NOW()
                WHERE country_code = v_country_code;
            END IF;
            
            -- Format the project code as {CountryCode}-{FourDigitNumber}
            v_project_code := format('%s-%s', v_country_code, lpad(v_next_sequence::text, 4, '0'));
            
            -- Check if this code already exists in projects table
            IF EXISTS (SELECT 1 FROM public.projects WHERE project_code = v_project_code) THEN
                -- Code collision, retry with next number
                CONTINUE;
            END IF;
            
            -- Success - return the code
            RETURN v_project_code;
            
        EXCEPTION 
            WHEN serialization_failure OR deadlock_detected THEN
                -- Retry on concurrency issues
                CONTINUE;
            WHEN unique_violation THEN
                -- Code already exists, retry
                CONTINUE;
        END;
    END LOOP;
    
    -- Should never reach here, but just in case
    RAISE EXCEPTION 'Unexpected error in project code generation';
END;
$$;

-- Update the existing generate_project_code function to use new logic
CREATE OR REPLACE FUNCTION public.generate_project_code(p_region text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT public.generate_sequential_project_code(p_region);
$$;

-- Initialize sequences for any existing projects
-- This will analyze existing project codes and set appropriate starting sequences
DO $$
DECLARE
    r RECORD;
    v_country_code text;
    v_sequence_number integer;
    v_max_sequence integer;
BEGIN
    -- For each unique country in existing projects
    FOR r IN 
        SELECT DISTINCT 
            public.extract_country_code(event_location) as country_code,
            event_location
        FROM public.projects 
        WHERE event_location IS NOT NULL
    LOOP
        v_country_code := r.country_code;
        
        -- Find the highest sequence number for this country
        SELECT COALESCE(MAX(
            CASE 
                WHEN project_code ~ ('^' || v_country_code || '-\d{4}$') THEN
                    substring(project_code FROM '\d{4}$')::integer
                ELSE 0
            END
        ), 0)
        INTO v_max_sequence
        FROM public.projects
        WHERE project_code IS NOT NULL;
        
        -- Insert or update the sequence for this country
        INSERT INTO public.project_code_sequences (country_code, current_sequence)
        VALUES (v_country_code, v_max_sequence)
        ON CONFLICT (country_code) DO UPDATE SET
            current_sequence = GREATEST(public.project_code_sequences.current_sequence, EXCLUDED.current_sequence),
            updated_at = NOW();
    END LOOP;
END
$$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_project_code_country ON public.projects(substring(project_code FROM '^([A-Z]{2})-'));

-- Add comment
COMMENT ON FUNCTION public.generate_sequential_project_code(text) IS 'Generates sequential project codes in format {CountryCode}-{FourDigitNumber} with proper concurrency handling';
COMMENT ON TABLE public.project_code_sequences IS 'Tracks project code sequences per country for sequential numbering';