import React from 'react';
import { ROI3 } from './ROI3';
import { FinancialGuard, RoleGuard, PermissionGuard } from '../permissions/PermissionGuard';
import { usePermissionContext } from '../permissions/PermissionProvider';
import { Project } from '../../types';
import { Lock, Eye, AlertTriangle } from 'lucide-react';

interface ProtectedROIProps {
  project: Project;
}

export function ProtectedROI({ project }: ProtectedROIProps) {
  const { user, canViewFinancialData } = usePermissionContext();

  // For external users, hide ROI completely
  if (user?.role === 'external') {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">
            ROI and financial data is not available for external users.
          </p>
        </div>
      </div>
    );
  }

  // For mid-level users, hide financial data
  if (user?.role === 'mid') {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-900">Limited Access</h3>
              <p className="text-sm text-yellow-700">
                Financial calculations and sensitive data are hidden for your role level.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ROI Dashboard</h3>
            <p className="text-gray-500 mb-4">
              View-only access to basic project information
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-400">•••</div>
                <div className="text-sm text-gray-600 mt-2">Revenue Data</div>
                <div className="text-xs text-gray-400">Access Restricted</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-400">•••</div>
                <div className="text-sm text-gray-600 mt-2">Cost Analysis</div>
                <div className="text-xs text-gray-400">Access Restricted</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-400">•••</div>
                <div className="text-sm text-gray-600 mt-2">Profit Margins</div>
                <div className="text-xs text-gray-400">Access Restricted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For HR Finance, Senior, and Master users - show full ROI
  return (
    <FinancialGuard
      fallback={
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Data Access Required</h3>
            <p className="text-gray-500">
              Your current role does not have permission to view ROI calculations and financial data.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Role indicator for transparency */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-800">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">
              Viewing as: {user?.role} • Full financial access granted
            </span>
          </div>
        </div>

        {/* Edit permissions guard */}
        <PermissionGuard
          module="roi"
          section="financial_data"
          action="edit"
          fallback={
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">
                  View-only mode: You can see financial data but cannot make edits
                </span>
              </div>
            </div>
          }
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <Lock className="w-4 h-4" />
              <span className="text-sm">
                Edit mode available: You can modify ROI calculations
              </span>
            </div>
          </div>
        </PermissionGuard>

        {/* Main ROI Component */}
        <ROI3 project={project} />
      </div>
    </FinancialGuard>
  );
}

// HOC to wrap any component with ROI protection
export function withROIProtection<T extends { project: Project }>(
  WrappedComponent: React.ComponentType<T>
) {
  return function ProtectedComponent(props: T) {
    return (
      <PermissionGuard
        module="roi"
        section="financial_data"
        action="view"
        projectId={props.project.id}
        fallback={
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
              <p className="text-gray-500">
                You do not have permission to view ROI data for this project.
              </p>
            </div>
          </div>
        }
      >
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}