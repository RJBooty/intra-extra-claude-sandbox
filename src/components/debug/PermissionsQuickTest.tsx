import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePageAccessByName } from '../../hooks/usePermissions';
import { CheckCircle, XCircle, Clock, AlertTriangle, User, Shield } from 'lucide-react';

/**
 * Quick Permissions Test Component
 * 
 * This component provides a simple test to verify that the permissions system
 * is working correctly. It shows:
 * 1. Current user and role
 * 2. Permission test for "projects-roi" page
 * 3. Any errors or issues
 * 
 * Use this component to quickly verify foundation pieces are working.
 */
export function PermissionsQuickTest() {
  const { user, userRole, isAuthenticated, loading: authLoading } = useAuth();
  const {
    permission,
    loading: permissionLoading,
    error: permissionError,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canApprove,
    isNone,
    isReadOnly,
    isFull
  } = usePageAccessByName('projects-roi');

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-red-200">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Authentication Required</span>
        </div>
        <p className="text-gray-600 mt-2">Please log in to test permissions.</p>
      </div>
    );
  }

  const getPermissionStatusIcon = () => {
    if (permissionLoading) return <Clock className="w-5 h-5 animate-spin text-blue-600" />;
    if (permissionError) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (canRead) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getPermissionStatusColor = () => {
    if (isFull) return 'border-green-200 bg-green-50';
    if (isReadOnly) return 'border-blue-200 bg-blue-50';
    if (isNone) return 'border-red-200 bg-red-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getExpectedResult = (userRole: string) => {
    switch (userRole) {
      case 'master':
      case 'senior':
        return '✅ Should have FULL access';
      case 'hr_finance':
        return '✅ Should have READ-ONLY access';
      case 'mid':
      case 'external':
        return '❌ Should have NO access';
      default:
        return '❓ Unknown role';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">🧪 Permissions Quick Test</h1>
        
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Current User</p>
              <p className="text-blue-900 text-sm">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-purple-800 font-medium">Role Level</p>
              <p className="text-purple-900 font-mono uppercase text-sm">
                {userRole || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Permission Test */}
        <div className={`border rounded-lg p-4 ${getPermissionStatusColor()}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {getPermissionStatusIcon()}
              <h3 className="font-semibold">ROI Calculator Access Test</h3>
            </div>
            <span className="text-xs font-mono bg-white px-2 py-1 rounded border">
              {permissionLoading ? 'loading...' : permission}
            </span>
          </div>

          {permissionError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
              <p className="text-red-800 font-medium">❌ Permission Check Failed</p>
              <p className="text-red-600 mt-1">{permissionError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Actual Result:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className={canRead ? 'text-green-600' : 'text-red-600'}>
                    {canRead ? '✅' : '❌'} Read: {canRead ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={canCreate ? 'text-green-600' : 'text-red-600'}>
                    {canCreate ? '✅' : '❌'} Create: {canCreate ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={canUpdate ? 'text-green-600' : 'text-red-600'}>
                    {canUpdate ? '✅' : '❌'} Update: {canUpdate ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={canDelete ? 'text-green-600' : 'text-red-600'}>
                    {canDelete ? '✅' : '❌'} Delete: {canDelete ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={canApprove ? 'text-green-600' : 'text-red-600'}>
                    {canApprove ? '✅' : '❌'} Approve: {canApprove ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Expected for {userRole}:</p>
              <div className="text-sm text-gray-600">
                {getExpectedResult(userRole || '')}
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <p className="text-sm font-medium text-gray-700">Test Status:</p>
          <div className="mt-1 text-sm">
            {permissionLoading ? (
              <span className="text-blue-600">🔄 Testing permissions...</span>
            ) : permissionError ? (
              <span className="text-red-600">❌ Permission system has errors</span>
            ) : (
              <span className="text-green-600">✅ Permission system is responding</span>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 mb-2">🔧 Next Steps:</h3>
        <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
          <li>Verify the permission result matches the expected result for your role</li>
          <li>Test with different user roles using UserSwitcher if available</li>
          <li>Check browser console for any errors</li>
          <li>Run the database verification script in Supabase</li>
          <li>Test the ROI component protection by accessing /projects/roi</li>
        </ol>
      </div>
    </div>
  );
}