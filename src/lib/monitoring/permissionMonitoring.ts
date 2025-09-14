import { UserTier, PermissionType } from '../../types/permissions';
import { ErrorSeverity } from '../resilience/errorHandling';

/**
 * Production monitoring system for permissions
 * Tracks performance, security events, and system health
 */

// Metric types
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMING = 'timing'
}

// Alert levels
export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

// Monitoring events
export interface PermissionEvent {
  id: string;
  type: string;
  timestamp: Date;
  userId?: string;
  userRole?: string;
  entityType?: string;
  entityId?: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  duration?: number;
  metadata?: any;
}

// Performance metrics
export interface PerformanceMetric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

// Security alerts
export interface SecurityAlert {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  entityId?: string;
  metadata?: any;
  resolved: boolean;
  resolvedAt?: Date;
}

export class PermissionMonitoring {
  private static events: PermissionEvent[] = [];
  private static metrics: PerformanceMetric[] = [];
  private static alerts: SecurityAlert[] = [];
  private static eventBuffer: PermissionEvent[] = [];
  private static flushInterval: NodeJS.Timeout | null = null;
  
  // Configuration
  private static config = {
    bufferSize: 100,
    flushIntervalMs: 30000, // 30 seconds
    maxRetentionDays: 30,
    alertThresholds: {
      failureRate: 0.05, // 5%
      responseTime: 2000, // 2 seconds
      suspiciousActivityCount: 10,
      massPermissionChanges: 20
    }
  };

  /**
   * Initialize monitoring system
   */
  static initialize(): void {
    // Start periodic flush to external systems
    this.flushInterval = setInterval(() => {
      this.flushEvents();
      this.analyzeMetrics();
      this.checkAlertConditions();
      this.cleanupOldData();
    }, this.config.flushIntervalMs);

    // Initialize performance observer
    this.initializePerformanceObserver();
    
    // Set up error tracking
    this.initializeErrorTracking();
  }

  /**
   * Track permission check event
   */
  static trackPermissionCheck(
    userId: string,
    userRole: string,
    entityType: 'page' | 'section' | 'field',
    entityId: string,
    result: 'granted' | 'denied',
    duration?: number
  ): void {
    const event: PermissionEvent = {
      id: this.generateEventId(),
      type: 'permission_check',
      timestamp: new Date(),
      userId,
      userRole,
      entityType,
      entityId,
      action: 'check',
      result: result === 'granted' ? 'success' : 'blocked',
      duration,
      metadata: { checkType: 'access_control' }
    };

    this.addEvent(event);
    this.updateMetrics('permission_checks_total', 1, { result, entityType });
    
    if (duration) {
      this.updateMetrics('permission_check_duration', duration, { entityType });
    }
  }

  /**
   * Track permission change event
   */
  static trackPermissionChange(
    userId: string,
    userRole: string,
    entityType: 'page' | 'section' | 'field',
    entityId: string,
    targetUserTier: UserTier,
    oldPermission: PermissionType,
    newPermission: PermissionType,
    duration?: number
  ): void {
    const event: PermissionEvent = {
      id: this.generateEventId(),
      type: 'permission_change',
      timestamp: new Date(),
      userId,
      userRole,
      entityType,
      entityId,
      action: 'modify',
      result: 'success',
      duration,
      metadata: {
        targetUserTier,
        oldPermission,
        newPermission,
        changeType: this.classifyPermissionChange(oldPermission, newPermission)
      }
    };

    this.addEvent(event);
    this.updateMetrics('permission_changes_total', 1, { 
      entityType, 
      changeType: event.metadata.changeType 
    });
    
    // Check for suspicious patterns
    this.checkSuspiciousPermissionActivity(userId, event);
  }

  /**
   * Track bulk operation
   */
  static trackBulkOperation(
    userId: string,
    userRole: string,
    operationType: 'bulk_apply' | 'bulk_copy' | 'bulk_reset',
    affectedEntities: number,
    duration: number,
    success: boolean
  ): void {
    const event: PermissionEvent = {
      id: this.generateEventId(),
      type: 'bulk_operation',
      timestamp: new Date(),
      userId,
      userRole,
      action: operationType,
      result: success ? 'success' : 'failure',
      duration,
      metadata: {
        affectedEntities,
        operationType
      }
    };

    this.addEvent(event);
    this.updateMetrics('bulk_operations_total', 1, { 
      operationType, 
      result: event.result 
    });
    this.updateMetrics('bulk_operation_duration', duration, { operationType });
    this.updateMetrics('bulk_entities_affected', affectedEntities, { operationType });

    // Alert for large bulk operations
    if (affectedEntities > this.config.alertThresholds.massPermissionChanges) {
      this.createAlert(
        AlertLevel.WARNING,
        'Large Bulk Operation',
        `User ${userId} performed bulk ${operationType} on ${affectedEntities} entities`,
        { userId, operationType, affectedEntities }
      );
    }
  }

  /**
   * Track validation event
   */
  static trackValidation(
    userId: string,
    validationType: 'inheritance' | 'business_rule' | 'security',
    entityType: 'page' | 'section' | 'field',
    entityId: string,
    result: 'passed' | 'warning' | 'failed',
    issuesFound: number
  ): void {
    const event: PermissionEvent = {
      id: this.generateEventId(),
      type: 'validation',
      timestamp: new Date(),
      userId,
      entityType,
      entityId,
      action: 'validate',
      result: result === 'failed' ? 'failure' : 'success',
      metadata: {
        validationType,
        result,
        issuesFound
      }
    };

    this.addEvent(event);
    this.updateMetrics('validations_total', 1, { 
      validationType, 
      result, 
      entityType 
    });
    this.updateMetrics('validation_issues_found', issuesFound, { validationType });
  }

  /**
   * Track authentication/authorization failures
   */
  static trackAuthFailure(
    userId: string,
    failureType: 'authentication' | 'authorization',
    entityId?: string,
    attemptedAction?: string
  ): void {
    const event: PermissionEvent = {
      id: this.generateEventId(),
      type: 'auth_failure',
      timestamp: new Date(),
      userId,
      entityId,
      action: attemptedAction || 'access',
      result: 'blocked',
      metadata: {
        failureType,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
      }
    };

    this.addEvent(event);
    this.updateMetrics('auth_failures_total', 1, { failureType });

    // Check for brute force patterns
    this.checkBruteForcePattern(userId);
  }

  /**
   * Track system performance metrics
   */
  static trackPerformance(
    operation: string,
    duration: number,
    success: boolean,
    metadata?: any
  ): void {
    this.updateMetrics(`${operation}_duration`, duration, { 
      success: success.toString() 
    });
    this.updateMetrics(`${operation}_total`, 1, { 
      result: success ? 'success' : 'failure' 
    });

    // Alert on slow operations
    if (duration > this.config.alertThresholds.responseTime) {
      this.createAlert(
        AlertLevel.WARNING,
        'Slow Operation Detected',
        `${operation} took ${duration}ms to complete`,
        { operation, duration, metadata }
      );
    }
  }

  /**
   * Add event to buffer
   */
  private static addEvent(event: PermissionEvent): void {
    this.events.push(event);
    this.eventBuffer.push(event);

    // Flush buffer if full
    if (this.eventBuffer.length >= this.config.bufferSize) {
      this.flushEvents();
    }
  }

  /**
   * Update metrics
   */
  private static updateMetrics(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      type: name.includes('duration') ? MetricType.TIMING : MetricType.COUNTER,
      value,
      timestamp: new Date(),
      tags
    };

    this.metrics.push(metric);
  }

  /**
   * Create security alert
   */
  private static createAlert(
    level: AlertLevel,
    title: string,
    description: string,
    metadata?: any
  ): void {
    const alert: SecurityAlert = {
      id: this.generateAlertId(),
      level,
      title,
      description,
      timestamp: new Date(),
      metadata,
      resolved: false
    };

    this.alerts.push(alert);
    
    // Send immediate notification for critical alerts
    if (level === AlertLevel.CRITICAL || level === AlertLevel.EMERGENCY) {
      this.sendImmediateAlert(alert);
    }
  }

  /**
   * Flush events to external monitoring systems
   */
  private static async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // Send to external systems (Prometheus, DataDog, CloudWatch, etc.)
      await Promise.all([
        this.sendToPrometheus(eventsToFlush),
        this.sendToDataDog(eventsToFlush),
        this.sendToCloudWatch(eventsToFlush)
      ]);
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Add events back to buffer for retry
      this.eventBuffer.unshift(...eventsToFlush);
    }
  }

  /**
   * Analyze metrics for patterns and anomalies
   */
  private static analyzeMetrics(): void {
    const recentMetrics = this.metrics.filter(m => 
      Date.now() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    // Calculate failure rate
    const totalChecks = recentMetrics
      .filter(m => m.name === 'permission_checks_total')
      .reduce((sum, m) => sum + m.value, 0);
    
    const failedChecks = recentMetrics
      .filter(m => m.name === 'permission_checks_total' && m.tags?.result === 'blocked')
      .reduce((sum, m) => sum + m.value, 0);

    const failureRate = totalChecks > 0 ? failedChecks / totalChecks : 0;

    if (failureRate > this.config.alertThresholds.failureRate) {
      this.createAlert(
        AlertLevel.WARNING,
        'High Permission Failure Rate',
        `${(failureRate * 100).toFixed(1)}% of permission checks are failing`,
        { failureRate, totalChecks, failedChecks }
      );
    }

    // Analyze response times
    const avgResponseTime = this.calculateAverageResponseTime(recentMetrics);
    if (avgResponseTime > this.config.alertThresholds.responseTime) {
      this.createAlert(
        AlertLevel.WARNING,
        'Slow Permission Response Times',
        `Average response time is ${avgResponseTime}ms`,
        { avgResponseTime }
      );
    }
  }

  /**
   * Check for alert conditions
   */
  private static checkAlertConditions(): void {
    // Check for unusual activity patterns
    const recentEvents = this.events.filter(e => 
      Date.now() - e.timestamp.getTime() < 600000 // Last 10 minutes
    );

    // Mass permission changes by single user
    const userChangeCounts = new Map<string, number>();
    recentEvents
      .filter(e => e.type === 'permission_change')
      .forEach(e => {
        const count = userChangeCounts.get(e.userId || '') || 0;
        userChangeCounts.set(e.userId || '', count + 1);
      });

    userChangeCounts.forEach((count, userId) => {
      if (count > this.config.alertThresholds.massPermissionChanges) {
        this.createAlert(
          AlertLevel.WARNING,
          'Mass Permission Changes',
          `User ${userId} made ${count} permission changes in 10 minutes`,
          { userId, changeCount: count }
        );
      }
    });

    // Multiple failed authentication attempts
    const authFailures = recentEvents
      .filter(e => e.type === 'auth_failure')
      .reduce((acc, e) => {
        const key = e.userId || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(authFailures).forEach(([userId, count]) => {
      if (count >= 5) {
        this.createAlert(
          AlertLevel.CRITICAL,
          'Multiple Authentication Failures',
          `${count} failed auth attempts for user ${userId}`,
          { userId, attemptCount: count }
        );
      }
    });
  }

  /**
   * Check for suspicious permission activity patterns
   */
  private static checkSuspiciousPermissionActivity(userId: string, event: PermissionEvent): void {
    const recentUserEvents = this.events
      .filter(e => e.userId === userId && Date.now() - e.timestamp.getTime() < 300000)
      .slice(-20); // Last 20 events

    // Pattern 1: Rapid permission escalations
    const escalations = recentUserEvents.filter(e => 
      e.type === 'permission_change' && 
      e.metadata?.changeType === 'escalation'
    );

    if (escalations.length >= 5) {
      this.createAlert(
        AlertLevel.WARNING,
        'Rapid Permission Escalations',
        `User ${userId} performed ${escalations.length} permission escalations`,
        { userId, escalationCount: escalations.length }
      );
    }

    // Pattern 2: Access to critical resources by lower-tier users
    if (event.metadata?.targetUserTier === 'external' && 
        event.metadata?.newPermission === 'full' &&
        event.entityId?.includes('financial')) {
      this.createAlert(
        AlertLevel.CRITICAL,
        'Critical Resource Access Grant',
        `Full access to financial resource granted to external user`,
        { userId, entityId: event.entityId, targetUserTier: event.metadata.targetUserTier }
      );
    }
  }

  /**
   * Check for brute force authentication patterns
   */
  private static checkBruteForcePattern(userId: string): void {
    const recentFailures = this.events
      .filter(e => 
        e.type === 'auth_failure' && 
        e.userId === userId && 
        Date.now() - e.timestamp.getTime() < 900000 // Last 15 minutes
      );

    if (recentFailures.length >= 5) {
      this.createAlert(
        AlertLevel.CRITICAL,
        'Possible Brute Force Attack',
        `${recentFailures.length} authentication failures for user ${userId}`,
        { userId, failureCount: recentFailures.length }
      );
    }
  }

  /**
   * Send immediate alert for critical issues
   */
  private static async sendImmediateAlert(alert: SecurityAlert): Promise<void> {
    try {
      // Send to multiple channels for critical alerts
      await Promise.all([
        this.sendSlackAlert(alert),
        this.sendEmailAlert(alert),
        this.sendPagerDutyAlert(alert)
      ]);
    } catch (error) {
      console.error('Failed to send immediate alert:', error);
    }
  }

  /**
   * Calculate average response time from metrics
   */
  private static calculateAverageResponseTime(metrics: PerformanceMetric[]): number {
    const timingMetrics = metrics.filter(m => m.type === MetricType.TIMING);
    if (timingMetrics.length === 0) return 0;
    
    const total = timingMetrics.reduce((sum, m) => sum + m.value, 0);
    return total / timingMetrics.length;
  }

  /**
   * Classify permission change type
   */
  private static classifyPermissionChange(
    oldPermission: PermissionType,
    newPermission: PermissionType
  ): string {
    const permissionLevels = {
      'none': 0,
      'own_only': 1,
      'assigned_only': 2,
      'read_only': 3,
      'full': 4
    };

    const oldLevel = permissionLevels[oldPermission];
    const newLevel = permissionLevels[newPermission];

    if (newLevel > oldLevel) return 'escalation';
    if (newLevel < oldLevel) return 'reduction';
    return 'modification';
  }

  /**
   * Generate unique event ID
   */
  private static generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique alert ID
   */
  private static generateAlertId(): string {
    return `alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up old data
   */
  private static cleanupOldData(): void {
    const cutoffDate = new Date(Date.now() - this.config.maxRetentionDays * 24 * 60 * 60 * 1000);
    
    this.events = this.events.filter(e => e.timestamp > cutoffDate);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffDate);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoffDate);
  }

  /**
   * Initialize performance observer
   */
  private static initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('permission')) {
            this.trackPerformance(entry.name, entry.duration, true);
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  /**
   * Initialize error tracking
   */
  private static initializeErrorTracking(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        if (event.error?.message?.includes('permission')) {
          this.createAlert(
            AlertLevel.CRITICAL,
            'Permission System Error',
            event.error.message,
            { stack: event.error.stack, filename: event.filename }
          );
        }
      });
    }
  }

  // External service integration methods (mock implementations)
  private static async sendToPrometheus(events: PermissionEvent[]): Promise<void> {
    // Send metrics to Prometheus
    console.log(`Sending ${events.length} events to Prometheus`);
  }

  private static async sendToDataDog(events: PermissionEvent[]): Promise<void> {
    // Send metrics to DataDog
    console.log(`Sending ${events.length} events to DataDog`);
  }

  private static async sendToCloudWatch(events: PermissionEvent[]): Promise<void> {
    // Send metrics to CloudWatch
    console.log(`Sending ${events.length} events to CloudWatch`);
  }

  private static async sendSlackAlert(alert: SecurityAlert): Promise<void> {
    // Send alert to Slack
    console.log(`Sending Slack alert: ${alert.title}`);
  }

  private static async sendEmailAlert(alert: SecurityAlert): Promise<void> {
    // Send email alert
    console.log(`Sending email alert: ${alert.title}`);
  }

  private static async sendPagerDutyAlert(alert: SecurityAlert): Promise<void> {
    // Send PagerDuty alert
    console.log(`Sending PagerDuty alert: ${alert.title}`);
  }

  /**
   * Get monitoring statistics
   */
  static getMonitoringStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    activeAlerts: SecurityAlert[];
    recentMetrics: PerformanceMetric[];
    systemHealth: 'healthy' | 'warning' | 'critical';
  } {
    const eventsByType: Record<string, number> = {};
    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    const activeAlerts = this.alerts.filter(a => !a.resolved);
    const criticalAlerts = activeAlerts.filter(a => a.level === AlertLevel.CRITICAL);
    
    const systemHealth = criticalAlerts.length > 0 ? 'critical' :
                        activeAlerts.length > 0 ? 'warning' : 'healthy';

    return {
      totalEvents: this.events.length,
      eventsByType,
      activeAlerts,
      recentMetrics: this.metrics.slice(-50),
      systemHealth
    };
  }

  /**
   * Resolve alert
   */
  static resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Shutdown monitoring
   */
  static shutdown(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Final flush
    this.flushEvents();
  }
}

// Initialize monitoring on module load
if (typeof window !== 'undefined' || import.meta.env.MODE === 'production') {
  PermissionMonitoring.initialize();
}

export default PermissionMonitoring;