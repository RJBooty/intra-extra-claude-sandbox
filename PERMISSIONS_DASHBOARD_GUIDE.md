# 🎯 Permissions Dashboard User Guide

## Overview
The Permissions Dashboard is a comprehensive interface for Master users to manage access control across the entire IntraExtra platform. It provides both high-level overview and detailed permission management capabilities.

## 🚀 Quick Start

### Adding to Your App

```typescript
// In your App.tsx or router
import { PermissionsDashboard } from './components/permissions/PermissionsDashboard';

// Add route (Master users only)
case 'permissions-dashboard':
  return <PermissionsDashboard />;
```

### Access Control
- **Who can access**: Only users with `master` role level
- **Automatic protection**: Dashboard shows access denied for non-Master users
- **Integration**: Uses your existing `useAuth` hook for authentication

## 📋 Features Overview

### 🔍 Two View Modes

#### 1. Overview Mode (Default)
- **Card-based layout** showing pages with expandable sections and fields
- **Visual permission indicators** with color-coded permission types
- **Hierarchical drill-down** from pages → sections → fields
- **Quick permission changes** with inline dropdowns
- **Page metadata** showing route paths, critical status, financial indicators

#### 2. Detailed Mode
- **Table view** of all permissions for a selected user tier
- **Bulk operations** to change multiple permissions at once
- **Select all/individual** items for mass updates
- **Filterable by entity type** (pages, sections, fields)
- **Attribute indicators** (critical, financial, sensitive)

### 🔧 Core Functionality

#### Permission Management
- **5 Permission Types**:
  - **Full Access**: Create, read, update, delete, approve
  - **Read Only**: View data only, no modifications
  - **Assigned Only**: Access to assigned items only
  - **Own Only**: Access to own items only
  - **No Access**: Cannot access this resource

- **5 User Tiers**: Master, Senior, HR Finance, Mid, External

#### Smart Validation
- **Critical page protection**: Prevents Mid/External access to critical pages
- **Financial data warnings**: Alerts when granting financial access to lower tiers
- **Sensitive field checks**: Warns about sensitive data access
- **Master tier warnings**: Alerts when removing Master user access

#### Search & Filtering
- **Search**: Pages, sections, or fields by name
- **Filter Types**:
  - All Pages
  - Critical Only
  - Financial Data
  - Restricted Access

#### Unsaved Changes Tracking
- **Visual indicators**: Amber warning badge showing unsaved change count
- **Browser protection**: Warns before leaving with unsaved changes
- **Batch operations**: Save/reset multiple changes at once
- **Validation before save**: Prevents invalid permission combinations

## 🎨 User Interface Guide

### Dashboard Header
```
[Settings Icon] Permissions Dashboard               [Unsaved Changes] [Reset] [Save]
Manage access control for all pages, sections, and fields

[4 Pages] [5 Sections] [7 Fields] [5 User Tiers]
```

### Search & Controls
```
[Search: "pages, sections, or fields..."] [Filter: All Pages ▼] [Overview/Detailed Toggle]
```

### Permission Legend
Color-coded permission types with descriptions for quick reference.

### Overview Mode Cards
```
▼ ROI Calculator (projects-roi) • 2 sections                          [Route: /projects/roi]
  🔴 CRITICAL
  
  Page Permissions
  MASTER     SENIOR     HR FINANCE     MID     EXTERNAL
  [Full]     [Full]     [Read]         [None]  [None]
  
  ▼ Sections (2)
    ▼ Financial Summary (2 fields)                                     💰 📋
      MASTER     SENIOR     HR FINANCE     MID     EXTERNAL
      [Full]     [Full]     [Read]         [None]  [None]
      
      📋 Fields (2)
      🔒 Total Revenue                    [Full] [Full] [Read] [None] [None]
      🔒 Profit Margin                    [Full] [Full] [Read] [None] [None]
```

### Detailed Mode Table
```
Detailed Permissions View    Viewing permissions for: [MASTER ▼]           5 selected [Set permission: Full ▼] [Apply]
☑ Select all (25 items)

[☑] Entity              Type      Parent           Permission  Attributes
[☑] ROI Calculator      page      -                [Full ▼]    🔴
[☑] Financial Summary   section   ROI Calculator   [Full ▼]    💰📋  
[☑] Total Revenue       field     Financial        [Full ▼]    🔒
```

## ⚙️ Advanced Usage

### Bulk Permission Changes
1. Switch to **Detailed Mode**
2. Select target **User Tier**
3. Check items to modify (individual or "Select all")
4. Choose **Permission Type** from dropdown
5. Click **Apply** to batch update
6. **Save Changes** to persist to database

### Managing Critical Pages
- Critical pages (🔴 icon) have enhanced protection
- Mid/External users **cannot** access critical pages
- System prevents invalid combinations
- Master users receive warnings before removing their own access

### Financial Data Protection
- Financial sections (💰 icon) have special handling
- System warns when granting write access to Mid/External users
- HR Finance typically gets read-only access to financial data
- Sensitive fields (🔒 icon) require additional confirmation

### Workflow Best Practices
1. **Plan changes**: Use Overview mode to understand current permissions
2. **Make changes**: Edit permissions inline or use bulk operations
3. **Review warnings**: Pay attention to validation messages
4. **Save frequently**: Don't accumulate too many unsaved changes
5. **Test access**: Verify changes work with different user roles

## 🔐 Security Features

### Automatic Validation
- **Prevents invalid states**: Critical pages can't be accessed by Mid/External
- **Warns about risks**: Financial data access for lower tiers
- **Master protection**: Alerts when removing Master user access
- **Confirmation dialogs**: For potentially dangerous changes

### Audit Trail
- All permission changes are **logged automatically**
- Changes include: user, timestamp, old/new permissions, reason
- **Integration with PermissionService** ensures proper audit logging
- **Error tracking** for failed operations

### Data Integrity
- **Atomic operations**: Either all changes save or none do
- **Rollback capability**: Reset button undoes all pending changes
- **Real-time validation**: Immediate feedback on invalid combinations
- **Database consistency**: Proper foreign key relationships maintained

## 🐛 Troubleshooting

### Common Issues

**Dashboard shows "Access Restricted"**
- Verify user has `master` role in `platform_user_roles` table
- Check authentication is working properly
- Ensure `useAuth` hook is returning correct user role

**Permission changes not saving**
- Check browser console for errors
- Verify Supabase connection is active
- Ensure database migration completed successfully
- Check that all required permission tables exist

**Validation errors preventing save**
- Review error messages carefully
- Check if trying to grant critical page access to Mid/External users
- Verify permission combinations are logically valid
- Contact system administrator for complex validation issues

**Performance issues with large datasets**
- Permission data is cached for 5 minutes
- Consider filtering to reduce visible entities
- Use Detailed mode for better performance with many items
- Clear browser cache if experiencing stale data

### Debug Steps
1. **Check browser console** for JavaScript errors
2. **Verify database state** using verification SQL script
3. **Test with different user roles** to confirm permission inheritance
4. **Review network tab** for failed API calls
5. **Check Supabase logs** for database-level errors

## 🚀 Next Steps

After setting up the dashboard:
1. **Run foundation tests** to verify permissions system is working
2. **Add dashboard route** to your navigation menu (Master users only)
3. **Train administrators** on dashboard usage and best practices
4. **Set up monitoring** for permission changes and access patterns
5. **Consider additional features**: permission templates, role inheritance, etc.

## 📞 Support

If you encounter issues:
- Check the `FOUNDATION_TESTING_GUIDE.md` for verification steps
- Review database setup with `verify-permissions-database.sql`
- Test individual components with `PermissionsQuickTest.tsx`
- Verify ROI protection is working properly

The Permissions Dashboard provides complete control over your platform's access control system while maintaining security and data integrity! 🛡️