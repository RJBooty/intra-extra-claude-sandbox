# 🧪 Permissions System Foundation Testing Guide

## Overview
Before building the permissions dashboard, this guide helps you verify that all foundation pieces are working correctly.

## ✅ Foundation Status Check

### Files Verified:
- ✅ `src/types/permissions.ts` - Complete TypeScript types
- ✅ `src/hooks/useAuth.ts` - Authentication hook
- ✅ `src/lib/permissions.ts` - PermissionService class
- ✅ `src/hooks/usePermissions.ts` - Permission hooks
- ✅ `src/components/permissions/ProtectedPage.tsx` - Page protection
- ✅ `src/components/permissions/ProtectedField.tsx` - Field protection
- ✅ `supabase/migrations/20250906_permissions_management_system.sql` - Database migration (7 tables)
- ✅ TypeScript compilation clean (no errors)
- ✅ All imports and dependencies working

## 🔧 Step-by-Step Testing Instructions

### Step 1: Database Setup

1. **Run the migration** (if not already done):
   ```bash
   # In Supabase Dashboard > SQL Editor, run:
   # File: supabase/migrations/20250906_permissions_management_system.sql
   ```

2. **Verify tables were created**:
   ```sql
   -- Run this verification script in Supabase SQL Editor:
   -- File: verify-permissions-database.sql
   ```

3. **Add sample data**:
   ```sql
   -- Run this in Supabase SQL Editor:
   -- File: sample-permissions-data.sql
   ```

### Step 2: Quick Functionality Test

1. **Add the quick test component to your app**:
   ```typescript
   // In your App.tsx or router, add:
   import { PermissionsQuickTest } from './components/debug/PermissionsQuickTest';
   
   // Add route or navigation option:
   case 'quick-test':
     return <PermissionsQuickTest />;
   ```

2. **Access the test page**:
   - Navigate to `/quick-test` or add it to your navigation
   - Should show your current user and role
   - Should show ROI permission test results

3. **Expected results by role**:
   - **Master/Senior**: Full access (can read, create, update, delete, approve)
   - **HR Finance**: Read-only access (can read only)
   - **Mid/External**: No access (all permissions false)

### Step 3: ROI Component Protection Test

1. **Navigate to ROI page** (`/projects/roi` or equivalent):
   
   **Master/Senior users should see**:
   - ✅ Full ROI component loads normally
   - ✅ All tabs and functionality available
   - ✅ No access restriction messages

   **HR Finance users should see**:
   - ✅ Full ROI component loads (read-only mode)
   - ✅ Financial data visible but not editable
   - ✅ No access restriction messages

   **Mid/External users should see**:
   - ❌ Professional "Financial Data Access Restricted" message
   - ❌ Lock icon and clear explanation
   - ❌ No access to actual ROI content

2. **Check browser console**:
   - Should be no JavaScript errors
   - Permission checks should complete successfully
   - No excessive API calls (caching should work)

### Step 4: Comprehensive Test (Optional)

1. **Add the full test page**:
   ```typescript
   // In your App.tsx or router:
   import { PermissionsTestPage } from './components/debug/PermissionsTestPage';
   
   case 'permissions-test':
     return <PermissionsTestPage />;
   ```

2. **Run comprehensive tests**:
   - Tests all 4 sample pages
   - Tests all 7 sample fields
   - Shows permission matrix results
   - Displays system statistics

### Step 5: Database Verification

1. **Run verification script in Supabase**:
   ```sql
   -- Copy and run: verify-permissions-database.sql
   -- Should show "✅ DATABASE SETUP COMPLETE" at the end
   ```

2. **Expected database state**:
   - 7 tables created (6 permission tables + audit log)
   - 4+ pages, 5+ sections, 7+ fields
   - 15+ page permissions, 25+ field permissions
   - All foreign keys working
   - RLS policies enabled

### Step 6: Error Checking

1. **TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   # Should complete with no errors
   ```

2. **Dev server**:
   ```bash
   npm run dev
   # Should start without errors
   # Hot reload should work
   ```

3. **Browser console**:
   - No red errors in console
   - Permission API calls should succeed
   - Authentication should work

## 🚨 Common Issues & Solutions

### Issue: "Permission check failed" errors
**Solution**: 
1. Check if migration ran successfully
2. Verify sample data was inserted
3. Check user exists in `platform_user_roles` table

### Issue: "User tier not found" errors
**Solution**:
1. Ensure user has role in `platform_user_roles` table
2. Check that `role_level` matches: `master`, `senior`, `mid`, `external`, `hr_finance`
3. Verify `getUserRole` function in `src/lib/supabase.ts`

### Issue: TypeScript errors
**Solution**:
1. Run `npm install` to ensure dependencies
2. Check import paths are correct
3. Verify all types are exported from `src/types/permissions.ts`

### Issue: ROI component still shows for restricted users
**Solution**:
1. Verify `ProtectedPage` wrapper is correctly implemented
2. Check that `pageName="projects-roi"` matches database `page_name`
3. Ensure imports are correct

### Issue: Permissions not loading
**Solution**:
1. Check Supabase connection
2. Verify RLS policies allow access
3. Check if permission tables exist
4. Look for JavaScript console errors

## ✅ Success Indicators

### System Working Correctly When:
1. **Quick test shows expected results** for your user role
2. **ROI component properly blocks** unauthorized users
3. **No JavaScript errors** in browser console
4. **TypeScript compilation is clean**
5. **Database verification script** shows "✅ DATABASE SETUP COMPLETE"
6. **Permission checks are fast** (cached after first load)
7. **Different roles see different content**

### Red Flags:
- All users see the same content regardless of role
- Permission checks never complete (infinite loading)
- JavaScript errors in console
- ROI component accessible to Mid/External users
- TypeScript compilation errors
- Database verification fails

## 🎯 Ready for Dashboard?

Once all tests pass and you see the success indicators above, your permissions system foundation is solid and ready for the management dashboard.

**Final checklist**:
- [ ] Database migration completed successfully
- [ ] Sample data inserted and verified
- [ ] Quick test shows correct permissions for your role
- [ ] ROI protection works as expected
- [ ] No TypeScript or JavaScript errors
- [ ] All 7 database tables exist and populated
- [ ] Permission caching working (fast after first load)

If all items are checked, you're ready to build the permissions management dashboard! 🚀