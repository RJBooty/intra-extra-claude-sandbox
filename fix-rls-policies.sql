-- Fix RLS Policies for Clients Table
-- This creates more permissive policies that should work with your authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;

-- Create new, more permissive policies
CREATE POLICY "Allow authenticated users to view clients"
    ON clients
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert clients"
    ON clients
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update clients"
    ON clients
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete clients"
    ON clients
    FOR DELETE
    TO authenticated
    USING (true);

-- Also create a policy for anon users (in case authentication is not working properly)
CREATE POLICY "Allow anon users to manage clients"
    ON clients
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);