-- Clean up duplicate policies
-- Run this in Supabase SQL Editor to remove existing policies before rerunning migrations

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clients;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.clients;  
DROP POLICY IF EXISTS "Enable update for all users" ON public.clients;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable update for all users" ON public.projects;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.opportunities;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.opportunities;
DROP POLICY IF EXISTS "Enable update for all users" ON public.opportunities;

-- Now you can safely run your fixed migration files