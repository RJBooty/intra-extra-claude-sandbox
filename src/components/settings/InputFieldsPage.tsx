@@ .. @@
 import React, { useState } from 'react';
-import { ArrowLeft, Settings } from 'lucide-react';
+import { ArrowLeft, Settings, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
+import { LoadingSpinner } from '../ui/LoadingSpinner';
+import toast from 'react-hot-toast';
 
 interface InputFieldsPageProps {
   onBack: () => void;
 }
 
 export function InputFieldsPage({ onBack }: InputFieldsPageProps) {
+  const [isLoading, setIsLoading] = useState(false);
+  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
+  const [editingField, setEditingField] = useState<any>(null);
+  
+  // Mock data for input fields
+  const [inputFields, setInputFields] = useState([
+    {
+      id: '1',
+      fieldName: 'Project Status',
+      module: 'Projects',
+      options: ['Active', 'Completed', 'On Hold', 'Cancelled', 'Planning'],
+      optionCount: 5
+    },
+    {
+      id: '2',
+      fieldName: 'Client Type',
+      module: 'Clients',
+      options: ['Canopy', 'Direct', 'Partner'],
+      optionCount: 3
+    },
+    {
+      id: '3',
+      fieldName: 'Task Priority',
+      module: 'Pipeline',
+      options: ['Critical', 'High', 'Normal', 'Low'],
+      optionCount: 4
+    },
+    {
+      id: '4',
+      fieldName: 'User Role',
+      module: 'Team',
+      options: ['Master User', 'Senior User', 'Mid User', 'External User', 'HR User', 'Admin'],
+      optionCount: 6
+    }
+  ]);
+
+  const handleSave = async () => {
+    setIsLoading(true);
+    try {
+      await new Promise(resolve => setTimeout(resolve, 1000));
+      toast.success('Input fields updated successfully!');
+    } catch (error) {
+      toast.error('Failed to save changes');
+    } finally {
+      setIsLoading(false);
+    }
+  };
+
+  const handleAddField = () => {
+    setShowAddFieldModal(true);
+  };
+
+  const handleEditField = (field: any) => {
+    setEditingField(field);
+    setShowAddFieldModal(true);
+  };
+
+  const handleDeleteField = (fieldId: string) => {
+    setInputFields(prev => prev.filter(field => field.id !== fieldId));
+    toast.success('Field removed successfully!');
+  };
+
+  const handleSaveField = (fieldData: any) => {
+    if (editingField) {
+      // Update existing field
+      setInputFields(prev => prev.map(field => 
+        field.id === editingField.id ? { ...field, ...fieldData } : field
+      ));
+      toast.success('Field updated successfully!');
+    } else {
+      // Add new field
+      const newField = {
+        id: Date.now().toString(),
+        ...fieldData,
+        optionCount: fieldData.options.length
+      };
+      setInputFields(prev => [...prev, newField]);
+      toast.success('Field added successfully!');
+    }
+    setShowAddFieldModal(false);
+    setEditingField(null);
+  };
+
   return (
     <div className="flex h-full">
       <div className="flex-1 overflow-y-auto">
@@ .. @@
           </div>
 
           {/* Content */}
-          <div className="bg-white rounded-lg border border-gray-200 p-6">
-            <div className="text-center py-12">
-              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
-              <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
-              <p className="text-gray-500">This section is under development.</p>
+          <div className="space-y-8">
+            {/* Warning Banner */}
+            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start">
+              <AlertTriangle className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
+              <div>
+                <h2 className="font-semibold">Settings Module Under Development</h2>
+                <p>We're working hard to bring you comprehensive settings management. Check back soon for updates!</p>
+              </div>
+            </div>
+
+            {/* Platform Configuration */}
+            <div className="bg-white p-6 rounded-lg border border-gray-200">
+              <div className="flex justify-between items-center mb-6">
+                <div>
+                  <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
+                  <p className="text-gray-600">Manage dropdown and select field options across the platform.</p>
+                </div>
+                <button 
+                  onClick={handleAddField}
+                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
+                >
+                  <Plus className="w-4 h-4 mr-2" />
+                  Add New Field
+                </button>
+              </div>
+
+              {/* Input Fields Table */}
+              <div className="overflow-x-auto">
+                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
+                  <thead className="bg-gray-50">
+                    <tr>
+                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                        Field Name
+                      </th>
+                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                        Module
+                      </th>
+                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
+                        Options
+                      </th>
+                      <th className="relative px-6 py-3">
+                        <span className="sr-only">Actions</span>
+                      </th>
+                    </tr>
+                  </thead>
+                  <tbody className="divide-y divide-gray-200">
+                    {inputFields.map((field) => (
+                      <tr key={field.id} className="hover:bg-gray-50">
+                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
+                          {field.fieldName}
+                        </td>
+                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
+                          {field.module}
+                        </td>
+                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
+                          {field.optionCount} options
+                        </td>
+                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
+                          <button 
+                            onClick={() => handleEditField(field)}
+                            className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
+                          >
+                            Edit
+                          </button>
+                          <button 
+                            onClick={() => handleDeleteField(field.id)}
+                            className="text-red-600 hover:text-red-900 transition-colors"
+                          >
+                            Remove
+                          </button>
+                        </td>
+                      </tr>
+                    ))}
+                  </tbody>
+                </table>
+              </div>
+            </div>
+
+            {/* Current System Information */}
+            <div className="bg-white p-6 rounded-lg border border-gray-200">
+              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current System Information</h3>
+              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
+                <div>
+                  <p>Platform Version:</p>
+                  <p>Last Updated:</p>
+                  <p>Environment:</p>
+                </div>
+                <div className="text-gray-900">
+                  <p>v2.1.0</p>
+                  <p>January 21, 2025</p>
+                  <p>Production</p>
+                </div>
+                <div>
+                  <p>Database Status:</p>
+                  <p>Active Users:</p>
+                  <p>Total Projects:</p>
+                </div>
+                <div className="text-gray-900">
+                  <p>
+                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
+                    Connected
+                  </p>
+                  <p>12</p>
+                  <p>48</p>
+                </div>
+              </div>
+            </div>
+
+            {/* Contact Support */}
+            <div className="text-center">
+              <p className="text-gray-600 mb-4">Need help configuring your settings or have questions?</p>
+              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
+                Contact Support
+              </button>
+            </div>
+
+            {/* Save Button */}
+            <div className="flex justify-end">
+              <button
+                onClick={handleSave}
+                disabled={isLoading}
+                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
+              >
+                {isLoading && <LoadingSpinner size="sm" />}
+                Save Changes
+              </button>
             </div>
           </div>
         </div>
       </div>
+
+      {/* Add/Edit Field Modal */}
+      {showAddFieldModal && (
+        <AddFieldModal
+          field={editingField}
+          onClose={() => {
+            setShowAddFieldModal(false);
+            setEditingField(null);
+          }}
+          onSave={handleSaveField}
+        />
+      )}
     </div>
   );
+}
+
+// Add Field Modal Component
+interface AddFieldModalProps {
+  field?: any;
+  onClose: () => void;
+  onSave: (fieldData: any) => void;
+}
+
+function AddFieldModal({ field, onClose, onSave }: AddFieldModalProps) {
+  const [formData, setFormData] = useState({
+    fieldName: field?.fieldName || '',
+    module: field?.module || '',
+    options: field?.options || ['']
+  });
+
+  const handleSubmit = (e: React.FormEvent) => {
+    e.preventDefault();
+    if (!formData.fieldName.trim() || !formData.module.trim()) {
+      toast.error('Please fill in all required fields');
+      return;
+    }
+    
+    const validOptions = formData.options.filter(option => option.trim() !== '');
+    if (validOptions.length === 0) {
+      toast.error('Please add at least one option');
+      return;
+    }
+
+    onSave({
+      ...formData,
+      options: validOptions
+    });
+  };
+
+  const addOption = () => {
+    setFormData(prev => ({
+      ...prev,
+      options: [...prev.options, '']
+    }));
+  };
+
+  const removeOption = (index: number) => {
+    setFormData(prev => ({
+      ...prev,
+      options: prev.options.filter((_, i) => i !== index)
+    }));
+  };
+
+  const updateOption = (index: number, value: string) => {
+    setFormData(prev => ({
+      ...prev,
+      options: prev.options.map((option, i) => i === index ? value : option)
+    }));
+  };
+
+  return (
+    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
+      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
+        <div className="flex items-center justify-between p-6 border-b border-gray-200">
+          <h2 className="text-xl font-semibold text-gray-900">
+            {field ? 'Edit Field' : 'Add New Field'}
+          </h2>
+          <button
+            onClick={onClose}
+            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
+          >
+            ×
+          </button>
+        </div>
+
+        <form onSubmit={handleSubmit} className="p-6 space-y-4">
+          <div>
+            <label className="block text-sm font-medium text-gray-700 mb-2">
+              Field Name *
+            </label>
+            <input
+              type="text"
+              value={formData.fieldName}
+              onChange={(e) => setFormData(prev => ({ ...prev, fieldName: e.target.value }))}
+              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
+              placeholder="Enter field name"
+              required
+            />
+          </div>
+
+          <div>
+            <label className="block text-sm font-medium text-gray-700 mb-2">
+              Module *
+            </label>
+            <select
+              value={formData.module}
+              onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
+              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
+              required
+            >
+              <option value="">Select Module</option>
+              <option value="Projects">Projects</option>
+              <option value="Clients">Clients</option>
+              <option value="Pipeline">Pipeline</option>
+              <option value="Team">Team</option>
+              <option value="ROI">ROI</option>
+              <option value="Operations">Operations</option>
+            </select>
+          </div>
+
+          <div>
+            <label className="block text-sm font-medium text-gray-700 mb-2">
+              Options *
+            </label>
+            <div className="space-y-2">
+              {formData.options.map((option, index) => (
+                <div key={index} className="flex gap-2">
+                  <input
+                    type="text"
+                    value={option}
+                    onChange={(e) => updateOption(index, e.target.value)}
+                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
+                    placeholder={`Option ${index + 1}`}
+                  />
+                  {formData.options.length > 1 && (
+                    <button
+                      type="button"
+                      onClick={() => removeOption(index)}
+                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
+                    >
+                      <Trash2 className="w-4 h-4" />
+                    </button>
+                  )}
+                </div>
+              ))}
+              <button
+                type="button"
+                onClick={addOption}
+                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
+              >
+                <Plus className="w-4 h-4" />
+                Add Option
+              </button>
+            </div>
+          </div>
+
+          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
+            <button
+              type="button"
+              onClick={onClose}
+              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
+            >
+              Cancel
+            </button>
+            <button
+              type="submit"
+              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
+            >
+              {field ? 'Update' : 'Add'} Field
+            </button>
+          </div>
+        </form>
+      </div>
+    </div>
+  );
 }