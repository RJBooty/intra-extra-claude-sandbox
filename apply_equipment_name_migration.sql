-- Run this SQL in your Supabase SQL Editor to add the equipment_name column

ALTER TABLE project_equipment_planning
ADD COLUMN IF NOT EXISTS equipment_name TEXT;

-- Add comment
COMMENT ON COLUMN project_equipment_planning.equipment_name IS
'Custom equipment name when equipment_item_id is null (for items not in master inventory)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'project_equipment_planning'
ORDER BY ordinal_position;
