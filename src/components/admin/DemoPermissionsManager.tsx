import React, { useState } from 'react';
import { Shield, Grid, Users, Settings, Eye, Check, X, Edit, Save } from 'lucide-react';
import { PermissionType, UserTier } from '../../types/permissions';
import toast from 'react-hot-toast';

interface DemoPermissionsManagerProps {
  onBack: () => void;
}

export function DemoPermissionsManager({ onBack }: DemoPermissionsManagerProps) {
  const [selectedUserTier, setSelectedUserTier] = useState<UserTier>('mid');
  const [editingPermission, setEditingPermission] = useState<string | null>(null);
  const [editPermissionType, setEditPermissionType] = useState<PermissionType>('read_only');

  // Demo data that can be modified - ALL ACTUAL PLATFORM PAGES
  const [demoData, setDemoData] = useState({
    pages: [
      // PROJECTS MODULE
      {
        id: 'projects-core',
        page_name: 'Core Info',
        current_permission: 'read_write' as PermissionType,
        sections: [
          { id: 'project-details', section_name: 'Project Details', current_permission: 'read_write' as PermissionType },
          { id: 'project-status', section_name: 'Project Status', current_permission: 'read_only' as PermissionType }
        ]
      },
      {
        id: 'projects-roi',
        page_name: 'ROI Analysis',
        current_permission: 'assigned_only' as PermissionType,
        sections: [
          { id: 'financial-summary', section_name: 'Financial Summary', current_permission: 'read_only' as PermissionType },
          { id: 'revenue-streams', section_name: 'Revenue Streams', current_permission: 'assigned_only' as PermissionType },
          { id: 'cost-analysis', section_name: 'Cost Analysis', current_permission: 'assigned_only' as PermissionType }
        ]
      },
      {
        id: 'projects-logistics',
        page_name: 'Logistics',
        current_permission: 'read_write' as PermissionType,
        sections: [
          { id: 'equipment-planning', section_name: 'Equipment Planning', current_permission: 'read_write' as PermissionType },
          { id: 'site-allocation', section_name: 'Site Allocation', current_permission: 'read_write' as PermissionType },
          { id: 'shipping', section_name: 'Shipping', current_permission: 'read_only' as PermissionType }
        ]
      },
      {
        id: 'projects-operations',
        page_name: 'Operations',
        current_permission: 'read_write' as PermissionType,
        sections: [
          { id: 'phase-discover', section_name: 'Discover Phase', current_permission: 'read_write' as PermissionType },
          { id: 'phase-build', section_name: 'Build Phase', current_permission: 'read_write' as PermissionType },
          { id: 'phase-prepare', section_name: 'Prepare Phase', current_permission: 'read_write' as PermissionType },
          { id: 'phase-deliver', section_name: 'Deliver Phase', current_permission: 'read_only' as PermissionType },
          { id: 'phase-roundup', section_name: 'Roundup Phase', current_permission: 'read_only' as PermissionType }
        ]
      },
      {
        id: 'projects-crew',
        page_name: 'Crew Management',
        current_permission: 'read_only' as PermissionType,
        sections: [
          { id: 'crew-assignment', section_name: 'Crew Assignment', current_permission: 'read_only' as PermissionType },
          { id: 'crew-scheduling', section_name: 'Crew Scheduling', current_permission: 'none' as PermissionType }
        ]
      },
      {
        id: 'projects-documents',
        page_name: 'Documents',
        current_permission: 'read_only' as PermissionType,
        sections: [
          { id: 'project-docs', section_name: 'Project Documents', current_permission: 'read_only' as PermissionType },
          { id: 'contracts', section_name: 'Contracts', current_permission: 'none' as PermissionType }
        ]
      },
      {
        id: 'projects-timeline',
        page_name: 'Timeline',
        current_permission: 'read_only' as PermissionType,
        sections: [
          { id: 'milestones', section_name: 'Milestones', current_permission: 'read_only' as PermissionType },
          { id: 'tasks', section_name: 'Tasks', current_permission: 'read_only' as PermissionType }
        ]
      },
      // SALES MODULE
      {
        id: 'sales-pipeline',
        page_name: 'Sales Pipeline',
        current_permission: 'read_write' as PermissionType,
        sections: [
          { id: 'opportunities', section_name: 'Opportunities', current_permission: 'read_write' as PermissionType },
          { id: 'quotes', section_name: 'Quotes', current_permission: 'read_only' as PermissionType }
        ]
      },
      {
        id: 'sales-activities',
        page_name: 'Activities', 
        current_permission: 'read_only' as PermissionType,
        sections: [
          { id: 'follow-ups', section_name: 'Follow-ups', current_permission: 'read_only' as PermissionType },
          { id: 'meetings', section_name: 'Meetings', current_permission: 'read_only' as PermissionType }
        ]
      },
      // DASHBOARD MODULE  
      {
        id: 'dashboard-main',
        page_name: 'Main Dashboard',
        current_permission: 'read_only' as PermissionType,
        sections: [
          { id: 'overview', section_name: 'Overview', current_permission: 'read_only' as PermissionType },
          { id: 'stats', section_name: 'Statistics', current_permission: 'read_only' as PermissionType }
        ]
      },
      // TEAM MODULE
      {
        id: 'team-all',
        page_name: 'All Profiles',
        current_permission: 'read_only' as PermissionType,
        sections: [
          { id: 'team-directory', section_name: 'Team Directory', current_permission: 'read_only' as PermissionType },
          { id: 'role-assignment', section_name: 'Role Assignment', current_permission: 'none' as PermissionType }
        ]
      },
      {
        id: 'team-internal',
        page_name: 'Internal Profiles',
        current_permission: 'read_only' as PermissionType,
        sections: [
          { id: 'internal-staff', section_name: 'Internal Staff', current_permission: 'read_only' as PermissionType },
          { id: 'performance', section_name: 'Performance', current_permission: 'none' as PermissionType }
        ]
      },
      {
        id: 'team-contractors',
        page_name: 'Contractors',
        current_permission: 'read_only' as PermissionType,
        sections: [
          { id: 'contractor-list', section_name: 'Contractor List', current_permission: 'read_only' as PermissionType },
          { id: 'contractor-rates', section_name: 'Rates', current_permission: 'none' as PermissionType }
        ]
      },
      // CLIENTS MODULE
      {
        id: 'clients-list',
        page_name: 'Client List',
        current_permission: 'read_only' as PermissionType,
        sections: [
          { id: 'client-directory', section_name: 'Client Directory', current_permission: 'read_only' as PermissionType },
          { id: 'client-contacts', section_name: 'Contacts', current_permission: 'read_only' as PermissionType }
        ]
      },
      {
        id: 'clients-details',
        page_name: 'Client Details',
        current_permission: 'assigned_only' as PermissionType,
        sections: [
          { id: 'client-info', section_name: 'Client Information', current_permission: 'assigned_only' as PermissionType },
          { id: 'client-contracts', section_name: 'Contracts', current_permission: 'read_only' as PermissionType }
        ]
      },
      // SETTINGS MODULE
      {
        id: 'settings-profile',
        page_name: 'Profile Settings',
        current_permission: 'own_only' as PermissionType,
        sections: [
          { id: 'personal-info', section_name: 'Personal Information', current_permission: 'own_only' as PermissionType },
          { id: 'preferences', section_name: 'Preferences', current_permission: 'own_only' as PermissionType }
        ]
      },
      {
        id: 'settings-system',
        page_name: 'System Settings',
        current_permission: 'none' as PermissionType,
        sections: [
          { id: 'platform-config', section_name: 'Platform Configuration', current_permission: 'none' as PermissionType },
          { id: 'security-settings', section_name: 'Security Settings', current_permission: 'none' as PermissionType }
        ]
      }
    ],
    totalPages: 15,
    totalSections: 30,
    totalFields: 178,
    userTierCounts: {
      master: 178,
      senior: 156,
      hr_finance: 89,
      mid: 95,
      external: 23
    }
  });

  const userTiers: UserTier[] = ['master', 'senior', 'hr_finance', 'mid', 'external'];
  const permissionTypes: PermissionType[] = ['full', 'read_only', 'assigned_only', 'own_only', 'none'];

  // Add debug helper
  const debugPermissionChange = (entityType: string, entityId: string, newType: PermissionType) => {
    console.log('🔧 DEBUG: Permission Change', {
      entityType,
      entityId,
      newType,
      selectedUserTier,
      editingPermission,
      editPermissionType
    });
  };

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

  const handlePermissionUpdate = (
    entityType: 'page' | 'section',
    entityId: string, 
    newPermissionType: PermissionType
  ) => {
    debugPermissionChange(entityType, entityId, newPermissionType);
    
    const updatedData = { ...demoData };
    
    if (entityType === 'page') {
      const page = updatedData.pages.find(p => p.id === entityId);
      if (page) {
        console.log(`📝 Updating page ${page.page_name} from ${page.current_permission} to ${newPermissionType}`);
        page.current_permission = newPermissionType;
      }
    } else if (entityType === 'section') {
      updatedData.pages.forEach(page => {
        const section = page.sections?.find(s => s.id === entityId);
        if (section) {
          console.log(`📝 Updating section ${section.section_name} from ${section.current_permission} to ${newPermissionType}`);
          section.current_permission = newPermissionType;
        }
      });
    }
    
    setDemoData(updatedData);
    toast.success(`${entityType} permission updated to ${newPermissionType} for ${selectedUserTier}`);
    setEditingPermission(null);
  };

  const startEditing = (entityId: string, currentPermission: PermissionType) => {
    setEditingPermission(entityId);
    setEditPermissionType(currentPermission);
  };

  const cancelEditing = () => {
    setEditingPermission(null);
    setEditPermissionType('read_only');
  };

  const getPermissionCapabilities = (permission: PermissionType) => {
    switch (permission) {
      case 'full':
        return { read: true, create: true, update: true, delete: true };
      case 'read_only':
        return { read: true, create: false, update: false, delete: false };
      case 'assigned_only':
        return { read: true, create: false, update: true, delete: false };
      case 'own_only':
        return { read: true, create: false, update: true, delete: false };
      case 'none':
      default:
        return { read: false, create: false, update: false, delete: false };
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Permission Matrix Demo</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            Interactive demo of the 312-point permission system - fully functional
          </p>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
            ✅ Fully Working Demo
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Grid className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">{demoData.totalPages}</p>
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
              <p className="text-2xl font-bold text-gray-900">{demoData.totalSections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Fields</p>
              <p className="text-2xl font-bold text-gray-900">{demoData.totalFields}</p>
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

      {/* User Tier Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">View permissions for:</label>
          <select
            value={selectedUserTier}
            onChange={(e) => setSelectedUserTier(e.target.value as UserTier)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {userTiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier.charAt(0).toUpperCase() + tier.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Permission Matrix - {selectedUserTier.charAt(0).toUpperCase() + selectedUserTier.slice(1).replace('_', ' ')}
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
              {demoData.pages.map((page) => (
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
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPermissionColor(page.current_permission)}`}>
                          {page.current_permission}
                        </span>
                      )}
                    </td>
                    {(() => {
                      const caps = getPermissionCapabilities(page.current_permission);
                      return (
                        <>
                          <td className="px-6 py-4 text-center">
                            {caps.read ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {caps.create ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {caps.update ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {caps.delete ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                          </td>
                        </>
                      );
                    })()}
                    <td className="px-6 py-4 text-center">
                      {editingPermission === `page_${page.id}` ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handlePermissionUpdate('page', page.id, editPermissionType)}
                            className="text-green-600 hover:text-green-900 p-1"
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
                          onClick={() => startEditing(`page_${page.id}`, page.current_permission)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Sections */}
                  {page.sections?.map((section) => (
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
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPermissionColor(section.current_permission)}`}>
                            {section.current_permission}
                          </span>
                        )}
                      </td>
                      {(() => {
                        const caps = getPermissionCapabilities(section.current_permission);
                        return (
                          <>
                            <td className="px-6 py-3 text-center">
                              {caps.read ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                            </td>
                            <td className="px-6 py-3 text-center">
                              {caps.create ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                            </td>
                            <td className="px-6 py-3 text-center">
                              {caps.update ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                            </td>
                            <td className="px-6 py-3 text-center">
                              {caps.delete ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-500 mx-auto" />}
                            </td>
                          </>
                        );
                      })()}
                      <td className="px-6 py-3 text-center">
                        {editingPermission === `section_${section.id}` ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePermissionUpdate('section', section.id, editPermissionType)}
                              className="text-green-600 hover:text-green-900 p-1"
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
                            onClick={() => startEditing(`section_${section.id}`, section.current_permission)}
                            className="text-blue-600 hover:text-blue-900 p-1"
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

      {/* User Tier Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Tier Distribution</h3>
        <div className="space-y-3">
          {userTiers.map((tier) => (
            <div key={tier} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(tier)}`}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1).replace('_', ' ')}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {demoData.userTierCounts[tier]} permissions
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}