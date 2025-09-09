import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePageAccessByName, useFieldAccess } from '../../hooks/usePermissions';
import { permissionService } from '../../lib/permissions';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Shield, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckSquare,
  RefreshCw,
  Database
} from 'lucide-react';

interface PermissionTestResult {
  pageName: string;
  displayName: string;
  permission: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  loading: boolean;
  error: string | null;
}

interface FieldTestResult {
  fieldId: string;
  displayName: string;
  permission: string;
  canRead: boolean;
  canUpdate: boolean;
  loading: boolean;
}

export function PermissionsTestPage() {
  const { user, userRole, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [hierarchicalData, setHierarchicalData] = useState<any>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);

  // Test pages
  const testPages = [
    { pageName: 'projects-roi', displayName: 'ROI Calculator', critical: true },
    { pageName: 'sales-pipeline', displayName: 'Sales Pipeline', critical: false },
    { pageName: 'projects-overview', displayName: 'Projects Overview', critical: false },
    { pageName: 'logistics-equipment', displayName: 'Equipment Management', critical: false }
  ];

  // Test fields
  const testFields = [
    { fieldId: 'total_revenue', displayName: 'Total Revenue' },
    { fieldId: 'total_costs_actual', displayName: 'Total Costs (Actual)' },
    { fieldId: 'total_costs_estimate', displayName: 'Total Costs (Estimate)' },
    { fieldId: 'profit_actual', displayName: 'Profit (Actual)' },
    { fieldId: 'client_name', displayName: 'Client Name' },
    { fieldId: 'deal_value', displayName: 'Deal Value' }
  ];

  // Load hierarchical permissions data
  const loadHierarchicalData = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoadingHierarchy(true);
    try {
      const data = await permissionService.getAllPermissions();
      setHierarchicalData(data);
    } catch (error) {
      console.error('Error loading hierarchical data:', error);
    } finally {
      setLoadingHierarchy(false);
    }
  };

  useEffect(() => {
    loadHierarchicalData();
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-600">Please log in to test permissions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Permissions System Test</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshUser}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={loadHierarchicalData}
              className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
            >
              <Database className="w-4 h-4" />
              Reload Data
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Current User</p>
              <p className="text-blue-900">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-purple-800 font-medium">Role Level</p>
              <p className="text-purple-900 font-mono uppercase">{userRole || 'Unknown'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-green-800 font-medium">Auth Status</p>
              <p className="text-green-900">Authenticated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Permissions Tests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Page-Level Permissions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {testPages.map((page) => (
            <PagePermissionTest
              key={page.pageName}
              pageName={page.pageName}
              displayName={page.displayName}
              critical={page.critical}
            />
          ))}
        </div>
      </div>

      {/* Field Permissions Tests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Field-Level Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testFields.map((field) => (
            <FieldPermissionTest
              key={field.fieldId}
              fieldId={field.fieldId}
              displayName={field.displayName}
            />
          ))}
        </div>
      </div>

      {/* Hierarchical Data Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
        {loadingHierarchy ? (
          <div className="flex items-center justify-center p-8">
            <Clock className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Loading system data...</span>
          </div>
        ) : hierarchicalData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{hierarchicalData.totalPages}</div>
              <div className="text-sm text-blue-700">Total Pages</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{hierarchicalData.totalSections}</div>
              <div className="text-sm text-green-700">Total Sections</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{hierarchicalData.totalFields}</div>
              <div className="text-sm text-purple-700">Total Fields</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-900">
                {hierarchicalData.userTierCounts[userRole] || 0}
              </div>
              <div className="text-sm text-amber-700">Your Permissions</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-8">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Unable to load system data</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component to test individual page permissions
function PagePermissionTest({ pageName, displayName, critical }: { pageName: string; displayName: string; critical: boolean }) {
  const {
    permission,
    loading,
    error,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canApprove,
    isNone,
    isReadOnly,
    isFull
  } = usePageAccessByName(pageName);

  const getPermissionColor = () => {
    if (isFull) return 'text-green-600 bg-green-50 border-green-200';
    if (isReadOnly) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (isNone) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPermissionIcon = () => {
    if (loading) return <Clock className="w-4 h-4 animate-spin" />;
    if (error) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (canRead) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className={`border rounded-lg p-4 ${getPermissionColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getPermissionIcon()}
          <h3 className="font-semibold">
            {displayName}
            {critical && <span className="ml-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">CRITICAL</span>}
          </h3>
        </div>
        <span className="text-xs font-mono bg-white px-2 py-1 rounded">
          {loading ? 'loading...' : permission}
        </span>
      </div>
      
      {error && (
        <div className="text-sm text-red-600 mb-2">
          Error: {error}
        </div>
      )}
      
      <div className="flex flex-wrap gap-1">
        <PermissionBadge icon={Eye} label="Read" granted={canRead} />
        <PermissionBadge icon={Plus} label="Create" granted={canCreate} />
        <PermissionBadge icon={Edit} label="Update" granted={canUpdate} />
        <PermissionBadge icon={Trash2} label="Delete" granted={canDelete} />
        <PermissionBadge icon={CheckSquare} label="Approve" granted={canApprove} />
      </div>
    </div>
  );
}

// Component to test individual field permissions
function FieldPermissionTest({ fieldId, displayName }: { fieldId: string; displayName: string }) {
  const {
    permission,
    loading,
    error,
    canRead,
    canUpdate,
    isNone,
    isReadOnly
  } = useFieldAccess(fieldId);

  const getPermissionColor = () => {
    if (canUpdate) return 'text-green-600 bg-green-50 border-green-200';
    if (isReadOnly) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (isNone) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPermissionIcon = () => {
    if (loading) return <Clock className="w-4 h-4 animate-spin" />;
    if (error) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (canRead) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className={`border rounded-lg p-3 ${getPermissionColor()}`}>
      <div className="flex items-center gap-2 mb-2">
        {getPermissionIcon()}
        <h4 className="font-medium text-sm">{displayName}</h4>
      </div>
      
      <div className="text-xs font-mono bg-white px-2 py-1 rounded mb-2">
        {loading ? 'loading...' : permission}
      </div>
      
      {error && (
        <div className="text-xs text-red-600 mb-2">
          Error: {error}
        </div>
      )}
      
      <div className="flex gap-1">
        <PermissionBadge icon={Eye} label="Read" granted={canRead} size="sm" />
        <PermissionBadge icon={Edit} label="Edit" granted={canUpdate} size="sm" />
      </div>
    </div>
  );
}

// Small permission indicator badge
function PermissionBadge({ 
  icon: Icon, 
  label, 
  granted, 
  size = 'normal' 
}: { 
  icon: any; 
  label: string; 
  granted: boolean; 
  size?: 'sm' | 'normal' 
}) {
  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-xs' 
    : 'px-2 py-1 text-xs';
    
  return (
    <span
      className={`inline-flex items-center gap-1 rounded ${sizeClasses} ${
        granted
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3 h-3'} />
      {label}
    </span>
  );
}