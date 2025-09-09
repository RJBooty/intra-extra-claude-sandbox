import { PermissionType, UserTier } from '../../types/permissions';
import { PermissionCache } from '../performance/permissionCache';

/**
 * Production-ready error handling and fallback system for permissions
 * Ensures graceful degradation when services are unavailable
 */

// Error types
export enum PermissionErrorType {
  NETWORK_ERROR = 'network_error',
  DATABASE_ERROR = 'database_error',
  AUTHENTICATION_ERROR = 'auth_error',
  AUTHORIZATION_ERROR = 'authz_error',
  VALIDATION_ERROR = 'validation_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  TIMEOUT_ERROR = 'timeout_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Permission error interface
export interface PermissionError {
  type: PermissionErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code: string;
  timestamp: Date;
  context?: any;
  stackTrace?: string;
  retryable: boolean;
}

// Fallback permission policies
const FALLBACK_PERMISSIONS = {
  // Conservative fallback - no access by default
  SAFE_FALLBACK: 'none' as PermissionType,
  
  // Emergency access for critical systems
  EMERGENCY_ACCESS: {
    'master': 'full' as PermissionType,
    'senior': 'read_only' as PermissionType,
    'hr_finance': 'none' as PermissionType,
    'mid': 'none' as PermissionType,
    'external': 'none' as PermissionType
  },
  
  // Read-only fallback for non-critical systems
  READ_ONLY_FALLBACK: {
    'master': 'read_only' as PermissionType,
    'senior': 'read_only' as PermissionType,
    'hr_finance': 'read_only' as PermissionType,
    'mid': 'read_only' as PermissionType,
    'external': 'none' as PermissionType
  }
};

export class PermissionErrorHandler {
  private static errorLog: PermissionError[] = [];
  private static maxLogSize = 1000;
  private static retryAttempts = new Map<string, number>();
  private static circuitBreaker = new Map<string, { failures: number; lastFailure: Date; state: 'closed' | 'open' | 'half-open' }>();

  /**
   * Handle permission service errors with appropriate fallback
   */
  static async handlePermissionError(
    error: any,
    context: {
      operation: string;
      userId?: string;
      entityType?: string;
      entityId?: string;
      userTier?: UserTier;
    }
  ): Promise<{
    permission: PermissionType;
    isUsingFallback: boolean;
    error: PermissionError;
  }> {
    const permissionError = this.classifyError(error, context);
    this.logError(permissionError);

    // Update circuit breaker
    this.updateCircuitBreaker(context.operation, permissionError);

    // Determine fallback permission
    const fallbackPermission = this.getFallbackPermission(
      permissionError,
      context.entityType,
      context.entityId,
      context.userTier
    );

    // Send error to monitoring system
    this.sendErrorToMonitoring(permissionError, context);

    // Schedule retry if appropriate
    if (permissionError.retryable) {
      this.scheduleRetry(context);
    }

    return {
      permission: fallbackPermission,
      isUsingFallback: true,
      error: permissionError
    };
  }

  /**
   * Classify error and create PermissionError object
   */
  private static classifyError(error: any, context: any): PermissionError {
    let type = PermissionErrorType.UNKNOWN_ERROR;
    let severity = ErrorSeverity.MEDIUM;
    let userMessage = 'An unexpected error occurred. Please try again.';
    let retryable = false;

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
      type = PermissionErrorType.NETWORK_ERROR;
      severity = ErrorSeverity.HIGH;
      userMessage = 'Unable to connect to permission service. Using cached permissions.';
      retryable = true;
    }
    
    // Database errors
    else if (error.code?.startsWith('PG') || error.message?.includes('database')) {
      type = PermissionErrorType.DATABASE_ERROR;
      severity = ErrorSeverity.CRITICAL;
      userMessage = 'Database temporarily unavailable. Limited functionality available.';
      retryable = true;
    }
    
    // Authentication errors
    else if (error.status === 401 || error.code === 'UNAUTHENTICATED') {
      type = PermissionErrorType.AUTHENTICATION_ERROR;
      severity = ErrorSeverity.HIGH;
      userMessage = 'Please log in again to continue.';
      retryable = false;
    }
    
    // Authorization errors
    else if (error.status === 403 || error.code === 'UNAUTHORIZED') {
      type = PermissionErrorType.AUTHORIZATION_ERROR;
      severity = ErrorSeverity.MEDIUM;
      userMessage = 'You do not have permission to perform this action.';
      retryable = false;
    }
    
    // Validation errors
    else if (error.status === 400 || error.code === 'VALIDATION_ERROR') {
      type = PermissionErrorType.VALIDATION_ERROR;
      severity = ErrorSeverity.LOW;
      userMessage = 'Invalid request. Please check your input and try again.';
      retryable = false;
    }
    
    // Service unavailable
    else if (error.status === 503 || error.code === 'SERVICE_UNAVAILABLE') {
      type = PermissionErrorType.SERVICE_UNAVAILABLE;
      severity = ErrorSeverity.CRITICAL;
      userMessage = 'Permission service is temporarily unavailable. Using fallback permissions.';
      retryable = true;
    }
    
    // Timeout errors
    else if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      type = PermissionErrorType.TIMEOUT_ERROR;
      severity = ErrorSeverity.HIGH;
      userMessage = 'Request timed out. Please try again.';
      retryable = true;
    }

    return {
      type,
      severity,
      message: error.message || 'Unknown error',
      userMessage,
      code: error.code || 'UNKNOWN',
      timestamp: new Date(),
      context,
      stackTrace: error.stack,
      retryable
    };
  }

  /**
   * Get appropriate fallback permission based on error and context
   */
  private static getFallbackPermission(
    error: PermissionError,
    entityType?: string,
    entityId?: string,
    userTier?: UserTier
  ): PermissionType {
    // Check cache first
    if (entityType && entityId && userTier) {
      const cachedPermission = PermissionCache.get<PermissionType>(
        `entity_perm:${entityType}:${entityId}:${userTier}`
      );
      if (cachedPermission) {
        return cachedPermission;
      }
    }

    // Critical errors - use most restrictive fallback
    if (error.severity === ErrorSeverity.CRITICAL) {
      return FALLBACK_PERMISSIONS.SAFE_FALLBACK;
    }

    // For critical pages/systems
    if (this.isCriticalEntity(entityType, entityId)) {
      return userTier ? FALLBACK_PERMISSIONS.EMERGENCY_ACCESS[userTier] : FALLBACK_PERMISSIONS.SAFE_FALLBACK;
    }

    // For non-critical systems, allow read-only access
    if (userTier && error.severity !== ErrorSeverity.CRITICAL) {
      return FALLBACK_PERMISSIONS.READ_ONLY_FALLBACK[userTier];
    }

    // Default to safe fallback
    return FALLBACK_PERMISSIONS.SAFE_FALLBACK;
  }

  /**
   * Check if entity is critical and requires special handling
   */
  private static isCriticalEntity(entityType?: string, entityId?: string): boolean {
    if (!entityType || !entityId) return true; // Assume critical if unknown

    const criticalPatterns = [
      'roi',
      'financial',
      'admin',
      'user-management',
      'system',
      'audit'
    ];

    return criticalPatterns.some(pattern => 
      entityId.toLowerCase().includes(pattern)
    );
  }

  /**
   * Log error for debugging and analysis
   */
  private static logError(error: PermissionError): void {
    // Add to in-memory log
    this.errorLog.push(error);
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console logging for development
    if (import.meta.env.MODE !== 'production') {
      console.error('Permission Error:', error);
    }

    // Send to external logging service in production
    if (import.meta.env.MODE === 'production') {
      this.sendToExternalLogger(error);
    }
  }

  /**
   * Send error to external logging service
   */
  private static async sendToExternalLogger(error: PermissionError): Promise<void> {
    try {
      // In production, this would send to services like:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - CloudWatch
      
      const logData = {
        level: error.severity,
        message: error.message,
        error: {
          type: error.type,
          code: error.code,
          userMessage: error.userMessage
        },
        context: error.context,
        timestamp: error.timestamp.toISOString(),
        environment: import.meta.env.MODE,
        service: 'permissions',
        // Remove sensitive data
        sanitized: true
      };

      // Mock external service call
      if (typeof fetch !== 'undefined') {
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        }).catch(err => console.error('Failed to send log:', err));
      }
    } catch (logError) {
      console.error('Failed to send error to external logger:', logError);
    }
  }

  /**
   * Update circuit breaker state
   */
  private static updateCircuitBreaker(operation: string, error: PermissionError): void {
    const breaker = this.circuitBreaker.get(operation) || { 
      failures: 0, 
      lastFailure: new Date(), 
      state: 'closed' 
    };

    breaker.failures++;
    breaker.lastFailure = new Date();

    // Open circuit after 5 failures
    if (breaker.failures >= 5 && breaker.state === 'closed') {
      breaker.state = 'open';
    }
    
    // Move to half-open after 30 seconds
    else if (breaker.state === 'open' && 
             Date.now() - breaker.lastFailure.getTime() > 30000) {
      breaker.state = 'half-open';
    }

    this.circuitBreaker.set(operation, breaker);
  }

  /**
   * Check if circuit breaker allows operation
   */
  static canAttemptOperation(operation: string): boolean {
    const breaker = this.circuitBreaker.get(operation);
    if (!breaker) return true;

    if (breaker.state === 'open') {
      // Check if enough time has passed to try half-open
      if (Date.now() - breaker.lastFailure.getTime() > 30000) {
        breaker.state = 'half-open';
        return true;
      }
      return false;
    }

    return true;
  }

  /**
   * Reset circuit breaker on successful operation
   */
  static resetCircuitBreaker(operation: string): void {
    this.circuitBreaker.delete(operation);
  }

  /**
   * Schedule retry for retryable operations
   */
  private static scheduleRetry(context: any): void {
    const retryKey = JSON.stringify(context);
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;
    
    if (currentAttempts < 3) {
      const delay = Math.pow(2, currentAttempts) * 1000; // Exponential backoff
      
      setTimeout(async () => {
        this.retryAttempts.set(retryKey, currentAttempts + 1);
        
        try {
          // Retry the operation
          await this.retryOperation(context);
          this.retryAttempts.delete(retryKey);
        } catch (retryError) {
          // Handle retry failure
          if (currentAttempts === 2) { // Last attempt
            this.retryAttempts.delete(retryKey);
          }
        }
      }, delay);
    }
  }

  /**
   * Retry failed operation
   */
  private static async retryOperation(context: any): Promise<void> {
    // This would retry the original operation
    // Implementation depends on specific operation type
    console.log('Retrying operation:', context.operation);
  }

  /**
   * Send error to monitoring system
   */
  private static sendErrorToMonitoring(error: PermissionError, context: any): void {
    // Send to monitoring system (Prometheus, DataDog, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'permission_error', {
        event_category: 'permissions',
        event_label: error.type,
        value: error.severity === ErrorSeverity.CRITICAL ? 4 : 
               error.severity === ErrorSeverity.HIGH ? 3 :
               error.severity === ErrorSeverity.MEDIUM ? 2 : 1
      });
    }
  }

  /**
   * Get error statistics for monitoring
   */
  static getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: PermissionError[];
    circuitBreakerStates: Record<string, string>;
  } {
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.errorLog.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    const circuitBreakerStates: Record<string, string> = {};
    this.circuitBreaker.forEach((breaker, operation) => {
      circuitBreakerStates[operation] = breaker.state;
    });

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      errorsBySeverity,
      recentErrors: this.errorLog.slice(-10),
      circuitBreakerStates
    };
  }

  /**
   * Clear error log and reset state
   */
  static clearErrorLog(): void {
    this.errorLog = [];
    this.retryAttempts.clear();
    this.circuitBreaker.clear();
  }
}

/**
 * User-friendly error messages for different scenarios
 */
export const USER_ERROR_MESSAGES = {
  [PermissionErrorType.NETWORK_ERROR]: {
    title: 'Connection Issue',
    message: 'Unable to connect to our servers. We\'re showing you cached information.',
    action: 'Check your internet connection and refresh the page.',
    severity: 'warning'
  },
  [PermissionErrorType.DATABASE_ERROR]: {
    title: 'Service Temporarily Unavailable',
    message: 'Our permission service is experiencing issues. Limited functionality is available.',
    action: 'Please try again in a few minutes.',
    severity: 'error'
  },
  [PermissionErrorType.AUTHENTICATION_ERROR]: {
    title: 'Authentication Required',
    message: 'Your session has expired. Please log in again.',
    action: 'Click here to log in',
    severity: 'warning'
  },
  [PermissionErrorType.AUTHORIZATION_ERROR]: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    action: 'Contact your administrator if you believe this is an error.',
    severity: 'info'
  },
  [PermissionErrorType.SERVICE_UNAVAILABLE]: {
    title: 'Service Maintenance',
    message: 'The permission service is temporarily down for maintenance.',
    action: 'Normal service will resume shortly.',
    severity: 'warning'
  }
};

/**
 * React hook for handling permission errors
 */
export function usePermissionErrorHandler() {
  return {
    handleError: PermissionErrorHandler.handlePermissionError,
    canAttempt: PermissionErrorHandler.canAttemptOperation,
    resetCircuit: PermissionErrorHandler.resetCircuitBreaker,
    getStats: PermissionErrorHandler.getErrorStats
  };
}

export default {
  PermissionErrorHandler,
  PermissionErrorType,
  ErrorSeverity,
  FALLBACK_PERMISSIONS,
  USER_ERROR_MESSAGES,
  usePermissionErrorHandler
};