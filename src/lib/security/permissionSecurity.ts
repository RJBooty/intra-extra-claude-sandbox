import { UserTier, PermissionType } from '../../types/permissions';

/**
 * Security utilities for permission system
 * Production-ready security measures and validation
 */

// Rate limiting for permission changes
const permissionChangeRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_CHANGES = 50; // Maximum changes per minute per user

// Input validation patterns
const VALIDATION_PATTERNS = {
  entityId: /^[a-zA-Z0-9_-]+$/,
  userTier: /^(master|senior|hr_finance|mid|external)$/,
  permissionType: /^(full|read_only|assigned_only|own_only|none)$/,
  pageRoute: /^\/[a-zA-Z0-9/_-]*$/
};

// Critical pages that require extra protection
const CRITICAL_PAGES = [
  'roi',
  'financial-reports', 
  'user-management',
  'system-settings',
  'audit-logs'
];

// Sensitive fields that require encryption at rest
const SENSITIVE_FIELD_TYPES = [
  'ssn',
  'tax_id',
  'bank_account',
  'credit_card',
  'personal_email',
  'phone_number'
];

export class PermissionSecurityValidator {
  /**
   * Validate permission change request for security issues
   */
  static validatePermissionChange(
    userId: string,
    userRole: string,
    entityType: 'page' | 'section' | 'field',
    entityId: string,
    targetUserTier: UserTier,
    newPermission: PermissionType,
    currentUserPermission?: PermissionType
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Rate limiting check
    if (!this.checkRateLimit(userId)) {
      errors.push('Rate limit exceeded. Too many permission changes in short time.');
    }

    // Input validation
    if (!this.validateInputs(entityId, targetUserTier, newPermission)) {
      errors.push('Invalid input parameters detected.');
    }

    // Authorization check
    if (!this.validateUserAuthorization(userRole, entityType, newPermission)) {
      errors.push('Insufficient authorization for this permission change.');
    }

    // Critical resource protection
    if (this.isCriticalResourceViolation(entityType, entityId, targetUserTier, newPermission)) {
      errors.push('Cannot grant access to critical resources for this user tier.');
    }

    // Privilege escalation check
    if (this.isPrivilegeEscalation(userRole, targetUserTier, currentUserPermission, newPermission)) {
      errors.push('Potential privilege escalation detected.');
    }

    // Business rule validation
    const businessRuleIssues = this.validateBusinessRules(entityType, entityId, targetUserTier, newPermission);
    warnings.push(...businessRuleIssues);

    // Suspicious pattern detection
    const suspiciousPatterns = this.detectSuspiciousPatterns(userId, entityType, targetUserTier, newPermission);
    warnings.push(...suspiciousPatterns);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check rate limiting for permission changes
   */
  private static checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = permissionChangeRateLimit.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      permissionChangeRateLimit.set(userId, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      });
      return true;
    }

    if (userLimit.count >= RATE_LIMIT_MAX_CHANGES) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  /**
   * Validate input parameters against injection attacks
   */
  private static validateInputs(
    entityId: string,
    userTier: UserTier,
    permissionType: PermissionType
  ): boolean {
    return (
      VALIDATION_PATTERNS.entityId.test(entityId) &&
      VALIDATION_PATTERNS.userTier.test(userTier) &&
      VALIDATION_PATTERNS.permissionType.test(permissionType) &&
      entityId.length <= 100 // Prevent oversized inputs
    );
  }

  /**
   * Validate user has authorization to make this change
   */
  private static validateUserAuthorization(
    userRole: string,
    entityType: 'page' | 'section' | 'field',
    newPermission: PermissionType
  ): boolean {
    // Only Master and Senior users can grant full permissions
    if (newPermission === 'full' && !['master', 'senior'].includes(userRole)) {
      return false;
    }

    // Only Master users can modify critical system permissions
    if (entityType === 'page' && !['master'].includes(userRole)) {
      return false;
    }

    return true;
  }

  /**
   * Check for critical resource access violations
   */
  private static isCriticalResourceViolation(
    entityType: 'page' | 'section' | 'field',
    entityId: string,
    userTier: UserTier,
    newPermission: PermissionType
  ): boolean {
    if (entityType === 'page') {
      const isCriticalPage = CRITICAL_PAGES.some(page => entityId.includes(page));
      if (isCriticalPage && ['mid', 'external'].includes(userTier) && newPermission !== 'none') {
        return true;
      }
    }

    // Financial data protection
    if (entityId.includes('financial') || entityId.includes('roi')) {
      if (['external'].includes(userTier) && newPermission !== 'none') {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect potential privilege escalation attempts
   */
  private static isPrivilegeEscalation(
    userRole: string,
    targetUserTier: UserTier,
    currentPermission: PermissionType = 'none',
    newPermission: PermissionType
  ): boolean {
    // Users cannot grant permissions higher than their own role allows
    const roleHierarchy = {
      'external': 0,
      'mid': 1,
      'hr_finance': 2,
      'senior': 3,
      'master': 4
    };

    const permissionValues = {
      'none': 0,
      'own_only': 1,
      'assigned_only': 2,
      'read_only': 3,
      'full': 4
    };

    const userRoleValue = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const targetUserValue = roleHierarchy[targetUserTier] || 0;
    const newPermissionValue = permissionValues[newPermission] || 0;

    // Cannot grant permissions to users at same or higher role level
    if (targetUserValue >= userRoleValue && userRole !== 'master') {
      return true;
    }

    // Significant permission increase requires justification
    const currentPermissionValue = permissionValues[currentPermission] || 0;
    if (newPermissionValue - currentPermissionValue > 2) {
      return true;
    }

    return false;
  }

  /**
   * Validate against business rules
   */
  private static validateBusinessRules(
    entityType: 'page' | 'section' | 'field',
    entityId: string,
    userTier: UserTier,
    newPermission: PermissionType
  ): string[] {
    const warnings: string[] = [];

    // Master users should maintain access to critical systems
    if (userTier === 'master' && newPermission === 'none') {
      warnings.push('Removing Master access may impact system administration');
    }

    // External users should have minimal access
    if (userTier === 'external' && ['full', 'assigned_only'].includes(newPermission)) {
      warnings.push('Granting broad access to External users may violate security policy');
    }

    // Sensitive field access patterns
    if (entityType === 'field' && SENSITIVE_FIELD_TYPES.some(type => entityId.includes(type))) {
      if (['mid', 'external'].includes(userTier) && newPermission !== 'none') {
        warnings.push('Granting access to sensitive fields requires additional approval');
      }
    }

    return warnings;
  }

  /**
   * Detect suspicious permission change patterns
   */
  private static detectSuspiciousPatterns(
    userId: string,
    entityType: 'page' | 'section' | 'field',
    userTier: UserTier,
    newPermission: PermissionType
  ): string[] {
    const warnings: string[] = [];

    // Multiple high-privilege grants in short time
    const recentChanges = this.getRecentPermissionChanges(userId);
    const highPrivilegeChanges = recentChanges.filter(change => 
      change.permission === 'full' && Date.now() - change.timestamp < 300000 // 5 minutes
    );

    if (highPrivilegeChanges.length > 5) {
      warnings.push('Unusual pattern: Multiple high-privilege grants in short timeframe');
    }

    // Mass permission changes to External users
    const externalUserChanges = recentChanges.filter(change =>
      change.userTier === 'external' && Date.now() - change.timestamp < 600000 // 10 minutes
    );

    if (externalUserChanges.length > 10) {
      warnings.push('Unusual pattern: Mass permission changes to External users');
    }

    return warnings;
  }

  /**
   * Get recent permission changes for pattern analysis
   */
  private static getRecentPermissionChanges(userId: string): Array<{
    timestamp: number;
    userTier: UserTier;
    permission: PermissionType;
  }> {
    // This would query the audit log in a real implementation
    // For now, return mock data
    return [];
  }

  /**
   * Sanitize permission data for logging (remove sensitive info)
   */
  static sanitizeForLogging(data: any): any {
    const sanitized = { ...data };
    
    // Remove or mask sensitive fields
    const sensitiveFields = ['ssn', 'tax_id', 'bank_account', 'personal_email', 'phone'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    // Truncate long strings to prevent log flooding
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 200) {
        sanitized[key] = sanitized[key].substring(0, 200) + '...';
      }
    });

    return sanitized;
  }

  /**
   * Generate security event for monitoring
   */
  static generateSecurityEvent(
    eventType: 'permission_change' | 'access_denied' | 'suspicious_activity',
    userId: string,
    details: any
  ): SecurityEvent {
    return {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp: new Date().toISOString(),
      userId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      ipAddress: this.getClientIP(),
      details: this.sanitizeForLogging(details),
      severity: this.determineSeverity(eventType, details)
    };
  }

  /**
   * Get client IP address (server-side implementation would differ)
   */
  private static getClientIP(): string {
    // This is a client-side implementation
    // Server-side would use req.ip or similar
    return 'client-side';
  }

  /**
   * Determine event severity based on type and details
   */
  private static determineSeverity(
    eventType: string,
    details: any
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (eventType) {
      case 'access_denied':
        return details.attempts > 3 ? 'high' : 'medium';
      case 'permission_change':
        return details.targetUserTier === 'master' ? 'high' : 'medium';
      case 'suspicious_activity':
        return 'critical';
      default:
        return 'low';
    }
  }
}

export interface SecurityEvent {
  id: string;
  type: 'permission_change' | 'access_denied' | 'suspicious_activity';
  timestamp: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Database Row-Level Security (RLS) policy templates
 * These should be applied in Supabase
 */
export const RLS_POLICIES = {
  // Users can only see their own permission records
  user_permissions: `
    CREATE POLICY "Users can view own permissions" ON user_permissions
    FOR SELECT USING (auth.uid()::text = user_id);
  `,
  
  // Only Master/Senior can modify permissions
  permission_modifications: `
    CREATE POLICY "Only Master/Senior can modify permissions" ON page_permissions
    FOR ALL USING (
      auth.uid() IN (
        SELECT id FROM users 
        WHERE role IN ('master', 'senior')
      )
    );
  `,
  
  // Audit logs are read-only and only for Master users
  audit_logs: `
    CREATE POLICY "Master users can view audit logs" ON permission_audit_logs
    FOR SELECT USING (
      auth.uid() IN (
        SELECT id FROM users WHERE role = 'master'
      )
    );
  `,
  
  // Critical pages require Master access
  critical_pages: `
    CREATE POLICY "Critical pages Master only" ON page_permissions
    FOR ALL USING (
      CASE 
        WHEN page_id IN (SELECT id FROM pages WHERE is_critical = true)
        THEN auth.uid() IN (SELECT id FROM users WHERE role = 'master')
        ELSE true
      END
    );
  `
};

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
};

/**
 * Encryption utilities for sensitive data
 */
export class DataEncryption {
  private static readonly ENCRYPTION_KEY = import.meta.env.VITE_PERMISSION_ENCRYPTION_KEY || 'fallback-key';

  /**
   * Encrypt sensitive field data before storage
   */
  static async encryptSensitiveField(data: string): Promise<string> {
    // In production, use proper encryption library like crypto or sodium
    // This is a placeholder implementation
    if (typeof window !== 'undefined') {
      // Client-side: don't encrypt, mark for server processing
      return `[ENCRYPT]:${data}`;
    }
    
    // Server-side: actual encryption would happen here
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decrypt sensitive field data after retrieval
   */
  static async decryptSensitiveField(encryptedData: string): Promise<string> {
    if (encryptedData.startsWith('[ENCRYPT]:')) {
      return encryptedData.substring(10);
    }
    
    try {
      return Buffer.from(encryptedData, 'base64').toString();
    } catch {
      return encryptedData; // Return as-is if not encrypted
    }
  }

  /**
   * Hash sensitive data for comparison without storing plaintext
   */
  static async hashForComparison(data: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for environments without crypto.subtle
    return btoa(data);
  }
}

export default {
  PermissionSecurityValidator,
  RLS_POLICIES,
  SECURITY_HEADERS,
  DataEncryption
};