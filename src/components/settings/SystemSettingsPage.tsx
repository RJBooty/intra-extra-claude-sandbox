import React, { useState } from 'react';
import { ArrowLeft, Save, Settings, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface SystemSettingsPageProps {
  onBack: () => void;
}

export function SystemSettingsPage({ onBack }: SystemSettingsPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'configuration' | 'input-fields' | 'document-templates' | 'misc'>('configuration');
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  
  // Mock data for input fields
  const [inputFields, setInputFields] = useState([
    {
      id: '1',
      fieldName: 'Project Status',
      module: 'Projects',
      options: ['Active', 'Completed', 'On Hold', 'Cancelled', 'Planning'],
      optionCount: 5
    },
    {
      id: '2',
      fieldName: 'Client Type',
      module: 'Clients',
      options: ['Canopy', 'Direct', 'Partner'],
      optionCount: 3
    },
    {
      id: '3',
      fieldName: 'Task Priority',
      module: 'Pipeline',
      options: ['Critical', 'High', 'Normal', 'Low'],
      optionCount: 4
    },
    {
      id: '4',
      fieldName: 'User Role',
      module: 'Team',
      options: ['Master User', 'Senior User', 'Mid User', 'External User', 'HR User', 'Admin'],
      optionCount: 6
    }
  ]);

  const [formData, setFormData] = useState({
    currency: 'USD - United States Dollar',
    measurement: 'Metric (kg, cm)',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour (e.g., 15:00)',
    erpEnabled: true,
    apiKey: 'xyz-123-abc-456',
    apiEndpoint: 'https://api.your-erp.com/v2/sync'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (activeTab === 'configuration') {
        toast.success('System configuration saved successfully!');
      } else if (activeTab === 'input-fields') {
        toast.success('Input fields updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = () => {
    setShowAddFieldModal(true);
  };

  const handleEditField = (field: any) => {
    setEditingField(field);
    setShowAddFieldModal(true);
  };

  const handleDeleteField = (fieldId: string) => {
    setInputFields(prev => prev.filter(field => field.id !== fieldId));
    toast.success('Field removed successfully!');
  };

  const handleSaveField = (fieldData: any) => {
    if (editingField) {
      // Update existing field
      setInputFields(prev => prev.map(field => 
        field.id === editingField.id ? { ...field, ...fieldData } : field
      ));
      toast.success('Field updated successfully!');
    } else {
      // Add new field
      const newField = {
        id: Date.now().toString(),
        ...fieldData,
        optionCount: fieldData.options.length
      };
      setInputFields(prev => [...prev, newField]);
      toast.success('Field added successfully!');
    }
    setShowAddFieldModal(false);
    setEditingField(null);
  };

  const handleCancel = () => {
    onBack();
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('configuration')}
                className={`py-4 px-1 border-b-2 text-sm font-bold ${
                  activeTab === 'configuration' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Configuration
              </button>
              <button 
                onClick={() => setActiveTab('input-fields')}
                className={`py-4 px-1 border-b-2 text-sm font-bold ${
                  activeTab === 'input-fields' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Input Fields
              </button>
              <button 
                onClick={() => setActiveTab('document-templates')}
                className={`py-4 px-1 border-b-2 text-sm font-bold ${
                  activeTab === 'document-templates' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Document Templates
              </button>
              <button 
                onClick={() => setActiveTab('misc')}
                className={`py-4 px-1 border-b-2 text-sm font-bold ${
                  activeTab === 'misc' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Misc
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            {activeTab === 'configuration' && (
              <div className="space-y-12">
              {/* System Configuration Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">System Configuration</h2>
                <p className="mt-1 text-gray-600">Adjust the system's operational parameters to fit your workflow.</p>
                
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  {/* Default Currency */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="currency">
                      Default Currency
                    </label>
                    <div className="mt-2">
                      <select
                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 block w-full"
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                      >
                        <option>USD - United States Dollar</option>
                        <option>EUR - Euro</option>
                        <option>GBP - British Pound</option>
                        <option>JPY - Japanese Yen</option>
                      </select>
                    </div>
                  </div>

                  {/* Units of Measurement */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="measurement">
                      Units of Measurement
                    </label>
                    <div className="mt-2">
                      <select
                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 block w-full"
                        id="measurement"
                        name="measurement"
                        value={formData.measurement}
                        onChange={(e) => handleInputChange('measurement', e.target.value)}
                      >
                        <option>Metric (kg, cm)</option>
                        <option>Imperial (lb, in)</option>
                      </select>
                    </div>
                  </div>

                  {/* Date Format */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="date-format">
                      Date Format
                    </label>
                    <div className="mt-2">
                      <select
                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 block w-full"
                        id="date-format"
                        name="date-format"
                        value={formData.dateFormat}
                        onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                      >
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  {/* Time Format */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="time-format">
                      Time Format
                    </label>
                    <div className="mt-2">
                      <select
                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 block w-full"
                        id="time-format"
                        name="time-format"
                        value={formData.timeFormat}
                        onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                      >
                        <option>12-hour (e.g., 3:00 PM)</option>
                        <option>24-hour (e.g., 15:00)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Integration Section */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">API Integration</h2>
                <p className="mt-1 text-gray-600">Manage connections with other systems.</p>
                
                <div className="mt-6 space-y-6">
                  {/* ERP System Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold leading-6 text-gray-900">External ERP System</h3>
                      <p className="mt-1 text-sm text-gray-500">Sync inventory and order data automatically.</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input
                        className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all ${
                          formData.erpEnabled 
                            ? 'right-0 border-blue-600' 
                            : 'left-0 border-gray-300'
                        }`}
                        id="erp-toggle"
                        name="erp-toggle"
                        type="checkbox"
                        checked={formData.erpEnabled}
                        onChange={(e) => handleInputChange('erpEnabled', e.target.checked)}
                      />
                      <label
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-all ${
                          formData.erpEnabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        htmlFor="erp-toggle"
                      />
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="api-key">
                      API Key
                    </label>
                    <div className="mt-2">
                      <input
                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 block w-full"
                        id="api-key"
                        name="api-key"
                        placeholder="Enter your API key"
                        type="text"
                        value={formData.apiKey}
                        onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* API Endpoint */}
                  <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="api-endpoint">
                      API Endpoint URL
                    </label>
                    <div className="mt-2">
                      <input
                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 block w-full"
                        id="api-endpoint"
                        name="api-endpoint"
                        placeholder="https://api.example.com/v1/"
                        type="text"
                        value={formData.apiEndpoint}
                        onChange={(e) => handleInputChange('apiEndpoint', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {(activeTab === 'document-templates' || activeTab === 'misc') && (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-500">This section is under development.</p>
              </div>
            )}

            {/* Action Buttons */}
            {activeTab === 'configuration' && (
              <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 mr-2"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                type="submit"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                Save Configuration
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}