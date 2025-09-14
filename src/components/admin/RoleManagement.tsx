import React, { useState, useEffect } from 'react';
import { Shield, Users, Crown, Star, UserCheck, AlertTriangle, Trash2, Edit3, Save, X, Plus, Mail, User, Eye } from 'lucide-react';
import { userService } from '../../lib/services/userService';
import { UserWithRole, UserRole } from '../../types/user';
import { MockUserService } from '../../lib/userService.mock';
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
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState<UserWithRole | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role_type: 'External' as UserRole['role_type']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load from database first, fall back to mock data
      try {
        const [allUsers, profile] = await Promise.all([
          userService.getAllUserProfiles(),
          userService.getCurrentUserWithRole()
        ]);
        
        setUsers(allUsers);
        setCurrentUser(profile);
        console.log('RoleManagement - Current user loaded:', profile);
        console.log('RoleManagement - User role type:', profile?.role?.role_type);
      } catch (dbError) {
        console.warn('Database unavailable, using mock data:', dbError);
        
        // Use mock service as fallback
        const [allUsers, profile] = await Promise.all([
          MockUserService.getAllUsers(),
          MockUserService.getCurrentUserWithRole()
        ]);
        
        setUsers(allUsers);
        setCurrentUser(profile);
      }
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
      
      // Try database first, fall back to mock service
      try {
        await userService.assignRole(userId, newRole);
      } catch (dbError) {
        console.warn('Database unavailable, using mock service:', dbError);
        await MockUserService.updateUserRole(userId, newRole);
      }
      
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

  const handleViewUser = (user: UserWithRole) => {
    setSelectedUserForView(user);
    setShowUserProfileModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserProfileModal(false);
    setSelectedUserForView(null);
  };

  const handleCreateUser = async () => {
    try {
      if (!newUserData.email || !newUserData.first_name || !newUserData.last_name) {
        toast.error('Please fill in all required fields');
        return;
      }

      setLoading(true);
      
      // Try database first, fall back to mock service
      try {
        const newUser = await userService.createUser(newUserData);
        toast.success(`User ${newUser.display_name} created successfully`);
      } catch (dbError) {
        console.warn('Database unavailable, using mock service:', dbError);
        const newUser = await MockUserService.createUser(newUserData);
        toast.success(`User ${newUser.display_name} created successfully`);
      }
      
      await loadData();
      setShowCreateUserModal(false);
      setNewUserData({
        email: '',
        first_name: '',
        last_name: '',
        role_type: 'External'
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
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
            onClick={() => setShowCreateUserModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New User
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
                            title="Save Role Change"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(null);
                              setSelectedRole('External');
                            }}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(user.id);
                              setSelectedRole(user.role?.role_type || 'External');
                            }}
                            className="text-purple-600 hover:text-purple-900 p-1"
                            disabled={loading}
                            title="Edit Role"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="user@company.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      id="first_name"
                      value={newUserData.first_name}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    value={newUserData.last_name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Role
                </label>
                <select
                  id="role_type"
                  value={newUserData.role_type}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, role_type: e.target.value as UserRole['role_type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(roleDescriptions).map(([role, description]) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      selectedUserForView.role ? roleColors[selectedUserForView.role.role_type] : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {selectedUserForView.role && roleIcons[selectedUserForView.role.role_type] && 
                        React.createElement(roleIcons[selectedUserForView.role.role_type], { className: "w-3 h-3 mr-1" })
                      }
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