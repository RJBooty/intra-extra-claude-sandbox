-- Drop existing policies
DROP POLICY IF EXISTS "Users can modify project card layouts" ON project_card_layouts;
DROP POLICY IF EXISTS "Users can modify project field values" ON project_field_values;

-- Recreate policies with WITH CHECK clause for INSERT operations
CREATE POLICY "Users can modify project card layouts"
    ON project_card_layouts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM project_assignments pa
            JOIN projects p ON p.id = pa.project_id
            WHERE p.project_code = project_card_layouts.project_code
            AND pa.user_profile_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('Master', 'Senior')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_assignments pa
            JOIN projects p ON p.id = pa.project_id
            WHERE p.project_code = project_card_layouts.project_code
            AND pa.user_profile_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('Master', 'Senior')
        )
    );

CREATE POLICY "Users can modify project field values"
    ON project_field_values FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM project_assignments pa
            JOIN projects p ON p.id = pa.project_id
            WHERE p.project_code = project_field_values.project_code
            AND pa.user_profile_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('Master', 'Senior')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_assignments pa
            JOIN projects p ON p.id = pa.project_id
            WHERE p.project_code = project_field_values.project_code
            AND pa.user_profile_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('Master', 'Senior')
        )
    );
