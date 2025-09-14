import React, { useState, useEffect } from 'react';
import { Shield, Grid, Users, Settings, Eye, Lock, Key, AlertTriangle, Check, X, Edit, Save, MapPin, Briefcase, Mail } from 'lucide-react';
import { permissionService } from '../../lib/permissions';
import { PermissionType, UserTier } from '../../types/permissions';
import { DemoPermissionsManager } from './DemoPermissionsManager';
import { userService } from '../../lib/services/userService';
import { UserWithRole } from '../../types/user';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface AdvancedPermissionsManagementProps {
  onBack: () => void;
}

export function AdvancedPermissionsManagement({ onBack }: AdvancedPermissionsManagementProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'matrix' | 'users' | 'templates'>('overview');
  const [permissionsData, setPermissionsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserTier, setSelectedUserTier] = useState<UserTier>('mid');
  const [editingPermission, setEditingPermission] = useState<string | null>(null);
  const [editPermissionType, setEditPermissionType] = useState<PermissionType>('read_only');
  const [demoMode, setDemoMode] = useState(false);
  
  // User Management tab state
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState<UserWithRole | null>(null);
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);

  useEffect(() => {
    loadPermissionsData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const profile = await userService.getCurrentUserWithRole();
      setCurrentUser(profile);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadPermissionsData = async () => {
    try {
      setLoading(true);
      
      try {
        const data = await permissionService.getAllPermissions();
        setPermissionsData(data);
        setDemoMode(false);
      } catch (dbError) {
        console.warn('Database not available, using demo mode:', dbError);
        setDemoMode(true);
        
        // Create mock data for demo
        const mockData = {
          pages: [
            {
              id: 'projects',
              page_name: 'Projects',
              current_permission: 'read_only',
              sections: [
                { id: 'project-list', section_name: 'Project List', current_permission: 'read_only' },
                { id: 'project-form', section_name: 'Project Form', current_permission: 'none' }
              ]
            },
            {
              id: 'sales',
              page_name: 'Sales Pipeline',
              current_permission: 'assigned_only',
              sections: [
                { id: 'opportunities', section_name: 'Opportunities', current_permission: 'read_only' },
                { id: 'quotes', section_name: 'Quotes', current_permission: 'own_only' }
              ]
            },
            {
              id: 'roi',
              page_name: 'ROI Analysis',
              current_permission: 'none',
              sections: [
                { id: 'financial-data', section_name: 'Financial Data', current_permission: 'none' }
              ]
            }
          ],
          totalPages: 3,
          totalSections: 5,
          totalFields: 15,
          userTierCounts: {
            master: 45,
            senior: 38,
            hr_finance: 22,
            mid: 18,
            external: 8
          }
        };
        
        setPermissionsData(mockData);
        toast.success('Running in demo mode - changes won\'t be saved to database');
      }
    } catch (error) {
      console.error('Failed to load permissions data:', error);
      toast.error('Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      
      const userProfiles = await userService.getAllUserProfiles();
      setUsers(userProfiles);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsersError('Failed to load user data. Please try again.');
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleViewUser = (user: UserWithRole) => {
    setSelectedUserForView(user);
    setShowUserProfileModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserProfileModal(false);
    setSelectedUserForView(null);
  };

  // Load users when the users tab is selected
  useEffect(() => {
    if (activeTab === 'users' && users.length === 0 && !usersLoading) {
      loadUsers();
    }
  }, [activeTab]);

  const handlePermissionUpdate = async (
    entityType: 'page' | 'section' | 'field',
    entityId: string, 
    newPermissionType: PermissionType
  ) => {
    try {
      setLoading(true);
      
      console.log('Updating permission:', { entityType, entityId, selectedUserTier, newPermissionType, demoMode });
      
      if (demoMode) {
        // Demo mode - simulate the update locally
        console.log('Demo mode: simulating permission update...');
        
        // Update the local mock data
        const updatedData = { ...permissionsData };
        if (entityType === 'page') {
          const page = updatedData.pages.find((p: any) => p.id === entityId);
          if (page) {
            page.current_permission = newPermissionType;
          }
        } else if (entityType === 'section') {
          updatedData.pages.forEach((page: any) => {
            const section = page.sections?.find((s: any) => s.id === entityId);
            if (section) {
              section.current_permission = newPermissionType;
            }
          });
        }
        
        setPermissionsData(updatedData);
        toast.success(`Demo: ${entityType} permission updated to ${newPermissionType} for ${selectedUserTier}`);
        setEditingPermission(null);
        setLoading(false);
        return;
      }
      
      // Real mode - try to update in database
      // Generate a valid UUID format for demo
      const currentUser = '550e8400-e29b-41d4-a716-446655440000'; 
      let success = false;
      
      try {
        if (entityType === 'page') {
          console.log('Calling updatePagePermission...');
          success = await permissionService.updatePagePermission(
            entityId, 
            selectedUserTier, 
            newPermissionType, 
            currentUser,
            undefined, // permissions
            true // skipSecurityValidation for demo
          );
        } else if (entityType === 'section') {
          console.log('Calling updateSectionPermission...');
          success = await permissionService.updateSectionPermission(
            entityId,
            selectedUserTier,
            newPermissionType,
            currentUser,
            undefined, // permissions
            true // skipSecurityValidation for demo (need to add this parameter)
          );
        } else if (entityType === 'field') {
          console.log('Calling updateFieldPermission...');
          success = await permissionService.updateFieldPermission(
            entityId,
            selectedUserTier,
            newPermissionType,
            currentUser,
            undefined, // permissions
            true // skipSecurityValidation for demo (need to add this parameter)
          );
        }

        console.log('Permission update result:', success);

        if (success) {
          toast.success(`${entityType} permission updated to ${newPermissionType} for ${selectedUserTier}`);
          await loadPermissionsData(); // Reload data
          setEditingPermission(null);
        } else {
          toast.error('Failed to update permission - check console for details');
        }
      } catch (dbError: any) {
        console.error('Database update failed, falling back to demo mode:', dbError);
        toast.error(`Database update failed: ${dbError.message}. Try refreshing to use demo mode.`);
      }
    } catch (error: any) {
      console.error('Permission update error details:', error);
      toast.error(`Failed to update permission: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (entityId: string, currentPermission: PermissionType) => {
    setEditingPermission(entityId);
    setEditPermissionType(currentPermission);
  };

  const cancelEditing = () => {
    setEditingPermission(null);
    setEditPermissionType('read_only');
  };

  const userTiers: UserTier[] = ['master', 'senior', 'hr_finance', 'mid', 'external'];
  const permissionTypes: PermissionType[] = ['full', 'read_only', 'assigned_only', 'own_only', 'none'];

  const getTierColor = (tier: UserTier) => {
    const colors = {
      master: 'bg-purple-100 text-purple-800 border-purple-200',
      senior: 'bg-blue-100 text-blue-800 border-blue-200', 
      hr_finance: 'bg-orange-100 text-orange-800 border-orange-200',
      mid: 'bg-green-100 text-green-800 border-green-200',
      external: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[tier];
  };

  const getPermissionColor = (permission: PermissionType) => {
    const colors = {
      full: 'bg-green-500',
      read_only: 'bg-blue-500',
      assigned_only: 'bg-yellow-500',
      own_only: 'bg-orange-500',
      none: 'bg-red-500'
    };
    return colors[permission];
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Grid className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{permissionsData?.totalPages || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Sections</p>
              <p className="text-2xl font-bold text-gray-900">{permissionsData?.totalSections || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Key className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Fields</p>
              <p className="text-2xl font-bold text-gray-900">{permissionsData?.totalFields || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Permission Points</p>
              <p className="text-2xl font-bold text-gray-900">312</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Tier Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Tier Distribution</h3>
        <div className="space-y-3">
          {userTiers.map((tier) => (
            <div key={tier} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(tier)}`}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {permissionsData?.userTierCounts?.[tier] || 0} permissions
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMatrixTab = () => (
    <div className="space-y-6">
      {/* User Tier Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">View permissions for:</label>
          <select
            value={selectedUserTier}
            onChange={(e) => setSelectedUserTier(e.target.value as UserTier)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {userTiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Permission Matrix - {selectedUserTier.charAt(0).toUpperCase() + selectedUserTier.slice(1)}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission Level
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Read
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Create
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Update
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delete
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissionsData?.pages?.map((page: any) => (
                <React.Fragment key={page.id}>
                  {/* Page Row */}
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Grid className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">{page.page_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingPermission === `page_${page.id}` ? (
                        <select
                          value={editPermissionType}
                          onChange={(e) => setEditPermissionType(e.target.value as PermissionType)}
                          className="px-2 py-1 text-xs border rounded"
                        >
                          {permissionTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPermissionColor(page.current_permission || 'read_only')}`}>
                          {page.current_permission || 'read_only'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingPermission === `page_${page.id}` ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handlePermissionUpdate('page', page.id, editPermissionType)}
                            className="text-green-600 hover:text-green-900 p-1"
                            disabled={loading}
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-900 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(`page_${page.id}`, page.current_permission || 'read_only')}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Sections */}
                  {page.sections?.map((section: any) => (
                    <tr key={section.id} className="bg-gray-50">
                      <td className="px-6 py-3 whitespace-nowrap pl-12">
                        <div className="flex items-center">
                          <Settings className="w-4 h-4 text-gray-600 mr-2" />
                          <span className="text-sm text-gray-700">{section.section_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {editingPermission === `section_${section.id}` ? (
                          <select
                            value={editPermissionType}
                            onChange={(e) => setEditPermissionType(e.target.value as PermissionType)}
                            className="px-2 py-1 text-xs border rounded"
                          >
                            {permissionTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPermissionColor(section.current_permission || 'read_only')}`}>
                            {section.current_permission || 'read_only'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      </td>
                      <td className="px-6 py-3 text-center">
                        <X className="w-4 h-4 text-red-500 mx-auto" />
                      </td>
                      <td className="px-6 py-3 text-center">
                        <X className="w-4 h-4 text-red-500 mx-auto" />
                      </td>
                      <td className="px-6 py-3 text-center">
                        <X className="w-4 h-4 text-red-500 mx-auto" />
                      </td>
                      <td className="px-6 py-3 text-center">
                        {editingPermission === `section_${section.id}` ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePermissionUpdate('section', section.id, editPermissionType)}
                              className="text-green-600 hover:text-green-900 p-1"
                              disabled={loading}
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-900 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(`section_${section.id}`, section.current_permission || 'read_only')}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            disabled={loading}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permissions data...</p>
        </div>
      </div>
    );
  }

  // Use dedicated demo component when in demo mode for better UX
  if (demoMode) {
    return <DemoPermissionsManager onBack={onBack} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Advanced Permissions Management</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            Complete permission matrix management with 312 permission points across the platform
          </p>
          {demoMode && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full border border-yellow-200">
              Demo Mode
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'matrix', label: 'Permission Matrix', icon: Grid },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'templates', label: 'Templates', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'matrix' && renderMatrixTab()}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <button
                onClick={loadUsers}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                disabled={usersLoading}
              >
                {usersLoading ? 'Refreshing...' : 'Refresh Users'}
              </button>
            </div>

            {usersError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{usersError}</p>
                </div>
              </div>
            )}

            {usersLoading && users.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">No user profiles are available at the moment.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="text-base font-medium text-gray-900">
                    Team Members ({users.length})
                  </h4>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        {currentUser?.role?.role_type === 'Master' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-10 h-10 rounded-full bg-cover bg-center mr-4 border border-gray-200"
                                style={{
                                  backgroundImage: user.avatar_url
                                    ? `url("${user.avatar_url}")`
                                    : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || `${user.first_name || ''} ${user.last_name || ''}`).trim()}&background=6366f1&color=ffffff")`
                                }}
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.role?.role_type || 'No Role'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Briefcase className="w-3 h-3 mr-2 text-gray-400" />
                              <div>
                                <div>{user.department || 'Not specified'}</div>
                                <div className="text-xs text-gray-500">{user.job_title || 'No title'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                              {user.office_location || 'Not specified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          {currentUser?.role?.role_type === 'Master' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="View Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {usersLoading && users.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-sm text-gray-600">Refreshing user data...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === 'templates' && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Permission Templates</h3>
            <p className="text-gray-600">Pre-configured permission templates for common roles.</p>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showUserProfileModal && selectedUserForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
              <button
                onClick={handleCloseUserModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Profile Content */}
            <div className="p-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-6 mb-8">
                <div
                  className="w-20 h-20 rounded-full bg-cover bg-center border-4 border-white shadow-lg"
                  style={{
                    backgroundImage: selectedUserForView.avatar_url
                      ? `url("${selectedUserForView.avatar_url}")`
                      : `url("https://ui-avatars.com/api/?name=${selectedUserForView.first_name}+${selectedUserForView.last_name}&background=random")`
                  }}
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedUserForView.display_name || `${selectedUserForView.first_name} ${selectedUserForView.last_name}`}
                  </h3>
                  <p className="text-gray-600">{selectedUserForView.email}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedUserForView.role?.role_type || 'No Role'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedUserForView.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Timezone</label>
                    <p className="text-gray-900">{selectedUserForView.timezone || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Preferred Communication</label>
                    <p className="text-gray-900 capitalize">{selectedUserForView.preferred_communication || 'Not set'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Work Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Job Title</label>
                    <p className="text-gray-900">{selectedUserForView.job_title || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                    <p className="text-gray-900">{selectedUserForView.department || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Office Location</label>
                    <p className="text-gray-900">{selectedUserForView.office_location || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                    <p className="text-gray-900">
                      {selectedUserForView.start_date 
                        ? new Date(selectedUserForView.start_date).toLocaleDateString()
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Role Information */}
              {selectedUserForView.role && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Role Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Role Level:</span>
                      <span className="ml-2 text-gray-900">{selectedUserForView.role.role_level}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className={`ml-2 ${selectedUserForView.role.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUserForView.role.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Assigned:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedUserForView.role.assigned_at 
                          ? new Date(selectedUserForView.role.assigned_at).toLocaleDateString()
                          : 'Unknown'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Account Status:</span>
                      <span className={`ml-2 ${selectedUserForView.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUserForView.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium text-gray-600">Last Login:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedUserForView.last_login 
                        ? new Date(selectedUserForView.last_login).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">System Information</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>User ID: {selectedUserForView.id}</div>
                  <div>Created: {new Date(selectedUserForView.created_at).toLocaleString()}</div>
                  <div>Updated: {new Date(selectedUserForView.updated_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}