# Database Migration Required

## Step 1: Apply Migration

Go to your Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Add equipment_name column for custom equipment items
ALTER TABLE project_equipment_planning
ADD COLUMN IF NOT EXISTS equipment_name TEXT;

-- Verify it was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'project_equipment_planning'
ORDER BY ordinal_position;
```

## Step 2: Verify

You should see a new column `equipment_name` with type `text` and `is_nullable` = YES.

## What This Does

This allows the logistics system to store:
- **Items from inventory**: `equipment_item_id` is set, `equipment_name` is NULL
- **Custom items**: `equipment_item_id` is NULL, `equipment_name` contains the custom name

This gives you flexibility to add items from your master inventory OR create custom one-off items.

## Already Done ✅

- Created `logisticsService.ts` with full CRUD operations
- Service handles both inventory and custom items automatically
- Ready to integrate into Logistics component
