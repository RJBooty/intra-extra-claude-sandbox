# Permissions System Testing Guide

## Overview
This guide provides comprehensive instructions for testing the IntraExtra permissions system end-to-end. The testing suite validates permission enforcement, hierarchical inheritance, bulk operations, and advanced features across all user tiers.

## Prerequisites

### Required Setup
1. **Master User Access**: Only Master users can access the testing suite
2. **Development Environment**: Ensure the application is running locally
3. **Test Data**: Use provided test data or create your own test scenarios
4. **Browser Developer Tools**: Keep console open to monitor errors/warnings

### Access Testing Suite
1. Login as Master user
2. Navigate to Settings → Permission Management
3. Click "Testing Suite" tab (if available) or access `/permissions-testing`

## Test Categories

### 1. Master User Workflow Tests

**Purpose**: Validate that Master users can manage all aspects of permissions

#### Test Scenario 1.1: Basic Permission Management
```
Steps:
1. Login as Master user
2. Access Settings → Permission Management
3. Navigate to ROI page permissions
4. Change Mid user permission from "none" to "read_only"
5. Save changes
6. Verify change appears immediately in UI
7. Check audit log for recorded change

Expected Results:
✅ Master user has full access to permission dashboard
✅ Permission change is saved successfully
✅ UI updates immediately without page refresh
✅ Audit log entry is created with timestamp and user info
```

#### Test Scenario 1.2: Advanced Features Access
```
Steps:
1. Access Validation tab - should show validation warnings
2. Access Audit Trail tab - should show change history
3. Access Import/Export tab - should show template options
4. Test bulk operations interface

Expected Results:
✅ All advanced features accessible to Master user
✅ No permission denied errors
✅ All features load without errors
```

### 2. Permission Enforcement Tests

**Purpose**: Verify permissions are correctly enforced for different user tiers

#### Test Scenario 2.1: Mid User ROI Access
```
Prerequisites:
- Set ROI page permission to "read_only" for Mid user tier

Steps:
1. Login as Mid user (or simulate user switch)
2. Navigate to ROI page
3. Attempt to view financial data
4. Attempt to edit any field
5. Check which buttons/inputs are disabled

Expected Results:
✅ Mid user can view ROI page
✅ Financial data is visible but read-only
✅ Edit buttons are disabled/hidden
✅ Form inputs are disabled
✅ Save button is not available
```

#### Test Scenario 2.2: External User Blocked Access
```
Prerequisites:
- Set ROI page permission to "none" for External user tier

Steps:
1. Login as External user
2. Attempt to navigate to ROI page
3. Check for access denied message
4. Verify no sensitive data is exposed

Expected Results:
✅ External user cannot access ROI page
✅ Shows "Access Restricted" message
✅ No financial data visible
✅ No way to bypass restriction
```

#### Test Scenario 2.3: Field-Level Enforcement
```
Steps:
1. Set specific field permissions (e.g., profit_margin to "none" for Mid users)
2. Login as Mid user with page-level access
3. Verify specific fields are hidden/disabled
4. Check that other fields remain accessible

Expected Results:
✅ Restricted fields are not visible/editable
✅ Allowed fields function normally
✅ No JavaScript errors in console
```

### 3. Hierarchical Permissions Tests

**Purpose**: Validate inheritance behavior and cascading effects

#### Test Scenario 3.1: Page-Level Inheritance
```
Steps:
1. Set page permission to "none" for External user
2. Navigate to permission dashboard
3. Check all sections under that page
4. Check all fields under those sections
5. Verify all inherit "none" permission

Expected Results:
✅ All child sections show "none" permission
✅ All child fields show "none" permission
✅ Inheritance indicators show "Inherited" status
✅ No access violations exist
```

#### Test Scenario 3.2: Inheritance Violations
```
Steps:
1. Set page permission to "none" for Mid user
2. Attempt to set section permission to "read_only" for same user
3. Check for validation warning
4. Attempt to save changes

Expected Results:
✅ Validation warning appears
✅ Warning explains inheritance violation
✅ Save operation is blocked or warns user
✅ Auto-fix option is available
```

#### Test Scenario 3.3: Permission Override
```
Steps:
1. Set page permission to "read_only" for Mid user
2. Override section permission to "none" for Mid user
3. Verify override indicator appears
4. Test "Reset to Inherit" functionality

Expected Results:
✅ Override indicator shows correctly
✅ Section permission overrides page permission
✅ "Reset to Inherit" button appears
✅ Reset functionality works correctly
```

### 4. Bulk Operations Tests

**Purpose**: Validate bulk permission management features

#### Test Scenario 4.1: Bulk Apply Permissions
```
Steps:
1. Select multiple pages using checkboxes
2. Use bulk operations panel
3. Apply "read_only" permission to all selected for Mid users
4. Save changes
5. Verify all selected items updated

Expected Results:
✅ Bulk selection works correctly
✅ Bulk apply operation succeeds
✅ All selected items show new permission
✅ Audit log records bulk change
```

#### Test Scenario 4.2: Copy Permissions
```
Steps:
1. Set up complex permissions on source page
2. Use "Copy Permissions" bulk operation
3. Select source and target pages
4. Execute copy operation
5. Verify target pages have same permissions

Expected Results:
✅ Copy operation succeeds without errors
✅ Target pages match source permissions
✅ Audit log records copy operation
✅ No unintended side effects
```

#### Test Scenario 4.3: Reset to Defaults
```
Steps:
1. Modify several permissions from defaults
2. Select affected entities
3. Use "Reset to Defaults" operation
4. Verify permissions return to original state

Expected Results:
✅ Reset operation succeeds
✅ Permissions return to expected defaults
✅ No data loss or corruption
✅ Audit log records reset operation
```

### 5. Validation System Tests

**Purpose**: Test validation catches issues and provides solutions

#### Test Scenario 5.1: Critical Page Protection
```
Steps:
1. Attempt to give External user access to critical page
2. Check for validation error
3. Verify error message is clear and helpful
4. Test that save is blocked

Expected Results:
✅ Validation error appears immediately
✅ Error message explains the issue
✅ Save operation is prevented
✅ User can correct the issue easily
```

#### Test Scenario 5.2: Auto-Fix Functionality
```
Steps:
1. Create permission violations intentionally
2. Access Validation tab
3. Review validation warnings
4. Use auto-fix for fixable issues
5. Verify issues are resolved

Expected Results:
✅ Validation warnings appear correctly
✅ Auto-fix options are available for appropriate issues
✅ Auto-fix resolves issues correctly
✅ No new issues are introduced
```

### 6. Performance Tests

**Purpose**: Validate system performance under load

#### Test Scenario 6.1: Large Dataset Handling
```
Setup:
- Generate 100+ pages, 500+ sections, 1000+ fields
- Create permissions for all entities across all user tiers

Steps:
1. Load permission dashboard with large dataset
2. Measure initial load time
3. Test search and filtering performance
4. Test permission changes with large dataset

Expected Results:
✅ Initial load completes in < 5 seconds
✅ Search results appear in < 1 second
✅ Permission changes save in < 3 seconds
✅ UI remains responsive throughout
```

#### Test Scenario 6.2: Bulk Operations Performance
```
Steps:
1. Select 100+ entities for bulk operation
2. Apply bulk permission change
3. Measure operation completion time
4. Verify all changes applied correctly

Expected Results:
✅ Bulk operation completes in < 10 seconds
✅ All selected items are updated
✅ No timeouts or errors occur
✅ Memory usage remains reasonable
```

## Testing Checklist

### Pre-Test Setup
- [ ] Development environment running
- [ ] Test users created for all tiers
- [ ] Database has test data
- [ ] Browser developer tools open
- [ ] Logged in as Master user

### Core Functionality
- [ ] Permission dashboard loads without errors
- [ ] All user tiers can be selected
- [ ] Permission dropdowns work correctly
- [ ] Save/reset functionality works
- [ ] Changes persist after page refresh

### Advanced Features
- [ ] Validation tab shows warnings
- [ ] Audit trail displays change history
- [ ] Import/export functionality works
- [ ] Bulk operations complete successfully
- [ ] Templates can be applied

### User Experience
- [ ] Loading states appear appropriately
- [ ] Error messages are clear and helpful
- [ ] Success confirmations are shown
- [ ] UI is responsive on different screen sizes
- [ ] No console errors or warnings

### Security & Data Integrity
- [ ] Permissions are enforced correctly
- [ ] Unauthorized access is blocked
- [ ] Data changes are logged
- [ ] No sensitive data exposure
- [ ] No SQL injection vulnerabilities

## Common Issues & Solutions

### Issue 1: Permission Changes Not Saving
**Symptoms**: Changes appear in UI but don't persist
**Causes**: Network errors, validation failures, database issues
**Solutions**:
1. Check browser network tab for failed requests
2. Review validation errors in UI
3. Verify database connection
4. Check server logs for errors

### Issue 2: Inheritance Not Working
**Symptoms**: Child permissions don't follow parent changes
**Causes**: Explicit overrides, validation rules, inheritance logic bugs
**Solutions**:
1. Check for explicit permission overrides
2. Verify inheritance validation rules
3. Use "Reset to Inherit" to clear overrides
4. Check inheritance indicators in UI

### Issue 3: Performance Issues
**Symptoms**: Slow loading, unresponsive UI, timeouts
**Causes**: Large datasets, inefficient queries, memory leaks
**Solutions**:
1. Reduce dataset size for testing
2. Use pagination/virtualization for large lists
3. Check memory usage in browser dev tools
4. Optimize database queries

### Issue 4: User Role Simulation
**Symptoms**: Can't test different user roles effectively
**Causes**: Single login session, no user switching
**Solutions**:
1. Use multiple browser profiles/incognito windows
2. Implement user switching feature for testing
3. Create test accounts for each role
4. Use browser automation for role testing

### Issue 5: Validation False Positives
**Symptoms**: Validation errors for valid configurations
**Causes**: Incorrect validation rules, edge cases
**Solutions**:
1. Review validation rule logic
2. Test edge cases thoroughly
3. Allow valid exceptions to rules
4. Improve error message specificity

## Automated Testing Integration

### Unit Tests
```javascript
// Example unit test for permission validation
describe('Permission Validation', () => {
  it('should prevent child permission exceeding parent', () => {
    const result = validateInheritance('full', 'none');
    expect(result).toBe(false);
  });
  
  it('should allow child permission equal to parent', () => {
    const result = validateInheritance('read_only', 'read_only');
    expect(result).toBe(true);
  });
});
```

### Integration Tests
```javascript
// Example integration test
describe('Permission Enforcement', () => {
  it('should block unauthorized access', async () => {
    const response = await api.get('/roi', { 
      headers: { authorization: 'external-user-token' } 
    });
    expect(response.status).toBe(403);
  });
});
```

### End-to-End Tests
```javascript
// Example E2E test with Playwright/Cypress
test('Master user can change permissions', async ({ page }) => {
  await page.goto('/settings/permissions');
  await page.selectOption('#user-tier', 'mid');
  await page.selectOption('#permission-type', 'read_only');
  await page.click('#save-button');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## Test Data Management

### Creating Test Data
```sql
-- SQL script to create test permissions
INSERT INTO pages (id, page_name, display_name, is_critical) 
VALUES ('test-roi', 'roi', 'ROI Management', true);

INSERT INTO page_permissions (page_id, user_tier, permission_type)
VALUES 
  ('test-roi', 'master', 'full'),
  ('test-roi', 'mid', 'none');
```

### Cleaning Test Data
```sql
-- Clean up test data
DELETE FROM page_permissions WHERE page_id LIKE 'test-%';
DELETE FROM pages WHERE id LIKE 'test-%';
```

## Performance Benchmarks

### Expected Performance Standards
- **Dashboard Load Time**: < 3 seconds for 100 pages
- **Permission Change**: < 1 second for individual changes
- **Bulk Operations**: < 10 seconds for 100 items
- **Search/Filter**: < 500ms response time
- **Memory Usage**: < 100MB additional heap

### Monitoring Tools
1. **Browser Dev Tools**: Performance tab, Network tab
2. **React DevTools**: Component re-renders, memory usage
3. **Database Monitoring**: Query performance, connection usage
4. **Application Metrics**: Response times, error rates

## Reporting Results

### Test Report Template
```
# Permissions Testing Report
Date: [Date]
Tester: [Name]
Environment: [Development/Staging/Production]

## Summary
- Total Tests: [Number]
- Passed: [Number] 
- Failed: [Number]
- Duration: [Time]

## Failed Tests
1. Test Name: [Description]
   Error: [Error message]
   Steps to Reproduce: [Steps]
   
## Performance Results
- Dashboard Load: [Time]
- Permission Save: [Time]
- Bulk Operations: [Time]

## Recommendations
[Recommendations for improvements]
```

### Export Test Results
The testing suite automatically generates exportable test results in JSON format for integration with CI/CD pipelines and reporting tools.

---

This comprehensive testing guide ensures all aspects of the permissions system are thoroughly validated before deployment to production.