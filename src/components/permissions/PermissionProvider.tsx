import React, { createContext, ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionContext } from '../../types/permissions';

const PermissionContextData = createContext<PermissionContext | null>(null);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const permissionData = usePermissions();

  return (
    <PermissionContextData.Provider value={permissionData}>
      {children}
    </PermissionContextData.Provider>
  );
}

export const usePermissionContext = (): PermissionContext => {
  const context = React.useContext(PermissionContextData);
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
};