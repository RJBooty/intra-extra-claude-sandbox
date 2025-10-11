import { supabase, getUserRole } from './supabase';
import {
  UserTier,
  PermissionType,
  EntityType,
  PageDefinition,
  SectionDefinition,
  FieldDefinition,
  PagePermission,
  SectionPermission,
  FieldPermission,
  PageWithPermissions,
  SectionWithPermissions,
  FieldWithPermissions,
  PermissionOperation,
  PermissionAuditLog,
  getEffectivePermission,
  validatePermissionOperation
} from '../types/permissions';

// Production-ready imports
import { PermissionSecurityValidator } from './security/permissionSecurity';
import { PermissionCache, PermissionCacheManager } from './performance/permissionCache';
import { PermissionErrorHandler, PermissionErrorType } from './resilience/errorHandling';
import { PermissionMonitoring } from './monitoring/permissionMonitoring';

export interface PermissionCheckResult {
  permission: PermissionType;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove?: boolean;
  reason?: string;
}

export interface HierarchicalPermissions {
  pages: PageWithPermissions[];
  totalPages: number;
  totalSections: number;
  totalFields: number;
  userTierCounts: Record<UserTier, number>;
}

export class PermissionService {
  private static instance: PermissionService;

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
      // Initialize production components
      PermissionCache.initialize();
      PermissionMonitoring.initialize();
    }
    return PermissionService.instance;
  }

  // CHECKING METHODS

  /**
   * Check if user can access a specific page
   * Enhanced with caching, monitoring, and error handling
   */
  async canAccessPage(userId: string, pageId: string): Promise<PermissionCheckResult> {
    const startTime = Date.now();
    const operation = 'canAccessPage';

    try {
      // Check circuit breaker
      if (!PermissionErrorHandler.canAttemptOperation(operation)) {
        PermissionMonitoring.trackPermissionCheck(userId, 'page', pageId, 'none', false, Date.now() - startTime);
        return this.createNoAccessResult('Service temporarily unavailable');
      }

      // Try cache first
      const userTier = await getUserRole(userId) as UserTier;
      if (!userTier) {
        PermissionMonitoring.trackPermissionCheck(userId, 'page', pageId, 'none', false, Date.now() - startTime);
        return this.createNoAccessResult('User tier not found');
      }

      const cachedResult = await PermissionCacheManager.getEntityPermission('page', pageId, userTier);
      if (cachedResult) {
        const result = this.createPermissionResult(cachedResult, userTier, false, false, false);
        PermissionMonitoring.trackPermissionCheck(userId, 'page', pageId, cachedResult, true, Date.now() - startTime);
        return result;
      }

      // Database query with monitoring
      const { data: pagePermission, error } = await supabase
        .from('page_permissions')
        .select(`
          *,
          page:page_definitions(is_critical, is_financial)
        `)
        .eq('page_id', pageId)
        .eq('user_tier', userTier)
        .single();

      if (error || !pagePermission) {
        PermissionMonitoring.trackPermissionCheck(userId, 'page', pageId, 'none', false, Date.now() - startTime);
        console.warn(`No page permission found for user ${userId} on page ${pageId}:`, error);
        return this.createNoAccessResult('No permission found');
      }

      // Calculate effective permission
      const page = pagePermission.page as any;
      const effectivePermission = getEffectivePermission(
        pagePermission.permission_type,
        userTier,
        page?.is_financial || false,
        false, // pages don't have sensitive flag
        page?.is_critical || false
      );

      // Cache the result
      PermissionCache.set(
        `entity_perm:page:${pageId}:${userTier}`,
        effectivePermission
      );

      // Create result
      const result = {
        permission: effectivePermission,
        canRead: pagePermission.can_read && effectivePermission !== 'none',
        canCreate: pagePermission.can_create && effectivePermission !== 'none' && effectivePermission !== 'read_only',
        canUpdate: pagePermission.can_update && effectivePermission !== 'none' && effectivePermission !== 'read_only',
        canDelete: pagePermission.can_delete && effectivePermission === 'full',
        canApprove: pagePermission.can_approve && ['full', 'read_only'].includes(effectivePermission)
      };

      // Reset circuit breaker on success
      PermissionErrorHandler.resetCircuitBreaker(operation);
      
      // Track successful check
      PermissionMonitoring.trackPermissionCheck(userId, 'page', pageId, effectivePermission, true, Date.now() - startTime);

      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Handle error with fallback
      const fallbackResult = await PermissionErrorHandler.handlePermissionError(error, {
        operation,
        userId,
        entityType: 'page',
        entityId: pageId,
        userTier: await getUserRole(userId) as UserTier
      });

      // Track failed check
      PermissionMonitoring.trackPermissionCheck(userId, 'page', pageId, fallbackResult.permission, false, responseTime);

      return {
        permission: fallbackResult.permission,
        canRead: fallbackResult.permission !== 'none',
        canCreate: false, // Conservative fallback
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        reason: fallbackResult.error.userMessage
      };
    }
  }

  /**
   * Check if user can access a specific section
   */
  async canAccessSection(userId: string, sectionId: string): Promise<PermissionCheckResult> {
    try {
      const userTier = await getUserRole(userId) as UserTier;
      if (!userTier) {
        return this.createNoAccessResult('User tier not found');
      }

      // Get section permission and section details
      const { data: sectionPermission, error } = await supabase
        .from('section_permissions')
        .select(`
          *,
          section:section_definitions(
            is_financial,
            requires_approval,
            page:page_definitions(is_critical)
          )
        `)
        .eq('section_id', sectionId)
        .eq('user_tier', userTier)
        .single();

      if (error || !sectionPermission) {
        console.warn(`No section permission found for user ${userId} on section ${sectionId}:`, error);
        return this.createNoAccessResult('No permission found');
      }

      const section = sectionPermission.section as any;
      const effectivePermission = getEffectivePermission(
        sectionPermission.permission_type,
        userTier,
        section?.is_financial || false,
        false, // sections don't have sensitive flag directly
        section?.page?.is_critical || false
      );

      return {
        permission: effectivePermission,
        canRead: sectionPermission.can_read && effectivePermission !== 'none',
        canCreate: sectionPermission.can_create && effectivePermission !== 'none' && effectivePermission !== 'read_only',
        canUpdate: sectionPermission.can_update && effectivePermission !== 'none' && effectivePermission !== 'read_only',
        canDelete: sectionPermission.can_delete && effectivePermission === 'full',
        canApprove: sectionPermission.can_approve && section?.requires_approval && ['full', 'read_only'].includes(effectivePermission)
      };

    } catch (error) {
      console.error('Error checking section permission:', error);
      return this.createNoAccessResult('Permission check failed');
    }
  }

  /**
   * Check if user can access a specific field
   */
  async canAccessField(userId: string, fieldNameOrId: string): Promise<PermissionCheckResult> {
    try {
      const userTier = await getUserRole(userId) as UserTier;
      if (!userTier) {
        return this.createNoAccessResult('User tier not found');
      }

      // First, try to get the field definition by name (if it's not a UUID)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fieldNameOrId);

      let actualFieldId = fieldNameOrId;

      if (!isUUID) {
        // Look up the field by name
        const { data: fieldDef, error: fieldError } = await supabase
          .from('field_definitions')
          .select('id')
          .eq('field_name', fieldNameOrId)
          .single();

        if (fieldError || !fieldDef) {
          console.warn(`Field definition not found for field name: ${fieldNameOrId}`);
          // Return full access for fields not in the permissions system
          return {
            permission: 'full',
            canRead: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true
          };
        }

        actualFieldId = fieldDef.id;
      }

      // Get field permission and field details
      const { data: fieldPermission, error } = await supabase
        .from('field_permissions')
        .select(`
          *,
          field:field_definitions(
            is_sensitive,
            section:section_definitions(
              is_financial,
              page:page_definitions(is_critical)
            )
          )
        `)
        .eq('field_id', actualFieldId)
        .eq('user_tier', userTier)
        .single();

      if (error || !fieldPermission) {
        console.warn(`No field permission found for user ${userId} on field ${fieldNameOrId}:`, error);
        // Return full access for fields not in the permissions system
        return {
          permission: 'full',
          canRead: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true
        };
      }

      const field = fieldPermission.field as any;
      const section = field?.section;
      const effectivePermission = getEffectivePermission(
        fieldPermission.permission_type,
        userTier,
        section?.is_financial || false,
        field?.is_sensitive || false,
        section?.page?.is_critical || false
      );

      return {
        permission: effectivePermission,
        canRead: fieldPermission.can_read && effectivePermission !== 'none',
        canCreate: fieldPermission.can_create && effectivePermission !== 'none' && effectivePermission !== 'read_only',
        canUpdate: fieldPermission.can_update && effectivePermission !== 'none' && effectivePermission !== 'read_only',
        canDelete: fieldPermission.can_delete && effectivePermission === 'full'
      };

    } catch (error) {
      console.error('Error checking field permission:', error);
      return this.createNoAccessResult('Permission check failed');
    }
  }

  /**
   * Check page permission by page name (commonly used)
   */
  async canAccessPageByName(userId: string, pageName: string): Promise<PermissionCheckResult> {
    try {
      // Get page ID by name first
      const { data: page, error: pageError } = await supabase
        .from('page_definitions')
        .select('id')
        .eq('page_name', pageName)
        .eq('is_active', true)
        .single();

      if (pageError || !page) {
        return this.createNoAccessResult(`Page '${pageName}' not found`);
      }

      return await this.canAccessPage(userId, page.id);
    } catch (error) {
      console.error('Error checking page permission by name:', error);
      return this.createNoAccessResult('Permission check failed');
    }
  }

  // MANAGEMENT METHODS

  /**
   * Get all permissions in hierarchical structure for management UI
   */
  async getAllPermissions(): Promise<HierarchicalPermissions> {
    try {
      // Get all pages with their sections and fields
      const { data: pages, error } = await supabase
        .from('page_definitions')
        .select(`
          *,
          sections:section_definitions(
            *,
            fields:field_definitions(*),
            permissions:section_permissions(*)
          ),
          permissions:page_permissions(*)
        `)
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Error fetching permissions hierarchy:', error);
        return this.createEmptyHierarchy();
      }

      if (!pages || pages.length === 0) {
        return this.createEmptyHierarchy();
      }

      // Get field permissions separately for better performance
      const { data: fieldPermissions } = await supabase
        .from('field_permissions')
        .select('*');

      // Transform to hierarchical structure
      const hierarchicalPages: PageWithPermissions[] = pages.map(page => {
        const sectionsWithPermissions: SectionWithPermissions[] = (page.sections || []).map(section => {
          const fieldsWithPermissions: FieldWithPermissions[] = (section.fields || []).map(field => {
            const fieldPerms = fieldPermissions?.filter(fp => fp.field_id === field.id) || [];
            return {
              ...field,
              permissions: fieldPerms,
              section: section
            };
          });

          return {
            ...section,
            fields: fieldsWithPermissions,
            permissions: section.permissions || [],
            page: page
          };
        });

        return {
          ...page,
          sections: sectionsWithPermissions,
          permissions: page.permissions || []
        };
      });

      // Calculate statistics
      const stats = this.calculatePermissionStats(hierarchicalPages);

      return {
        pages: hierarchicalPages,
        ...stats
      };

    } catch (error) {
      console.error('Error getting all permissions:', error);
      return this.createEmptyHierarchy();
    }
  }

  /**
   * Update page permission for a specific user tier
   * Enhanced with security validation and monitoring
   */
  async updatePagePermission(
    pageId: string,
    userTier: UserTier,
    permissionType: PermissionType,
    updatedBy: string,
    permissions?: Partial<PagePermission>,
    skipSecurityValidation?: boolean
  ): Promise<boolean> {
    const startTime = Date.now();

    try {
      let updaterRole: UserTier = 'master'; // Default for demo mode
      
      // Only do security validation if not skipping
      if (!skipSecurityValidation) {
        try {
          // Get updater role for validation
          updaterRole = await getUserRole(updatedBy) as UserTier;
          
          // Security validation
          const securityValidation = PermissionSecurityValidator.validatePermissionChange(
            updatedBy,
            updaterRole,
            'page',
            pageId,
            userTier,
            permissionType
          );

          if (!securityValidation.isValid) {
            PermissionMonitoring.trackPermissionChange(
              updatedBy,
              'page',
              pageId,
              userTier,
              'none',
              permissionType,
              false,
              Date.now() - startTime,
              securityValidation.errors.join(', ')
            );
            console.error('Security validation failed:', securityValidation.errors);
            return false;
          }

          // Log warnings if any
          if (securityValidation.warnings.length > 0) {
            console.warn('Permission change warnings:', securityValidation.warnings);
          }
        } catch (securityError) {
          console.warn('Security validation failed, proceeding with demo mode:', securityError);
          updaterRole = 'master'; // Assume master for demo
        }
      } else {
        console.log('Skipping security validation for demo mode');
      }

      const operation: PermissionOperation = {
        entityType: 'page',
        entityId: pageId,
        userTier,
        permissionType,
        permissions: permissions || this.getDefaultPermissions(permissionType),
        reason: 'Updated via PermissionService'
      };

      // Validate operation
      const validationErrors = validatePermissionOperation(operation);
      if (validationErrors.length > 0) {
        console.error('Permission operation validation failed:', validationErrors);
        return false;
      }

      // Get current permission for audit
      const { data: currentPermission } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('page_id', pageId)
        .eq('user_tier', userTier)
        .single();

      // Upsert the permission
      const permissionData = {
        page_id: pageId,
        user_tier: userTier,
        permission_type: permissionType,
        can_create: permissions?.can_create ?? this.getDefaultPermissions(permissionType).can_create,
        can_read: permissions?.can_read ?? this.getDefaultPermissions(permissionType).can_read,
        can_update: permissions?.can_update ?? this.getDefaultPermissions(permissionType).can_update,
        can_delete: permissions?.can_delete ?? this.getDefaultPermissions(permissionType).can_delete,
        can_approve: permissions?.can_approve ?? this.getDefaultPermissions(permissionType).can_approve,
        granted_by: updatedBy,
        granted_at: new Date().toISOString(),
        reason: operation.reason,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('page_permissions')
        .upsert([permissionData]);

      if (error) {
        console.error('Error updating page permission:', error);
        PermissionMonitoring.trackPermissionChange(
          updatedBy,
          'page',
          pageId,
          userTier,
          currentPermission?.permission_type || 'none',
          permissionType,
          false,
          Date.now() - startTime,
          error.message
        );
        return false;
      }

      // Invalidate cache
      PermissionCacheManager.invalidateEntityCache('page', pageId);

      // Log the change
      await this.logPermissionChange('page', pageId, userTier, currentPermission, permissionData, updatedBy);

      // Track successful change
      PermissionMonitoring.trackPermissionChange(
        updatedBy,
        'page',
        pageId,
        userTier,
        currentPermission?.permission_type || 'none',
        permissionType,
        true,
        Date.now() - startTime
      );

      return true;
    } catch (error) {
      console.error('Error updating page permission:', error);
      return false;
    }
  }

  /**
   * Update section permission for a specific user tier
   */
  async updateSectionPermission(
    sectionId: string,
    userTier: UserTier,
    permissionType: PermissionType,
    updatedBy: string,
    permissions?: Partial<SectionPermission>,
    skipSecurityValidation?: boolean
  ): Promise<boolean> {
    try {
      const operation: PermissionOperation = {
        entityType: 'section',
        entityId: sectionId,
        userTier,
        permissionType,
        permissions: permissions || this.getDefaultPermissions(permissionType)
      };

      const validationErrors = validatePermissionOperation(operation);
      if (validationErrors.length > 0) {
        console.error('Permission operation validation failed:', validationErrors);
        return false;
      }

      const updaterTier = await getUserRole(updatedBy) as UserTier;
      if (updaterTier !== 'master') {
        console.error('Only master users can update permissions');
        return false;
      }

      const { data: currentPermission } = await supabase
        .from('section_permissions')
        .select('*')
        .eq('section_id', sectionId)
        .eq('user_tier', userTier)
        .single();

      const permissionData = {
        section_id: sectionId,
        user_tier: userTier,
        permission_type: permissionType,
        can_create: permissions?.can_create ?? this.getDefaultPermissions(permissionType).can_create,
        can_read: permissions?.can_read ?? this.getDefaultPermissions(permissionType).can_read,
        can_update: permissions?.can_update ?? this.getDefaultPermissions(permissionType).can_update,
        can_delete: permissions?.can_delete ?? this.getDefaultPermissions(permissionType).can_delete,
        can_approve: permissions?.can_approve ?? this.getDefaultPermissions(permissionType).can_approve,
        granted_by: updatedBy,
        granted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('section_permissions')
        .upsert([permissionData]);

      if (error) {
        console.error('Error updating section permission:', error);
        return false;
      }

      await this.logPermissionChange('section', sectionId, userTier, currentPermission, permissionData, updatedBy);
      return true;
    } catch (error) {
      console.error('Error updating section permission:', error);
      return false;
    }
  }

  /**
   * Update field permission for a specific user tier
   */
  async updateFieldPermission(
    fieldId: string,
    userTier: UserTier,
    permissionType: PermissionType,
    updatedBy: string,
    permissions?: Partial<FieldPermission>,
    skipSecurityValidation?: boolean
  ): Promise<boolean> {
    try {
      const operation: PermissionOperation = {
        entityType: 'field',
        entityId: fieldId,
        userTier,
        permissionType,
        permissions: permissions || this.getDefaultPermissions(permissionType, false) // fields don't have approve
      };

      const validationErrors = validatePermissionOperation(operation);
      if (validationErrors.length > 0) {
        console.error('Permission operation validation failed:', validationErrors);
        return false;
      }

      const updaterTier = await getUserRole(updatedBy) as UserTier;
      if (updaterTier !== 'master') {
        console.error('Only master users can update permissions');
        return false;
      }

      const { data: currentPermission } = await supabase
        .from('field_permissions')
        .select('*')
        .eq('field_id', fieldId)
        .eq('user_tier', userTier)
        .single();

      const permissionData = {
        field_id: fieldId,
        user_tier: userTier,
        permission_type: permissionType,
        can_create: permissions?.can_create ?? this.getDefaultPermissions(permissionType, false).can_create,
        can_read: permissions?.can_read ?? this.getDefaultPermissions(permissionType, false).can_read,
        can_update: permissions?.can_update ?? this.getDefaultPermissions(permissionType, false).can_update,
        can_delete: permissions?.can_delete ?? this.getDefaultPermissions(permissionType, false).can_delete,
        granted_by: updatedBy,
        granted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('field_permissions')
        .upsert([permissionData]);

      if (error) {
        console.error('Error updating field permission:', error);
        return false;
      }

      await this.logPermissionChange('field', fieldId, userTier, currentPermission, permissionData, updatedBy);
      return true;
    } catch (error) {
      console.error('Error updating field permission:', error);
      return false;
    }
  }

  // UTILITY METHODS

  /**
   * Get user's accessible pages
   */
  async getUserAccessiblePages(userId: string): Promise<PageWithPermissions[]> {
    try {
      const userTier = await getUserRole(userId) as UserTier;
      if (!userTier) return [];

      const { data: pages, error } = await supabase
        .from('page_definitions')
        .select(`
          *,
          userPermission:page_permissions!inner(*)
        `)
        .eq('is_active', true)
        .eq('page_permissions.user_tier', userTier)
        .eq('page_permissions.can_read', true)
        .order('sort_order');

      if (error || !pages) {
        console.error('Error getting user accessible pages:', error);
        return [];
      }

      return pages as PageWithPermissions[];
    } catch (error) {
      console.error('Error getting user accessible pages:', error);
      return [];
    }
  }

  /**
   * Initialize default permissions for a new page
   */
  async initializePagePermissions(pageId: string, createdBy: string): Promise<boolean> {
    try {
      const defaultPermissions = [
        { user_tier: 'master', permission_type: 'full', can_create: true, can_read: true, can_update: true, can_delete: true, can_approve: true },
        { user_tier: 'senior', permission_type: 'full', can_create: true, can_read: true, can_update: true, can_delete: false, can_approve: true },
        { user_tier: 'hr_finance', permission_type: 'read_only', can_create: false, can_read: true, can_update: false, can_delete: false, can_approve: false },
        { user_tier: 'mid', permission_type: 'read_only', can_create: false, can_read: true, can_update: false, can_delete: false, can_approve: false },
        { user_tier: 'external', permission_type: 'none', can_create: false, can_read: false, can_update: false, can_delete: false, can_approve: false }
      ];

      const permissionData = defaultPermissions.map(perm => ({
        page_id: pageId,
        ...perm,
        granted_by: createdBy,
        granted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('page_permissions')
        .insert(permissionData);

      if (error) {
        console.error('Error initializing page permissions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initializing page permissions:', error);
      return false;
    }
  }

  // PRIVATE HELPER METHODS

  private createNoAccessResult(reason: string): PermissionCheckResult {
    return {
      permission: 'none',
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canApprove: false,
      reason
    };
  }

  private createEmptyHierarchy(): HierarchicalPermissions {
    return {
      pages: [],
      totalPages: 0,
      totalSections: 0,
      totalFields: 0,
      userTierCounts: {
        master: 0,
        senior: 0,
        hr_finance: 0,
        mid: 0,
        external: 0
      }
    };
  }

  private calculatePermissionStats(pages: PageWithPermissions[]) {
    let totalSections = 0;
    let totalFields = 0;
    const userTierCounts: Record<UserTier, number> = {
      master: 0,
      senior: 0,
      hr_finance: 0,
      mid: 0,
      external: 0
    };

    pages.forEach(page => {
      totalSections += page.sections?.length || 0;
      page.sections?.forEach(section => {
        totalFields += section.fields?.length || 0;
      });

      // Count permissions by tier
      page.permissions?.forEach(perm => {
        userTierCounts[perm.user_tier]++;
      });
    });

    return {
      totalPages: pages.length,
      totalSections,
      totalFields,
      userTierCounts
    };
  }

  private createPermissionResult(
    permissionType: PermissionType, 
    userTier: UserTier, 
    isFinancial: boolean, 
    isSensitive: boolean, 
    isCritical: boolean
  ): PermissionCheckResult {
    const effectivePermission = getEffectivePermission(permissionType, userTier, isFinancial, isSensitive, isCritical);
    
    return {
      permission: effectivePermission,
      canRead: effectivePermission !== 'none',
      canCreate: ['full'].includes(effectivePermission),
      canUpdate: ['full', 'assigned_only', 'own_only'].includes(effectivePermission),
      canDelete: effectivePermission === 'full',
      canApprove: ['full', 'read_only'].includes(effectivePermission)
    };
  }

  private getDefaultPermissions(permissionType: PermissionType, includeApprove: boolean = true) {
    const base = {
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false
    };

    const withApprove = includeApprove ? { can_approve: false } : {};

    switch (permissionType) {
      case 'full':
        return { ...base, can_create: true, can_read: true, can_update: true, can_delete: true, ...withApprove, ...(includeApprove ? { can_approve: true } : {}) };
      case 'read_only':
        return { ...base, can_read: true, ...withApprove };
      case 'own_only':
      case 'assigned_only':
        return { ...base, can_read: true, can_update: true, ...withApprove };
      case 'none':
      default:
        return { ...base, ...withApprove };
    }
  }

  private async logPermissionChange(
    entityType: EntityType,
    entityId: string,
    userTier: UserTier,
    oldPermission: any,
    newPermission: any,
    changedBy: string
  ): Promise<void> {
    try {
      await supabase
        .from('permission_audit_log')
        .insert([{
          entity_type: entityType,
          entity_id: entityId,
          user_tier: userTier,
          action_type: oldPermission ? 'modify' : 'grant',
          old_permission: oldPermission,
          new_permission: newPermission,
          changed_by: changedBy,
          change_reason: 'Updated via PermissionService',
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error logging permission change:', error);
    }
  }
}

// Export singleton instance
export const permissionService = PermissionService.getInstance();