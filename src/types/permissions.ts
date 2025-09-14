// Permission Types - Integrated with existing IntraExtra platform
// Matches platform_user_roles.role_level values exactly

export type UserTier = 'master' | 'senior' | 'mid' | 'external' | 'hr_finance';

export type PermissionType = 'full' | 'none' | 'assigned_only' | 'own_only' | 'read_only';

export type EntityType = 'page' | 'section' | 'field';

export type FieldType = 'currency' | 'percentage' | 'text' | 'number' | 'date' | 'boolean';

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'approve';

// Database Table Interfaces - Match exact Supabase schema

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

// Base permission structure shared across all permission types
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

// Hierarchical UI Interfaces for Management Components

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

// Permission Check Results and Context

export interface PermissionCheckResult {
  hasAccess: boolean;
  permission?: BasePermission;
  reason?: string;
  requiredTier?: UserTier;
  effectivePermission?: PermissionType;
}

export interface UserPermissionContext {
  userId: string;
  userTier: UserTier;
  pagePermissions: Map<string, PagePermission>;
  sectionPermissions: Map<string, SectionPermission>;
  fieldPermissions: Map<string, FieldPermission>;
  lastUpdated: string;
}

// Permission Management Operations

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

export interface BulkPermissionOperation {
  operations: PermissionOperation[];
  changedBy: string;
  reason: string;
  transactionId?: string;
}

// Hook Return Types

export interface UsePermissionsResult {
  hasAccess: (entityType: EntityType, entityId: string, action: PermissionAction) => boolean;
  checkPagePermission: (pageName: string, action: PermissionAction) => Promise<PermissionCheckResult>;
  getUserTier: () => UserTier | null;
  userPermissions: UserPermissionContext | null;
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

export interface UsePermissionGuardResult {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  isLoading: boolean;
  effectivePermission: PermissionType | null;
  requiredTier?: UserTier;
}

export interface UsePermissionManagementResult {
  updatePermission: (operation: PermissionOperation) => Promise<boolean>;
  bulkUpdatePermissions: (operations: BulkPermissionOperation) => Promise<boolean>;
  getPermissionHistory: (entityType: EntityType, entityId?: string) => Promise<PermissionAuditLog[]>;
  initializePagePermissions: (pageId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export interface UsePageDefinitionsResult {
  pages: PageWithPermissions[];
  getPageByName: (pageName: string) => PageWithPermissions | null;
  getUserAccessiblePages: () => PageWithPermissions[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Permission Hierarchy and Constants

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

export const FINANCIAL_ACCESS_TIERS: UserTier[] = ['master', 'senior', 'hr_finance'];
export const SENSITIVE_ACCESS_TIERS: UserTier[] = ['master', 'senior', 'hr_finance'];
export const CRITICAL_PAGE_ACCESS_TIERS: UserTier[] = ['master', 'senior'];

// Helper Type Guards and Validation

export function isValidUserTier(tier: string): tier is UserTier {
  return ['master', 'senior', 'mid', 'external', 'hr_finance'].includes(tier);
}

export function isValidPermissionType(type: string): type is PermissionType {
  return ['full', 'none', 'assigned_only', 'own_only', 'read_only'].includes(type);
}

export function isValidEntityType(type: string): type is EntityType {
  return ['page', 'section', 'field'].includes(type);
}

export function hasMinimumTier(userTier: UserTier, requiredTier: UserTier): boolean {
  return USER_TIER_HIERARCHY[userTier] >= USER_TIER_HIERARCHY[requiredTier];
}

export function canAccessFinancialData(userTier: UserTier): boolean {
  return FINANCIAL_ACCESS_TIERS.includes(userTier);
}

export function canAccessSensitiveData(userTier: UserTier): boolean {
  return SENSITIVE_ACCESS_TIERS.includes(userTier);
}

export function canAccessCriticalPages(userTier: UserTier): boolean {
  return CRITICAL_PAGE_ACCESS_TIERS.includes(userTier);
}

export function requiresApproval(userTier: UserTier, isFinancial: boolean, isCritical: boolean = false): boolean {
  if (userTier === 'master') return false;
  if (isCritical && !CRITICAL_PAGE_ACCESS_TIERS.includes(userTier)) return true;
  if (isFinancial && !FINANCIAL_ACCESS_TIERS.includes(userTier)) return true;
  return false;
}

export function getEffectivePermission(
  basePermission: PermissionType,
  userTier: UserTier,
  isFinancial: boolean = false,
  isSensitive: boolean = false,
  isCritical: boolean = false
): PermissionType {
  // Master always gets full access
  if (userTier === 'master') return 'full';
  
  // External users restrictions
  if (userTier === 'external') {
    if (isFinancial || isSensitive || isCritical) return 'none';
    // External users can only see assigned data
    return basePermission === 'none' ? 'none' : 'assigned_only';
  }
  
  // Mid users can't access financial or critical data
  if (userTier === 'mid') {
    if (isFinancial || isCritical) return 'none';
    if (isSensitive) return 'read_only';
  }
  
  // HR Finance has special financial access but limited elsewhere
  if (userTier === 'hr_finance') {
    if (isCritical && !isFinancial) return 'read_only';
  }
  
  return basePermission;
}

// Permission validation functions

export function validatePermissionOperation(operation: PermissionOperation): string[] {
  const errors: string[] = [];
  
  if (!operation.entityId) errors.push('Entity ID is required');
  if (!isValidUserTier(operation.userTier)) errors.push('Invalid user tier');
  if (!isValidPermissionType(operation.permissionType)) errors.push('Invalid permission type');
  if (!isValidEntityType(operation.entityType)) errors.push('Invalid entity type');
  
  // Business rule validations
  if (operation.userTier === 'external' && operation.permissionType === 'full') {
    errors.push('External users cannot have full permissions');
  }
  
  if (operation.userTier === 'mid' && operation.permissions.can_approve) {
    errors.push('Mid-tier users cannot have approval permissions');
  }
  
  // Expiration validation
  if (operation.expiresAt && new Date(operation.expiresAt) < new Date()) {
    errors.push('Expiration date cannot be in the past');
  }
  
  return errors;
}

// Integration with existing User interface
export interface UserWithPermissions {
  id: string;
  email: string;
  role_level: UserTier; // This maps to UserTier exactly
  permissions?: UserPermissionContext;
  accessiblePages?: string[];
  lastPermissionCheck?: string;
}

// Component Props for Permission-Aware Components

export interface PermissionGuardProps {
  userTier?: UserTier;
  requiredTier?: UserTier;
  entityType: EntityType;
  entityId: string;
  action: PermissionAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export interface PermissionAwareComponentProps {
  userTier: UserTier;
  permissions: UserPermissionContext;
  isReadOnly?: boolean;
  showSensitiveData?: boolean;
  showFinancialData?: boolean;
}

// Management Dashboard Types

export interface PermissionSummaryRow {
  entityType: EntityType;
  entityName: string;
  entityId: string;
  userTier: UserTier;
  permissionType: PermissionType;
  permissions: {
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_approve?: boolean;
  };
  grantedBy?: string;
  grantedAt: string;
  expiresAt?: string;
  isExpired: boolean;
  isFinancial: boolean;
  isSensitive: boolean;
  isCritical: boolean;
}

export interface PermissionMatrixView {
  pages: Array<{
    pageDefinition: PageDefinition;
    tiers: Record<UserTier, {
      pagePermission: PagePermission;
      sections: Array<{
        sectionDefinition: SectionDefinition;
        sectionPermission: SectionPermission;
        fields: Array<{
          fieldDefinition: FieldDefinition;
          fieldPermission: FieldPermission;
        }>;
      }>;
    }>;
  }>;
}

// Backward compatibility aliases for existing code
export type UserRole = UserTier;
export const ROLE_HIERARCHY = USER_TIER_HIERARCHY;
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return hasMinimumTier(userRole, minRole);
}