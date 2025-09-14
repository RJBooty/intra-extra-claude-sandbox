// Permission Helper Functions - Integrates with your existing platform_user_roles system

import { supabase } from './supabase';
import { 
  UserTier, 
  PermissionType, 
  PageWithPermissions,
  SectionWithPermissions,
  FieldWithPermissions,
  PermissionCheckResult,
  PermissionOperation,
  validatePermissionOperation
} from '../types/permissionManagement';

// Get user tier from your existing platform_user_roles table
export async function getUserTier(userId: string): Promise<UserTier | null> {
  try {
    const { data, error } = await supabase
      .from('platform_user_roles')
      .select('role_level')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Failed to get user tier:', error);
      return null;
    }

    return data.role_level as UserTier;
  } catch (error) {
    console.error('Error getting user tier:', error);
    return null;
  }
}

// Check if user can access a specific page
export async function checkPagePermission(
  userId: string,
  pageName: string,
  action: 'read' | 'create' | 'update' | 'delete' | 'approve' = 'read'
): Promise<PermissionCheckResult> {
  try {
    const { data, error } = await supabase.rpc('check_page_permission', {
      p_user_id: userId,
      p_page_name: pageName,
      p_action: action
    });

    if (error) {
      return { hasAccess: false, reason: `Permission check failed: ${error.message}` };
    }

    return { hasAccess: data || false };
  } catch (error) {
    console.error('Error checking page permission:', error);
    return { hasAccess: false, reason: 'Permission check error' };
  }
}

// Get user's effective permissions for a page
export async function getUserPagePermissions(
  userId: string,
  pageName: string
) {
  try {
    const { data, error } = await supabase.rpc('get_user_page_permissions', {
      p_user_id: userId,
      p_page_name: pageName
    });

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error getting user page permissions:', error);
    return null;
  }
}

// Get page definition with sections and fields
export async function getPageDefinition(pageName: string): Promise<PageWithPermissions | null> {
  try {
    const { data, error } = await supabase
      .from('page_definitions')
      .select(`
        *,
        sections:section_definitions(
          *,
          fields:field_definitions(*)
        )
      `)
      .eq('page_name', pageName)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data as PageWithPermissions;
  } catch (error) {
    console.error('Error getting page definition:', error);
    return null;
  }
}

// Get page with user-specific permissions
export async function getPageWithUserPermissions(
  pageName: string,
  userId: string
): Promise<PageWithPermissions | null> {
  try {
    const userTier = await getUserTier(userId);
    if (!userTier) return null;

    const { data, error } = await supabase
      .from('page_definitions')
      .select(`
        *,
        sections:section_definitions(
          *,
          fields:field_definitions(*),
          userPermission:section_permissions!inner(*)
        ),
        userPermission:page_permissions!inner(*)
      `)
      .eq('page_name', pageName)
      .eq('is_active', true)
      .eq('section_definitions.section_permissions.user_tier', userTier)
      .eq('page_permissions.user_tier', userTier)
      .single();

    if (error) throw error;
    return data as PageWithPermissions;
  } catch (error) {
    console.error('Error getting page with user permissions:', error);
    return null;
  }
}

// Check if user can access financial data
export async function canUserAccessFinancialData(userId: string): Promise<boolean> {
  const userTier = await getUserTier(userId);
  return userTier ? ['master', 'senior', 'hr_finance'].includes(userTier) : false;
}

// Check if user can access sensitive fields
export async function canUserAccessSensitiveData(userId: string): Promise<boolean> {
  const userTier = await getUserTier(userId);
  return userTier ? ['master', 'senior', 'hr_finance'].includes(userTier) : false;
}

// Get all pages user has access to
export async function getUserAccessiblePages(userId: string): Promise<PageWithPermissions[]> {
  try {
    const userTier = await getUserTier(userId);
    if (!userTier) return [];

    const { data, error } = await supabase
      .from('page_definitions')
      .select(`
        *,
        userPermission:page_permissions!inner(*)
      `)
      .eq('is_active', true)
      .eq('page_permissions.user_tier', userTier)
      .eq('page_permissions.can_read', true)
      .order('sort_order');

    if (error) throw error;
    return data as PageWithPermissions[];
  } catch (error) {
    console.error('Error getting user accessible pages:', error);
    return [];
  }
}

// Master user functions for managing permissions
export async function updatePagePermission(
  operation: PermissionOperation,
  changedBy: string
): Promise<boolean> {
  try {
    // Validate the operation
    const validationErrors = validatePermissionOperation(operation);
    if (validationErrors.length > 0) {
      console.error('Permission operation validation failed:', validationErrors);
      return false;
    }

    // Check if the user making changes is a master
    const changedByTier = await getUserTier(changedBy);
    if (changedByTier !== 'master') {
      console.error('Only master users can modify permissions');
      return false;
    }

    // Get current permission for audit
    const { data: currentPermission } = await supabase
      .from(`${operation.entityType}_permissions`)
      .select('*')
      .eq(`${operation.entityType}_id`, operation.entityId)
      .eq('user_tier', operation.userTier)
      .single();

    // Upsert the permission
    const permissionData = {
      [`${operation.entityType}_id`]: operation.entityId,
      user_tier: operation.userTier,
      permission_type: operation.permissionType,
      ...operation.permissions,
      granted_by: changedBy,
      granted_at: new Date().toISOString(),
      expires_at: operation.expiresAt,
      reason: operation.reason,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from(`${operation.entityType}_permissions`)
      .upsert([permissionData]);

    if (error) throw error;

    // Log the change
    await supabase
      .from('permission_audit_log')
      .insert([{
        entity_type: operation.entityType,
        entity_id: operation.entityId,
        user_tier: operation.userTier,
        action_type: currentPermission ? 'modify' : 'grant',
        old_permission: currentPermission,
        new_permission: permissionData,
        changed_by: changedBy,
        change_reason: operation.reason
      }]);

    return true;
  } catch (error) {
    console.error('Error updating permission:', error);
    return false;
  }
}

// Get permission audit log
export async function getPermissionAuditLog(
  entityType?: string,
  entityId?: string,
  limit: number = 50
) {
  try {
    let query = supabase
      .from('permission_audit_log')
      .select(`
        *,
        changed_by_user:auth.users!changed_by(email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting audit log:', error);
    return [];
  }
}

// Bulk update permissions for a user tier
export async function bulkUpdateTierPermissions(
  userTier: UserTier,
  permissions: PermissionOperation[],
  changedBy: string
): Promise<boolean> {
  try {
    // Check if the user making changes is a master
    const changedByTier = await getUserTier(changedBy);
    if (changedByTier !== 'master') {
      console.error('Only master users can modify permissions');
      return false;
    }

    // Process all permissions in a transaction
    const results = await Promise.all(
      permissions.map(permission => updatePagePermission(permission, changedBy))
    );

    return results.every(result => result === true);
  } catch (error) {
    console.error('Error bulk updating permissions:', error);
    return false;
  }
}

// Get permission summary for all tiers
export async function getPermissionSummary() {
  try {
    const { data, error } = await supabase
      .from('page_permissions')
      .select(`
        user_tier,
        permission_type,
        can_create,
        can_read,
        can_update,
        can_delete,
        can_approve,
        page:page_definitions(page_name, display_name, is_critical)
      `)
      .order('user_tier')
      .order('page.page_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting permission summary:', error);
    return [];
  }
}

// Initialize default permissions for a new page
export async function initializePagePermissions(
  pageId: string,
  createdBy: string
): Promise<boolean> {
  try {
    const defaultPermissions = [
      // Master - full access
      {
        page_id: pageId,
        user_tier: 'master' as UserTier,
        permission_type: 'full' as PermissionType,
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
        can_approve: true,
        granted_by: createdBy
      },
      // Senior - full access except delete
      {
        page_id: pageId,
        user_tier: 'senior' as UserTier,
        permission_type: 'full' as PermissionType,
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false,
        can_approve: true,
        granted_by: createdBy
      },
      // HR Finance - read only initially
      {
        page_id: pageId,
        user_tier: 'hr_finance' as UserTier,
        permission_type: 'read_only' as PermissionType,
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
        can_approve: false,
        granted_by: createdBy
      },
      // Mid - read only
      {
        page_id: pageId,
        user_tier: 'mid' as UserTier,
        permission_type: 'read_only' as PermissionType,
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
        can_approve: false,
        granted_by: createdBy
      },
      // External - no access initially
      {
        page_id: pageId,
        user_tier: 'external' as UserTier,
        permission_type: 'none' as PermissionType,
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false,
        can_approve: false,
        granted_by: createdBy
      }
    ];

    const { error } = await supabase
      .from('page_permissions')
      .insert(defaultPermissions);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error initializing page permissions:', error);
    return false;
  }
}