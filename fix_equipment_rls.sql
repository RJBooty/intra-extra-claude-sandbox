-- Fix RLS policies for equipment tables
-- This allows authenticated users to read equipment data

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can read equipment items" ON equipment_items;
DROP POLICY IF EXISTS "Authenticated users can read equipment categories" ON equipment_categories;
DROP POLICY IF EXISTS "Authenticated users can read equipment bundles" ON equipment_bundles;
DROP POLICY IF EXISTS "Authenticated users can read bundle items" ON equipment_bundle_items;

-- Create read policies for authenticated users
CREATE POLICY "Authenticated users can read equipment items"
    ON equipment_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read equipment categories"
    ON equipment_categories
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read equipment bundles"
    ON equipment_bundles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read bundle items"
    ON equipment_bundle_items
    FOR SELECT
    TO authenticated
    USING (true);

-- Verify RLS is enabled
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_bundle_items ENABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies created for equipment tables';
END $$;
