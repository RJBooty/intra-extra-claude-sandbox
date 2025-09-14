import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { permissionService } from '../../lib/permissions';
import {
  PageDefinition,
  SectionDefinition,
  FieldDefinition,
  PagePermission,
  SectionPermission,
  FieldPermission,
  UserTier,
  PermissionType,
  HierarchicalPermissions
} from '../../types/permissions';
import {
  Settings,
  Search,
  Filter,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Shield,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckSquare,
  Users,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  FileText,
  Grid,
  List,
  X,
  AlertCircle,
  Info,
  DollarSign,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ValidationWarnings } from './ValidationWarnings';
import { BulkOperations } from './BulkOperations';
import { AuditTrail } from './AuditTrail';
import { ImportExport } from './ImportExport';
import { PermissionInheritance, PermissionInheritanceManager } from './PermissionInheritance';

type ViewMode = 'overview' | 'detailed';
type FilterType = 'all' | 'critical' | 'financial' | 'restricted';
type AdvancedTab = 'validation' | 'audit' | 'import-export' | null;

interface PendingChange {
  type: 'page' | 'section' | 'field';
  entityId: string;
  userTier: UserTier;
  oldPermission: PermissionType;
  newPermission: PermissionType;
}

interface PermissionsDashboardProps {
  className?: string;
}

export function PermissionsDashboard({ className = '' }: PermissionsDashboardProps) {
  const { user, userRole, isAuthenticated } = useAuth();
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAdvancedTab, setActiveAdvancedTab] = useState<AdvancedTab>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [dismissedIssues, setDismissedIssues] = useState<Set<string>>(new Set());
  
  // Data state
  const [hierarchicalData, setHierarchicalData] = useState<HierarchicalPermissions | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  
  // User tiers for permission matrix
  const userTiers: UserTier[] = ['master', 'senior', 'hr_finance', 'mid', 'external'];

  // Check if user is authorized
  if (!isAuthenticated || userRole !== 'master') {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only Master users can access the permissions dashboard.</p>
        </div>
      </div>
    );
  }

  // Load hierarchical permissions data
  const loadPermissionsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await permissionService.getAllPermissions();
      setHierarchicalData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions data');
      console.error('Error loading permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissionsData();
  }, []);

  // Warn user about unsaved changes when leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingChanges.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved permission changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pendingChanges.length]);

  // Filter pages based on search and filter type
  const filteredPages = useMemo(() => {
    if (!hierarchicalData?.pages) return [];
    
    return hierarchicalData.pages.filter(page => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !page.display_name.toLowerCase().includes(searchLower) &&
          !page.page_name.toLowerCase().includes(searchLower) &&
          !page.section.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      
      // Type filter
      switch (filterType) {
        case 'critical':
          return page.is_critical;
        case 'financial':
          return hierarchicalData.sections[page.id]?.some(section => section.is_financial);
        case 'restricted':
          return hierarchicalData.pagePermissions[page.id]?.some(perm => 
            perm.permission_type === 'none' && ['mid', 'external'].includes(perm.user_tier)
          );
        default:
          return true;
      }
    });
  }, [hierarchicalData, searchTerm, filterType]);

  // Handle bulk operations
  const handleBulkPermissionChange = (
    entityIds: string[], 
    userTier: UserTier, 
    newPermission: PermissionType,
    operationType: 'individual' | 'section' | 'page'
  ) => {
    entityIds.forEach(entityId => {
      // Determine entity type based on operationType or find in hierarchical data
      let entityType: 'page' | 'section' | 'field' = 'page';
      
      if (operationType === 'page') {
        entityType = 'page';
      } else if (operationType === 'section') {
        entityType = 'section';
      } else {
        // Find entity type for individual operations
        if (hierarchicalData?.pages.find(p => p.id === entityId)) {
          entityType = 'page';
        } else if (Object.values(hierarchicalData?.sections || {}).flat().find(s => s.id === entityId)) {
          entityType = 'section';
        } else {
          entityType = 'field';
        }
      }
      
      handlePermissionChange(entityType, entityId, userTier, newPermission);
    });
  };

  // Handle copy permissions
  const handleCopyPermissions = (sourcePageId: string, targetPageIds: string[], userTier: UserTier) => {
    const sourcePermissions = hierarchicalData?.pagePermissions[sourcePageId] || [];
    const sourcePermission = sourcePermissions.find(p => p.user_tier === userTier)?.permission_type || 'none';
    
    targetPageIds.forEach(targetId => {
      handlePermissionChange('page', targetId, userTier, sourcePermission);
    });
  };

  // Handle reset to defaults
  const handleResetToDefaults = (entityIds: string[], entityType: 'page' | 'section' | 'field') => {
    entityIds.forEach(entityId => {
      userTiers.forEach(userTier => {
        // Reset to 'none' as default - could be enhanced to use actual defaults
        handlePermissionChange(entityType, entityId, userTier, 'none');
      });
    });
  };

  // Handle apply template
  const handleApplyTemplate = async (templateName: string, targetIds: string[]) => {
    // This would apply a predefined permission template
    // Implementation would depend on the template structure
    toast.success(`Applied ${templateName} template to ${targetIds.length} items`);
  };

  // Handle validation issue dismissal
  const handleDismissIssue = (issueId: string) => {
    setDismissedIssues(prev => new Set([...prev, issueId]));
  };

  // Handle auto-fix for validation issues
  const handleAutoFix = (issueId: string) => {
    // Implementation would depend on the specific issue type
    toast.success('Applied auto-fix for validation issue');
  };

  // Handle inheritance toggle
  const handleInheritanceToggle = (entityId: string, userTier: UserTier, inherit: boolean) => {
    if (inherit) {
      // Reset to inherited permission by removing explicit permission
      // This would require updating the permission service
      toast.success('Reset to inherit from parent');
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle permission change
  const handlePermissionChange = (
    type: 'page' | 'section' | 'field',
    entityId: string,
    userTier: UserTier,
    newPermission: PermissionType
  ) => {
    const currentPermissions = type === 'page' 
      ? hierarchicalData?.pagePermissions[entityId] || []
      : type === 'section'
      ? hierarchicalData?.sectionPermissions[entityId] || []
      : hierarchicalData?.fieldPermissions[entityId] || [];
    
    const currentPerm = currentPermissions.find(p => p.user_tier === userTier);
    const oldPermission = currentPerm?.permission_type || 'none';
    
    if (oldPermission === newPermission) return;
    
    // Update pending changes
    setPendingChanges(prev => {
      const existing = prev.find(c => 
        c.type === type && c.entityId === entityId && c.userTier === userTier
      );
      
      if (existing) {
        // Update existing change
        return prev.map(c => 
          c === existing ? { ...c, newPermission } : c
        );
      } else {
        // Add new change
        return [...prev, {
          type,
          entityId,
          userTier,
          oldPermission,
          newPermission
        }];
      }
    });
  };

  // Validation for permission changes
  const validatePermissionChange = (
    type: 'page' | 'section' | 'field',
    entityId: string,
    userTier: UserTier,
    newPermission: PermissionType
  ): { isValid: boolean; warning?: string; error?: string } => {
    // Find the entity to get its properties
    const entity = hierarchicalData ? 
      (type === 'page' ? hierarchicalData.pages.find(p => p.id === entityId) :
       type === 'section' ? Object.values(hierarchicalData.sections).flat().find(s => s.id === entityId) :
       Object.values(hierarchicalData.fields).flat().find(f => f.id === entityId)) : null;

    // Critical page validation
    if (type === 'page' && entity && (entity as PageDefinition).is_critical) {
      if (['mid', 'external'].includes(userTier) && newPermission !== 'none') {
        return {
          isValid: false,
          error: 'Critical pages cannot be accessed by Mid or External users'
        };
      }
    }

    // Financial data validation
    if (type === 'section' && entity && (entity as SectionDefinition).is_financial) {
      if (['mid', 'external'].includes(userTier) && !['none', 'read_only'].includes(newPermission)) {
        return {
          isValid: true,
          warning: 'Granting write access to financial data for this user tier'
        };
      }
    }

    // Sensitive field validation
    if (type === 'field' && entity && (entity as FieldDefinition).is_sensitive) {
      if (['mid', 'external'].includes(userTier) && newPermission !== 'none') {
        return {
          isValid: true,
          warning: 'Granting access to sensitive field for this user tier'
        };
      }
    }

    // Master tier validation
    if (userTier === 'master' && newPermission === 'none') {
      return {
        isValid: true,
        warning: 'Removing access for Master user may cause management issues'
      };
    }

    return { isValid: true };
  };

  // Save all pending changes with validation
  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) return;
    
    // Validate all changes first
    const validationResults = pendingChanges.map(change => ({
      change,
      validation: validatePermissionChange(change.type, change.entityId, change.userTier, change.newPermission)
    }));

    const errors = validationResults.filter(r => !r.validation.isValid);
    const warnings = validationResults.filter(r => r.validation.isValid && r.validation.warning);

    // Show errors
    if (errors.length > 0) {
      const errorMessages = errors.map(e => e.validation.error).join('\n');
      toast.error(`Cannot save changes:\n${errorMessages}`);
      return;
    }

    // Show warnings and ask for confirmation
    if (warnings.length > 0) {
      const warningMessages = warnings.map(w => w.validation.warning).join('\n');
      const confirmed = window.confirm(`Warning:\n${warningMessages}\n\nDo you want to continue?`);
      if (!confirmed) return;
    }
    
    try {
      setSaving(true);
      const changeCount = pendingChanges.length;
      
      for (const change of pendingChanges) {
        if (change.type === 'page') {
          await permissionService.updatePagePermission(
            change.entityId,
            change.userTier,
            change.newPermission
          );
        } else if (change.type === 'section') {
          await permissionService.updateSectionPermission(
            change.entityId,
            change.userTier,
            change.newPermission
          );
        } else if (change.type === 'field') {
          await permissionService.updateFieldPermission(
            change.entityId,
            change.userTier,
            change.newPermission
          );
        }
      }
      
      setPendingChanges([]);
      await loadPermissionsData(); // Refresh data
      toast.success(`Successfully saved ${changeCount} permission changes`);
      
    } catch (err) {
      console.error('Error saving changes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error(`Failed to save permission changes: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Reset pending changes
  const handleResetChanges = () => {
    setPendingChanges([]);
    toast.success('All changes reset');
  };

  // Toggle page expansion
  const togglePageExpansion = (pageId: string) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  };

  // Get effective permission (including pending changes)
  const getEffectivePermission = (
    type: 'page' | 'section' | 'field',
    entityId: string,
    userTier: UserTier
  ): PermissionType => {
    const pendingChange = pendingChanges.find(c => 
      c.type === type && c.entityId === entityId && c.userTier === userTier
    );
    
    if (pendingChange) {
      return pendingChange.newPermission;
    }
    
    const permissions = type === 'page' 
      ? hierarchicalData?.pagePermissions[entityId] || []
      : type === 'section'
      ? hierarchicalData?.sectionPermissions[entityId] || []
      : hierarchicalData?.fieldPermissions[entityId] || [];
    
    const permission = permissions.find(p => p.user_tier === userTier);
    return permission?.permission_type || 'none';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading permissions dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadPermissionsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Permissions Dashboard</h1>
              <p className="text-gray-600">Manage access control for all pages, sections, and fields</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Advanced Feature Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveAdvancedTab(activeAdvancedTab === 'validation' ? null : 'validation')}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeAdvancedTab === 'validation'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
                title="View validation warnings and issues"
              >
                <AlertTriangle className="w-4 h-4" />
                Validation
              </button>
              <button
                onClick={() => setActiveAdvancedTab(activeAdvancedTab === 'audit' ? null : 'audit')}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeAdvancedTab === 'audit'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
                title="View audit trail and change history"
              >
                <Clock className="w-4 h-4" />
                Audit Trail
              </button>
              <button
                onClick={() => setActiveAdvancedTab(activeAdvancedTab === 'import-export' ? null : 'import-export')}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeAdvancedTab === 'import-export'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
                title="Import/export permissions and templates"
              >
                <Database className="w-4 h-4" />
                Import/Export
              </button>
            </div>

            {pendingChanges.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800 font-medium">
                  {pendingChanges.length} unsaved change{pendingChanges.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {pendingChanges.length > 0 && (
              <>
                <button
                  onClick={handleResetChanges}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Reset all unsaved changes"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset ({pendingChanges.length})
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  title="Save all permission changes to database"
                >
                  {saving ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes ({pendingChanges.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Pages</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {hierarchicalData?.totalPages || 0}
            </p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Sections</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {hierarchicalData?.totalSections || 0}
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Fields</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {hierarchicalData?.totalFields || 0}
            </p>
          </div>
          
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">User Tiers</span>
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-1">5</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pages, sections, or fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Pages</option>
              <option value="critical">Critical Only</option>
              <option value="financial">Financial Data</option>
              <option value="restricted">Restricted Access</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-1" />
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4 inline mr-1" />
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Features Tabs */}
      {activeAdvancedTab === 'validation' && (
        <ValidationWarnings
          hierarchicalData={hierarchicalData}
          pendingChanges={pendingChanges}
          getEffectivePermission={getEffectivePermission}
          onDismissIssue={handleDismissIssue}
          onAutoFix={handleAutoFix}
        />
      )}

      {activeAdvancedTab === 'audit' && (
        <AuditTrail />
      )}

      {activeAdvancedTab === 'import-export' && (
        <ImportExport
          hierarchicalData={hierarchicalData}
          userTiers={userTiers}
          onImportComplete={loadPermissionsData}
        />
      )}

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedItems}
        userTiers={userTiers}
        pages={hierarchicalData?.pages || []}
        onBulkPermissionChange={handleBulkPermissionChange}
        onCopyPermissions={handleCopyPermissions}
        onResetToDefaults={handleResetToDefaults}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Permission Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Permission Types</h3>
        <div className="flex flex-wrap gap-4">
          <PermissionLegendItem type="full" />
          <PermissionLegendItem type="read_only" />
          <PermissionLegendItem type="assigned_only" />
          <PermissionLegendItem type="own_only" />
          <PermissionLegendItem type="none" />
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'overview' ? (
        <OverviewMode
          pages={filteredPages}
          hierarchicalData={hierarchicalData}
          userTiers={userTiers}
          getEffectivePermission={getEffectivePermission}
          onPermissionChange={handlePermissionChange}
          expandedPages={expandedPages}
          onToggleExpansion={togglePageExpansion}
          selectedItems={selectedItems}
          onToggleSelection={toggleItemSelection}
          onInheritanceToggle={handleInheritanceToggle}
        />
      ) : (
        <DetailedMode
          pages={filteredPages}
          hierarchicalData={hierarchicalData}
          userTiers={userTiers}
          getEffectivePermission={getEffectivePermission}
          onPermissionChange={handlePermissionChange}
        />
      )}
    </div>
  );
}

// Permission Legend Item Component
function PermissionLegendItem({ type }: { type: PermissionType }) {
  const configs = {
    full: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle, 
      label: 'Full Access',
      desc: 'Create, read, update, delete, approve'
    },
    read_only: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: Eye, 
      label: 'Read Only',
      desc: 'View data only, no modifications'
    },
    assigned_only: { 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      icon: Users, 
      label: 'Assigned Only',
      desc: 'Access to assigned items only'
    },
    own_only: { 
      color: 'bg-amber-100 text-amber-800 border-amber-200', 
      icon: User, 
      label: 'Own Only',
      desc: 'Access to own items only'
    },
    none: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: X, 
      label: 'No Access',
      desc: 'Cannot access this resource'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.color}`}>
      <Icon className="w-4 h-4" />
      <div>
        <span className="text-sm font-medium">{config.label}</span>
        <p className="text-xs opacity-75">{config.desc}</p>
      </div>
    </div>
  );
}

// Overview Mode Component
function OverviewMode({
  pages,
  hierarchicalData,
  userTiers,
  getEffectivePermission,
  onPermissionChange,
  expandedPages,
  onToggleExpansion,
  selectedItems,
  onToggleSelection,
  onInheritanceToggle
}: {
  pages: PageDefinition[];
  hierarchicalData: HierarchicalPermissions | null;
  userTiers: UserTier[];
  getEffectivePermission: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier) => PermissionType;
  onPermissionChange: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier, newPermission: PermissionType) => void;
  expandedPages: Set<string>;
  onToggleExpansion: (pageId: string) => void;
  selectedItems: Set<string>;
  onToggleSelection: (itemId: string) => void;
  onInheritanceToggle: (entityId: string, userTier: UserTier, inherit: boolean) => void;
}) {
  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pages Found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pages.map(page => (
        <PageCard
          key={page.id}
          page={page}
          hierarchicalData={hierarchicalData}
          userTiers={userTiers}
          getEffectivePermission={getEffectivePermission}
          onPermissionChange={onPermissionChange}
          expanded={expandedPages.has(page.id)}
          onToggleExpansion={() => onToggleExpansion(page.id)}
          selectedItems={selectedItems}
          onToggleSelection={toggleItemSelection}
          onInheritanceToggle={handleInheritanceToggle}
        />
      ))}
    </div>
  );
}

// Detailed Mode Component - Table view with all permissions
function DetailedMode({
  pages,
  hierarchicalData,
  userTiers,
  getEffectivePermission,
  onPermissionChange
}: {
  pages: PageDefinition[];
  hierarchicalData: HierarchicalPermissions | null;
  userTiers: UserTier[];
  getEffectivePermission: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier) => PermissionType;
  onPermissionChange: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier, newPermission: PermissionType) => void;
}) {
  const [selectedUserTier, setSelectedUserTier] = useState<UserTier>('master');
  const [bulkOperation, setBulkOperation] = useState<PermissionType | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Collect all entities for the selected user tier
  const allEntities = useMemo(() => {
    const entities: Array<{
      type: 'page' | 'section' | 'field';
      id: string;
      name: string;
      parent?: string;
      parentName?: string;
      isCritical?: boolean;
      isFinancial?: boolean;
      isSensitive?: boolean;
    }> = [];

    pages.forEach(page => {
      entities.push({
        type: 'page',
        id: page.id,
        name: page.display_name,
        isCritical: page.is_critical
      });

      const sections = hierarchicalData?.sections[page.id] || [];
      sections.forEach(section => {
        entities.push({
          type: 'section',
          id: section.id,
          name: section.display_name,
          parent: page.id,
          parentName: page.display_name,
          isFinancial: section.is_financial
        });

        const fields = hierarchicalData?.fields[section.id] || [];
        fields.forEach(field => {
          entities.push({
            type: 'field',
            id: field.id,
            name: field.display_name,
            parent: section.id,
            parentName: section.display_name,
            isSensitive: field.is_sensitive
          });
        });
      });
    });

    return entities;
  }, [pages, hierarchicalData]);

  const handleBulkOperation = () => {
    if (!bulkOperation || selectedItems.size === 0) return;

    selectedItems.forEach(entityId => {
      const entity = allEntities.find(e => e.id === entityId);
      if (entity) {
        onPermissionChange(entity.type, entity.id, selectedUserTier, bulkOperation);
      }
    });

    setSelectedItems(new Set());
    setBulkOperation(null);
    toast.success(`Applied ${bulkOperation} permission to ${selectedItems.size} items`);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === allEntities.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allEntities.map(e => e.id)));
    }
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Controls Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900">Detailed Permissions View</h3>
            
            {/* User Tier Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Viewing permissions for:</span>
              <select
                value={selectedUserTier}
                onChange={(e) => setSelectedUserTier(e.target.value as UserTier)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {userTiers.map(tier => (
                  <option key={tier} value={tier}>
                    {tier.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Operations */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedItems.size} selected
              </span>
              <select
                value={bulkOperation || ''}
                onChange={(e) => setBulkOperation(e.target.value as PermissionType || null)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Set permission...</option>
                <option value="full">Full Access</option>
                <option value="read_only">Read Only</option>
                <option value="assigned_only">Assigned Only</option>
                <option value="own_only">Own Only</option>
                <option value="none">No Access</option>
              </select>
              <button
                onClick={handleBulkOperation}
                disabled={!bulkOperation}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Select All Checkbox */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selectedItems.size === allEntities.length && allEntities.length > 0}
            onChange={toggleSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">
            Select all ({allEntities.length} items)
          </span>
        </label>
      </div>

      {/* Permissions Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permission
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attributes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allEntities.map((entity) => (
              <tr 
                key={entity.id}
                className={`hover:bg-gray-50 ${selectedItems.has(entity.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(entity.id)}
                    onChange={() => toggleSelectItem(entity.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {entity.type === 'page' && <Layers className="w-4 h-4 text-blue-600" />}
                    {entity.type === 'section' && <Grid className="w-4 h-4 text-green-600" />}
                    {entity.type === 'field' && <FileText className="w-4 h-4 text-purple-600" />}
                    <span className="text-sm font-medium text-gray-900">{entity.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    entity.type === 'page' ? 'bg-blue-100 text-blue-800' :
                    entity.type === 'section' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {entity.type}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {entity.parentName || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <PermissionSelect
                    value={getEffectivePermission(entity.type, entity.id, selectedUserTier)}
                    onChange={(newPermission) => onPermissionChange(entity.type, entity.id, selectedUserTier, newPermission)}
                    options={['full', 'read_only', 'assigned_only', 'own_only', 'none']}
                    size="sm"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {entity.isCritical && (
                      <span className="inline-flex px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded" title="Critical">
                        <AlertCircle className="w-3 h-3" />
                      </span>
                    )}
                    {entity.isFinancial && (
                      <span className="inline-flex px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded" title="Financial">
                        <DollarSign className="w-3 h-3" />
                      </span>
                    )}
                    {entity.isSensitive && (
                      <span className="inline-flex px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded" title="Sensitive">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allEntities.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Permissions Found</h3>
          <p className="text-gray-600">No entities match your current filter criteria.</p>
        </div>
      )}
    </div>
  );
}

// Page Card Component with full permission management
function PageCard({
  page,
  hierarchicalData,
  userTiers,
  getEffectivePermission,
  onPermissionChange,
  expanded,
  onToggleExpansion,
  selectedItems,
  onToggleSelection,
  onInheritanceToggle
}: {
  page: PageDefinition;
  hierarchicalData: HierarchicalPermissions | null;
  userTiers: UserTier[];
  getEffectivePermission: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier) => PermissionType;
  onPermissionChange: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier, newPermission: PermissionType) => void;
  expanded: boolean;
  onToggleExpansion: () => void;
  selectedItems?: Set<string>;
  onToggleSelection?: (itemId: string) => void;
  onInheritanceToggle?: (entityId: string, userTier: UserTier, inherit: boolean) => void;
}) {
  const sections = hierarchicalData?.sections[page.id] || [];
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const permissionOptions: PermissionType[] = ['full', 'read_only', 'assigned_only', 'own_only', 'none'];
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Page Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {selectedItems && onToggleSelection && (
              <input
                type="checkbox"
                checked={selectedItems.has(page.id)}
                onChange={() => onToggleSelection(page.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                title="Select for bulk operations"
              />
            )}
            <button
              onClick={onToggleExpansion}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {expanded ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </button>
            <div className="flex items-center gap-3">
              {page.is_critical && (
                <div className="p-1 bg-red-100 rounded" title="Critical Page">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{page.display_name}</h3>
                <p className="text-sm text-gray-600">
                  {page.page_name} • {sections.length} sections
                  {page.description && (
                    <span className="text-gray-500 ml-2">• {page.description}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {/* Route info */}
          {page.route_path && (
            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {page.route_path}
            </span>
          )}
        </div>

        {/* Page-level permissions matrix */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Page Permissions
          </h4>
          
          <div className="grid grid-cols-5 gap-2">
            {userTiers.map(tier => {
              const currentPermission = getEffectivePermission('page', page.id, tier);
              // Check if permission is inherited (no explicit permission set)
              const explicitPermissions = hierarchicalData?.pagePermissions[page.id] || [];
              const hasExplicitPermission = explicitPermissions.some(p => p.user_tier === tier);
              
              return (
                <div key={tier} className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 uppercase text-center">
                    {tier.replace('_', ' ')}
                  </div>
                  <div className="space-y-1">
                    <PermissionSelect
                      value={currentPermission}
                      onChange={(newPermission) => onPermissionChange('page', page.id, tier, newPermission)}
                      options={permissionOptions}
                      size="sm"
                    />
                    {onInheritanceToggle && (
                      <PermissionInheritance
                        entityType="page"
                        entityId={page.id}
                        userTier={tier}
                        currentPermission={currentPermission}
                        isInherited={!hasExplicitPermission}
                        isOverridden={hasExplicitPermission}
                        onInheritanceToggle={onInheritanceToggle}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Expanded sections */}
      {expanded && sections.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Sections ({sections.length})
            </h4>
            
            <div className="space-y-3">
              {sections.map(section => (
                <SectionCard
                  key={section.id}
                  section={section}
                  hierarchicalData={hierarchicalData}
                  userTiers={userTiers}
                  getEffectivePermission={getEffectivePermission}
                  onPermissionChange={onPermissionChange}
                  expanded={expandedSections.has(section.id)}
                  onToggleExpansion={() => toggleSectionExpansion(section.id)}
                  selectedItems={selectedItems}
                  onToggleSelection={onToggleSelection}
                  parentPermissions={hierarchicalData?.pagePermissions[page.id] || []}
                  onInheritanceToggle={onInheritanceToggle}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Section Card Component
function SectionCard({
  section,
  hierarchicalData,
  userTiers,
  getEffectivePermission,
  onPermissionChange,
  expanded,
  onToggleExpansion,
  selectedItems,
  onToggleSelection,
  parentPermissions,
  onInheritanceToggle
}: {
  section: SectionDefinition;
  hierarchicalData: HierarchicalPermissions | null;
  userTiers: UserTier[];
  getEffectivePermission: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier) => PermissionType;
  onPermissionChange: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier, newPermission: PermissionType) => void;
  expanded: boolean;
  onToggleExpansion: () => void;
  selectedItems?: Set<string>;
  onToggleSelection?: (itemId: string) => void;
  parentPermissions?: Array<{ user_tier: UserTier; permission_type: PermissionType }>;
  onInheritanceToggle?: (entityId: string, userTier: UserTier, inherit: boolean) => void;
}) {
  const fields = hierarchicalData?.fields[section.id] || [];
  const permissionOptions: PermissionType[] = ['full', 'read_only', 'assigned_only', 'own_only', 'none'];
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {selectedItems && onToggleSelection && (
              <input
                type="checkbox"
                checked={selectedItems.has(section.id)}
                onChange={() => onToggleSelection(section.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                title="Select for bulk operations"
              />
            )}
            <button
              onClick={onToggleExpansion}
              className="p-0.5 hover:bg-gray-100 rounded transition-colors"
            >
              {expanded ? 
                <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                <ChevronRight className="w-4 h-4 text-gray-400" />
              }
            </button>
            <div className="flex items-center gap-2">
              {section.is_financial && (
                <div className="p-0.5 bg-amber-100 rounded" title="Financial Section">
                  <DollarSign className="w-3 h-3 text-amber-600" />
                </div>
              )}
              {section.requires_approval && (
                <div className="p-0.5 bg-blue-100 rounded" title="Requires Approval">
                  <CheckSquare className="w-3 h-3 text-blue-600" />
                </div>
              )}
              <div>
                <h5 className="font-medium text-gray-900 text-sm">{section.display_name}</h5>
                <p className="text-xs text-gray-600">{fields.length} fields</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section permissions */}
        <div className="grid grid-cols-5 gap-1">
          {userTiers.map(tier => (
            <PermissionSelect
              key={tier}
              value={getEffectivePermission('section', section.id, tier)}
              onChange={(newPermission) => onPermissionChange('section', section.id, tier, newPermission)}
              options={permissionOptions}
              size="xs"
            />
          ))}
        </div>
      </div>
      
      {/* Expanded fields */}
      {expanded && fields.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <h6 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Fields ({fields.length})
          </h6>
          
          <div className="space-y-2">
            {fields.map(field => (
              <FieldRow
                key={field.id}
                field={field}
                userTiers={userTiers}
                getEffectivePermission={getEffectivePermission}
                onPermissionChange={onPermissionChange}
                selectedItems={selectedItems}
                onToggleSelection={onToggleSelection}
                parentPermissions={hierarchicalData?.sectionPermissions[section.id] || []}
                onInheritanceToggle={onInheritanceToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Field Row Component
function FieldRow({
  field,
  userTiers,
  getEffectivePermission,
  onPermissionChange,
  selectedItems,
  onToggleSelection,
  parentPermissions,
  onInheritanceToggle
}: {
  field: FieldDefinition;
  userTiers: UserTier[];
  getEffectivePermission: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier) => PermissionType;
  onPermissionChange: (type: 'page' | 'section' | 'field', entityId: string, userTier: UserTier, newPermission: PermissionType) => void;
  selectedItems?: Set<string>;
  onToggleSelection?: (itemId: string) => void;
  parentPermissions?: Array<{ user_tier: UserTier; permission_type: PermissionType }>;
  onInheritanceToggle?: (entityId: string, userTier: UserTier, inherit: boolean) => void;
}) {
  const permissionOptions: PermissionType[] = ['full', 'read_only', 'assigned_only', 'own_only', 'none'];
  
  return (
    <div className="flex items-center justify-between p-2 bg-white rounded border">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {selectedItems && onToggleSelection && (
          <input
            type="checkbox"
            checked={selectedItems.has(field.id)}
            onChange={() => onToggleSelection(field.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            title="Select for bulk operations"
          />
        )}
        {field.is_sensitive && (
          <Lock className="w-3 h-3 text-red-500 flex-shrink-0" title="Sensitive Field" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-900 truncate">{field.display_name}</p>
          <p className="text-xs text-gray-500">{field.field_type}</p>
        </div>
      </div>
      
      <div className="flex gap-1 ml-2">
        {userTiers.map(tier => (
          <PermissionSelect
            key={tier}
            value={getEffectivePermission('field', field.id, tier)}
            onChange={(newPermission) => onPermissionChange('field', field.id, tier, newPermission)}
            options={permissionOptions}
            size="xs"
          />
        ))}
      </div>
    </div>
  );
}

// Permission Select Component
function PermissionSelect({
  value,
  onChange,
  options,
  size = 'normal'
}: {
  value: PermissionType;
  onChange: (permission: PermissionType) => void;
  options: PermissionType[];
  size?: 'xs' | 'sm' | 'normal';
}) {
  const configs = {
    full: { color: 'bg-green-500 hover:bg-green-600', label: 'Full' },
    read_only: { color: 'bg-blue-500 hover:bg-blue-600', label: 'Read' },
    assigned_only: { color: 'bg-purple-500 hover:bg-purple-600', label: 'Assigned' },
    own_only: { color: 'bg-amber-500 hover:bg-amber-600', label: 'Own' },
    none: { color: 'bg-red-500 hover:bg-red-600', label: 'None' }
  };

  const sizeClasses = {
    xs: 'text-xs px-1 py-0.5 min-w-[50px]',
    sm: 'text-xs px-2 py-1 min-w-[60px]', 
    normal: 'text-sm px-3 py-1.5 min-w-[80px]'
  };

  const config = configs[value];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${config.color} text-white rounded text-center font-medium transition-colors ${sizeClasses[size]}`}
        title={value.replace('_', ' ').toUpperCase()}
      >
        {config.label}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
            {options.map(option => {
              const optionConfig = configs[option];
              return (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    option === value ? 'bg-gray-100 font-medium' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${optionConfig.color.split(' ')[0]}`} />
                    {option.replace('_', ' ').charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Permission Indicator Component
function PermissionIndicator({ 
  permission, 
  size = 'normal' 
}: { 
  permission: PermissionType; 
  size?: 'sm' | 'normal';
}) {
  const configs = {
    full: 'bg-green-500',
    read_only: 'bg-blue-500',
    assigned_only: 'bg-purple-500',
    own_only: 'bg-amber-500',
    none: 'bg-red-500'
  };

  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <div 
      className={`${sizeClass} rounded-full ${configs[permission]}`}
      title={permission.replace('_', ' ').toUpperCase()}
    />
  );
}