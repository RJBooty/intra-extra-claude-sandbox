-- Essential Project Code Fix
-- Minimal migration to fix project code generation without dependencies

-- Ensure project_code has unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_code_unique 
ON public.projects(project_code) 
WHERE project_code IS NOT NULL;

-- Simple preview function - shows what the next code would be without reserving it
CREATE OR REPLACE FUNCTION public.preview_project_code(p_location text)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_country_code text;
    v_next_number integer;
BEGIN
    -- Simple country code extraction
    v_country_code := CASE
        -- Handle direct ISO codes first
        WHEN p_location ~ ',\s*[A-Za-z]{2}\s*$' THEN 
            CASE WHEN UPPER(TRIM(split_part(p_location, ',', 2))) = 'UK' THEN 'GB'
                 ELSE UPPER(TRIM(split_part(p_location, ',', 2)))
            END
        -- Handle common country names
        WHEN p_location ILIKE '%united kingdom%' OR p_location ILIKE '%uk%' OR 
             p_location ILIKE '%england%' OR p_location ILIKE '%scotland%' OR 
             p_location ILIKE '%wales%' OR p_location ILIKE '%britain%' THEN 'GB'
        WHEN p_location ILIKE '%spain%' OR p_location ILIKE '%españa%' THEN 'ES'
        WHEN p_location ILIKE '%france%' THEN 'FR'
        WHEN p_location ILIKE '%germany%' OR p_location ILIKE '%deutschland%' THEN 'DE'
        WHEN p_location ILIKE '%italy%' OR p_location ILIKE '%italia%' THEN 'IT'
        WHEN p_location ILIKE '%netherlands%' OR p_location ILIKE '%holland%' THEN 'NL'
        WHEN p_location ILIKE '%belgium%' THEN 'BE'
        WHEN p_location ILIKE '%portugal%' THEN 'PT'
        WHEN p_location ILIKE '%ireland%' THEN 'IE'
        WHEN p_location ILIKE '%united states%' OR p_location ILIKE '%usa%' OR 
             p_location ILIKE '%america%' THEN 'US'
        WHEN p_location ILIKE '%canada%' THEN 'CA'
        WHEN p_location ILIKE '%australia%' THEN 'AU'
        WHEN p_location ILIKE '%japan%' THEN 'JP'
        WHEN p_location ILIKE '%dubai%' OR p_location ILIKE '%uae%' OR 
             p_location ILIKE '%emirates%' THEN 'AE'
        ELSE 'XX'
    END;
    
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

-- Simple reserve function - actually generates and reserves the next available code
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
BEGIN
    -- Simple country code extraction (same as preview)
    v_country_code := CASE
        -- Handle direct ISO codes first
        WHEN p_location ~ ',\s*[A-Za-z]{2}\s*$' THEN 
            CASE WHEN UPPER(TRIM(split_part(p_location, ',', 2))) = 'UK' THEN 'GB'
                 ELSE UPPER(TRIM(split_part(p_location, ',', 2)))
            END
        -- Handle common country names
        WHEN p_location ILIKE '%united kingdom%' OR p_location ILIKE '%uk%' OR 
             p_location ILIKE '%england%' OR p_location ILIKE '%scotland%' OR 
             p_location ILIKE '%wales%' OR p_location ILIKE '%britain%' THEN 'GB'
        WHEN p_location ILIKE '%spain%' OR p_location ILIKE '%españa%' THEN 'ES'
        WHEN p_location ILIKE '%france%' THEN 'FR'
        WHEN p_location ILIKE '%germany%' OR p_location ILIKE '%deutschland%' THEN 'DE'
        WHEN p_location ILIKE '%italy%' OR p_location ILIKE '%italia%' THEN 'IT'
        WHEN p_location ILIKE '%netherlands%' OR p_location ILIKE '%holland%' THEN 'NL'
        WHEN p_location ILIKE '%belgium%' THEN 'BE'
        WHEN p_location ILIKE '%portugal%' THEN 'PT'
        WHEN p_location ILIKE '%ireland%' THEN 'IE'
        WHEN p_location ILIKE '%united states%' OR p_location ILIKE '%usa%' OR 
             p_location ILIKE '%america%' THEN 'US'
        WHEN p_location ILIKE '%canada%' THEN 'CA'
        WHEN p_location ILIKE '%australia%' THEN 'AU'
        WHEN p_location ILIKE '%japan%' THEN 'JP'
        WHEN p_location ILIKE '%dubai%' OR p_location ILIKE '%uae%' OR 
             p_location ILIKE '%emirates%' THEN 'AE'
        ELSE 'XX'
    END;
    
    -- Find the next available number with retry logic
    LOOP
        v_attempt := v_attempt + 1;
        
        -- Prevent infinite loops
        IF v_attempt > 50 THEN
            RAISE EXCEPTION 'Failed to generate project code after 50 attempts for country %', v_country_code;
        END IF;
        
        -- Find the next number (simple sequential approach)
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
        
        -- Format the project code
        v_project_code := format('%s-%s', v_country_code, lpad(v_next_number::text, 4, '0'));
        
        -- Check if this code is already taken
        IF NOT EXISTS (SELECT 1 FROM public.projects WHERE project_code = v_project_code) THEN
            -- Code is available, return it
            RETURN v_project_code;
        END IF;
        
        -- Code was taken, retry
    END LOOP;
END;
$$;

-- Backward compatibility functions
CREATE OR REPLACE FUNCTION public.generate_project_code(p_region text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT public.reserve_project_code(p_region);
$$;

CREATE OR REPLACE FUNCTION public.generate_sequential_project_code(p_location text)
RETURNS text
LANGUAGE sql
AS $$
    SELECT public.reserve_project_code(p_location);
$$;

-- Comments
COMMENT ON FUNCTION public.preview_project_code(text) IS 'Shows preview of next project code without reserving it';
COMMENT ON FUNCTION public.reserve_project_code(text) IS 'Reserves and returns the next available project code';