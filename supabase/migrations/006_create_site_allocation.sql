-- Create table for site allocation (assigning equipment to physical locations)
CREATE TABLE IF NOT EXISTS project_site_allocation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  equipment_item_id UUID REFERENCES equipment_items(id) ON DELETE SET NULL,
  category TEXT NOT NULL, -- e.g., 'access-control', 'accreditation', 'pos', 'topup', 'production', 'other'
  location_name TEXT NOT NULL, -- e.g., 'Main Entrance', 'VIP Bar', etc.
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_site_allocation_project_id ON project_site_allocation(project_id);
CREATE INDEX IF NOT EXISTS idx_site_allocation_equipment_item_id ON project_site_allocation(equipment_item_id);
CREATE INDEX IF NOT EXISTS idx_site_allocation_category ON project_site_allocation(category);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_allocation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_allocation_updated_at
  BEFORE UPDATE ON project_site_allocation
  FOR EACH ROW
  EXECUTE FUNCTION update_site_allocation_updated_at();

-- Add comments
COMMENT ON TABLE project_site_allocation IS 'Stores equipment allocation to specific physical locations within a project';
COMMENT ON COLUMN project_site_allocation.category IS 'The category/section of the site (access-control, accreditation, pos, topup, production, other)';
COMMENT ON COLUMN project_site_allocation.location_name IS 'The specific location within the category (e.g., Main Entrance, VIP Bar)';
COMMENT ON COLUMN project_site_allocation.equipment_item_id IS 'Reference to equipment item from master inventory';

-- Enable RLS
ALTER TABLE project_site_allocation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth setup)
CREATE POLICY "Users can view site allocation for their projects" ON project_site_allocation
  FOR SELECT USING (true);

CREATE POLICY "Users can insert site allocation for their projects" ON project_site_allocation
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update site allocation for their projects" ON project_site_allocation
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete site allocation for their projects" ON project_site_allocation
  FOR DELETE USING (true);
