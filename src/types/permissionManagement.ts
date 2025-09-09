// Permission Management Types - Matches your exact database schema

export type UserTier = 'master' | 'senior' | 'mid' | 'external' | 'hr_finance';

export type PermissionType = 'full' | 'none' | 'assigned_only' | 'own_only' | 'read_only';

export type EntityType = 'page' | 'section' | 'field';

export type FieldType = 'currency' | 'percentage' | 'text' | 'number' | 'date' | 'boolean';

export interface PageDefinition {
  id: string;
  section: string; // 'projects', 'sales', 'roi', 'logistics', 'crew', 'settings'
  page_name: string; // 'projects-roi', 'sales-pipeline'
  display_name: string; // 'ROI Calculator', 'Sales Pipeline'
  description?: string;
  is_critical: boolean; // Critical pages require special permissions
  route_path?: string; // '/projects/roi'
  icon_name?: string; // Icon identifier for UI
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectionDefinition {
  id: string;
  page_id: string;
  section_name: string; // 'financial-summary', 'revenue-streams'
  display_name: string; // 'Financial Summary', 'Revenue Streams'  
  description?: string;
  is_financial: boolean; // Marks financial data sections
  requires_approval: boolean; // Requires approval to modify
  component_name?: string; // React component name for UI
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FieldDefinition {
  id: string;
  section_id: string;
  field_name: string; // 'total_revenue', 'profit_margin'
  display_name: string; // 'Total Revenue', 'Profit Margin'
  field_type: FieldType;
  description?: string;
  is_sensitive: boolean; // Sensitive data requires higher permissions
  is_required: boolean;
  validation_rules?: any; // JSONB validation rules
  default_value?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BasePermission {
  id: string;
  user_tier: UserTier;
  permission_type: PermissionType;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PagePermission extends BasePermission {
  page_id: string;
  can_approve: boolean; // For workflows requiring approval
}

export interface SectionPermission extends BasePermission {
  section_id: string;
  can_approve: boolean;
}

export interface FieldPermission extends BasePermission {
  field_id: string;
}

export interface PermissionAuditLog {
  id: string;
  entity_type: EntityType;
  entity_id: string; // ID of the page/section/field
  user_tier: UserTier;
  action_type: string; // 'grant', 'revoke', 'modify', 'create', 'delete'
  old_permission?: any; // JSONB - Previous permission state
  new_permission?: any; // JSONB - New permission state
  changed_by: string;
  change_reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Combined interfaces for UI components
export interface PageWithPermissions extends PageDefinition {
  sections?: SectionWithPermissions[];
  permissions?: PagePermission[];
  userPermission?: PagePermission;
}

export interface SectionWithPermissions extends SectionDefinition {
  fields?: FieldWithPermissions[];
  permissions?: SectionPermission[];
  userPermission?: SectionPermission;
  page?: PageDefinition;
}

export interface FieldWithPermissions extends FieldDefinition {
  permissions?: FieldPermission[];
  userPermission?: FieldPermission;
  section?: SectionDefinition;
}

// Permission check result
export interface PermissionCheckResult {
  hasAccess: boolean;
  permission?: BasePermission;
  reason?: string;
  requiredTier?: UserTier;
}

// User permission context
export interface UserPermissionContext {
  userId: string;
  userTier: UserTier;
  pagePermissions: Map<string, PagePermission>;
  sectionPermissions: Map<string, SectionPermission>;
  fieldPermissions: Map<string, FieldPermission>;
}

// Permission management operations
export interface PermissionOperation {
  entityType: EntityType;
  entityId: string;
  userTier: UserTier;
  permissionType: PermissionType;
  permissions: {
    can_create?: boolean;
    can_read?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
    can_approve?: boolean;
  };
  reason?: string;
  expiresAt?: string;
}

// Constants for permission hierarchy
export const USER_TIER_HIERARCHY: Record<UserTier, number> = {
  master: 5,
  senior: 4,
  hr_finance: 3,
  mid: 2,
  external: 1,
};

export const PERMISSION_TYPE_HIERARCHY: Record<PermissionType, number> = {
  full: 5,
  read_only: 4,
  own_only: 3,
  assigned_only: 2,
  none: 1,
};

// Helper functions
export function hasMinimumTier(userTier: UserTier, requiredTier: UserTier): boolean {
  return USER_TIER_HIERARCHY[userTier] >= USER_TIER_HIERARCHY[requiredTier];
}

export function canAccessFinancialData(userTier: UserTier): boolean {
  return ['master', 'senior', 'hr_finance'].includes(userTier);
}

export function requiresApproval(userTier: UserTier, isFinancial: boolean): boolean {
  if (userTier === 'master') return false;
  if (isFinancial && !['master', 'senior', 'hr_finance'].includes(userTier)) return true;
  return false;
}

export function getEffectivePermission(
  basePermission: PermissionType,
  userTier: UserTier,
  isFinancial: boolean = false,
  isSensitive: boolean = false
): PermissionType {
  // Master always gets full access
  if (userTier === 'master') return 'full';
  
  // External users can't access financial or sensitive data
  if (userTier === 'external' && (isFinancial || isSensitive)) return 'none';
  
  // Mid users can't access financial data
  if (userTier === 'mid' && isFinancial) return 'none';
  
  return basePermission;
}

// Permission validation
export function validatePermissionOperation(operation: PermissionOperation): string[] {
  const errors: string[] = [];
  
  if (!operation.entityId) errors.push('Entity ID is required');
  if (!operation.userTier) errors.push('User tier is required');
  if (!operation.permissionType) errors.push('Permission type is required');
  
  // Validate tier hierarchy
  if (operation.userTier === 'external' && 
      operation.permissionType === 'full') {
    errors.push('External users cannot have full permissions');
  }
  
  return errors;
}