import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Save,
  Eye,
  Settings
} from 'lucide-react';
import { PermissionType, UserTier, PageDefinition, SectionDefinition, FieldDefinition } from '../../types/permissions';
import toast from 'react-hot-toast';

interface PermissionExport {
  version: string;
  exportedAt: string;
  exportedBy: string;
  pages: Array<{
    id: string;
    page_name: string;
    display_name: string;
    permissions: Record<UserTier, PermissionType>;
    sections: Array<{
      id: string;
      section_name: string;
      display_name: string;
      permissions: Record<UserTier, PermissionType>;
      fields: Array<{
        id: string;
        field_name: string;
        display_name: string;
        permissions: Record<UserTier, PermissionType>;
      }>;
    }>;
  }>;
}

interface ImportExportProps {
  hierarchicalData: any;
  onImportPermissions: (permissions: PermissionExport) => Promise<void>;
  onExportPermissions: () => Promise<PermissionExport>;
}

const PERMISSION_TEMPLATES = {
  financial_restricted: {
    name: 'Financial Restricted',
    description: 'Strict financial data protection - suitable for ROI, accounting pages',
    permissions: {
      master: 'full' as PermissionType,
      senior: 'full' as PermissionType,
      hr_finance: 'read_only' as PermissionType,
      mid: 'none' as PermissionType,
      external: 'none' as PermissionType
    }
  },
  project_standard: {
    name: 'Standard Project Access',
    description: 'Standard project permissions - suitable for most project pages',
    permissions: {
      master: 'full' as PermissionType,
      senior: 'full' as PermissionType,
      hr_finance: 'read_only' as PermissionType,
      mid: 'full' as PermissionType,
      external: 'assigned_only' as PermissionType
    }
  },
  sales_team: {
    name: 'Sales Team Access',
    description: 'Sales-focused permissions - suitable for pipeline, opportunities',
    permissions: {
      master: 'full' as PermissionType,
      senior: 'full' as PermissionType,
      hr_finance: 'read_only' as PermissionType,
      mid: 'full' as PermissionType,
      external: 'none' as PermissionType
    }
  },
  external_limited: {
    name: 'External Limited',
    description: 'Limited access for external users - assigned items only',
    permissions: {
      master: 'full' as PermissionType,
      senior: 'full' as PermissionType,
      hr_finance: 'read_only' as PermissionType,
      mid: 'read_only' as PermissionType,
      external: 'assigned_only' as PermissionType
    }
  },
  hr_compliance: {
    name: 'HR Compliance',
    description: 'HR and compliance access pattern - suitable for team, user management',
    permissions: {
      master: 'full' as PermissionType,
      senior: 'read_only' as PermissionType,
      hr_finance: 'full' as PermissionType,
      mid: 'read_only' as PermissionType,
      external: 'none' as PermissionType
    }
  },
  system_admin: {
    name: 'System Administration',
    description: 'Administrative access - suitable for system settings, configuration',
    permissions: {
      master: 'full' as PermissionType,
      senior: 'read_only' as PermissionType,
      hr_finance: 'none' as PermissionType,
      mid: 'none' as PermissionType,
      external: 'none' as PermissionType
    }
  }
};

export function ImportExport({
  hierarchicalData,
  onImportPermissions,
  onExportPermissions
}: ImportExportProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'templates'>('export');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<PermissionExport | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportData = await onExportPermissions();
      downloadJSON(exportData, `permissions-export-${Date.now()}.json`);
      toast.success('Permissions exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export permissions');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        validateImportData(data);
        setImportData(data);
        generateImportPreview(data);
      } catch (error) {
        toast.error('Invalid JSON file or format');
        console.error('Import validation error:', error);
      }
    };
    reader.readAsText(file);
  };

  const validateImportData = (data: any) => {
    if (!data.version || !data.pages || !Array.isArray(data.pages)) {
      throw new Error('Invalid permission export format');
    }

    // Add more validation as needed
    const requiredFields = ['id', 'page_name', 'display_name', 'permissions'];
    data.pages.forEach((page: any, index: number) => {
      requiredFields.forEach(field => {
        if (!page[field]) {
          throw new Error(`Missing ${field} in page ${index}`);
        }
      });
    });
  };

  const generateImportPreview = (data: PermissionExport) => {
    const preview = data.pages.map(page => ({
      type: 'page',
      name: page.display_name,
      id: page.id,
      changes: Object.entries(page.permissions).map(([tier, permission]) => ({
        userTier: tier as UserTier,
        newPermission: permission,
        // Compare with current if available
        isChange: true // You'd calculate this by comparing with current permissions
      })),
      sections: page.sections?.map(section => ({
        type: 'section',
        name: section.display_name,
        id: section.id,
        changes: Object.entries(section.permissions || {}).map(([tier, permission]) => ({
          userTier: tier as UserTier,
          newPermission: permission,
          isChange: true
        })),
        fields: section.fields?.map(field => ({
          type: 'field',
          name: field.display_name,
          id: field.id,
          changes: Object.entries(field.permissions || {}).map(([tier, permission]) => ({
            userTier: tier as UserTier,
            newPermission: permission,
            isChange: true
          }))
        })) || []
      })) || []
    }));
    setImportPreview(preview);
  };

  const handleImport = async () => {
    if (!importData) return;

    try {
      setIsImporting(true);
      await onImportPermissions(importData);
      toast.success('Permissions imported successfully');
      setShowDialog(false);
      setImportData(null);
      setImportPreview([]);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import permissions');
    } finally {
      setIsImporting(false);
    }
  };

  const handleTemplateExport = () => {
    if (!selectedTemplate) return;

    const template = PERMISSION_TEMPLATES[selectedTemplate as keyof typeof PERMISSION_TEMPLATES];
    const templateData = {
      name: template.name,
      description: template.description,
      permissions: template.permissions,
      created_at: new Date().toISOString()
    };

    downloadJSON(templateData, `template-${selectedTemplate}.json`);
    toast.success(`Template "${template.name}" exported`);
  };

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPermissionColor = (permission: PermissionType) => {
    const colors = {
      full: 'text-green-600 bg-green-50',
      read_only: 'text-blue-600 bg-blue-50',
      assigned_only: 'text-purple-600 bg-purple-50',
      own_only: 'text-amber-600 bg-amber-50',
      none: 'text-red-600 bg-red-50'
    };
    return colors[permission] || 'text-gray-600 bg-gray-50';
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        title="Import/Export permissions"
      >
        <Settings className="w-4 h-4" />
        Import/Export
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Permission Import/Export
                </h2>
                <button
                  onClick={() => setShowDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('export')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'export'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setActiveTab('import')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'import'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Import
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'templates'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Templates
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'export' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Export Current Permissions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Export all current permission settings to a JSON file. This includes all pages, 
                      sections, and fields with their permission configurations for each user tier.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Export Contents:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• All page, section, and field definitions</li>
                      <li>• Complete permission matrix for all user tiers</li>
                      <li>• Export metadata (timestamp, version, creator)</li>
                      <li>• Hierarchical structure relationships</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isExporting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Export Permissions
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'import' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Import Permissions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Import permission settings from a previously exported JSON file. 
                      Review changes before applying to ensure they meet your security requirements.
                    </p>
                  </div>

                  {!importData ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Upload Permission File
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Select a JSON file exported from the permissions dashboard
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Select File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-900">File Loaded Successfully</h4>
                            <p className="text-sm text-green-800 mt-1">
                              Found {importData.pages.length} pages with permission configurations
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              Exported: {new Date(importData.exportedAt).toLocaleString()} by {importData.exportedBy}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Import Preview */}
                      <div className="border border-gray-200 rounded-lg">
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900">Import Preview</h4>
                          <p className="text-sm text-gray-600">Review the changes that will be applied</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {importPreview.map((page, pageIndex) => (
                            <div key={page.id} className="p-3 border-b border-gray-100 last:border-b-0">
                              <div className="font-medium text-gray-900 mb-2">
                                📄 {page.name}
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-xs">
                                {page.changes.map((change: any) => (
                                  <div key={change.userTier} className="text-center">
                                    <div className="text-gray-600 mb-1">
                                      {change.userTier.replace('_', ' ').toUpperCase()}
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs ${getPermissionColor(change.newPermission)}`}>
                                      {change.newPermission.replace('_', ' ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            setImportData(null);
                            setImportPreview([]);
                          }}
                          className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Choose Different File
                        </button>
                        <button
                          onClick={handleImport}
                          disabled={isImporting}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {isImporting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Apply Import
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Permission Templates
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Pre-configured permission patterns for common use cases. 
                      Export these templates to apply consistent permissions across similar pages.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(PERMISSION_TEMPLATES).map(([key, template]) => (
                      <div
                        key={key}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedTemplate === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTemplate(key)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          </div>
                          <input
                            type="radio"
                            name="template"
                            checked={selectedTemplate === key}
                            onChange={() => setSelectedTemplate(key)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="grid grid-cols-5 gap-2">
                          {Object.entries(template.permissions).map(([tier, permission]) => (
                            <div key={tier} className="text-center">
                              <div className="text-xs text-gray-600 mb-1">
                                {tier.replace('_', ' ').toUpperCase()}
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${getPermissionColor(permission)}`}>
                                {permission.replace('_', ' ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleTemplateExport}
                      disabled={!selectedTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}