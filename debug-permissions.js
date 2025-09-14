// Permissions System Diagnostic Script
// Run this in browser console on localhost:5174

console.log("=== PERMISSIONS SYSTEM DIAGNOSTIC ===");

// 1. Check if Supabase is connected
async function checkSupabaseConnection() {
  console.log("\n1. SUPABASE CONNECTION TEST:");
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    const { data, error } = await supabase.from('page_definitions').select('count').limit(1);
    if (error) {
      console.error("❌ Supabase connection failed:", error);
      return false;
    }
    console.log("✅ Supabase connected successfully");
    return true;
  } catch (err) {
    console.error("❌ Supabase import failed:", err);
    return false;
  }
}

// 2. Check database tables and data
async function checkDatabaseTables() {
  console.log("\n2. DATABASE TABLES CHECK:");
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    // Check page_definitions
    const { data: pages, error: pagesError } = await supabase
      .from('page_definitions')
      .select('*');
    
    if (pagesError) {
      console.error("❌ page_definitions error:", pagesError);
    } else {
      console.log(`✅ page_definitions: ${pages?.length || 0} records`);
      console.table(pages);
    }
    
    // Check page_permissions
    const { data: permissions, error: permError } = await supabase
      .from('page_permissions')
      .select('*')
      .limit(5);
    
    if (permError) {
      console.error("❌ page_permissions error:", permError);
    } else {
      console.log(`✅ page_permissions: ${permissions?.length || 0} records`);
      console.table(permissions);
    }
    
  } catch (err) {
    console.error("❌ Database check failed:", err);
  }
}

// 3. Test PermissionService
async function testPermissionService() {
  console.log("\n3. PERMISSION SERVICE TEST:");
  try {
    const { permissionService } = await import('./src/lib/permissions.js');
    
    // Test getAllPermissions
    console.log("Testing getAllPermissions...");
    const allPerms = await permissionService.getAllPermissions();
    console.log("getAllPermissions result:", allPerms);
    
    // Test updatePagePermission
    console.log("Testing updatePagePermission...");
    const updateResult = await permissionService.updatePagePermission(
      'test-page-id',
      'mid',
      'read_only',
      { id: 'test-user', role: { role_type: 'master' } },
      undefined,
      true // skipSecurityValidation
    );
    console.log("updatePagePermission result:", updateResult);
    
  } catch (err) {
    console.error("❌ PermissionService test failed:", err);
  }
}

// 4. Check UI Components
async function checkUIComponents() {
  console.log("\n4. UI COMPONENTS CHECK:");
  
  // Check if DemoPermissionsManager is working
  const demoComponent = document.querySelector('[data-testid="demo-permissions-manager"]');
  console.log("DemoPermissionsManager found:", !!demoComponent);
  
  // Check for JavaScript errors
  const errors = window.permissionErrors || [];
  console.log("JavaScript errors:", errors);
}

// Run all diagnostics
async function runFullDiagnostic() {
  await checkSupabaseConnection();
  await checkDatabaseTables();
  await testPermissionService();
  checkUIComponents();
  
  console.log("\n=== DIAGNOSTIC COMPLETE ===");
  console.log("Check the results above to identify issues.");
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runFullDiagnostic();
}

// Export for manual testing
window.permissionsDiagnostic = {
  checkSupabaseConnection,
  checkDatabaseTables,
  testPermissionService,
  checkUIComponents,
  runFullDiagnostic
};

console.log("Run window.permissionsDiagnostic.runFullDiagnostic() to test everything");