

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_profile_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  completion_score INTEGER := 0;
  total_fields INTEGER := 20;
BEGIN
  -- Count completed fields
  IF NEW.first_name IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.last_name IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.phone IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.avatar_url IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.job_title IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.department IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.office_location IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.start_date IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.preferred_communication IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.timezone IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF array_length(NEW.skills, 1) > 0 THEN completion_score := completion_score + 1; END IF;
  IF array_length(NEW.certifications, 1) > 0 THEN completion_score := completion_score + 1; END IF;
  IF array_length(NEW.languages, 1) > 1 THEN completion_score := completion_score + 1; END IF;
  IF NEW.daily_rate IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.tax_status IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.travel_willingness IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.passport_expiry IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.insurance_valid_until IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.dbs_check_date IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.emergency_contact_name IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  
  -- Calculate percentage
  NEW.profile_completion_percentage := (completion_score * 100) / total_fields;
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_profile_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_page_permission"("p_user_id" "uuid", "p_page_name" character varying, "p_action" character varying DEFAULT 'read'::character varying) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_role VARCHAR(20);
  page_perm RECORD;
BEGIN
  -- Get user role from your existing table
  SELECT role_level INTO user_role 
  FROM platform_user_roles 
  WHERE user_id = p_user_id;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get page permission
  SELECT pp.*, pd.is_critical 
  INTO page_perm
  FROM page_permissions pp
  JOIN page_definitions pd ON pp.page_id = pd.id
  WHERE pd.page_name = p_page_name 
    AND pp.user_tier = user_role;
  
  IF page_perm IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check specific action permission
  CASE p_action
    WHEN 'read' THEN RETURN page_perm.can_read;
    WHEN 'create' THEN RETURN page_perm.can_create;
    WHEN 'update' THEN RETURN page_perm.can_update;
    WHEN 'delete' THEN RETURN page_perm.can_delete;
    WHEN 'approve' THEN RETURN page_perm.can_approve;
    ELSE RETURN FALSE;
  END CASE;
END;
$$;


ALTER FUNCTION "public"."check_page_permission"("p_user_id" "uuid", "p_page_name" character varying, "p_action" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_user_permission"("user_id" "uuid", "required_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
$_$;


ALTER FUNCTION "public"."check_user_permission"("user_id" "uuid", "required_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."extract_country_code"("p_location" "text") RETURNS "text"
    LANGUAGE "sql" STABLE
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


ALTER FUNCTION "public"."extract_country_code"("p_location" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_project_code"("p_region" "text") RETURNS "text"
    LANGUAGE "sql"
    AS $$
    SELECT public.reserve_project_code(p_region);
$$;


ALTER FUNCTION "public"."generate_project_code"("p_region" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_sequential_project_code"("p_location" "text") RETURNS "text"
    LANGUAGE "sql"
    AS $$
    SELECT public.reserve_project_code(p_location);
$$;


ALTER FUNCTION "public"."generate_sequential_project_code"("p_location" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_sequential_project_code"("p_location" "text") IS 'Generates sequential project codes in format {CountryCode}-{FourDigitNumber} with proper concurrency handling';



CREATE OR REPLACE FUNCTION "public"."get_region_code"("p_location" "text") RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select
    case
      when p_location is null or btrim(p_location) = '' then 'XX'
      when p_location ilike '%united kingdom%' or p_location ilike '%uk%' or p_location ilike '%england%' or p_location ilike '%scotland%' or p_location ilike '%wales%' or p_location ilike '%northern ireland%' then 'UK'
      when p_location ilike '%ireland%' then 'IE'
      when p_location ilike '%spain%' then 'ES'
      when p_location ilike '%portugal%' then 'PT'
      when p_location ilike '%france%' then 'FR'
      when p_location ilike '%germany%' then 'DE'
      when p_location ilike '%netherlands%' or p_location ilike '%holland%' then 'NL'
      when p_location ilike '%belgium%' then 'BE'
      when p_location ilike '%italy%' then 'IT'
      when p_location ilike '%united states%' or p_location ilike '%usa%' or p_location ilike '%u.s.%' then 'US'
      when p_location ilike '%canada%' then 'CA'
      else 'XX'
    end;
$$;


ALTER FUNCTION "public"."get_region_code"("p_location" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_role_level"("p_user_id" "uuid") RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select coalesce(
    (select role_level from platform_user_roles where user_id = p_user_id),
    'user'
  )
$$;


ALTER FUNCTION "public"."get_role_level"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_page_permissions"("p_user_id" "uuid", "p_page_name" character varying) RETURNS TABLE("permission_type" character varying, "can_create" boolean, "can_read" boolean, "can_update" boolean, "can_delete" boolean, "can_approve" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  -- Get user role
  SELECT role_level INTO user_role 
  FROM platform_user_roles 
  WHERE user_id = p_user_id;
  
  IF user_role IS NULL THEN
    RETURN QUERY SELECT 'none'::VARCHAR, false, false, false, false, false;
    RETURN;
  END IF;
  
  -- Return user's permissions for the page
  RETURN QUERY
  SELECT 
    pp.permission_type,
    pp.can_create,
    pp.can_read,
    pp.can_update,
    pp.can_delete,
    pp.can_approve
  FROM page_permissions pp
  JOIN page_definitions pd ON pp.page_id = pd.id
  WHERE pd.page_name = p_page_name 
    AND pp.user_tier = user_role;
END;
$$;


ALTER FUNCTION "public"."get_user_page_permissions"("p_user_id" "uuid", "p_page_name" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("user_uuid" "uuid") RETURNS TABLE("role_type" "text", "role_level" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role_type, ur.role_level
  FROM public.user_roles ur
  WHERE ur.user_id = user_uuid AND ur.is_active = true;
END;
$$;


ALTER FUNCTION "public"."get_user_role"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role_level"("user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
  role_level INTEGER;
BEGIN
  SELECT ur.role_level INTO role_level
  FROM public.user_roles ur
  WHERE ur.user_id = $1 AND ur.is_active = true;
  
  RETURN COALESCE(role_level, 4); -- Default to External (4) if no role found
END;
$_$;


ALTER FUNCTION "public"."get_user_role_level"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        email,
        display_name,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_master"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select get_role_level(p_user_id) = 'master'
$$;


ALTER FUNCTION "public"."is_master"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_master_user"("user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid 
    AND role_type = 'Master' 
    AND is_active = true
  );
END;
$$;


ALTER FUNCTION "public"."is_master_user"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."preview_project_code"("p_location" "text") RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    AS $_$
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
$_$;


ALTER FUNCTION "public"."preview_project_code"("p_location" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."preview_project_code"("p_location" "text") IS 'Shows preview of next project code without reserving it';



CREATE OR REPLACE FUNCTION "public"."reserve_project_code"("p_location" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $_$
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
$_$;


ALTER FUNCTION "public"."reserve_project_code"("p_location" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."reserve_project_code"("p_location" "text") IS 'Reserves and returns the next available project code';



CREATE OR REPLACE FUNCTION "public"."set_role_level"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.role_level := CASE NEW.role_type
    WHEN 'Master' THEN 1
    WHEN 'Senior' THEN 2
    WHEN 'Mid' THEN 3
    WHEN 'External' THEN 4
    WHEN 'HR' THEN 5
  END;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_role_level"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_last_login"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.last_sign_in_at > OLD.last_sign_in_at THEN
    UPDATE public.user_profiles 
    SET last_login = NEW.last_sign_in_at,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_last_login"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_roi_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    roi_id uuid;
    total_revenue decimal(12,2) := 0;
    total_costs decimal(12,2) := 0;
    margin decimal(5,2) := 0;
    profit decimal(12,2) := 0;
BEGIN
    -- Get ROI ID from the changed record
    roi_id := COALESCE(NEW.roi_calculation_id, OLD.roi_calculation_id);
    
    -- Calculate revenue total
    SELECT COALESCE(SUM(estimate_value), 0) INTO total_revenue
    FROM revenue_streams 
    WHERE roi_calculation_id = roi_id AND enabled = true;
    
    -- Calculate cost total
    SELECT COALESCE(SUM(estimate_value), 0) INTO total_costs
    FROM cost_streams 
    WHERE roi_calculation_id = roi_id AND enabled = true;
    
    -- Calculate profit and margin
    profit := total_revenue - total_costs;
    IF total_revenue > 0 THEN
        margin := (profit / total_revenue) * 100;
    END IF;
    
    -- Update the ROI calculation
    UPDATE roi_calculations 
    SET 
        total_revenue_estimate = total_revenue,
        total_costs_estimate = total_costs,
        margin_percentage = margin,
        profit_estimate = profit,
        updated_at = now()
    WHERE id = roi_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_roi_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check if the table has an updated_at column
    IF TG_TABLE_NAME = 'user_profiles' OR TG_TABLE_NAME = 'user_roles' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "user_id" "uuid",
    "changes" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "position" "text",
    "contact_type" "text" NOT NULL,
    "is_decision_maker" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "client_contacts_contact_type_check" CHECK (("contact_type" = ANY (ARRAY['Primary'::"text", 'Financial'::"text", 'Technical'::"text", 'Management'::"text", 'Emergency'::"text"])))
);


ALTER TABLE "public"."client_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_requirements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "rfid_access_control" boolean DEFAULT false,
    "cashless_payments" boolean DEFAULT false,
    "ticketing_system" boolean DEFAULT false,
    "data_analytics" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."client_requirements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_satisfaction" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "nps_score" integer,
    "overall_satisfaction" integer,
    "positive_feedback" "text",
    "areas_for_improvement" "text",
    "survey_type" "text",
    "surveyed_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "client_satisfaction_nps_score_check" CHECK ((("nps_score" >= 0) AND ("nps_score" <= 10))),
    CONSTRAINT "client_satisfaction_overall_satisfaction_check" CHECK ((("overall_satisfaction" >= 1) AND ("overall_satisfaction" <= 5))),
    CONSTRAINT "client_satisfaction_survey_type_check" CHECK (("survey_type" = ANY (ARRAY['Post-Event'::"text", 'Annual'::"text", 'Ad-Hoc'::"text"])))
);


ALTER TABLE "public"."client_satisfaction" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_tier_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "previous_tier" "text",
    "new_tier" "text" NOT NULL,
    "change_reason" "text",
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."client_tier_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "company" "text" NOT NULL,
    "classification" "text" DEFAULT 'Direct'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "clients_classification_check" CHECK (("classification" = ANY (ARRAY['Canopy'::"text", 'Direct'::"text", 'Partner'::"text", 'Vendor'::"text"])))
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cost_streams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "roi_calculation_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "item_name" "text" NOT NULL,
    "unit_cost" numeric(10,2) DEFAULT 0,
    "quantity" integer DEFAULT 0,
    "days" integer DEFAULT 1,
    "estimate_value" numeric(12,2) DEFAULT 0,
    "enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cost_streams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."field_change_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_id" "uuid" NOT NULL,
    "changed_by" "uuid",
    "change_type" "text" NOT NULL,
    "old_value" "jsonb",
    "new_value" "jsonb",
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "field_change_log_change_type_check" CHECK (("change_type" = ANY (ARRAY['create'::"text", 'update'::"text", 'delete'::"text", 'lock'::"text", 'unlock'::"text", 'option_add'::"text", 'option_update'::"text", 'option_delete'::"text"])))
);


ALTER TABLE "public"."field_change_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."field_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_id" "uuid" NOT NULL,
    "field_name" character varying(100) NOT NULL,
    "display_name" character varying(100) NOT NULL,
    "field_type" character varying(50) NOT NULL,
    "description" "text",
    "is_sensitive" boolean DEFAULT false,
    "is_required" boolean DEFAULT false,
    "validation_rules" "jsonb",
    "default_value" "text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."field_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."field_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_id" "uuid" NOT NULL,
    "option_value" "text" NOT NULL,
    "option_label" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."field_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."field_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_id" "uuid" NOT NULL,
    "user_tier" character varying(20) NOT NULL,
    "permission_type" character varying(20) DEFAULT 'none'::character varying NOT NULL,
    "can_create" boolean DEFAULT false,
    "can_read" boolean DEFAULT false,
    "can_update" boolean DEFAULT false,
    "can_delete" boolean DEFAULT false,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "field_permissions_permission_type_check" CHECK ((("permission_type")::"text" = ANY ((ARRAY['full'::character varying, 'none'::character varying, 'assigned_only'::character varying, 'own_only'::character varying, 'read_only'::character varying])::"text"[]))),
    CONSTRAINT "field_permissions_user_tier_check" CHECK ((("user_tier")::"text" = ANY ((ARRAY['master'::character varying, 'senior'::character varying, 'mid'::character varying, 'external'::character varying, 'hr_finance'::character varying])::"text"[])))
);


ALTER TABLE "public"."field_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."field_usage_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_id" "uuid" NOT NULL,
    "used_in_module" "text" NOT NULL,
    "used_in_table" "text" NOT NULL,
    "used_in_column" "text" NOT NULL,
    "usage_count" integer DEFAULT 0 NOT NULL,
    "last_detected_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."field_usage_tracking" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."layout_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_id" character varying(100) NOT NULL,
    "name" character varying(100) DEFAULT 'Default Layout'::character varying NOT NULL,
    "description" "text",
    "is_locked" boolean DEFAULT false,
    "is_default" boolean DEFAULT false,
    "created_by" "uuid",
    "last_modified_by" "uuid",
    "version" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."layout_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."layout_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "layout_id" "uuid" NOT NULL,
    "item_id" character varying(100) NOT NULL,
    "item_type" character varying(50) NOT NULL,
    "title" character varying(200) NOT NULL,
    "description" "text",
    "component_name" character varying(100),
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_locked" boolean DEFAULT false,
    "is_hidden" boolean DEFAULT false,
    "is_archived" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "layout_items_type_check" CHECK ((("item_type")::"text" = ANY ((ARRAY['section'::character varying, 'field'::character varying, 'widget'::character varying, 'component'::character varying])::"text"[])))
);


ALTER TABLE "public"."layout_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."opportunities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_name" "text" NOT NULL,
    "event_name" "text" NOT NULL,
    "deal_value" numeric(15,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text",
    "stage" "text" NOT NULL,
    "lead_score" integer DEFAULT 0,
    "temperature" "text",
    "client_tier" "text",
    "event_type" "text",
    "owner_id" "uuid",
    "event_date" "date",
    "decision_date" "date",
    "win_probability" integer DEFAULT 50,
    "created_project_id" "uuid",
    "is_previous_client" boolean DEFAULT false,
    "budget_confirmed" boolean DEFAULT false,
    "multiple_events" boolean DEFAULT false,
    "referral_source" "text",
    "decision_maker_engaged" boolean DEFAULT false,
    "contract_link" "text",
    "contract_signed" boolean DEFAULT false,
    "last_activity_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "opportunities_client_tier_check" CHECK (("client_tier" = ANY (ARRAY['Seed'::"text", 'Sapling'::"text", 'Canopy'::"text", 'Jungle'::"text", 'Rainforest'::"text"]))),
    CONSTRAINT "opportunities_temperature_check" CHECK (("temperature" = ANY (ARRAY['Hot'::"text", 'Warm'::"text", 'Cold'::"text"])))
);


ALTER TABLE "public"."opportunities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."opportunity_activities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "opportunity_id" "uuid" NOT NULL,
    "activity_type" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "description" "text" NOT NULL,
    "duration" integer,
    "participants" "text"[],
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "opportunity_activities_activity_type_check" CHECK (("activity_type" = ANY (ARRAY['Email'::"text", 'Call'::"text", 'Meeting'::"text", 'Note'::"text"])))
);


ALTER TABLE "public"."opportunity_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section" character varying(50) NOT NULL,
    "page_name" character varying(100) NOT NULL,
    "display_name" character varying(100) NOT NULL,
    "description" "text",
    "is_critical" boolean DEFAULT false,
    "route_path" character varying(200),
    "icon_name" character varying(50),
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."page_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "user_tier" character varying(20) NOT NULL,
    "permission_type" character varying(20) DEFAULT 'none'::character varying NOT NULL,
    "can_create" boolean DEFAULT false,
    "can_read" boolean DEFAULT false,
    "can_update" boolean DEFAULT false,
    "can_delete" boolean DEFAULT false,
    "can_approve" boolean DEFAULT false,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "page_permissions_permission_type_check" CHECK ((("permission_type")::"text" = ANY ((ARRAY['full'::character varying, 'none'::character varying, 'assigned_only'::character varying, 'own_only'::character varying, 'read_only'::character varying])::"text"[]))),
    CONSTRAINT "page_permissions_user_tier_check" CHECK ((("user_tier")::"text" = ANY ((ARRAY['master'::character varying, 'senior'::character varying, 'mid'::character varying, 'external'::character varying, 'hr_finance'::character varying])::"text"[])))
);


ALTER TABLE "public"."page_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permission_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" character varying(20) NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "user_tier" character varying(20) NOT NULL,
    "action_type" character varying(50) NOT NULL,
    "old_permission" "jsonb",
    "new_permission" "jsonb",
    "changed_by" "uuid" NOT NULL,
    "change_reason" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "permission_audit_log_entity_type_check" CHECK ((("entity_type")::"text" = ANY ((ARRAY['page'::character varying, 'section'::character varying, 'field'::character varying])::"text"[]))),
    CONSTRAINT "permission_audit_log_user_tier_check" CHECK ((("user_tier")::"text" = ANY ((ARRAY['master'::character varying, 'senior'::character varying, 'mid'::character varying, 'external'::character varying, 'hr_finance'::character varying])::"text"[])))
);


ALTER TABLE "public"."permission_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_fields" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module" "text" NOT NULL,
    "section" "text" NOT NULL,
    "field_key" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "data_type" "text" NOT NULL,
    "required" boolean DEFAULT false NOT NULL,
    "default_value" "text",
    "is_system" boolean DEFAULT false NOT NULL,
    "is_system_locked" boolean DEFAULT false NOT NULL,
    "is_custom" boolean DEFAULT false NOT NULL,
    "has_options" boolean DEFAULT false NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "platform_fields_data_type_check" CHECK (("data_type" = ANY (ARRAY['text'::"text", 'number'::"text", 'date'::"text", 'datetime'::"text", 'boolean'::"text", 'select'::"text", 'multiselect'::"text", 'tag'::"text", 'json'::"text", 'currency'::"text", 'percent'::"text"])))
);


ALTER TABLE "public"."platform_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_user_roles" (
    "user_id" "uuid" NOT NULL,
    "role_level" "text" DEFAULT 'user'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "platform_user_roles_role_level_check" CHECK (("role_level" = ANY (ARRAY['master'::"text", 'senior'::"text", 'mid'::"text", 'external'::"text", 'hr'::"text", 'admin'::"text", 'user'::"text"])))
);


ALTER TABLE "public"."platform_user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_code_sequences" (
    "country_code" character varying(2) NOT NULL,
    "current_sequence" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_code_sequences" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_code_sequences" IS 'Tracks project code sequences per country for sequential numbering';



CREATE TABLE IF NOT EXISTS "public"."project_deletions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "performed_by" "uuid" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "project_deletions_action_type_check" CHECK (("action_type" = ANY (ARRAY['soft_delete'::"text", 'restore'::"text", 'permanent_delete'::"text"])))
);


ALTER TABLE "public"."project_deletions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "document_name" "text" NOT NULL,
    "document_type" "text" NOT NULL,
    "document_category" "text",
    "file_name" "text",
    "file_size_bytes" bigint,
    "mime_type" "text",
    "sharepoint_url" "text",
    "cloud_storage_path" "text",
    "is_client_visible" boolean DEFAULT false,
    "confidentiality_level" "text" DEFAULT 'Internal'::"text",
    "document_status" "text" DEFAULT 'Draft'::"text",
    "version_number" "text" DEFAULT '1.0'::"text",
    "uploaded_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "project_documents_confidentiality_level_check" CHECK (("confidentiality_level" = ANY (ARRAY['Public'::"text", 'Internal'::"text", 'Confidential'::"text", 'Restricted'::"text"]))),
    CONSTRAINT "project_documents_document_category_check" CHECK (("document_category" = ANY (ARRAY['Legal'::"text", 'Technical'::"text", 'Commercial'::"text", 'Operational'::"text", 'Compliance'::"text", 'Financial'::"text"]))),
    CONSTRAINT "project_documents_document_status_check" CHECK (("document_status" = ANY (ARRAY['Draft'::"text", 'Review'::"text", 'Approved'::"text", 'Superseded'::"text", 'Archived'::"text"]))),
    CONSTRAINT "project_documents_document_type_check" CHECK (("document_type" = ANY (ARRAY['Contract'::"text", 'Proposal'::"text", 'Technical Spec'::"text", 'Site Plan'::"text", 'Risk Assessment'::"text", 'Invoice'::"text", 'Other'::"text"])))
);


ALTER TABLE "public"."project_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text",
    "is_read" boolean DEFAULT false,
    "action_url" "text",
    "action_label" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "due_date" timestamp with time zone,
    CONSTRAINT "project_notifications_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "project_notifications_type_check" CHECK (("type" = ANY (ARRAY['task'::"text", 'warning'::"text", 'info'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."project_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_phases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "phase_name" "text" NOT NULL,
    "phase_order" integer NOT NULL,
    "status" "text" DEFAULT 'Not Started'::"text" NOT NULL,
    "progress_percentage" numeric(5,2) DEFAULT 0,
    "planned_start_date" "date",
    "planned_end_date" "date",
    "actual_start_date" "date",
    "actual_end_date" "date",
    "phase_description" "text",
    "key_deliverables" "text"[],
    "success_criteria" "text"[],
    "phase_owner_name" "text",
    "phase_owner_email" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "project_phases_phase_name_check" CHECK (("phase_name" = ANY (ARRAY['Discover'::"text", 'Build'::"text", 'Prepare'::"text", 'Deliver'::"text", 'Roundup'::"text"]))),
    CONSTRAINT "project_phases_progress_percentage_check" CHECK ((("progress_percentage" >= (0)::numeric) AND ("progress_percentage" <= (100)::numeric))),
    CONSTRAINT "project_phases_status_check" CHECK (("status" = ANY (ARRAY['Not Started'::"text", 'In Progress'::"text", 'Completed'::"text", 'Skipped'::"text", 'Blocked'::"text"])))
);


ALTER TABLE "public"."project_phases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_location" "text",
    "project_code" "text",
    "client_id" "uuid",
    "project_id" "text",
    "event_start_date" "date",
    "event_end_date" "date",
    "expected_attendance" integer,
    "event_type" "text",
    "current_phase" integer DEFAULT 1,
    "phase_progress" integer DEFAULT 25,
    "status" "text" DEFAULT 'Active'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "is_deleted" boolean DEFAULT false,
    "event_image" "text",
    "description" "text",
    "requirements" "text",
    "special_notes" "text",
    "updated_by" "uuid",
    "project_name" "text",
    "current_phase_text" "text",
    CONSTRAINT "projects_current_phase_text_check" CHECK (("current_phase_text" = ANY (ARRAY['Discover'::"text", 'Build'::"text", 'Prepare'::"text", 'Deliver'::"text", 'Roundup'::"text"])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projects_code_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."projects_code_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."revenue_streams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "roi_calculation_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "item_name" "text" NOT NULL,
    "unit_price" numeric(10,2) DEFAULT 0,
    "quantity" integer DEFAULT 0,
    "fee_percentage" numeric(5,2) DEFAULT 0,
    "performance_percentage" numeric(5,2) DEFAULT 100,
    "estimate_value" numeric(12,2) DEFAULT 0,
    "enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."revenue_streams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_calculations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "calculation_name" "text",
    "calculation_type" "text" DEFAULT 'detailed'::"text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "total_revenue_estimate" numeric(12,2) DEFAULT 0,
    "total_costs_estimate" numeric(12,2) DEFAULT 0,
    "margin_percentage" numeric(5,2) DEFAULT 0,
    "profit_estimate" numeric(12,2) DEFAULT 0,
    "client_tier" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roi_calculations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_scenarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "roi_calculation_id" "uuid" NOT NULL,
    "scenario_type" "text" NOT NULL,
    "attendance_variance" numeric DEFAULT 0,
    "adoption_rate_variance" numeric DEFAULT 0,
    "weather_impact" numeric DEFAULT 0,
    "technical_issues_allowance" numeric DEFAULT 0,
    "currency_fluctuation" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "roi_scenarios_scenario_type_check" CHECK (("scenario_type" = ANY (ARRAY['best'::"text", 'expected'::"text", 'worst'::"text"])))
);


ALTER TABLE "public"."roi_scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_name" "text" NOT NULL,
    "event_type" "text",
    "client_tier" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roi_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."section_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "section_name" character varying(100) NOT NULL,
    "display_name" character varying(100) NOT NULL,
    "description" "text",
    "is_financial" boolean DEFAULT false,
    "requires_approval" boolean DEFAULT false,
    "component_name" character varying(100),
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."section_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."section_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_id" "uuid" NOT NULL,
    "user_tier" character varying(20) NOT NULL,
    "permission_type" character varying(20) DEFAULT 'none'::character varying NOT NULL,
    "can_create" boolean DEFAULT false,
    "can_read" boolean DEFAULT false,
    "can_update" boolean DEFAULT false,
    "can_delete" boolean DEFAULT false,
    "can_approve" boolean DEFAULT false,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "section_permissions_permission_type_check" CHECK ((("permission_type")::"text" = ANY ((ARRAY['full'::character varying, 'none'::character varying, 'assigned_only'::character varying, 'own_only'::character varying, 'read_only'::character varying])::"text"[]))),
    CONSTRAINT "section_permissions_user_tier_check" CHECK ((("user_tier")::"text" = ANY ((ARRAY['master'::character varying, 'senior'::character varying, 'mid'::character varying, 'external'::character varying, 'hr_finance'::character varying])::"text"[])))
);


ALTER TABLE "public"."section_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "theme" "text" DEFAULT 'light'::"text",
    "language" "text" DEFAULT 'en'::"text",
    "date_format" "text" DEFAULT 'DD/MM/YYYY'::"text",
    "time_format" "text" DEFAULT '24h'::"text",
    "email_notifications" boolean DEFAULT true,
    "push_notifications" boolean DEFAULT true,
    "project_updates" boolean DEFAULT true,
    "system_alerts" boolean DEFAULT true,
    "default_view" "text" DEFAULT 'dashboard'::"text",
    "items_per_page" integer DEFAULT 25,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_preferences_theme_check" CHECK (("theme" = ANY (ARRAY['light'::"text", 'dark'::"text", 'auto'::"text"]))),
    CONSTRAINT "user_preferences_time_format_check" CHECK (("time_format" = ANY (ARRAY['12h'::"text", '24h'::"text"])))
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "display_name" "text",
    "phone" "text",
    "avatar_url" "text",
    "job_title" "text",
    "department" "text",
    "office_location" "text",
    "employee_id" "text",
    "start_date" "date",
    "manager_id" "uuid",
    "preferred_communication" "text",
    "timezone" "text",
    "emergency_contact_name" "text",
    "emergency_contact_phone" "text",
    "skills" "text"[],
    "certifications" "text"[],
    "languages" "text"[],
    "daily_rate" numeric(10,2),
    "currency" "text" DEFAULT 'GBP'::"text",
    "tax_status" "text",
    "availability_status" "text" DEFAULT 'available'::"text",
    "next_available_date" "date",
    "travel_willingness" "text",
    "passport_expiry" "date",
    "visa_requirements" "text"[],
    "insurance_valid_until" "date",
    "dbs_check_date" "date",
    "projects_completed" integer DEFAULT 0,
    "total_days_worked" integer DEFAULT 0,
    "average_client_rating" numeric(3,2),
    "last_performance_review" "date",
    "is_active" boolean DEFAULT true,
    "profile_completion_percentage" integer DEFAULT 0,
    "last_login" timestamp with time zone,
    "onboarding_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_profiles_availability_status_check" CHECK (("availability_status" = ANY (ARRAY['available'::"text", 'busy'::"text", 'unavailable'::"text", 'on_leave'::"text"]))),
    CONSTRAINT "user_profiles_department_check" CHECK (("department" = ANY (ARRAY['Operations'::"text", 'Sales'::"text", 'Technical'::"text", 'Finance'::"text", 'HR'::"text", 'Management'::"text"]))),
    CONSTRAINT "user_profiles_office_location_check" CHECK (("office_location" = ANY (ARRAY['UK'::"text", 'Spain'::"text", 'Remote'::"text", 'Client Site'::"text"]))),
    CONSTRAINT "user_profiles_preferred_communication_check" CHECK (("preferred_communication" = ANY (ARRAY['email'::"text", 'phone'::"text", 'teams'::"text", 'slack'::"text"]))),
    CONSTRAINT "user_profiles_tax_status_check" CHECK (("tax_status" = ANY (ARRAY['PAYE'::"text", 'Self-Employed'::"text", 'Limited Company'::"text", 'Overseas'::"text"]))),
    CONSTRAINT "user_profiles_travel_willingness_check" CHECK (("travel_willingness" = ANY (ARRAY['local'::"text", 'national'::"text", 'international'::"text", 'any'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_type" "text" NOT NULL,
    "role_level" integer NOT NULL,
    "role_description" "text",
    "assigned_by" "uuid",
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_roles_role_level_check" CHECK ((("role_level" >= 1) AND ("role_level" <= 5))),
    CONSTRAINT "user_roles_role_type_check" CHECK (("role_type" = ANY (ARRAY['Master'::"text", 'Senior'::"text", 'Mid'::"text", 'External'::"text", 'HR'::"text"])))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_start" timestamp with time zone DEFAULT "now"(),
    "session_end" timestamp with time zone,
    "ip_address" "inet",
    "user_agent" "text",
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "role_level" "text" DEFAULT 'user'::"text",
    "avatar_url" "text",
    "department" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_role_level_check" CHECK (("role_level" = ANY (ARRAY['master'::"text", 'senior'::"text", 'mid'::"text", 'external'::"text", 'hr'::"text", 'admin'::"text", 'user'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_contacts"
    ADD CONSTRAINT "client_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_requirements"
    ADD CONSTRAINT "client_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_satisfaction"
    ADD CONSTRAINT "client_satisfaction_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tier_history"
    ADD CONSTRAINT "client_tier_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cost_streams"
    ADD CONSTRAINT "cost_streams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."field_change_log"
    ADD CONSTRAINT "field_change_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."field_definitions"
    ADD CONSTRAINT "field_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."field_definitions"
    ADD CONSTRAINT "field_definitions_section_id_field_name_key" UNIQUE ("section_id", "field_name");



ALTER TABLE ONLY "public"."field_options"
    ADD CONSTRAINT "field_options_field_value_uk" UNIQUE ("field_id", "option_value");



ALTER TABLE ONLY "public"."field_options"
    ADD CONSTRAINT "field_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."field_permissions"
    ADD CONSTRAINT "field_permissions_field_id_user_tier_key" UNIQUE ("field_id", "user_tier");



ALTER TABLE ONLY "public"."field_permissions"
    ADD CONSTRAINT "field_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."field_usage_tracking"
    ADD CONSTRAINT "field_usage_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."layout_configs"
    ADD CONSTRAINT "layout_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."layout_items"
    ADD CONSTRAINT "layout_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opportunity_activities"
    ADD CONSTRAINT "opportunity_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_definitions"
    ADD CONSTRAINT "page_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_definitions"
    ADD CONSTRAINT "page_definitions_section_page_name_key" UNIQUE ("section", "page_name");



ALTER TABLE ONLY "public"."page_permissions"
    ADD CONSTRAINT "page_permissions_page_id_user_tier_key" UNIQUE ("page_id", "user_tier");



ALTER TABLE ONLY "public"."page_permissions"
    ADD CONSTRAINT "page_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permission_audit_log"
    ADD CONSTRAINT "permission_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_fields"
    ADD CONSTRAINT "platform_fields_module_section_key_uk" UNIQUE ("module", "section", "field_key");



ALTER TABLE ONLY "public"."platform_fields"
    ADD CONSTRAINT "platform_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_user_roles"
    ADD CONSTRAINT "platform_user_roles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."project_code_sequences"
    ADD CONSTRAINT "project_code_sequences_pkey" PRIMARY KEY ("country_code");



ALTER TABLE ONLY "public"."project_deletions"
    ADD CONSTRAINT "project_deletions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_documents"
    ADD CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_notifications"
    ADD CONSTRAINT "project_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_phases"
    ADD CONSTRAINT "project_phases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_phases"
    ADD CONSTRAINT "project_phases_project_id_phase_name_key" UNIQUE ("project_id", "phase_name");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."revenue_streams"
    ADD CONSTRAINT "revenue_streams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roi_calculations"
    ADD CONSTRAINT "roi_calculations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roi_scenarios"
    ADD CONSTRAINT "roi_scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roi_templates"
    ADD CONSTRAINT "roi_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."section_definitions"
    ADD CONSTRAINT "section_definitions_page_id_section_name_key" UNIQUE ("page_id", "section_name");



ALTER TABLE ONLY "public"."section_definitions"
    ADD CONSTRAINT "section_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."section_permissions"
    ADD CONSTRAINT "section_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."section_permissions"
    ADD CONSTRAINT "section_permissions_section_id_user_tier_key" UNIQUE ("section_id", "user_tier");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_is_active_key" UNIQUE ("user_id", "is_active");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_log_created_at" ON "public"."permission_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_log_entity" ON "public"."permission_audit_log" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at");



CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_logs_user" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_client_contacts_client_id" ON "public"."client_contacts" USING "btree" ("client_id");



CREATE INDEX "idx_client_requirements_client_id" ON "public"."client_requirements" USING "btree" ("client_id");



CREATE INDEX "idx_clients_classification" ON "public"."clients" USING "btree" ("classification");



CREATE INDEX "idx_clients_company" ON "public"."clients" USING "btree" ("company");



CREATE INDEX "idx_clients_email" ON "public"."clients" USING "btree" ("email");



CREATE INDEX "idx_cost_roi" ON "public"."cost_streams" USING "btree" ("roi_calculation_id");



CREATE INDEX "idx_field_change_log_changed_at" ON "public"."field_change_log" USING "btree" ("changed_at");



CREATE INDEX "idx_field_change_log_field_id" ON "public"."field_change_log" USING "btree" ("field_id");



CREATE INDEX "idx_field_definitions_section_id" ON "public"."field_definitions" USING "btree" ("section_id");



CREATE INDEX "idx_field_definitions_sensitive" ON "public"."field_definitions" USING "btree" ("is_sensitive");



CREATE INDEX "idx_field_options_field_id" ON "public"."field_options" USING "btree" ("field_id");



CREATE INDEX "idx_field_permissions_field_tier" ON "public"."field_permissions" USING "btree" ("field_id", "user_tier");



CREATE INDEX "idx_field_permissions_user_tier" ON "public"."field_permissions" USING "btree" ("user_tier");



CREATE INDEX "idx_field_usage_field_id" ON "public"."field_usage_tracking" USING "btree" ("field_id");



CREATE INDEX "idx_field_usage_location" ON "public"."field_usage_tracking" USING "btree" ("used_in_module", "used_in_table", "used_in_column");



CREATE INDEX "idx_layout_configs_page_id" ON "public"."layout_configs" USING "btree" ("page_id");



CREATE INDEX "idx_layout_items_layout_id" ON "public"."layout_items" USING "btree" ("layout_id");



CREATE INDEX "idx_layout_items_sort_order" ON "public"."layout_items" USING "btree" ("layout_id", "sort_order");



CREATE INDEX "idx_opportunities_owner_id" ON "public"."opportunities" USING "btree" ("owner_id");



CREATE INDEX "idx_opportunities_stage" ON "public"."opportunities" USING "btree" ("stage");



CREATE INDEX "idx_opportunity_activities_opportunity_id" ON "public"."opportunity_activities" USING "btree" ("opportunity_id");



CREATE INDEX "idx_page_definitions_active" ON "public"."page_definitions" USING "btree" ("is_active");



CREATE INDEX "idx_page_definitions_section" ON "public"."page_definitions" USING "btree" ("section");



CREATE INDEX "idx_page_permissions_page_tier" ON "public"."page_permissions" USING "btree" ("page_id", "user_tier");



CREATE INDEX "idx_page_permissions_user_tier" ON "public"."page_permissions" USING "btree" ("user_tier");



CREATE INDEX "idx_platform_fields_key" ON "public"."platform_fields" USING "btree" ("field_key");



CREATE INDEX "idx_platform_fields_module_section" ON "public"."platform_fields" USING "btree" ("module", "section");



CREATE INDEX "idx_project_documents_project_id" ON "public"."project_documents" USING "btree" ("project_id");



CREATE INDEX "idx_project_documents_type" ON "public"."project_documents" USING "btree" ("document_type");



CREATE INDEX "idx_project_notifications_is_read" ON "public"."project_notifications" USING "btree" ("is_read");



CREATE INDEX "idx_project_notifications_project_id" ON "public"."project_notifications" USING "btree" ("project_id");



CREATE INDEX "idx_project_phases_project_id" ON "public"."project_phases" USING "btree" ("project_id");



CREATE INDEX "idx_project_phases_status" ON "public"."project_phases" USING "btree" ("status");



CREATE INDEX "idx_projects_client_id" ON "public"."projects" USING "btree" ("client_id");



CREATE INDEX "idx_projects_current_phase_text" ON "public"."projects" USING "btree" ("current_phase_text");



CREATE INDEX "idx_projects_event_dates" ON "public"."projects" USING "btree" ("event_start_date", "event_end_date");



CREATE INDEX "idx_projects_is_deleted" ON "public"."projects" USING "btree" ("is_deleted");



CREATE INDEX "idx_projects_not_deleted" ON "public"."projects" USING "btree" ("is_deleted") WHERE ("is_deleted" = false);



CREATE INDEX "idx_projects_project_code" ON "public"."projects" USING "btree" ("project_code");



CREATE INDEX "idx_projects_project_code_country" ON "public"."projects" USING "btree" ("substring"("project_code", '^([A-Z]{2})-'::"text"));



CREATE UNIQUE INDEX "idx_projects_project_code_unique" ON "public"."projects" USING "btree" ("project_code") WHERE ("project_code" IS NOT NULL);



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_revenue_roi" ON "public"."revenue_streams" USING "btree" ("roi_calculation_id");



CREATE INDEX "idx_roi_calc_project" ON "public"."roi_calculations" USING "btree" ("project_id");



CREATE INDEX "idx_roi_scenarios_calc_id" ON "public"."roi_scenarios" USING "btree" ("roi_calculation_id");



CREATE INDEX "idx_section_definitions_financial" ON "public"."section_definitions" USING "btree" ("is_financial");



CREATE INDEX "idx_section_definitions_page_id" ON "public"."section_definitions" USING "btree" ("page_id");



CREATE INDEX "idx_section_permissions_section_tier" ON "public"."section_permissions" USING "btree" ("section_id", "user_tier");



CREATE INDEX "idx_section_permissions_user_tier" ON "public"."section_permissions" USING "btree" ("user_tier");



CREATE INDEX "idx_user_preferences_user_id" ON "public"."user_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_user_profiles_department" ON "public"."user_profiles" USING "btree" ("department");



CREATE INDEX "idx_user_profiles_email" ON "public"."user_profiles" USING "btree" ("email");



CREATE INDEX "idx_user_profiles_is_active" ON "public"."user_profiles" USING "btree" ("is_active");



CREATE INDEX "idx_user_profiles_office_location" ON "public"."user_profiles" USING "btree" ("office_location");



CREATE INDEX "idx_user_roles_is_active" ON "public"."user_roles" USING "btree" ("is_active");



CREATE INDEX "idx_user_roles_role_type" ON "public"."user_roles" USING "btree" ("role_type");



CREATE INDEX "idx_user_roles_user_id" ON "public"."user_roles" USING "btree" ("user_id");



CREATE INDEX "idx_user_sessions_active" ON "public"."user_sessions" USING "btree" ("user_id", "is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_user_sessions_user_id" ON "public"."user_sessions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "layout_configs_page_default_unique" ON "public"."layout_configs" USING "btree" ("page_id") WHERE ("is_default" = true);



CREATE UNIQUE INDEX "layout_items_layout_item_unique" ON "public"."layout_items" USING "btree" ("layout_id", "item_id");



CREATE UNIQUE INDEX "projects_project_code_uk" ON "public"."projects" USING "btree" ("project_code") WHERE ("project_code" IS NOT NULL);



CREATE OR REPLACE TRIGGER "trg_field_options_updated_at" BEFORE UPDATE ON "public"."field_options" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_platform_fields_updated_at" BEFORE UPDATE ON "public"."platform_fields" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_platform_user_roles_updated_at" BEFORE UPDATE ON "public"."platform_user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "update_roi_on_cost_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."cost_streams" FOR EACH ROW EXECUTE FUNCTION "public"."update_roi_totals"();



CREATE OR REPLACE TRIGGER "update_roi_on_revenue_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."revenue_streams" FOR EACH ROW EXECUTE FUNCTION "public"."update_roi_totals"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_roles_updated_at" BEFORE UPDATE ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."cost_streams"
    ADD CONSTRAINT "cost_streams_roi_calculation_id_fkey" FOREIGN KEY ("roi_calculation_id") REFERENCES "public"."roi_calculations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."field_change_log"
    ADD CONSTRAINT "field_change_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."field_change_log"
    ADD CONSTRAINT "field_change_log_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."platform_fields"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."field_definitions"
    ADD CONSTRAINT "field_definitions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."section_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."field_options"
    ADD CONSTRAINT "field_options_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."field_options"
    ADD CONSTRAINT "field_options_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."platform_fields"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."field_options"
    ADD CONSTRAINT "field_options_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."field_permissions"
    ADD CONSTRAINT "field_permissions_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."field_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."field_permissions"
    ADD CONSTRAINT "field_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."field_usage_tracking"
    ADD CONSTRAINT "field_usage_tracking_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."platform_fields"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."layout_configs"
    ADD CONSTRAINT "layout_configs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."layout_configs"
    ADD CONSTRAINT "layout_configs_last_modified_by_fkey" FOREIGN KEY ("last_modified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."layout_items"
    ADD CONSTRAINT "layout_items_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "public"."layout_configs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_created_project_id_fkey" FOREIGN KEY ("created_project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."opportunity_activities"
    ADD CONSTRAINT "opportunity_activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."opportunity_activities"
    ADD CONSTRAINT "opportunity_activities_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."page_permissions"
    ADD CONSTRAINT "page_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."page_permissions"
    ADD CONSTRAINT "page_permissions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."page_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."permission_audit_log"
    ADD CONSTRAINT "permission_audit_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."platform_fields"
    ADD CONSTRAINT "platform_fields_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."platform_fields"
    ADD CONSTRAINT "platform_fields_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."platform_user_roles"
    ADD CONSTRAINT "platform_user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_deletions"
    ADD CONSTRAINT "project_deletions_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."project_deletions"
    ADD CONSTRAINT "project_deletions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."project_documents"
    ADD CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_notifications"
    ADD CONSTRAINT "project_notifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."project_notifications"
    ADD CONSTRAINT "project_notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_phases"
    ADD CONSTRAINT "project_phases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."revenue_streams"
    ADD CONSTRAINT "revenue_streams_roi_calculation_id_fkey" FOREIGN KEY ("roi_calculation_id") REFERENCES "public"."roi_calculations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roi_calculations"
    ADD CONSTRAINT "roi_calculations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."section_definitions"
    ADD CONSTRAINT "section_definitions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."page_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."section_permissions"
    ADD CONSTRAINT "section_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."section_permissions"
    ADD CONSTRAINT "section_permissions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."section_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow anon users to manage clients" ON "public"."clients" TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users full access" ON "public"."opportunity_activities" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users full access" ON "public"."projects" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to delete clients" ON "public"."clients" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to insert clients" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert sequences" ON "public"."project_code_sequences" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read sequences" ON "public"."project_code_sequences" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update clients" ON "public"."clients" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update sequences" ON "public"."project_code_sequences" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to view clients" ON "public"."clients" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert audit logs" ON "public"."audit_logs" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can manage opportunities" ON "public"."opportunities" TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can manage opportunity activities" ON "public"."opportunity_activities" TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can manage project notifications" ON "public"."project_notifications" TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can manage projects" ON "public"."projects" TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read opportunities" ON "public"."opportunities" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read opportunity activities" ON "public"."opportunity_activities" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read project notifications" ON "public"."project_notifications" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read projects" ON "public"."projects" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable insert for all users" ON "public"."opportunities" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."projects" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."opportunities" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "Enable update for all users" ON "public"."opportunities" FOR UPDATE USING (true);



CREATE POLICY "Enable update for all users" ON "public"."projects" FOR UPDATE USING (true);



CREATE POLICY "Everyone can read audit log" ON "public"."permission_audit_log" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Everyone can read field definitions" ON "public"."field_definitions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Everyone can read field permissions" ON "public"."field_permissions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Everyone can read page definitions" ON "public"."page_definitions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Everyone can read page permissions" ON "public"."page_permissions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Everyone can read section definitions" ON "public"."section_definitions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Everyone can read section permissions" ON "public"."section_permissions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Master users can assign roles" ON "public"."user_roles" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (("auth"."uid"() IN ( SELECT "user_roles_1"."user_id"
   FROM "public"."user_roles" "user_roles_1"
  WHERE (("user_roles_1"."role_type" = 'Master'::"text") AND ("user_roles_1"."is_active" = true)))) OR (NOT (EXISTS ( SELECT 1
   FROM "public"."user_roles" "user_roles_1"
 LIMIT 1))))));



CREATE POLICY "Master users can create profiles" ON "public"."user_profiles" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (("auth"."uid"() IN ( SELECT "user_roles"."user_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."role_type" = 'Master'::"text") AND ("user_roles"."is_active" = true)))) OR (NOT (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "user_profiles_1"
 LIMIT 1))))));



CREATE POLICY "Master users can manage layout items" ON "public"."layout_items" USING ((EXISTS ( SELECT 1
   FROM "public"."platform_user_roles"
  WHERE (("platform_user_roles"."user_id" = "auth"."uid"()) AND ("platform_user_roles"."role_level" = 'master'::"text")))));



CREATE POLICY "Master users can manage layouts" ON "public"."layout_configs" USING ((EXISTS ( SELECT 1
   FROM "public"."platform_user_roles"
  WHERE (("platform_user_roles"."user_id" = "auth"."uid"()) AND ("platform_user_roles"."role_level" = 'master'::"text")))));



CREATE POLICY "Master users can update any profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "user_roles"."user_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."role_type" = 'Master'::"text") AND ("user_roles"."is_active" = true)))));



CREATE POLICY "Master users can update roles" ON "public"."user_roles" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "user_roles_1"."user_id"
   FROM "public"."user_roles" "user_roles_1"
  WHERE (("user_roles_1"."role_type" = 'Master'::"text") AND ("user_roles_1"."is_active" = true)))));



CREATE POLICY "Master users can view all audit logs" ON "public"."audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role_type" = 'master'::"text") AND ("ur"."is_active" = true)))));



CREATE POLICY "Masters can manage page definitions" ON "public"."page_definitions" USING ((EXISTS ( SELECT 1
   FROM "public"."platform_user_roles"
  WHERE (("platform_user_roles"."user_id" = "auth"."uid"()) AND ("platform_user_roles"."role_level" = 'master'::"text")))));



CREATE POLICY "Public profiles are viewable by authenticated users" ON "public"."user_profiles" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND ("is_active" = true)));



CREATE POLICY "Roles are viewable by authenticated users" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "System can insert sessions" ON "public"."user_sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own preferences" ON "public"."user_preferences" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read all users" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view layout items" ON "public"."layout_items" FOR SELECT USING (true);



CREATE POLICY "Users can view layouts" ON "public"."layout_configs" FOR SELECT USING (true);



CREATE POLICY "Users can view own audit logs" ON "public"."audit_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own sessions" ON "public"."user_sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own audit logs" ON "public"."audit_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_requirements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_satisfaction" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tier_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cost_policy" ON "public"."cost_streams" TO "authenticated" USING (true);



ALTER TABLE "public"."cost_streams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."field_change_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "field_change_log_insert_master" ON "public"."field_change_log" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_master"("auth"."uid"()));



CREATE POLICY "field_change_log_select_auth" ON "public"."field_change_log" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."field_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."field_options" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "field_options_manage_master" ON "public"."field_options" TO "authenticated" USING ("public"."is_master"("auth"."uid"())) WITH CHECK ("public"."is_master"("auth"."uid"()));



CREATE POLICY "field_options_select_auth" ON "public"."field_options" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."field_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."field_usage_tracking" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "field_usage_tracking_manage_master" ON "public"."field_usage_tracking" TO "authenticated" USING ("public"."is_master"("auth"."uid"())) WITH CHECK ("public"."is_master"("auth"."uid"()));



CREATE POLICY "field_usage_tracking_select_auth" ON "public"."field_usage_tracking" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."layout_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."layout_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."opportunities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."opportunity_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."page_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."page_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permission_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_fields" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "platform_fields_manage_master" ON "public"."platform_fields" TO "authenticated" USING ("public"."is_master"("auth"."uid"())) WITH CHECK ("public"."is_master"("auth"."uid"()));



CREATE POLICY "platform_fields_select_auth" ON "public"."platform_fields" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."platform_user_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "platform_user_roles_manage_master" ON "public"."platform_user_roles" TO "authenticated" USING ("public"."is_master"("auth"."uid"())) WITH CHECK ("public"."is_master"("auth"."uid"()));



CREATE POLICY "platform_user_roles_select_self_or_master" ON "public"."platform_user_roles" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_master"("auth"."uid"())));



ALTER TABLE "public"."project_code_sequences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "project_documents_read_policy" ON "public"."project_documents" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."project_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_phases" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "project_phases_read_policy" ON "public"."project_phases" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "revenue_policy" ON "public"."revenue_streams" TO "authenticated" USING (true);



ALTER TABLE "public"."revenue_streams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roi_calculations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roi_policy" ON "public"."roi_calculations" TO "authenticated" USING (true);



ALTER TABLE "public"."roi_scenarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roi_scenarios all (auth)" ON "public"."roi_scenarios" TO "authenticated" USING (true);



CREATE POLICY "roi_scenarios select (auth)" ON "public"."roi_scenarios" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."roi_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."section_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."section_permissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "template_policy" ON "public"."roi_templates" TO "authenticated" USING (true);



ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_profile_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_profile_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_profile_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_page_permission"("p_user_id" "uuid", "p_page_name" character varying, "p_action" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."check_page_permission"("p_user_id" "uuid", "p_page_name" character varying, "p_action" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_page_permission"("p_user_id" "uuid", "p_page_name" character varying, "p_action" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_permission"("user_id" "uuid", "required_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_permission"("user_id" "uuid", "required_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_permission"("user_id" "uuid", "required_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."extract_country_code"("p_location" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."extract_country_code"("p_location" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."extract_country_code"("p_location" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_project_code"("p_region" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_project_code"("p_region" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_project_code"("p_region" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_sequential_project_code"("p_location" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_sequential_project_code"("p_location" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_sequential_project_code"("p_location" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_region_code"("p_location" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_region_code"("p_location" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_region_code"("p_location" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_role_level"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_role_level"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_role_level"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_page_permissions"("p_user_id" "uuid", "p_page_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_page_permissions"("p_user_id" "uuid", "p_page_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_page_permissions"("p_user_id" "uuid", "p_page_name" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role_level"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role_level"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role_level"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_master"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_master"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_master"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_master_user"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_master_user"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_master_user"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."preview_project_code"("p_location" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."preview_project_code"("p_location" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."preview_project_code"("p_location" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reserve_project_code"("p_location" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reserve_project_code"("p_location" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reserve_project_code"("p_location" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_role_level"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_role_level"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_role_level"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_last_login"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_last_login"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_last_login"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_roi_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_roi_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_roi_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."client_contacts" TO "anon";
GRANT ALL ON TABLE "public"."client_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."client_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."client_requirements" TO "anon";
GRANT ALL ON TABLE "public"."client_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."client_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."client_satisfaction" TO "anon";
GRANT ALL ON TABLE "public"."client_satisfaction" TO "authenticated";
GRANT ALL ON TABLE "public"."client_satisfaction" TO "service_role";



GRANT ALL ON TABLE "public"."client_tier_history" TO "anon";
GRANT ALL ON TABLE "public"."client_tier_history" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tier_history" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."cost_streams" TO "anon";
GRANT ALL ON TABLE "public"."cost_streams" TO "authenticated";
GRANT ALL ON TABLE "public"."cost_streams" TO "service_role";



GRANT ALL ON TABLE "public"."field_change_log" TO "anon";
GRANT ALL ON TABLE "public"."field_change_log" TO "authenticated";
GRANT ALL ON TABLE "public"."field_change_log" TO "service_role";



GRANT ALL ON TABLE "public"."field_definitions" TO "anon";
GRANT ALL ON TABLE "public"."field_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."field_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."field_options" TO "anon";
GRANT ALL ON TABLE "public"."field_options" TO "authenticated";
GRANT ALL ON TABLE "public"."field_options" TO "service_role";



GRANT ALL ON TABLE "public"."field_permissions" TO "anon";
GRANT ALL ON TABLE "public"."field_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."field_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."field_usage_tracking" TO "anon";
GRANT ALL ON TABLE "public"."field_usage_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."field_usage_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."layout_configs" TO "anon";
GRANT ALL ON TABLE "public"."layout_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."layout_configs" TO "service_role";



GRANT ALL ON TABLE "public"."layout_items" TO "anon";
GRANT ALL ON TABLE "public"."layout_items" TO "authenticated";
GRANT ALL ON TABLE "public"."layout_items" TO "service_role";



GRANT ALL ON TABLE "public"."opportunities" TO "anon";
GRANT ALL ON TABLE "public"."opportunities" TO "authenticated";
GRANT ALL ON TABLE "public"."opportunities" TO "service_role";



GRANT ALL ON TABLE "public"."opportunity_activities" TO "anon";
GRANT ALL ON TABLE "public"."opportunity_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."opportunity_activities" TO "service_role";



GRANT ALL ON TABLE "public"."page_definitions" TO "anon";
GRANT ALL ON TABLE "public"."page_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."page_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."page_permissions" TO "anon";
GRANT ALL ON TABLE "public"."page_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."page_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."permission_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."permission_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."permission_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."platform_fields" TO "anon";
GRANT ALL ON TABLE "public"."platform_fields" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_fields" TO "service_role";



GRANT ALL ON TABLE "public"."platform_user_roles" TO "anon";
GRANT ALL ON TABLE "public"."platform_user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."project_code_sequences" TO "anon";
GRANT ALL ON TABLE "public"."project_code_sequences" TO "authenticated";
GRANT ALL ON TABLE "public"."project_code_sequences" TO "service_role";



GRANT ALL ON TABLE "public"."project_deletions" TO "anon";
GRANT ALL ON TABLE "public"."project_deletions" TO "authenticated";
GRANT ALL ON TABLE "public"."project_deletions" TO "service_role";



GRANT ALL ON TABLE "public"."project_documents" TO "anon";
GRANT ALL ON TABLE "public"."project_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."project_documents" TO "service_role";



GRANT ALL ON TABLE "public"."project_notifications" TO "anon";
GRANT ALL ON TABLE "public"."project_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."project_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."project_phases" TO "anon";
GRANT ALL ON TABLE "public"."project_phases" TO "authenticated";
GRANT ALL ON TABLE "public"."project_phases" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projects_code_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_code_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_code_seq" TO "service_role";



GRANT ALL ON TABLE "public"."revenue_streams" TO "anon";
GRANT ALL ON TABLE "public"."revenue_streams" TO "authenticated";
GRANT ALL ON TABLE "public"."revenue_streams" TO "service_role";



GRANT ALL ON TABLE "public"."roi_calculations" TO "anon";
GRANT ALL ON TABLE "public"."roi_calculations" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_calculations" TO "service_role";



GRANT ALL ON TABLE "public"."roi_scenarios" TO "anon";
GRANT ALL ON TABLE "public"."roi_scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_scenarios" TO "service_role";



GRANT ALL ON TABLE "public"."roi_templates" TO "anon";
GRANT ALL ON TABLE "public"."roi_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_templates" TO "service_role";



GRANT ALL ON TABLE "public"."section_definitions" TO "anon";
GRANT ALL ON TABLE "public"."section_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."section_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."section_permissions" TO "anon";
GRANT ALL ON TABLE "public"."section_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."section_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
