-- Quick schema check for projects table
-- Run this to see what columns actually exist

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if the table exists at all
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_name = 'projects' 
    AND table_schema = 'public'
) as projects_table_exists;