import { UserTier, PermissionType, HierarchicalPermissions } from '../../types/permissions';

/**
 * High-performance caching system for permissions
 * Reduces database queries and improves response times
 */

// Cache configuration
const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_ENTRIES: 10000,
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute
  PRELOAD_CRITICAL_PERMISSIONS: true
};

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
  lastAccess: number;
}

// Permission cache key generators
const CACHE_KEYS = {
  userPermissions: (userId: string) => `user_perms:${userId}`,
  entityPermission: (entityType: string, entityId: string, userTier: UserTier) => 
    `entity_perm:${entityType}:${entityId}:${userTier}`,
  hierarchicalData: () => 'hierarchical_data',
  userRole: (userId: string) => `user_role:${userId}`,
  bulkPermissions: (entityIds: string[], userTier: UserTier) =>
    `bulk_perms:${userTier}:${entityIds.sort().join(',')}`,
  validationCache: (entityType: string, entityId: string) =>
    `validation:${entityType}:${entityId}`
};

export class PermissionCache {
  private static cache = new Map<string, CacheEntry<any>>();
  private static cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize cache with cleanup timer
   */
  static initialize(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);

    // Preload critical permissions if enabled
    if (CACHE_CONFIG.PRELOAD_CRITICAL_PERMISSIONS) {
      this.preloadCriticalData();
    }
  }

  /**
   * Get cached data
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > CACHE_CONFIG.TTL) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.hits++;
    entry.lastAccess = Date.now();
    
    return entry.data as T;
  }

  /**
   * Set cached data
   */
  static set<T>(key: string, data: T): void {
    // Prevent cache overflow
    if (this.cache.size >= CACHE_CONFIG.MAX_ENTRIES) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
      lastAccess: Date.now()
    });
  }

  /**
   * Delete cached data
   */
  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache entries by pattern
   */
  static invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number;
    hitRate: number;
    totalHits: number;
    oldestEntry: number;
    memoryUsage: number;
  } {
    let totalHits = 0;
    let oldestTimestamp = Date.now();
    
    this.cache.forEach(entry => {
      totalHits += entry.hits;
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
    });

    return {
      size: this.cache.size,
      hitRate: totalHits > 0 ? totalHits / this.cache.size : 0,
      totalHits,
      oldestEntry: Date.now() - oldestTimestamp,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Cleanup expired entries
   */
  private static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > CACHE_CONFIG.TTL) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Evict least recently used entries
   */
  private static evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccess - b.lastAccess);
    
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    entries.slice(0, toRemove).forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  /**
   * Estimate memory usage
   */
  private static estimateMemoryUsage(): number {
    let usage = 0;
    this.cache.forEach((entry, key) => {
      usage += key.length * 2; // Approximate string size
      usage += JSON.stringify(entry.data).length * 2; // Approximate data size
      usage += 64; // Entry overhead
    });
    return usage;
  }

  /**
   * Preload critical permissions data
   */
  private static async preloadCriticalData(): Promise<void> {
    try {
      // This would load critical permissions in background
      console.log('Preloading critical permissions data...');
      
      // Preload hierarchical data
      // const hierarchicalData = await permissionService.getAllPermissions();
      // this.set(CACHE_KEYS.hierarchicalData(), hierarchicalData);
      
    } catch (error) {
      console.error('Failed to preload critical data:', error);
    }
  }

  /**
   * Destroy cache and cleanup
   */
  static destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}

/**
 * Permission-specific caching utilities
 */
export class PermissionCacheManager {
  /**
   * Get user permissions with caching
   */
  static async getUserPermissions(userId: string): Promise<any> {
    const cacheKey = CACHE_KEYS.userPermissions(userId);
    let permissions = PermissionCache.get(cacheKey);

    if (!permissions) {
      // Load from database
      permissions = await this.loadUserPermissionsFromDB(userId);
      PermissionCache.set(cacheKey, permissions);
    }

    return permissions;
  }

  /**
   * Get entity permission with caching
   */
  static async getEntityPermission(
    entityType: 'page' | 'section' | 'field',
    entityId: string,
    userTier: UserTier
  ): Promise<PermissionType> {
    const cacheKey = CACHE_KEYS.entityPermission(entityType, entityId, userTier);
    let permission = PermissionCache.get<PermissionType>(cacheKey);

    if (!permission) {
      permission = await this.loadEntityPermissionFromDB(entityType, entityId, userTier);
      PermissionCache.set(cacheKey, permission);
    }

    return permission;
  }

  /**
   * Get hierarchical permissions with caching
   */
  static async getHierarchicalData(): Promise<HierarchicalPermissions> {
    const cacheKey = CACHE_KEYS.hierarchicalData();
    let data = PermissionCache.get<HierarchicalPermissions>(cacheKey);

    if (!data) {
      data = await this.loadHierarchicalDataFromDB();
      PermissionCache.set(cacheKey, data);
    }

    return data;
  }

  /**
   * Bulk load permissions with caching
   */
  static async getBulkPermissions(
    entityIds: string[],
    userTier: UserTier
  ): Promise<Record<string, PermissionType>> {
    const cacheKey = CACHE_KEYS.bulkPermissions(entityIds, userTier);
    let permissions = PermissionCache.get<Record<string, PermissionType>>(cacheKey);

    if (!permissions) {
      permissions = await this.loadBulkPermissionsFromDB(entityIds, userTier);
      PermissionCache.set(cacheKey, permissions);
    }

    return permissions;
  }

  /**
   * Invalidate user-specific cache on permission change
   */
  static invalidateUserCache(userId: string): void {
    const userPattern = `user_perms:${userId}`;
    PermissionCache.delete(CACHE_KEYS.userPermissions(userId));
    
    // Also invalidate hierarchical data as it may have changed
    PermissionCache.delete(CACHE_KEYS.hierarchicalData());
  }

  /**
   * Invalidate entity-specific cache
   */
  static invalidateEntityCache(entityType: string, entityId: string): void {
    // Invalidate all user tiers for this entity
    const userTiers: UserTier[] = ['master', 'senior', 'hr_finance', 'mid', 'external'];
    userTiers.forEach(tier => {
      PermissionCache.delete(CACHE_KEYS.entityPermission(entityType, entityId, tier));
    });

    // Invalidate validation cache
    PermissionCache.delete(CACHE_KEYS.validationCache(entityType, entityId));
  }

  /**
   * Warm up cache with frequently accessed data
   */
  static async warmUpCache(userId: string): Promise<void> {
    try {
      // Preload user permissions
      await this.getUserPermissions(userId);
      
      // Preload hierarchical data
      await this.getHierarchicalData();
      
      // Preload user role
      const userRole = await this.loadUserRoleFromDB(userId);
      PermissionCache.set(CACHE_KEYS.userRole(userId), userRole);
      
    } catch (error) {
      console.error('Cache warmup failed:', error);
    }
  }

  // Mock database loading methods (replace with actual DB calls)
  private static async loadUserPermissionsFromDB(userId: string): Promise<any> {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, 100));
    return { userId, permissions: [] };
  }

  private static async loadEntityPermissionFromDB(
    entityType: string,
    entityId: string,
    userTier: UserTier
  ): Promise<PermissionType> {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, 50));
    return 'read_only';
  }

  private static async loadHierarchicalDataFromDB(): Promise<HierarchicalPermissions> {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      pages: [],
      sections: {},
      fields: {},
      pagePermissions: {},
      sectionPermissions: {},
      fieldPermissions: {},
      totalPages: 0,
      totalSections: 0,
      totalFields: 0
    };
  }

  private static async loadBulkPermissionsFromDB(
    entityIds: string[],
    userTier: UserTier
  ): Promise<Record<string, PermissionType>> {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, entityIds.length * 10));
    return entityIds.reduce((acc, id) => {
      acc[id] = 'read_only';
      return acc;
    }, {} as Record<string, PermissionType>);
  }

  private static async loadUserRoleFromDB(userId: string): Promise<string> {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, 50));
    return 'mid';
  }
}

/**
 * Database query optimization utilities
 */
export class QueryOptimizer {
  /**
   * Generate optimized query for bulk permission lookup
   */
  static generateBulkPermissionQuery(
    entityIds: string[],
    userTiers: UserTier[]
  ): string {
    // Batch multiple entity lookups into single query
    return `
      SELECT 
        entity_type,
        entity_id,
        user_tier,
        permission_type
      FROM (
        SELECT 'page' as entity_type, page_id as entity_id, user_tier, permission_type
        FROM page_permissions 
        WHERE page_id = ANY($1) AND user_tier = ANY($2)
        
        UNION ALL
        
        SELECT 'section' as entity_type, section_id as entity_id, user_tier, permission_type
        FROM section_permissions 
        WHERE section_id = ANY($1) AND user_tier = ANY($2)
        
        UNION ALL
        
        SELECT 'field' as entity_type, field_id as entity_id, user_tier, permission_type
        FROM field_permissions 
        WHERE field_id = ANY($1) AND user_tier = ANY($2)
      ) combined_permissions
      ORDER BY entity_type, entity_id, user_tier;
    `;
  }

  /**
   * Generate query with proper indexes for performance
   */
  static getRecommendedIndexes(): string[] {
    return [
      // Composite indexes for permission lookups
      'CREATE INDEX CONCURRENTLY idx_page_permissions_lookup ON page_permissions (page_id, user_tier);',
      'CREATE INDEX CONCURRENTLY idx_section_permissions_lookup ON section_permissions (section_id, user_tier);',
      'CREATE INDEX CONCURRENTLY idx_field_permissions_lookup ON field_permissions (field_id, user_tier);',
      
      // Indexes for audit queries
      'CREATE INDEX CONCURRENTLY idx_audit_logs_timestamp ON permission_audit_logs (created_at DESC);',
      'CREATE INDEX CONCURRENTLY idx_audit_logs_user ON permission_audit_logs (changed_by, created_at DESC);',
      'CREATE INDEX CONCURRENTLY idx_audit_logs_entity ON permission_audit_logs (entity_type, entity_id, created_at DESC);',
      
      // Indexes for hierarchical queries
      'CREATE INDEX CONCURRENTLY idx_sections_page ON sections (page_id);',
      'CREATE INDEX CONCURRENTLY idx_fields_section ON fields (section_id);',
      
      // Partial indexes for critical data
      'CREATE INDEX CONCURRENTLY idx_critical_pages ON pages (id) WHERE is_critical = true;',
      'CREATE INDEX CONCURRENTLY idx_financial_sections ON sections (id) WHERE is_financial = true;',
      'CREATE INDEX CONCURRENTLY idx_sensitive_fields ON fields (id) WHERE is_sensitive = true;'
    ];
  }

  /**
   * Analyze query performance
   */
  static analyzeQueryPerformance(query: string, params: any[]): Promise<any> {
    // This would run EXPLAIN ANALYZE in production
    return Promise.resolve({
      executionTime: Math.random() * 100,
      indexUsage: ['idx_page_permissions_lookup'],
      suggestions: ['Consider adding composite index on (entity_id, user_tier)']
    });
  }
}

/**
 * Performance monitoring for cache operations
 */
export class CachePerformanceMonitor {
  private static metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    totalResponseTime: 0,
    queries: 0
  };

  static recordCacheHit(): void {
    this.metrics.hits++;
  }

  static recordCacheMiss(): void {
    this.metrics.misses++;
  }

  static recordCacheSet(): void {
    this.metrics.sets++;
  }

  static recordCacheDelete(): void {
    this.metrics.deletes++;
  }

  static recordQueryTime(time: number): void {
    this.metrics.totalResponseTime += time;
    this.metrics.queries++;
  }

  static getMetrics(): typeof CachePerformanceMonitor.metrics & {
    hitRate: number;
    avgResponseTime: number;
  } {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
      avgResponseTime: this.metrics.queries > 0 ? 
        this.metrics.totalResponseTime / this.metrics.queries : 0
    };
  }

  static resetMetrics(): void {
    Object.keys(this.metrics).forEach(key => {
      (this.metrics as any)[key] = 0;
    });
  }
}

// Initialize cache on module load
if (typeof window !== 'undefined') {
  PermissionCache.initialize();
}

export default {
  PermissionCache,
  PermissionCacheManager,
  QueryOptimizer,
  CachePerformanceMonitor,
  CACHE_KEYS
};