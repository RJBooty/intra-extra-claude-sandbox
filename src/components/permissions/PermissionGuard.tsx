import React, { ReactNode } from 'react';
import { usePermissionCheck, useRoleAccess, useFinancialAccess } from '../../hooks/usePermissions';
import { UserRole, PermissionModule, PermissionAction } from '../../types/permissions';
import { AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';

interface BaseGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
  showReason?: boolean;
}

// Generic Permission Guard
interface PermissionGuardProps extends BaseGuardProps {
  module: PermissionModule;
  section: string;
  action: PermissionAction;
  projectId?: string;
}

export function PermissionGuard({ 
  module, 
  section, 
  action, 
  projectId, 
  children, 
  fallback,
  loading: loadingComponent,
  showReason = false 
}: PermissionGuardProps) {
  const { hasAccess, reason, loading } = usePermissionCheck(module, section, action, projectId);

  if (loading) {
    return loadingComponent || <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    
    if (showReason) {
      return (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          <Lock className="w-4 h-4" />
          <span>Access denied: {reason || 'Insufficient permissions'}</span>
        </div>
      );
    }
    
    return null;
  }

  return <>{children}</>;
}

// Role-based Guard
interface RoleGuardProps extends BaseGuardProps {
  minRole: UserRole;
}

export function RoleGuard({ 
  minRole, 
  children, 
  fallback,
  loading: loadingComponent,
  showReason = false 
}: RoleGuardProps) {
  const { hasAccess, userRole, loading } = useRoleAccess(minRole);

  if (loading) {
    return loadingComponent || <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    
    if (showReason) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>
            Access denied: Requires {minRole} role or higher. Your role: {userRole}
          </span>
        </div>
      );
    }
    
    return null;
  }

  return <>{children}</>;
}

// Financial Data Guard
interface FinancialGuardProps extends BaseGuardProps {
  hideCompletely?: boolean;
}

export function FinancialGuard({ 
  children, 
  fallback,
  loading: loadingComponent,
  showReason = false,
  hideCompletely = false 
}: FinancialGuardProps) {
  const { hasAccess, userRole, loading } = useFinancialAccess();

  if (loading) {
    return loadingComponent || <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }

  if (!hasAccess) {
    if (hideCompletely) return null;
    if (fallback) return <>{fallback}</>;
    
    if (showReason) {
      return (
        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm">
          <EyeOff className="w-4 h-4" />
          <span>Financial data hidden for {userRole} role</span>
        </div>
      );
    }
    
    // Default fallback for financial data
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-100 border border-gray-200 rounded-md">
        <Lock className="w-5 h-5 text-gray-400" />
        <div>
          <p className="font-medium text-gray-600">Financial Data</p>
          <p className="text-sm text-gray-500">Restricted content</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Master-only Guard (for admin functions)
export function MasterGuard({ children, fallback, showReason = false }: BaseGuardProps) {
  return (
    <RoleGuard 
      minRole="master" 
      fallback={fallback}
      showReason={showReason}
    >
      {children}
    </RoleGuard>
  );
}

// External user content filter
interface ExternalUserContentProps extends BaseGuardProps {
  projectId: string;
}

export function ExternalUserContent({ 
  projectId, 
  children, 
  fallback,
  showReason = false 
}: ExternalUserContentProps) {
  return (
    <PermissionGuard
      module="projects"
      section="basic_info"
      action="view"
      projectId={projectId}
      fallback={fallback}
      showReason={showReason}
    >
      {children}
    </PermissionGuard>
  );
}

// Conditional render based on permission
interface ConditionalRenderProps {
  condition: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ConditionalRender({ condition, children, fallback }: ConditionalRenderProps) {
  return condition ? <>{children}</> : <>{fallback || null}</>;
}