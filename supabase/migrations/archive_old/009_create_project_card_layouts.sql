-- Create table for storing project card layouts (positions and sizes)
CREATE TABLE IF NOT EXISTS project_card_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code TEXT NOT NULL,
    card_id TEXT NOT NULL,
    title TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    grid_column INTEGER NOT NULL,
    grid_row INTEGER NOT NULL,
    grid_column_span INTEGER NOT NULL,
    grid_row_span INTEGER NOT NULL,
    card_type TEXT NOT NULL,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_code, card_id)
);

-- Create table for storing project field values
CREATE TABLE IF NOT EXISTS project_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code TEXT NOT NULL,
    card_id TEXT NOT NULL,
    field_id TEXT NOT NULL,
    field_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_code, card_id, field_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_card_layouts_project_code
    ON project_card_layouts(project_code);

CREATE INDEX IF NOT EXISTS idx_project_field_values_project_code
    ON project_field_values(project_code);

CREATE INDEX IF NOT EXISTS idx_project_field_values_card_id
    ON project_field_values(project_code, card_id);

-- Add RLS policies for project_card_layouts
ALTER TABLE project_card_layouts ENABLE ROW LEVEL SECURITY;

-- Users can view card layouts for projects they have access to
CREATE POLICY "Users can view project card layouts"
    ON project_card_layouts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_assignments pa
            WHERE pa.project_code = project_card_layouts.project_code
            AND pa.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('Master', 'Senior')
        )
    );

-- Users can insert/update card layouts for projects they have access to
CREATE POLICY "Users can modify project card layouts"
    ON project_card_layouts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM project_assignments pa
            WHERE pa.project_code = project_card_layouts.project_code
            AND pa.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('Master', 'Senior')
        )
    );

-- Add RLS policies for project_field_values
ALTER TABLE project_field_values ENABLE ROW LEVEL SECURITY;

-- Users can view field values for projects they have access to
CREATE POLICY "Users can view project field values"
    ON project_field_values FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_assignments pa
            WHERE pa.project_code = project_field_values.project_code
            AND pa.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('Master', 'Senior')
        )
    );

-- Users can insert/update field values for projects they have access to
CREATE POLICY "Users can modify project field values"
    ON project_field_values FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM project_assignments pa
            WHERE pa.project_code = project_field_values.project_code
            AND pa.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('Master', 'Senior')
        )
    );

-- Add updated_at trigger for project_card_layouts
CREATE OR REPLACE FUNCTION update_project_card_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_card_layouts_updated_at
    BEFORE UPDATE ON project_card_layouts
    FOR EACH ROW
    EXECUTE FUNCTION update_project_card_layouts_updated_at();

-- Add updated_at trigger for project_field_values
CREATE OR REPLACE FUNCTION update_project_field_values_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_field_values_updated_at
    BEFORE UPDATE ON project_field_values
    FOR EACH ROW
    EXECUTE FUNCTION update_project_field_values_updated_at();
