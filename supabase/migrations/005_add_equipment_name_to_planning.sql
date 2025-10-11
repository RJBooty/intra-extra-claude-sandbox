-- Add equipment_name column to project_equipment_planning
-- This allows storing custom equipment names when equipment_item_id is null

ALTER TABLE project_equipment_planning
ADD COLUMN IF NOT EXISTS equipment_name TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN project_equipment_planning.equipment_name IS
'Custom equipment name when equipment_item_id is null (for items not in master inventory)';
