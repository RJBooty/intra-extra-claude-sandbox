import React from 'react';
import { 
  ArrowDown, 
  Lock, 
  Eye, 
  AlertCircle, 
  Info,
  Layers,
  Grid,
  FileText
} from 'lucide-react';
import { PermissionType, UserTier } from '../../types/permissions';

interface PermissionInheritanceProps {
  entityType: 'page' | 'section' | 'field';
  entityId: string;
  userTier: UserTier;
  currentPermission: PermissionType;
  parentPermission?: PermissionType;
  parentEntityType?: 'page' | 'section';
  parentEntityName?: string;
  isInherited: boolean;
  isOverridden: boolean;
  onInheritanceToggle: (entityId: string, userTier: UserTier, inherit: boolean) => void;
}

export function PermissionInheritance({
  entityType,
  entityId,
  userTier,
  currentPermission,
  parentPermission,
  parentEntityType,
  parentEntityName,
  isInherited,
  isOverridden,
  onInheritanceToggle
}: PermissionInheritanceProps) {
  const getEntityIcon = (type: 'page' | 'section' | 'field') => {
    switch (type) {
      case 'page': return Layers;
      case 'section': return Grid;
      case 'field': return FileText;
    }
  };

  const getPermissionColor = (permission: PermissionType) => {
    switch (permission) {
      case 'full': return 'text-green-600';
      case 'read_only': return 'text-blue-600';
      case 'assigned_only': return 'text-purple-600';
      case 'own_only': return 'text-amber-600';
      case 'none': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPermissionLabel = (permission: PermissionType) => {
    switch (permission) {
      case 'full': return 'Full Access';
      case 'read_only': return 'Read Only';
      case 'assigned_only': return 'Assigned Only';
      case 'own_only': return 'Own Only';
      case 'none': return 'No Access';
      default: return permission;
    }
  };

  const isInheritanceViolation = () => {
    if (!parentPermission) return false;
    
    // Check for inheritance violations
    if (parentPermission === 'none' && currentPermission !== 'none') {
      return true;
    }
    if (parentPermission === 'read_only' && currentPermission === 'full') {
      return true;
    }
    return false;
  };

  const getInheritanceMessage = () => {
    if (!parentPermission || !parentEntityType) return null;

    const ParentIcon = getEntityIcon(parentEntityType);
    
    if (isInherited) {
      return (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <ArrowDown className="w-4 h-4 text-blue-600" />
          <ParentIcon className="w-4 h-4 text-blue-600" />
          <span className="text-blue-800">
            Inheriting <strong>{getPermissionLabel(parentPermission)}</strong> from {parentEntityName}
          </span>
        </div>
      );
    }

    if (isOverridden) {
      const violatesInheritance = isInheritanceViolation();
      return (
        <div className={`flex items-center gap-2 p-2 rounded text-sm ${
          violatesInheritance 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-amber-50 border border-amber-200'
        }`}>
          {violatesInheritance ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
          ) : (
            <Info className="w-4 h-4 text-amber-600" />
          )}
          <ParentIcon className="w-4 h-4 text-gray-600" />
          <span className={violatesInheritance ? 'text-red-800' : 'text-amber-800'}>
            Override: <strong>{getPermissionLabel(currentPermission)}</strong>
            {violatesInheritance && (
              <span className="ml-1">(violates {parentEntityType} permission: {getPermissionLabel(parentPermission)})</span>
            )}
          </span>
          <button
            onClick={() => onInheritanceToggle(entityId, userTier, true)}
            className="ml-auto px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Reset to Inherit
          </button>
        </div>
      );
    }

    return null;
  };

  const getInheritanceIndicator = () => {
    if (isInherited) {
      return (
        <div className="flex items-center gap-1" title="Inherited permission">
          <ArrowDown className="w-3 h-3 text-blue-600" />
          <span className="text-xs text-blue-600">Inherited</span>
        </div>
      );
    }

    if (isOverridden) {
      const violatesInheritance = isInheritanceViolation();
      return (
        <div className="flex items-center gap-1" title={violatesInheritance ? "Violates inheritance" : "Override"}>
          {violatesInheritance ? (
            <AlertCircle className="w-3 h-3 text-red-600" />
          ) : (
            <Lock className="w-3 h-3 text-amber-600" />
          )}
          <span className={`text-xs ${violatesInheritance ? 'text-red-600' : 'text-amber-600'}`}>
            {violatesInheritance ? 'Violation' : 'Override'}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1" title="Explicit permission">
        <Eye className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-500">Explicit</span>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {getInheritanceMessage()}
      <div className="flex items-center justify-between">
        <div className={`font-medium ${getPermissionColor(currentPermission)}`}>
          {getPermissionLabel(currentPermission)}
        </div>
        {getInheritanceIndicator()}
      </div>
    </div>
  );
}

// Permission inheritance utilities
export class PermissionInheritanceManager {
  /**
   * Calculate the effective permission considering inheritance
   */
  static getEffectivePermission(
    entityPermission: PermissionType | null,
    parentPermission: PermissionType | null,
    allowOverride: boolean = true
  ): { 
    effective: PermissionType; 
    isInherited: boolean; 
    isOverridden: boolean;
    isValid: boolean;
  } {
    // If no explicit permission set, inherit from parent
    if (!entityPermission && parentPermission) {
      return {
        effective: parentPermission,
        isInherited: true,
        isOverridden: false,
        isValid: true
      };
    }

    // If explicit permission is set
    if (entityPermission) {
      const isOverridden = parentPermission !== null && entityPermission !== parentPermission;
      const isValid = this.validateInheritance(entityPermission, parentPermission);
      
      return {
        effective: entityPermission,
        isInherited: false,
        isOverridden,
        isValid: allowOverride || isValid
      };
    }

    // Default to 'none' if no permission found
    return {
      effective: 'none',
      isInherited: false,
      isOverridden: false,
      isValid: true
    };
  }

  /**
   * Validate that a permission doesn't violate inheritance rules
   */
  static validateInheritance(
    childPermission: PermissionType,
    parentPermission: PermissionType | null
  ): boolean {
    if (!parentPermission) return true;

    // If parent has no access, child cannot have access
    if (parentPermission === 'none' && childPermission !== 'none') {
      return false;
    }

    // If parent is read-only, child cannot have full access
    if (parentPermission === 'read_only' && childPermission === 'full') {
      return false;
    }

    // If parent is assigned/own only, child cannot have broader access
    if (parentPermission === 'assigned_only' && ['full', 'read_only'].includes(childPermission)) {
      return false;
    }

    if (parentPermission === 'own_only' && ['full', 'read_only', 'assigned_only'].includes(childPermission)) {
      return false;
    }

    return true;
  }

  /**
   * Get all permissions that would be valid for inheritance
   */
  static getValidChildPermissions(parentPermission: PermissionType | null): PermissionType[] {
    if (!parentPermission) {
      return ['full', 'read_only', 'assigned_only', 'own_only', 'none'];
    }

    switch (parentPermission) {
      case 'full':
        return ['full', 'read_only', 'assigned_only', 'own_only', 'none'];
      case 'read_only':
        return ['read_only', 'assigned_only', 'own_only', 'none'];
      case 'assigned_only':
        return ['assigned_only', 'own_only', 'none'];
      case 'own_only':
        return ['own_only', 'none'];
      case 'none':
        return ['none'];
      default:
        return ['none'];
    }
  }

  /**
   * Auto-cascade permissions when a parent permission changes
   */
  static cascadePermissionChange(
    parentPermission: PermissionType,
    currentChildPermissions: Array<{ id: string; permission: PermissionType }>
  ): Array<{ id: string; newPermission: PermissionType; reason: string }> {
    const changes: Array<{ id: string; newPermission: PermissionType; reason: string }> = [];

    currentChildPermissions.forEach(child => {
      if (!this.validateInheritance(child.permission, parentPermission)) {
        // Find the most permissive valid permission
        const validPermissions = this.getValidChildPermissions(parentPermission);
        const newPermission = validPermissions[0] || 'none';
        
        changes.push({
          id: child.id,
          newPermission,
          reason: `Cascaded from parent: ${parentPermission} → ${newPermission}`
        });
      }
    });

    return changes;
  }
}