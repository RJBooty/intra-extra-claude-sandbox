-- Fix Project Code Generation - Preview vs Reservation System
-- Ensures codes are only reserved on actual project creation, not on input changes

-- Drop the previous sequence-based approach
DROP TABLE IF EXISTS public.project_code_sequences CASCADE;

-- Ensure project_code has unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_code_unique 
ON public.projects(project_code) 
WHERE project_code IS NOT NULL;

-- Enhanced location parsing function
CREATE OR REPLACE FUNCTION public.parse_location(p_location text)
RETURNS TABLE(city text, country_code text)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_normalized text;
    v_parts text[];
    v_country_part text;
    v_city_part text;
    v_country_code text;
BEGIN
    -- Normalize input: trim, lowercase, collapse whitespace
    v_normalized := TRIM(REGEXP_REPLACE(COALESCE(p_location, ''), '\s+', ' ', 'g'));
    
    IF v_normalized = '' THEN
        RETURN QUERY SELECT ''::text, 'XX'::text;
        RETURN;
    END IF;
    
    -- Split by comma
    v_parts := string_to_array(v_normalized, ',');
    
    IF array_length(v_parts, 1) >= 2 THEN
        v_city_part := TRIM(v_parts[1]);
        v_country_part := TRIM(v_parts[2]);
    ELSE
        -- No comma, treat entire string as country
        v_city_part := '';
        v_country_part := v_normalized;
    END IF;
    
    -- Check if country part is already a 2-letter ISO code
    IF v_country_part ~ '^[A-Za-z]{2}$' THEN
        v_country_code := UPPER(v_country_part);
    ELSE
        -- Extract country code from full name
        v_country_code := CASE
            -- Europe - ISO 3166-1 alpha-2 codes
            WHEN v_country_part ILIKE '%united kingdom%' OR 
                 v_country_part ILIKE '%uk%' OR 
                 v_country_part ILIKE '%england%' OR 
                 v_country_part ILIKE '%scotland%' OR 
                 v_country_part ILIKE '%wales%' OR 
                 v_country_part ILIKE '%northern ireland%' OR
                 v_country_part ILIKE '%britain%' THEN 'GB'
            WHEN v_country_part ILIKE '%spain%' OR v_country_part ILIKE '%españa%' THEN 'ES'
            WHEN v_country_part ILIKE '%france%' THEN 'FR'
            WHEN v_country_part ILIKE '%germany%' OR v_country_part ILIKE '%deutschland%' THEN 'DE'
            WHEN v_country_part ILIKE '%italy%' OR v_country_part ILIKE '%italia%' THEN 'IT'
            WHEN v_country_part ILIKE '%netherlands%' OR v_country_part ILIKE '%holland%' THEN 'NL'
            WHEN v_country_part ILIKE '%belgium%' THEN 'BE'
            WHEN v_country_part ILIKE '%portugal%' THEN 'PT'
            WHEN v_country_part ILIKE '%ireland%' THEN 'IE'
            WHEN v_country_part ILIKE '%sweden%' THEN 'SE'
            WHEN v_country_part ILIKE '%norway%' THEN 'NO'
            WHEN v_country_part ILIKE '%denmark%' THEN 'DK'
            WHEN v_country_part ILIKE '%finland%' THEN 'FI'
            WHEN v_country_part ILIKE '%switzerland%' THEN 'CH'
            WHEN v_country_part ILIKE '%austria%' THEN 'AT'
            WHEN v_country_part ILIKE '%poland%' THEN 'PL'
            WHEN v_country_part ILIKE '%czech%' THEN 'CZ'
            WHEN v_country_part ILIKE '%hungary%' THEN 'HU'
            
            -- Americas
            WHEN v_country_part ILIKE '%united states%' OR 
                 v_country_part ILIKE '%usa%' OR 
                 v_country_part ILIKE '%america%' OR
                 v_country_part ILIKE '%u.s.%' THEN 'US'
            WHEN v_country_part ILIKE '%canada%' THEN 'CA'
            WHEN v_country_part ILIKE '%mexico%' OR v_country_part ILIKE '%méxico%' THEN 'MX'
            WHEN v_country_part ILIKE '%brazil%' OR v_country_part ILIKE '%brasil%' THEN 'BR'
            WHEN v_country_part ILIKE '%argentina%' THEN 'AR'
            WHEN v_country_part ILIKE '%colombia%' THEN 'CO'
            WHEN v_country_part ILIKE '%chile%' THEN 'CL'
            WHEN v_country_part ILIKE '%peru%' OR v_country_part ILIKE '%perú%' THEN 'PE'
            
            -- Asia-Pacific
            WHEN v_country_part ILIKE '%australia%' THEN 'AU'
            WHEN v_country_part ILIKE '%new zealand%' THEN 'NZ'
            WHEN v_country_part ILIKE '%japan%' THEN 'JP'
            WHEN v_country_part ILIKE '%china%' THEN 'CN'
            WHEN v_country_part ILIKE '%india%' THEN 'IN'
            WHEN v_country_part ILIKE '%singapore%' THEN 'SG'
            WHEN v_country_part ILIKE '%south korea%' OR v_country_part ILIKE '%korea%' THEN 'KR'
            WHEN v_country_part ILIKE '%thailand%' THEN 'TH'
            WHEN v_country_part ILIKE '%malaysia%' THEN 'MY'
            WHEN v_country_part ILIKE '%indonesia%' THEN 'ID'
            WHEN v_country_part ILIKE '%philippines%' THEN 'PH'
            
            -- Middle East & Africa
            WHEN v_country_part ILIKE '%dubai%' OR 
                 v_country_part ILIKE '%uae%' OR 
                 v_country_part ILIKE '%emirates%' THEN 'AE'
            WHEN v_country_part ILIKE '%saudi arabia%' THEN 'SA'
            WHEN v_country_part ILIKE '%qatar%' THEN 'QA'
            WHEN v_country_part ILIKE '%kuwait%' THEN 'KW'
            WHEN v_country_part ILIKE '%israel%' THEN 'IL'
            WHEN v_country_part ILIKE '%turkey%' THEN 'TR'
            WHEN v_country_part ILIKE '%south africa%' THEN 'ZA'
            WHEN v_country_part ILIKE '%egypt%' THEN 'EG'
            WHEN v_country_part ILIKE '%morocco%' THEN 'MA'
            
            -- Default for unknown locations
            ELSE 'XX'
        END;
    END IF;
    
    RETURN QUERY SELECT v_city_part, v_country_code;
END;
$$;

-- Preview function - shows what the next code would be without reserving it
CREATE OR REPLACE FUNCTION public.preview_project_code(p_location text)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_country_code text;
    v_next_number integer;
BEGIN
    -- Parse location to get country code
    SELECT country_code INTO v_country_code
    FROM public.parse_location(p_location);
    
    -- Find the next available number for this country
    SELECT COALESCE(MAX(
        CASE 
            WHEN project_code ~ ('^' || v_country_code || '-\d{4}$') THEN
                substring(project_code FROM '\d{4}$')::integer
            ELSE 0
        END
    ), 0) + 1
    INTO v_next_number
    FROM public.projects
    WHERE project_code IS NOT NULL;
    
    -- Return formatted preview code
    RETURN format('%s-%s', v_country_code, lpad(v_next_number::text, 4, '0'));
END;
$$;

-- Reserve function - actually generates and reserves the next available code
CREATE OR REPLACE FUNCTION public.reserve_project_code(p_location text)
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    v_country_code text;
    v_next_number integer;
    v_project_code text;
    v_attempt integer := 0;
    v_max_attempts integer := 100;
BEGIN
    -- Parse location to get country code
    SELECT country_code INTO v_country_code
    FROM public.parse_location(p_location);
    
    -- Find the next available number with retry logic for concurrency
    LOOP
        v_attempt := v_attempt + 1;
        
        -- Prevent infinite loops
        IF v_attempt > v_max_attempts THEN
            RAISE EXCEPTION 'Failed to generate project code after % attempts for country %', v_max_attempts, v_country_code;
        END IF;
        
        -- Find the smallest available number starting from 1
        WITH existing_numbers AS (
            SELECT substring(project_code FROM '\d{4}$')::integer as num
            FROM public.projects
            WHERE project_code ~ ('^' || v_country_code || '-\d{4}$')
            ORDER BY num
        ),
        number_gaps AS (
            SELECT 
                CASE 
                    WHEN LAG(num) OVER (ORDER BY num) IS NULL THEN 1
                    WHEN num - LAG(num) OVER (ORDER BY num) > 1 THEN LAG(num) OVER (ORDER BY num) + 1
                    ELSE NULL
                END as available_num
            FROM existing_numbers
            UNION ALL
            SELECT COALESCE(MAX(num), 0) + 1 as available_num
            FROM existing_numbers
        )
        SELECT available_num 
        INTO v_next_number
        FROM number_gaps 
        WHERE available_num IS NOT NULL 
        ORDER BY available_num 
        LIMIT 1;
        
        -- If no gaps found, start from 1
        IF v_next_number IS NULL THEN
            v_next_number := 1;
        END IF;
        
        -- Format the project code
        v_project_code := format('%s-%s', v_country_code, lpad(v_next_number::text, 4, '0'));
        
        -- Check if this code is already taken (race condition check)
        IF NOT EXISTS (SELECT 1 FROM public.projects WHERE project_code = v_project_code) THEN
            -- Code is available, return it
            RETURN v_project_code;
        END IF;
        
        -- Code was taken, retry with next number
    END LOOP;
    
    -- Should never reach here
    RAISE EXCEPTION 'Unexpected error in project code reservation';
END;
$$;

-- Updated generate_project_code function for backward compatibility
CREATE OR REPLACE FUNCTION public.generate_project_code(p_region text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT public.reserve_project_code(p_region);
$$;

-- Updated generate_sequential_project_code function for backward compatibility
CREATE OR REPLACE FUNCTION public.generate_sequential_project_code(p_location text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT public.reserve_project_code(p_location);
$$;

-- Add helpful comments
COMMENT ON FUNCTION public.parse_location(text) IS 'Parses location string into city and ISO 3166-1 alpha-2 country code';
COMMENT ON FUNCTION public.preview_project_code(text) IS 'Shows preview of next project code without reserving it';
COMMENT ON FUNCTION public.reserve_project_code(text) IS 'Reserves and returns the next available project code for the given location';

-- Create index for better performance on project code queries
CREATE INDEX IF NOT EXISTS idx_projects_project_code_pattern 
ON public.projects(project_code) 
WHERE project_code IS NOT NULL;