# Permissions System Testing Guide

## 🚀 Quick Setup & Testing Instructions

### Step 1: Run the Migration

```bash
# In Supabase SQL Editor, run the permissions migration first
# File: supabase/migrations/20250906_permissions_management_system.sql
```

### Step 2: Add Sample Data

```bash
# In Supabase SQL Editor, run the sample data script
# File: sample-permissions-data.sql
```

This creates:
- **4 test pages** (ROI Calculator, Sales Pipeline, Projects Overview, Equipment Management)
- **5 sections** for ROI page (Financial Summary, Revenue Streams, etc.)
- **7 test fields** (Total Revenue, Costs, Profit, Client Name, Deal Value, etc.)
- **Complete permission matrix** for all 5 user tiers

### Step 3: Access the Test Page

Add this route to your App.tsx or router:

```typescript
// In your App.tsx navigation or router
import { PermissionsTestPage } from './components/debug/PermissionsTestPage';

// Add to your navigation
case 'permissions-test':
  return <PermissionsTestPage />;
```

Or access directly: `/permissions-test`

### Step 4: Test with Different User Roles

Make sure you have users with different `role_level` values in your `platform_user_roles` table:

```sql
-- Check current user roles
SELECT user_id, role_level FROM platform_user_roles;

-- Update a user's role for testing (replace with actual user_id)
UPDATE platform_user_roles 
SET role_level = 'master' 
WHERE user_id = 'your-user-id-here';
```

## 🧪 Expected Test Results by Role

### Master User
✅ **Should see:**
- Full access to all pages (green checkmarks)
- All CRUD permissions (Create, Read, Update, Delete, Approve)
- All field data visible and editable
- ROI component fully accessible

### Senior User  
✅ **Should see:**
- Full access to most pages
- No Delete permissions (security measure)
- Full ROI access
- All financial data visible

### HR Finance User
✅ **Should see:**
- Read-only access to ROI page 
- Financial data visible but not editable
- Sales pipeline read-only access
- Limited field access

### Mid User
❌ **Should see:**
- No access to ROI page (shows access denied)
- Sales pipeline access
- Projects overview read-only
- No financial field access

### External User
❌ **Should see:**
- No access to ROI page (shows access denied)
- No access to sales pipeline
- Very limited access overall
- Only assigned_only permissions where granted

## 🔍 Test Checklist

### Page-Level Tests
- [ ] ROI Calculator access by role
- [ ] Sales Pipeline access by role  
- [ ] Projects Overview access by role
- [ ] Equipment Management access by role
- [ ] Loading states work correctly
- [ ] Error handling works
- [ ] Custom fallback messages display

### Field-Level Tests
- [ ] Financial fields (Total Revenue, Costs, Profit) protected
- [ ] Non-financial fields (Client Name) have broader access
- [ ] Read-only mode works for HR Finance
- [ ] Field hiding works for restricted users
- [ ] Custom placeholders display correctly

### ROI Component Tests
- [ ] Master/Senior users see full ROI component
- [ ] HR Finance users see read-only version
- [ ] Mid/External users see access denied message
- [ ] Protected fields show appropriate restrictions
- [ ] Loading overlay appears during permission checks

### Performance Tests
- [ ] Permission checks are cached (check Network tab)
- [ ] No excessive API calls
- [ ] Fast loading after initial check
- [ ] Refresh button works correctly

## 🐛 Troubleshooting

### "Permission check failed" errors
1. Check if migration ran successfully
2. Verify sample data was inserted
3. Check browser console for errors
4. Verify user has role in platform_user_roles table

### "User tier not found" errors  
1. Ensure user exists in platform_user_roles table
2. Check that role_level matches expected values
3. Verify getUserRole function works

### Permissions not loading
1. Check Supabase connection
2. Verify RLS policies allow access
3. Check if permission tables exist
4. Look for JavaScript console errors

### ROI component still shows for restricted users
1. Verify ProtectedPage wrapper is correctly implemented
2. Check that pageName matches database page_name
3. Ensure imports are correct
4. Check browser console for permission errors

## 📊 Sample Data Overview

The sample data creates this permission matrix:

| Page | Master | Senior | HR Finance | Mid | External |
|------|--------|---------|------------|-----|----------|
| ROI Calculator | Full | Full (no delete) | Read-only | None | None |
| Sales Pipeline | Full | Full (no delete) | Read-only | Full (no delete/approve) | None |
| Projects Overview | Full | Full (no delete) | Read-only | Read-only | Assigned only |
| Equipment Management | Full | Full (no delete) | None | None | None |

### Field-Level Permissions
- **Financial fields** (Revenue, Costs, Profit): Master/Senior=Full, HR=Read-only, Others=None
- **Client Name**: Master/Senior=Full, Mid/HR=Read-only, External=Assigned-only  
- **Deal Value**: Master/Senior=Full, HR=Read-only, Others=None

## 🎯 Success Indicators

### System Working Correctly When:
1. **Different roles see different content**
2. **Loading states appear briefly then show results**
3. **Error messages are clear and helpful**
4. **ROI component properly blocks unauthorized users**
5. **Field-level restrictions work as expected**
6. **Performance is good (cached requests)**
7. **Test page shows green checkmarks for appropriate permissions**

### Red Flags:
- All users see the same content regardless of role
- Permission checks never complete (infinite loading)
- JavaScript errors in console
- ROI component accessible to Mid/External users
- No caching (new request every time)

## 🔄 Quick Reset

To reset test data:

```sql
-- Clear all sample data
DELETE FROM field_permissions WHERE granted_by = 'system';
DELETE FROM section_permissions WHERE granted_by = 'system';  
DELETE FROM page_permissions WHERE granted_by = 'system';
DELETE FROM field_definitions WHERE created_at >= CURRENT_DATE;
DELETE FROM section_definitions WHERE created_at >= CURRENT_DATE;
DELETE FROM page_definitions WHERE created_at >= CURRENT_DATE;

-- Then re-run sample-permissions-data.sql
```

This testing setup provides comprehensive validation of your permissions system before building the management dashboard!