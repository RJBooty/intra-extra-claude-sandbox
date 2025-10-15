// src/utils/permissionHelpers.js

/**
 * Permission Helper Utilities
 * Centralized permission checking for IntraExtra platform
 * Based on the 5-tier permission system defined in the permissions matrix
 */

// Permission levels in order of access (lowest to highest)
export const PERMISSION_LEVELS = {
  EXTERNAL: 'External',
  MID: 'Mid',
  SENIOR: 'Senior',
  MASTER: 'Master',
  HR_FINANCE: 'HR_Finance'
};

// Hierarchical permission order (for comparison)
const PERMISSION_HIERARCHY = {
  'External': 0,
  'Mid': 1,
  'Senior': 2,
  'Master': 3,
  'HR_Finance': 2 // Same level as Senior but different permissions
};

/**
 * Check if user has a specific permission level
 */
export const hasPermissionLevel = (userRole, requiredLevel) => {
  return userRole === requiredLevel;
};

/**
 * Check if user has permission level or higher
 */
export const hasPermissionLevelOrHigher = (userRole, minimumLevel) => {
  const userLevel = PERMISSION_HIERARCHY[userRole] || 0;
  const minLevel = PERMISSION_HIERARCHY[minimumLevel] || 0;
  return userLevel >= minLevel;
};

/**
 * Check if user can view financial data
 * Financial data is visible to: Master, Senior, HR_Finance
 */
export const canViewFinancials = (userRole) => {
  return ['Master', 'Senior', 'HR_Finance'].includes(userRole);
};

/**
 * Check if user can edit financial data
 * Only Master can edit financial data
 */
export const canEditFinancials = (userRole) => {
  return userRole === 'Master';
};

/**
 * Check if user can view all projects
 * Master, Senior, HR_Finance can view all
 * Mid and External only see assigned projects
 */
export const canViewAllProjects = (userRole) => {
  return ['Master', 'Senior', 'HR_Finance'].includes(userRole);
};

/**
 * Check if user can edit layouts
 * All users can customize their own layouts
 */
export const canEditLayouts = (userRole) => {
  return true; // All users can customize layouts
};

/**
 * Check if user can manage team members
 * Only Master and Senior can manage team
 */
export const canManageTeam = (userRole) => {
  return ['Master', 'Senior'].includes(userRole);
};

/**
 * Check if user can access specific module
 */
export const canAccessModule = (userRole, moduleName) => {
  const modulePermissions = {
    'proposal-data': ['Master', 'Senior', 'Mid', 'External', 'HR_Finance'],
    'discovery-sales': ['Master', 'Senior', 'Mid'],
    'roi-analysis': ['Master', 'Senior', 'HR_Finance'],
    'operations-pipeline': ['Master', 'Senior', 'Mid', 'External'],
    'logistics': ['Master', 'Senior', 'Mid', 'External'],
    'crew-management': ['Master', 'Senior', 'Mid'],
    'guards-module': ['Master', 'Senior', 'Mid', 'External'],
    'client-relationship': ['Master', 'Senior', 'Mid']
  };
  
  return modulePermissions[moduleName]?.includes(userRole) || false;
};

/**
 * Get user permission description
 */
export const getPermissionDescription = (userRole) => {
  const descriptions = {
    'Master': 'Full unrestricted access to all features and data',
    'Senior': 'Broad access with financial visibility and team management',
    'Mid': 'Standard access with limited financial visibility',
    'External': 'Restricted access to assigned projects only',
    'HR_Finance': 'Read-all access for compliance and financial review'
  };
  
  return descriptions[userRole] || 'Unknown permission level';
};

/**
 * Get accessible features for user role
 */
export const getAccessibleFeatures = (userRole) => {
  const features = {
    'Master': [
      'View all projects',
      'Edit all data',
      'Manage team',
      'Access financials',
      'Edit financials',
      'System configuration',
      'User management'
    ],
    'Senior': [
      'View all projects',
      'Edit project data',
      'Manage team',
      'Access financials',
      'View reports',
      'Client management'
    ],
    'Mid': [
      'View assigned projects',
      'Edit project data',
      'Limited financial view',
      'Crew management',
      'Operations tracking'
    ],
    'External': [
      'View assigned projects only',
      'Limited data access',
      'Incident reporting',
      'Basic operations view'
    ],
    'HR_Finance': [
      'Read all data',
      'Financial analysis',
      'Compliance reporting',
      'No edit permissions',
      'Audit trail access'
    ]
  };
  
  return features[userRole] || [];
};

/**
 * Filter sections based on user permissions
 */
export const filterSectionsByPermission = (sections, userRole) => {
  return sections.filter(section => {
    // If section doesn't require special permission, show it
    if (!section.requiresPermission) {
      return true;
    }
    
    // If section requires financial permission
    if (section.permissionType === 'financial') {
      return canViewFinancials(userRole);
    }
    
    // If section has specific role requirements
    if (section.allowedRoles) {
      return section.allowedRoles.includes(userRole);
    }
    
    // Default: show if user has Senior or higher
    return hasPermissionLevelOrHigher(userRole, 'Senior');
  });
};

/**
 * Check if user can perform specific action on a section
 */
export const canPerformAction = (userRole, sectionId, action) => {
  // Define action permissions per section
  const actionPermissions = {
    'fees-overview': {
      'view': ['Master', 'Senior', 'HR_Finance'],
      'edit': ['Master', 'Senior']
    },
    'roi-analysis': {
      'view': ['Master', 'Senior', 'HR_Finance'],
      'edit': ['Master', 'Senior']
    },
    'crew-costs': {
      'view': ['Master', 'Senior', 'HR_Finance'],
      'edit': ['Master']
    },
    // Add more sections as needed
  };
  
  const sectionPerms = actionPermissions[sectionId];
  if (!sectionPerms || !sectionPerms[action]) {
    // If not explicitly defined, allow for all except External
    return userRole !== 'External';
  }
  
  return sectionPerms[action].includes(userRole);
};

/**
 * Get field visibility based on user role
 */
export const getFieldVisibility = (field, userRole) => {
  // If field has no restrictions, it's visible
  if (!field.visibleTo) {
    return true;
  }
  
  // Check if user role is in the visible list
  return field.visibleTo.includes(userRole);
};

/**
 * Get field editability based on user role
 */
export const getFieldEditability = (field, userRole) => {
  // If field is readonly, it's not editable
  if (field.readonly) {
    return false;
  }
  
  // If field has edit restrictions
  if (field.editableBy) {
    return field.editableBy.includes(userRole);
  }
  
  // Default: editable by all except External
  return userRole !== 'External';
};

/**
 * Mask sensitive data based on user role
 */
export const maskSensitiveData = (value, fieldType, userRole) => {
  // Master sees everything
  if (userRole === 'Master') {
    return value;
  }
  
  // Financial fields for non-financial users
  if (fieldType === 'financial' && !canViewFinancials(userRole)) {
    return '****';
  }
  
  // Partial masking for Mid users
  if (userRole === 'Mid' && fieldType === 'financial') {
    // Show only first and last digit
    const str = String(value);
    if (str.length > 2) {
      return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
    }
  }
  
  return value;
};

/**
 * Check if user can export data
 */
export const canExportData = (userRole, dataType) => {
  const exportPermissions = {
    'financial': ['Master', 'Senior', 'HR_Finance'],
    'crew': ['Master', 'Senior'],
    'operations': ['Master', 'Senior', 'Mid'],
    'client': ['Master', 'Senior']
  };
  
  return exportPermissions[dataType]?.includes(userRole) || false;
};

/**
 * Get user's default page based on role
 */
export const getDefaultPageForRole = (userRole) => {
  const defaultPages = {
    'Master': '/dashboard',
    'Senior': '/operations-pipeline',
    'Mid': '/operations-pipeline',
    'External': '/guards-module',
    'HR_Finance': '/roi-analysis'
  };
  
  return defaultPages[userRole] || '/dashboard';
};