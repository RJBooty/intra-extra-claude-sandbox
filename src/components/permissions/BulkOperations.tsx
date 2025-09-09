import React, { useState } from 'react';
import { 
  Copy, 
  RotateCcw, 
  Wand2, 
  ChevronDown, 
  Check,
  AlertTriangle,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { PermissionType, UserTier, PageDefinition } from '../../types/permissions';
import toast from 'react-hot-toast';

interface BulkOperationsProps {
  selectedItems: Set<string>;
  userTiers: UserTier[];
  pages: PageDefinition[];
  onBulkPermissionChange: (
    entityIds: string[], 
    userTier: UserTier, 
    newPermission: PermissionType,
    operationType: 'individual' | 'section' | 'page'
  ) => void;
  onCopyPermissions: (sourcePageId: string, targetPageIds: string[], userTier: UserTier) => void;
  onResetToDefaults: (entityIds: string[], entityType: 'page' | 'section' | 'field') => void;
  onApplyTemplate: (templateName: string, targetIds: string[]) => void;
}

export function BulkOperations({
  selectedItems,
  userTiers,
  pages,
  onBulkPermissionChange,
  onCopyPermissions,
  onResetToDefaults,
  onApplyTemplate
}: BulkOperationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [bulkUserTier, setBulkUserTier] = useState<UserTier>('master');
  const [bulkPermission, setBulkPermission] = useState<PermissionType>('full');
  const [sourcePageId, setSourcePageId] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');

  const permissionTemplates = [
    { name: 'financial_restricted', label: 'Financial Restricted', description: 'Strict financial data protection' },
    { name: 'project_standard', label: 'Standard Project', description: 'Standard project permissions' },
    { name: 'sales_team', label: 'Sales Team', description: 'Sales team access pattern' },
    { name: 'external_limited', label: 'External Limited', description: 'Limited external user access' },
    { name: 'hr_compliance', label: 'HR Compliance', description: 'HR and compliance access' }
  ];

  const handleBulkApply = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to apply permissions to');
      return;
    }

    const itemIds = Array.from(selectedItems);
    onBulkPermissionChange(itemIds, bulkUserTier, bulkPermission, 'individual');
    toast.success(`Applied ${bulkPermission} permission to ${itemIds.length} items for ${bulkUserTier} users`);
    setActiveOperation(null);
  };

  const handleCopyPermissions = () => {
    if (!sourcePageId || selectedItems.size === 0) {
      toast.error('Please select a source page and target items');
      return;
    }

    const targetIds = Array.from(selectedItems);
    onCopyPermissions(sourcePageId, targetIds, bulkUserTier);
    toast.success(`Copied permissions from source page to ${targetIds.length} items`);
    setActiveOperation(null);
  };

  const handleResetToDefaults = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to reset');
      return;
    }

    const itemIds = Array.from(selectedItems);
    onResetToDefaults(itemIds, 'page'); // Assuming page level for now
    toast.success(`Reset ${itemIds.length} items to default permissions`);
    setActiveOperation(null);
  };

  const handleApplyTemplate = () => {
    if (!templateName || selectedItems.size === 0) {
      toast.error('Please select a template and target items');
      return;
    }

    const itemIds = Array.from(selectedItems);
    onApplyTemplate(templateName, itemIds);
    toast.success(`Applied ${templateName} template to ${itemIds.length} items`);
    setActiveOperation(null);
  };

  if (selectedItems.size === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            Bulk Operations ({selectedItems.size} selected)
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 text-blue-700 hover:bg-blue-100 rounded transition-colors"
        >
          <span className="text-sm">Options</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveOperation('bulk-apply')}
              className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Wand2 className="w-4 h-4 text-green-600" />
              Bulk Apply
            </button>
            <button
              onClick={() => setActiveOperation('copy-permissions')}
              className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Copy className="w-4 h-4 text-blue-600" />
              Copy From
            </button>
            <button
              onClick={() => setActiveOperation('reset-defaults')}
              className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              Reset Defaults
            </button>
            <button
              onClick={() => setActiveOperation('apply-template')}
              className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Settings className="w-4 h-4 text-purple-600" />
              Apply Template
            </button>
          </div>

          {/* Bulk Apply Form */}
          {activeOperation === 'bulk-apply' && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Apply Permission to Selected Items</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Tier</label>
                  <select
                    value={bulkUserTier}
                    onChange={(e) => setBulkUserTier(e.target.value as UserTier)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {userTiers.map(tier => (
                      <option key={tier} value={tier}>
                        {tier.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
                  <select
                    value={bulkPermission}
                    onChange={(e) => setBulkPermission(e.target.value as PermissionType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="full">Full Access</option>
                    <option value="read_only">Read Only</option>
                    <option value="assigned_only">Assigned Only</option>
                    <option value="own_only">Own Only</option>
                    <option value="none">No Access</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleBulkApply}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Copy Permissions Form */}
          {activeOperation === 'copy-permissions' && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Copy Permissions From Another Page</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Page</label>
                  <select
                    value={sourcePageId}
                    onChange={(e) => setSourcePageId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select source page...</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.id}>
                        {page.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">For User Tier</label>
                  <select
                    value={bulkUserTier}
                    onChange={(e) => setBulkUserTier(e.target.value as UserTier)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {userTiers.map(tier => (
                      <option key={tier} value={tier}>
                        {tier.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCopyPermissions}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4 inline mr-2" />
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset to Defaults Form */}
          {activeOperation === 'reset-defaults' && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Reset to Default Permissions</h4>
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div className="text-sm text-amber-800">
                  This will reset selected items to their default permission configuration. This action cannot be undone.
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleResetToDefaults}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* Apply Template Form */}
          {activeOperation === 'apply-template' && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Apply Permission Template</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                  <div className="space-y-2">
                    {permissionTemplates.map(template => (
                      <label
                        key={template.name}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.name}
                          checked={templateName === template.name}
                          onChange={(e) => setTemplateName(e.target.value)}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{template.label}</div>
                          <div className="text-sm text-gray-600">{template.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleApplyTemplate}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Apply Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Button */}
          {activeOperation && (
            <div className="flex justify-end">
              <button
                onClick={() => setActiveOperation(null)}
                className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}