import React, { useState, useEffect } from 'react';
import { Shield, Users, Crown, Star, UserCheck, AlertTriangle, Trash2, Edit3, Save, X } from 'lucide-react';
import { userService, UserWithRole, UserRole } from '../../lib/userService';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface RoleManagementProps {
  onBack: () => void;
}

const roleColors = {
  'Master': 'bg-purple-100 text-purple-800 border-purple-200',
  'Senior': 'bg-blue-100 text-blue-800 border-blue-200',
  'Mid': 'bg-green-100 text-green-800 border-green-200',
  'External': 'bg-gray-100 text-gray-800 border-gray-200',
  'HR': 'bg-orange-100 text-orange-800 border-orange-200'
};

const roleIcons = {
  'Master': Crown,
  'Senior': Star,
  'Mid': UserCheck,
  'External': Users,
  'HR': Shield
};

const roleDescriptions = {
  'Master': 'Full system access including user management and system configuration',
  'Senior': 'Advanced access to most features with project management capabilities',
  'Mid': 'Standard access to core features and assigned projects',
  'External': 'Limited access to specific projects and basic features',
  'HR': 'Access to HR-specific features and user information'
};

export function RoleManagement({ onBack }: RoleManagementProps) {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole['role_type']>('External');
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allUsers, profile] = await Promise.all([
        userService.getAllUsers(),
        userService.getCurrentUserProfile()
      ]);
      
      setUsers(allUsers);
      setCurrentUser(profile);
    } catch (error) {
      console.error('Failed to load role management data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole['role_type']) => {
    try {
      setLoading(true);
      await userService.assignRole(userId, newRole);
      toast.success(`Role updated successfully to ${newRole}`);
      await loadData(); // Reload data
      setEditingUserId(null);
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupMasterUser = async () => {
    try {
      setLoading(true);
      const success = await userService.setupMasterUser();
      if (success) {
        toast.success('Master user setup completed');
        await loadData();
      } else {
        toast.error('Failed to setup master user');
      }
    } catch (error) {
      console.error('Failed to setup master user:', error);
      toast.error('Failed to setup master user');
    } finally {
      setLoading(false);
    }
  };

  // Check if current user has permission to manage roles
  const canManageRoles = currentUser?.role?.role_type === 'Master';

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading user roles...</p>
        </div>
      </div>
    );
  }

  if (!canManageRoles) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            You need Master-level permissions to manage user roles.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
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
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          </div>
          <button
            onClick={handleSetupMasterUser}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Setup Master User
          </button>
        </div>
        <p className="text-gray-600">
          Manage user roles and permissions across the IntraExtra platform
        </p>
      </div>

      {/* Role Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(roleDescriptions).map(([role, description]) => {
            const Icon = roleIcons[role as UserRole['role_type']];
            return (
              <div key={role} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${roleColors[role as UserRole['role_type']]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{role}</h4>
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({users.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const Icon = user.role ? roleIcons[user.role.role_type] : Users;
                const isEditing = editingUserId === user.id;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-full bg-cover bg-center mr-4"
                          style={{
                            backgroundImage: user.avatar_url
                              ? `url("${user.avatar_url}")`
                              : `url("https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop")`
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.department || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.job_title || 'No title'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as UserRole['role_type'])}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          {Object.keys(roleDescriptions).map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user.role ? roleColors[user.role.role_type] : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {user.role?.role_type || 'No Role'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRoleChange(user.id, selectedRole)}
                            className="text-green-600 hover:text-green-900 p-1"
                            disabled={loading}
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(null);
                              setSelectedRole('External');
                            }}
                            className="text-gray-600 hover:text-gray-900 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(user.id);
                            setSelectedRole(user.role?.role_type || 'External');
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          disabled={loading}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            Users will appear here once they register for the platform.
          </p>
        </div>
      )}
    </div>
  );
}