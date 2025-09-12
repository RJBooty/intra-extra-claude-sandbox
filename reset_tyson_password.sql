-- Reset password for tyson@casfid.com
-- This needs to be run with admin privileges in Supabase

-- First, find the user ID
SELECT id, email, encrypted_password, created_at, updated_at 
FROM auth.users 
WHERE email = 'tyson@casfid.com';

-- Since the login form requires minimum 6 characters, we'll set a simple password: "123456"
-- Note: In a real production environment, this should be a proper temporary password

-- Update the user to have a known password and confirm their email
UPDATE auth.users 
SET 
    encrypted_password = crypt('123456', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = CASE 
        WHEN email_confirmed_at IS NULL THEN NOW() 
        ELSE email_confirmed_at 
    END
WHERE email = 'tyson@casfid.com';

-- Verify the update
SELECT id, email, 
       CASE WHEN encrypted_password IS NOT NULL THEN '[PASSWORD SET]' ELSE '[NO PASSWORD]' END as password_status,
       email_confirmed_at, created_at, updated_at 
FROM auth.users 
WHERE email = 'tyson@casfid.com';

-- Instructions:
-- After running this script, you can login with:
-- Email: tyson@casfid.com  
-- Password: 123456