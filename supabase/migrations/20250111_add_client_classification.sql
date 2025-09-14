-- Add missing classification column to clients table
-- This fixes the client creation issue

-- First check if column exists, then add it if missing
DO $$
BEGIN
    -- Check if classification column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'classification' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Adding classification column to clients table';
        ALTER TABLE clients ADD COLUMN classification text NOT NULL DEFAULT 'Direct' CHECK (classification IN ('Canopy', 'Direct', 'Partner', 'Vendor'));
    ELSE
        RAISE NOTICE 'Classification column already exists in clients table';
    END IF;
END $$;