/*
  # Fix event_type column name in projects table

  1. Changes
    - Rename `classification` column to `event_type` in projects table to match the application code
    - Update the check constraint to use the new column name
    - Maintain all existing data and constraints

  2. Security
    - No changes to RLS policies
*/

-- Rename classification column to event_type in projects table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'classification'
  ) THEN
    ALTER TABLE projects RENAME COLUMN classification TO event_type;
  END IF;
END $$;

-- Update the check constraint name and values
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projects' AND constraint_name = 'projects_classification_check'
  ) THEN
    ALTER TABLE projects DROP CONSTRAINT projects_classification_check;
  END IF;
  
  -- Add new constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projects' AND constraint_name = 'projects_event_type_check'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_event_type_check 
    CHECK (event_type IN ('Conference', 'Festival', 'Exhibition', 'Sports', 'Corporate', 'Other'));
  END IF;
END $$;