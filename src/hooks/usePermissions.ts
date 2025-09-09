import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { permissionService, PermissionCheckResult } from '../lib/permissions';
import { PermissionType } from '../types/permissions';

// Cache to avoid excessive API calls
const permissionCache = new Map<string, { result: PermissionCheckResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface PermissionHookResult {
  // Core permission data
  permission: PermissionType;
  loading: boolean;
  error: string | null;
  
  // Boolean helpers for common checks
  canAccess: boolean;
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean; // alias for canUpdate
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  
  // Permission type helpers
  isReadOnly: boolean;
  isAssignedOnly: boolean;
  isOwnOnly: boolean;
  isFull: boolean;
  isNone: boolean;
  
  // Utility functions
  refresh: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for checking page-level permissions
 */
export function usePageAccess(pageId: string | null): PermissionHookResult {
  const { user, isAuthenticated } = useAuth();
  const [result, setResult] = useState<PermissionCheckResult>({
    permission: 'none',
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canApprove: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkPermission = useCallback(async () => {
    // Early return conditions
    if (!isAuthenticated || !user?.id || !pageId) {
      setResult({
        permission: 'none',
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        reason: !isAuthenticated ? 'User not authenticated' : 'No page specified'
      });
      setLoading(false);
      return;
    }

    const cacheKey = `page:${user.id}:${pageId}`;
    const cached = permissionCache.get(cacheKey);
    
    // Use cached result if valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResult(cached.result);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const permissionResult = await permissionService.canAccessPage(user.id, pageId);
      
      // Cache the result
      permissionCache.set(cacheKey, {
        result: permissionResult,
        timestamp: Date.now()
      });

      setResult(permissionResult);
    } catch (err: any) {
      console.error('Error checking page permission:', err);
      setError(err.message || 'Failed to check permissions');
      setResult({
        permission: 'none',
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        reason: 'Permission check failed'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, pageId]);

  const refresh = useCallback(async () => {
    if (user?.id && pageId) {
      const cacheKey = `page:${user.id}:${pageId}`;
      permissionCache.delete(cacheKey);
      await checkPermission();
    }
  }, [user?.id, pageId, checkPermission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const helpers = useMemo(() => ({
    canAccess: result.canRead,
    canRead: result.canRead,
    canCreate: result.canCreate,
    canEdit: result.canUpdate,
    canUpdate: result.canUpdate,
    canDelete: result.canDelete,
    canApprove: result.canApprove || false,
    
    isReadOnly: result.permission === 'read_only',
    isAssignedOnly: result.permission === 'assigned_only',
    isOwnOnly: result.permission === 'own_only',
    isFull: result.permission === 'full',
    isNone: result.permission === 'none'
  }), [result]);

  return {
    permission: result.permission,
    loading,
    error,
    ...helpers,
    refresh,
    clearError
  };
}

/**
 * Hook for checking section-level permissions
 */
export function useSectionAccess(sectionId: string | null): PermissionHookResult {
  const { user, isAuthenticated } = useAuth();
  const [result, setResult] = useState<PermissionCheckResult>({
    permission: 'none',
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canApprove: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkPermission = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !sectionId) {
      setResult({
        permission: 'none',
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        reason: !isAuthenticated ? 'User not authenticated' : 'No section specified'
      });
      setLoading(false);
      return;
    }

    const cacheKey = `section:${user.id}:${sectionId}`;
    const cached = permissionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResult(cached.result);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const permissionResult = await permissionService.canAccessSection(user.id, sectionId);
      
      permissionCache.set(cacheKey, {
        result: permissionResult,
        timestamp: Date.now()
      });

      setResult(permissionResult);
    } catch (err: any) {
      console.error('Error checking section permission:', err);
      setError(err.message || 'Failed to check permissions');
      setResult({
        permission: 'none',
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        reason: 'Permission check failed'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, sectionId]);

  const refresh = useCallback(async () => {
    if (user?.id && sectionId) {
      const cacheKey = `section:${user.id}:${sectionId}`;
      permissionCache.delete(cacheKey);
      await checkPermission();
    }
  }, [user?.id, sectionId, checkPermission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const helpers = useMemo(() => ({
    canAccess: result.canRead,
    canRead: result.canRead,
    canCreate: result.canCreate,
    canEdit: result.canUpdate,
    canUpdate: result.canUpdate,
    canDelete: result.canDelete,
    canApprove: result.canApprove || false,
    
    isReadOnly: result.permission === 'read_only',
    isAssignedOnly: result.permission === 'assigned_only',
    isOwnOnly: result.permission === 'own_only',
    isFull: result.permission === 'full',
    isNone: result.permission === 'none'
  }), [result]);

  return {
    permission: result.permission,
    loading,
    error,
    ...helpers,
    refresh,
    clearError
  };
}

/**
 * Hook for checking field-level permissions
 */
export function useFieldAccess(fieldId: string | null): PermissionHookResult {
  const { user, isAuthenticated } = useAuth();
  const [result, setResult] = useState<PermissionCheckResult>({
    permission: 'none',
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkPermission = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !fieldId) {
      setResult({
        permission: 'none',
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        reason: !isAuthenticated ? 'User not authenticated' : 'No field specified'
      });
      setLoading(false);
      return;
    }

    const cacheKey = `field:${user.id}:${fieldId}`;
    const cached = permissionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResult(cached.result);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const permissionResult = await permissionService.canAccessField(user.id, fieldId);
      
      permissionCache.set(cacheKey, {
        result: permissionResult,
        timestamp: Date.now()
      });

      setResult(permissionResult);
    } catch (err: any) {
      console.error('Error checking field permission:', err);
      setError(err.message || 'Failed to check permissions');
      setResult({
        permission: 'none',
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        reason: 'Permission check failed'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, fieldId]);

  const refresh = useCallback(async () => {
    if (user?.id && fieldId) {
      const cacheKey = `field:${user.id}:${fieldId}`;
      permissionCache.delete(cacheKey);
      await checkPermission();
    }
  }, [user?.id, fieldId, checkPermission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const helpers = useMemo(() => ({
    canAccess: result.canRead,
    canRead: result.canRead,
    canCreate: result.canCreate,
    canEdit: result.canUpdate,
    canUpdate: result.canUpdate,
    canDelete: result.canDelete,
    canApprove: false, // Fields don't have approval
    
    isReadOnly: result.permission === 'read_only',
    isAssignedOnly: result.permission === 'assigned_only',
    isOwnOnly: result.permission === 'own_only',
    isFull: result.permission === 'full',
    isNone: result.permission === 'none'
  }), [result]);

  return {
    permission: result.permission,
    loading,
    error,
    ...helpers,
    refresh,
    clearError
  };
}

/**
 * Hook for checking page permissions by page name (convenience hook)
 */
export function usePageAccessByName(pageName: string | null): PermissionHookResult {
  const { user, isAuthenticated } = useAuth();
  const [result, setResult] = useState<PermissionCheckResult>({
    permission: 'none',
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canApprove: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkPermission = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !pageName) {
      setResult({
        permission: 'none',
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        reason: !isAuthenticated ? 'User not authenticated' : 'No page specified'
      });
      setLoading(false);
      return;
    }

    const cacheKey = `pageName:${user.id}:${pageName}`;
    const cached = permissionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResult(cached.result);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const permissionResult = await permissionService.canAccessPageByName(user.id, pageName);
      
      permissionCache.set(cacheKey, {
        result: permissionResult,
        timestamp: Date.now()
      });

      setResult(permissionResult);
    } catch (err: any) {
      console.error('Error checking page permission by name:', err);
      setError(err.message || 'Failed to check permissions');
      setResult({
        permission: 'none',
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        reason: 'Permission check failed'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, pageName]);

  const refresh = useCallback(async () => {
    if (user?.id && pageName) {
      const cacheKey = `pageName:${user.id}:${pageName}`;
      permissionCache.delete(cacheKey);
      await checkPermission();
    }
  }, [user?.id, pageName, checkPermission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const helpers = useMemo(() => ({
    canAccess: result.canRead,
    canRead: result.canRead,
    canCreate: result.canCreate,
    canEdit: result.canUpdate,
    canUpdate: result.canUpdate,
    canDelete: result.canDelete,
    canApprove: result.canApprove || false,
    
    isReadOnly: result.permission === 'read_only',
    isAssignedOnly: result.permission === 'assigned_only',
    isOwnOnly: result.permission === 'own_only',
    isFull: result.permission === 'full',
    isNone: result.permission === 'none'
  }), [result]);

  return {
    permission: result.permission,
    loading,
    error,
    ...helpers,
    refresh,
    clearError
  };
}

/**
 * Hook for checking multiple permissions at once
 */
export function useMultiplePermissions(requests: Array<{
  type: 'page' | 'section' | 'field';
  id: string;
  name?: string; // For caching/identification
}>) {
  const { user, isAuthenticated } = useAuth();
  const [results, setResults] = useState<Record<string, PermissionCheckResult>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermissions = useCallback(async () => {
    if (!isAuthenticated || !user?.id || requests.length === 0) {
      setResults({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const permissionPromises = requests.map(async (request) => {
        const cacheKey = `${request.type}:${user.id}:${request.id}`;
        const cached = permissionCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return { key: request.name || request.id, result: cached.result };
        }

        let result: PermissionCheckResult;
        switch (request.type) {
          case 'page':
            result = await permissionService.canAccessPage(user.id, request.id);
            break;
          case 'section':
            result = await permissionService.canAccessSection(user.id, request.id);
            break;
          case 'field':
            result = await permissionService.canAccessField(user.id, request.id);
            break;
          default:
            throw new Error(`Unknown permission type: ${request.type}`);
        }

        permissionCache.set(cacheKey, { result, timestamp: Date.now() });
        return { key: request.name || request.id, result };
      });

      const results = await Promise.all(permissionPromises);
      const resultMap = results.reduce((acc, { key, result }) => {
        acc[key] = result;
        return acc;
      }, {} as Record<string, PermissionCheckResult>);

      setResults(resultMap);
    } catch (err: any) {
      console.error('Error checking multiple permissions:', err);
      setError(err.message || 'Failed to check permissions');
      setResults({});
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, requests]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    results,
    loading,
    error,
    refresh: checkPermissions,
    clearError: () => setError(null)
  };
}

/**
 * Utility function to clear all permission cache
 */
export function clearPermissionCache(): void {
  permissionCache.clear();
}

/**
 * Utility function to clear cache for specific user
 */
export function clearUserPermissionCache(userId: string): void {
  for (const [key] of permissionCache) {
    if (key.includes(`:${userId}:`)) {
      permissionCache.delete(key);
    }
  }
}