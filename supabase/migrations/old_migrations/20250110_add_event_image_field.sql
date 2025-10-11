-- Add event_image field to projects table
-- This migration adds a new optional event_image field for storing event image URLs

DO $$
BEGIN
    -- Check if projects table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'projects' AND table_schema = 'public'
    ) THEN
        -- Check if event_image column already exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'event_image' AND table_schema = 'public'
        ) THEN
            RAISE NOTICE 'Adding event_image column to projects table';
            ALTER TABLE projects ADD COLUMN event_image text;
            RAISE NOTICE 'event_image column added successfully';
        ELSE
            RAISE NOTICE 'event_image column already exists in projects table';
        END IF;
    ELSE
        RAISE NOTICE 'Projects table does not exist - run other migrations first';
    END IF;
END $$;

-- Log what we accomplished
DO $$
DECLARE
    event_image_exists boolean := false;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'event_image' AND table_schema = 'public'
    ) INTO event_image_exists;
    
    IF event_image_exists THEN
        RAISE NOTICE 'Migration completed: event_image field is now available in projects table';
    ELSE
        RAISE NOTICE 'Migration failed: event_image field was not added to projects table';
    END IF;
END $$;