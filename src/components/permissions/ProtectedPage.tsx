import React, { ReactNode } from 'react';
import { usePageAccess, usePageAccessByName } from '../../hooks/usePermissions';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Lock, AlertCircle, Eye, ShieldX } from 'lucide-react';

interface ProtectedPageProps {
  pageId?: string;
  pageName?: string;
  children: ReactNode;
  requireEdit?: boolean;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  showReason?: boolean;
  showLoadingOverlay?: boolean;
  className?: string;
}

export function ProtectedPage({
  pageId,
  pageName,
  children,
  requireEdit = false,
  fallback,
  loadingComponent,
  showReason = true,
  showLoadingOverlay = false,
  className = ''
}: ProtectedPageProps) {
  // Use the appropriate hook based on props
  const pageAccessById = usePageAccess(pageId || null);
  const pageAccessByName = usePageAccessByName(pageName || null);
  
  // Select which access result to use
  const {
    permission,
    loading,
    error,
    canAccess,
    canEdit,
    canUpdate,
    isReadOnly,
    isNone,
    refresh
  } = pageId ? pageAccessById : pageAccessByName;

  // Handle loading state
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    if (showLoadingOverlay) {
      return (
        <div className="relative min-h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 text-sm">Checking page permissions...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="md" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="p-3 bg-red-50 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Permission Check Failed
            </h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has required access level
  const hasRequiredAccess = requireEdit ? (canEdit || canUpdate) : canAccess;

  if (!hasRequiredAccess) {
    // Use custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // No access at all
    if (isNone || !canAccess) {
      return (
        <div className="flex items-center justify-center min-h-64 p-8">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="p-4 bg-red-50 rounded-full">
              <ShieldX className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-4">
                You don't have permission to view this page.
              </p>
              {showReason && (
                <div className="p-3 bg-gray-50 rounded-md text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Current permission: <span className="font-mono text-xs bg-gray-200 px-1 rounded">{permission}</span>
                    </span>
                  </div>
                  {requireEdit && (
                    <p className="text-xs text-gray-500 mt-1">
                      This page requires edit permissions to access.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Has read access but requires edit
    if (requireEdit && isReadOnly) {
      return (
        <div className="flex items-center justify-center min-h-64 p-8">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="p-4 bg-yellow-50 rounded-full">
              <Lock className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Edit Access Required
              </h2>
              <p className="text-gray-600 mb-4">
                You have read-only access to this page, but edit permissions are required.
              </p>
              {showReason && (
                <div className="p-3 bg-gray-50 rounded-md text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Current permission: <span className="font-mono text-xs bg-gray-200 px-1 rounded">read_only</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // User has access - render children
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Convenience components for common use cases

interface ProtectedPageWrapperProps {
  pageId?: string;
  pageName?: string;
  children: ReactNode;
  className?: string;
}

export function ReadOnlyPageGuard({ pageId, pageName, children, className }: ProtectedPageWrapperProps) {
  return (
    <ProtectedPage
      pageId={pageId}
      pageName={pageName}
      requireEdit={false}
      className={className}
    >
      {children}
    </ProtectedPage>
  );
}

export function EditablePageGuard({ pageId, pageName, children, className }: ProtectedPageWrapperProps) {
  return (
    <ProtectedPage
      pageId={pageId}
      pageName={pageName}
      requireEdit={true}
      className={className}
    >
      {children}
    </ProtectedPage>
  );
}

// Quick access guard by page name
export function ROIPageGuard({ children, requireEdit = false }: { children: ReactNode; requireEdit?: boolean }) {
  return (
    <ProtectedPage
      pageName="projects-roi"
      requireEdit={requireEdit}
      showLoadingOverlay={true}
    >
      {children}
    </ProtectedPage>
  );
}

export function ProjectsPageGuard({ children, requireEdit = false }: { children: ReactNode; requireEdit?: boolean }) {
  return (
    <ProtectedPage
      pageName="projects-overview"
      requireEdit={requireEdit}
      showLoadingOverlay={true}
    >
      {children}
    </ProtectedPage>
  );
}

export function SalesPageGuard({ children, requireEdit = false }: { children: ReactNode; requireEdit?: boolean }) {
  return (
    <ProtectedPage
      pageName="sales-pipeline"
      requireEdit={requireEdit}
      showLoadingOverlay={true}
    >
      {children}
    </ProtectedPage>
  );
}