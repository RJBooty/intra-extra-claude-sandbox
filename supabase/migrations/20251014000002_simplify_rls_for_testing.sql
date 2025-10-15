-- Temporarily create more permissive policies for authenticated users
-- This allows any authenticated user to save/load their layouts for testing

DROP POLICY IF EXISTS "Users can modify project card layouts" ON project_card_layouts;
DROP POLICY IF EXISTS "Users can view project card layouts" ON project_card_layouts;
DROP POLICY IF EXISTS "Users can modify project field values" ON project_field_values;
DROP POLICY IF EXISTS "Users can view project field values" ON project_field_values;

-- Allow authenticated users to view all card layouts
CREATE POLICY "Authenticated users can view project card layouts"
    ON project_card_layouts FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to modify card layouts
CREATE POLICY "Authenticated users can modify project card layouts"
    ON project_card_layouts FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to view all field values
CREATE POLICY "Authenticated users can view project field values"
    ON project_field_values FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to modify field values
CREATE POLICY "Authenticated users can modify project field values"
    ON project_field_values FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
