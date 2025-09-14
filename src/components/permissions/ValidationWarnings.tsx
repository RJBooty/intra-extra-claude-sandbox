import React from 'react';
import {
  AlertTriangle,
  Shield,
  Lock,
  Users,
  Eye,
  AlertCircle,
  Info,
  CheckCircle,
  X
} from 'lucide-react';
import { PermissionType, UserTier, PageDefinition, SectionDefinition, FieldDefinition } from '../../types/permissions';

interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'high' | 'medium' | 'low';
  category: 'security' | 'consistency' | 'inheritance' | 'business_rule';
  entityType: 'page' | 'section' | 'field';
  entityId: string;
  entityName: string;
  userTier: UserTier;
  currentPermission: PermissionType;
  message: string;
  recommendation?: string;
  autoFixable: boolean;
}

interface ValidationWarningsProps {
  hierarchicalData: any;
  pendingChanges: Array<{
    type: 'page' | 'section' | 'field';
    entityId: string;
    userTier: UserTier;
    oldPermission: PermissionType;
    newPermission: PermissionType;
  }>;
  getEffectivePermission: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier) => PermissionType;
  onDismissIssue: (issueId: string) => void;
  onAutoFix: (issueId: string) => void;
  className?: string;
}

export function ValidationWarnings({
  hierarchicalData,
  pendingChanges,
  getEffectivePermission,
  onDismissIssue,
  onAutoFix,
  className = ''
}: ValidationWarningsProps) {
  const issues = validatePermissions(hierarchicalData, pendingChanges, getEffectivePermission);
  
  if (issues.length === 0) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-medium text-green-900">Permissions Valid</h3>
            <p className="text-sm text-green-700">No validation issues found with current permissions.</p>
          </div>
        </div>
      </div>
    );
  }

  const errorCount = issues.filter(issue => issue.type === 'error').length;
  const warningCount = issues.filter(issue => issue.type === 'warning').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900">
              Validation Issues Found ({issues.length})
            </h3>
            <div className="text-sm text-amber-700 flex gap-4 mt-1">
              {errorCount > 0 && <span>{errorCount} errors</span>}
              {warningCount > 0 && <span>{warningCount} warnings</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Issue List */}
      <div className="space-y-3">
        {issues.map(issue => (
          <ValidationIssueCard
            key={issue.id}
            issue={issue}
            onDismiss={() => onDismissIssue(issue.id)}
            onAutoFix={() => onAutoFix(issue.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ValidationIssueCard({
  issue,
  onDismiss,
  onAutoFix
}: {
  issue: ValidationIssue;
  onDismiss: () => void;
  onAutoFix: () => void;
}) {
  const getIssueIcon = () => {
    switch (issue.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getIssueColors = () => {
    switch (issue.type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getCategoryIcon = () => {
    switch (issue.category) {
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'consistency':
        return <Eye className="w-4 h-4" />;
      case 'inheritance':
        return <Users className="w-4 h-4" />;
      case 'business_rule':
        return <Lock className="w-4 h-4" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getIssueColors()}`}>
      <div className="flex items-start gap-3">
        {getIssueIcon()}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {getCategoryIcon()}
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {issue.category.replace('_', ' ')}
              </span>
            </div>
            <span className="text-xs bg-white px-2 py-0.5 rounded">
              {issue.entityType}: {issue.entityName}
            </span>
            <span className="text-xs bg-white px-2 py-0.5 rounded">
              {issue.userTier.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-900 mb-1">
            {issue.message}
          </p>

          {issue.recommendation && (
            <p className="text-sm text-gray-700 mb-2">
              <strong>Recommendation:</strong> {issue.recommendation}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {issue.autoFixable && (
            <button
              onClick={onAutoFix}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Auto Fix
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Validation logic
function validatePermissions(
  hierarchicalData: any,
  pendingChanges: Array<any>,
  getEffectivePermission: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier) => PermissionType
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const userTiers: UserTier[] = ['master', 'senior', 'hr_finance', 'mid', 'external'];

  if (!hierarchicalData?.pages) return issues;

  // Check each page
  hierarchicalData.pages.forEach((page: PageDefinition) => {
    userTiers.forEach(userTier => {
      const pagePermission = getEffectivePermission('page', page.id, userTier);
      
      // Business rule: Critical pages cannot be accessed by Mid/External users
      if (page.is_critical && ['mid', 'external'].includes(userTier) && pagePermission !== 'none') {
        issues.push({
          id: `critical-access-${page.id}-${userTier}`,
          type: 'error',
          severity: 'high',
          category: 'security',
          entityType: 'page',
          entityId: page.id,
          entityName: page.display_name,
          userTier,
          currentPermission: pagePermission,
          message: `Critical page "${page.display_name}" should not be accessible to ${userTier} users`,
          recommendation: 'Set permission to "none" for security compliance',
          autoFixable: true
        });
      }

      // Business rule: Master users should not have "none" access to anything
      if (userTier === 'master' && pagePermission === 'none') {
        issues.push({
          id: `master-no-access-${page.id}`,
          type: 'warning',
          severity: 'high',
          category: 'business_rule',
          entityType: 'page',
          entityId: page.id,
          entityName: page.display_name,
          userTier,
          currentPermission: pagePermission,
          message: `Master user has no access to "${page.display_name}" - this may cause management issues`,
          recommendation: 'Consider granting at least read-only access to Master users',
          autoFixable: true
        });
      }

      // Check sections within this page
      const sections = hierarchicalData.sections[page.id] || [];
      sections.forEach((section: SectionDefinition) => {
        const sectionPermission = getEffectivePermission('section', section.id, userTier);
        
        // Inheritance validation: Section permission cannot exceed page permission
        if (isPermissionViolation(sectionPermission, pagePermission)) {
          issues.push({
            id: `inheritance-violation-section-${section.id}-${userTier}`,
            type: 'error',
            severity: 'medium',
            category: 'inheritance',
            entityType: 'section',
            entityId: section.id,
            entityName: section.display_name,
            userTier,
            currentPermission: sectionPermission,
            message: `Section "${section.display_name}" has more permissive access (${sectionPermission}) than its parent page (${pagePermission})`,
            recommendation: `Reduce section permission to ${pagePermission} or increase page permission`,
            autoFixable: true
          });
        }

        // Financial section validation
        if (section.is_financial && ['mid', 'external'].includes(userTier) && !['none', 'read_only'].includes(sectionPermission)) {
          issues.push({
            id: `financial-access-${section.id}-${userTier}`,
            type: 'warning',
            severity: 'medium',
            category: 'security',
            entityType: 'section',
            entityId: section.id,
            entityName: section.display_name,
            userTier,
            currentPermission: sectionPermission,
            message: `Financial section "${section.display_name}" grants write access to ${userTier} users`,
            recommendation: 'Consider limiting to read-only or no access for financial data protection',
            autoFixable: false
          });
        }

        // Check fields within this section
        const fields = hierarchicalData.fields[section.id] || [];
        fields.forEach((field: FieldDefinition) => {
          const fieldPermission = getEffectivePermission('field', field.id, userTier);
          
          // Inheritance validation: Field permission cannot exceed section permission
          if (isPermissionViolation(fieldPermission, sectionPermission)) {
            issues.push({
              id: `inheritance-violation-field-${field.id}-${userTier}`,
              type: 'error',
              severity: 'medium',
              category: 'inheritance',
              entityType: 'field',
              entityId: field.id,
              entityName: field.display_name,
              userTier,
              currentPermission: fieldPermission,
              message: `Field "${field.display_name}" has more permissive access (${fieldPermission}) than its parent section (${sectionPermission})`,
              recommendation: `Reduce field permission to ${sectionPermission} or increase section permission`,
              autoFixable: true
            });
          }

          // Sensitive field validation
          if (field.is_sensitive && ['mid', 'external'].includes(userTier) && fieldPermission !== 'none') {
            issues.push({
              id: `sensitive-access-${field.id}-${userTier}`,
              type: 'warning',
              severity: 'medium',
              category: 'security',
              entityType: 'field',
              entityId: field.id,
              entityName: field.display_name,
              userTier,
              currentPermission: fieldPermission,
              message: `Sensitive field "${field.display_name}" is accessible to ${userTier} users`,
              recommendation: 'Consider restricting access to sensitive fields for lower privilege users',
              autoFixable: false
            });
          }
        });
      });
    });
  });

  // Check pending changes for additional validation
  pendingChanges.forEach(change => {
    const entity = findEntity(hierarchicalData, change.type, change.entityId);
    if (!entity) return;

    // Warn about removing master access
    if (change.userTier === 'master' && change.newPermission === 'none') {
      issues.push({
        id: `pending-master-removal-${change.entityId}`,
        type: 'warning',
        severity: 'high',
        category: 'business_rule',
        entityType: change.type,
        entityId: change.entityId,
        entityName: entity.display_name,
        userTier: change.userTier,
        currentPermission: change.newPermission,
        message: `Pending change will remove Master access from "${entity.display_name}"`,
        recommendation: 'Ensure this is intentional as it may impact system management',
        autoFixable: false
      });
    }
  });

  return issues;
}

function isPermissionViolation(childPermission: PermissionType, parentPermission: PermissionType): boolean {
  const permissionHierarchy = {
    'none': 0,
    'own_only': 1,
    'assigned_only': 2,
    'read_only': 3,
    'full': 4
  };

  return permissionHierarchy[childPermission] > permissionHierarchy[parentPermission];
}

function findEntity(hierarchicalData: any, type: 'page' | 'section' | 'field', entityId: string): any {
  switch (type) {
    case 'page':
      return hierarchicalData.pages?.find((p: any) => p.id === entityId);
    case 'section':
      return Object.values(hierarchicalData.sections || {}).flat().find((s: any) => s.id === entityId);
    case 'field':
      return Object.values(hierarchicalData.fields || {}).flat().find((f: any) => f.id === entityId);
    default:
      return null;
  }
}