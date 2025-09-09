-- Setup script to run the permissions migration and test data
-- Run this in Supabase SQL Editor

-- First, run the permissions migration
\i supabase/migrations/20250905_permissions_system.sql

-- Create some test users (you can modify these as needed)
-- Note: These users would normally be created through the signup flow

-- Test permission checks
SELECT check_user_permission(
  'test-user-id'::uuid,
  'roi',
  'financial_data',
  'view',
  null
);

-- View all permissions
SELECT 
  module,
  section,
  action,
  description,
  is_financial
FROM permissions 
ORDER BY module, section, action;

-- View role permissions for each tier
SELECT 
  rp.role_type,
  p.module,
  p.section,
  p.action,
  p.is_financial,
  rp.is_granted
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
WHERE rp.is_granted = true
ORDER BY rp.role_type, p.module, p.section;