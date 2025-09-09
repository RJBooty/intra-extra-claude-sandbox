import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Settings, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  History,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  UserRole, 
  Permission, 
  UserWithPermissions, 
  PermissionAuditLog,
  UserProjectAssignment 
} from '../../types/permissions';
import { 
  getAllPermissions, 
  getPermissionAuditLog, 
  assignUserToProject, 
  grantPermissionOverride 
} from '../../lib/supabase';
import { MasterGuard } from './PermissionGuard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface PermissionManagementProps {
  onClose: () => void;
}

export function PermissionManagement({ onClose }: PermissionManagementProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'audit'>('users');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [auditLog, setAuditLog] = useState<PermissionAuditLog[]>([]);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [permissionsData, auditData] = await Promise.all([
        getAllPermissions(),
        getPermissionAuditLog(50)
      ]);
      
      setPermissions(permissionsData);
      setAuditLog(auditData);
    } catch (error) {
      toast.error('Failed to load management data');
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(p => 
    p.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={() => setShowUserModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.projectAssignments?.length || 0} projects
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2 hours ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowPermissionModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Create Permission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPermissions.map((permission) => (
          <div key={permission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${permission.is_financial ? 'text-yellow-500' : 'text-blue-500'}`} />
                <span className="font-medium text-gray-900">
                  {permission.module}.{permission.section}
                </span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                permission.action === 'view' ? 'bg-green-100 text-green-800' :
                permission.action === 'edit' ? 'bg-blue-100 text-blue-800' :
                permission.action === 'create' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {permission.action}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {permission.is_financial && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Financial
                  </span>
                )}
                {permission.resource_type && (
                  <span className="text-xs text-gray-500">
                    {permission.resource_type}
                  </span>
                )}
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Permission Audit Log
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {auditLog.map((log) => (
            <div key={log.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    log.action_type === 'grant' ? 'bg-green-500' :
                    log.action_type === 'revoke' ? 'bg-red-500' :
                    log.action_type === 'override' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.action_type} permission for user@example.com
                    </p>
                    <p className="text-sm text-gray-500">
                      {log.reason || 'No reason provided'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">admin@example.com</p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'master': return 'bg-red-100 text-red-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'hr_finance': return 'bg-yellow-100 text-yellow-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'external': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <MasterGuard showReason={true}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Permission Management
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'users', label: 'Users', icon: Users },
                { key: 'permissions', label: 'Permissions', icon: Shield },
                { key: 'audit', label: 'Audit Log', icon: History },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'permissions' && renderPermissionsTab()}
            {activeTab === 'audit' && renderAuditTab()}
          </div>
        </div>
      </div>
    </MasterGuard>
  );
}