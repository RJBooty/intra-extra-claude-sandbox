/*
  # Fix clients table classification column

  1. Changes
    - Ensure clients table has proper classification column with correct check constraint
    - Add any missing columns or constraints

  2. Security
    - No changes to RLS policies
*/

-- Ensure clients table has the classification column with proper constraint
DO $$
BEGIN
  -- Add classification column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'classification'
  ) THEN
    ALTER TABLE clients ADD COLUMN classification text DEFAULT 'Canopy' NOT NULL;
  END IF;
  
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'clients' AND constraint_name = 'clients_classification_check'
  ) THEN
    ALTER TABLE clients DROP CONSTRAINT clients_classification_check;
  END IF;
  
  -- Add new constraint
  ALTER TABLE clients ADD CONSTRAINT clients_classification_check 
  CHECK (classification IN ('Canopy', 'Direct', 'Partner', 'Vendor'));
END $$;