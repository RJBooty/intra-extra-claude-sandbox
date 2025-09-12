// src/components/project/CoreInfoPage.tsx
// Updated to use Supabase service instead of API routes

import React, { useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Save,
  X,
  Calendar, 
  Upload,
  Info,
  CheckCircle,
  ArrowDown,
  FileText,
  Assignment,
  Work,
  Description,
  RestaurantMenu,
  Devices,
  Gavel,
  ExternalLink
} from 'lucide-react';
import { Project } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { useProjectService } from '../../services/projectService';

interface CoreInfoPageProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

interface EditableFieldProps {
  label: string;
  value: string;
  fieldKey: string;
  type?: string;
  isTextarea?: boolean;
  isSelect?: boolean;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  isEditMode: boolean;
  formData: any;
  handleInputChange: (field: string, value: string) => void;
}

// Move EditableField outside to prevent recreation
const EditableField = React.memo(({ 
  label, 
  value, 
  fieldKey,
  type = 'text', 
  isTextarea = false, 
  isSelect = false, 
  options = [], 
  placeholder = '',
  required = false,
  isEditMode,
  formData,
  handleInputChange
}: EditableFieldProps) => {
  if (!isEditMode) {
    return (
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value || 'Not specified'}</p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData[fieldKey as keyof typeof formData]}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : isSelect ? (
        <select
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData[fieldKey as keyof typeof formData]}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData[fieldKey as keyof typeof formData]}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
});

EditableField.displayName = 'EditableField';

export function CoreInfoPage({ project, onProjectUpdate }: CoreInfoPageProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineVouchers, setOnlineVouchers] = useState(true);
  const [onlineTopups, setOnlineTopups] = useState(true);
  const [refundWindow, setRefundWindow] = useState(true);
  
  // Use the Supabase service
  const { updateProject } = useProjectService();
  
  // Form state for editable fields
  const [formData, setFormData] = useState({
    project_id: project.project_id || '',
    project_code: project.project_code || '',
    event_location: project.event_location || '',
    event_start_date: project.event_start_date || '',
    event_end_date: project.event_end_date || '',
    expected_attendance: project.expected_attendance || '',
    event_type: project.event_type || '',
    description: project.description || '',
    requirements: project.requirements || '',
    special_notes: project.special_notes || ''
  });

  // Handle form input changes - memoized to prevent recreation
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Enter edit mode
  const handleEditMode = () => {
    setIsEditMode(true);
    // Reset form data to current project values
    setFormData({
      project_id: project.project_id || '',
      project_code: project.project_code || '',
      event_location: project.event_location || '',
      event_start_date: project.event_start_date || '',
      event_end_date: project.event_end_date || '',
      expected_attendance: project.expected_attendance || '',
      event_type: project.event_type || '',
      description: project.description || '',
      requirements: project.requirements || '',
      special_notes: project.special_notes || ''
    });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form data to original values
    setFormData({
      project_id: project.project_id || '',
      project_code: project.project_code || '',
      event_location: project.event_location || '',
      event_start_date: project.event_start_date || '',
      event_end_date: project.event_end_date || '',
      expected_attendance: project.expected_attendance || '',
      event_type: project.event_type || '',
      description: project.description || '',
      requirements: project.requirements || '',
      special_notes: project.special_notes || ''
    });
  };

  // Save changes using Supabase service
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!formData.project_id.trim() || !formData.project_code.trim()) {
        toast.error('Project ID and Project Code are required');
        return;
      }

      // Use the Supabase service
      const updatedProject = await updateProject(project.id, formData);
      
      // Update parent component if callback provided
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }

      setIsEditMode(false); // Exit edit mode after successful save
    } catch (error) {
      // Error already handled by useProjectService with toast
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <a className="flex items-center text-gray-500 hover:text-gray-700" href="#">
                <ArrowLeft className="mr-1 w-4 h-4" /> Back to Projects
              </a>
              <h2 className="text-3xl font-bold text-gray-800 mt-2">
                {formData.project_id} - <span className="text-2xl text-gray-600">{formData.project_code}</span>
              </h2>
              <p className="text-gray-500">{formData.event_location} • {project.client?.company}</p>
            </div>
            
            {/* Edit Info Button - Main page only */}
            {!isEditMode ? (
              <button 
                onClick={handleEditMode}
                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Edit className="mr-2 w-4 h-4" />
                Edit Info
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleCancelEdit}
                  className="text-gray-600 hover:text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-lg flex items-center"
                  disabled={isLoading}
                >
                  <X className="mr-2 w-4 h-4" />
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center disabled:bg-gray-400"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Project Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Project Information</h3>
                  {isEditMode && (
                    <span className="text-sm text-blue-600 italic">Edit Mode</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <EditableField
                    label="Project ID"
                    value={formData.project_id}
                    fieldKey="project_id"
                    required={true}
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <EditableField
                    label="Project Code"
                    value={formData.project_code}
                    fieldKey="project_code"
                    required={true}
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <EditableField
                    label="Event Location"
                    value={formData.event_location}
                    fieldKey="event_location"
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <EditableField
                    label="Event Type"
                    value={formData.event_type}
                    fieldKey="event_type"
                    isSelect={true}
                    options={['Festival', 'Conference', 'Concert', 'Sports Event', 'Corporate Event', 'Other']}
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <EditableField
                    label="Start Date"
                    value={formData.event_start_date}
                    fieldKey="event_start_date"
                    type="date"
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <EditableField
                    label="End Date"
                    value={formData.event_end_date}
                    fieldKey="event_end_date"
                    type="date"
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <EditableField
                    label="Expected Attendance"
                    value={formData.expected_attendance}
                    fieldKey="expected_attendance"
                    type="number"
                    placeholder="e.g. 5000"
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                </div>

                {/* Additional Information */}
                <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
                  <EditableField
                    label="Description"
                    value={formData.description}
                    fieldKey="description"
                    isTextarea={true}
                    placeholder="Brief description of the event and project scope..."
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <EditableField
                    label="Requirements"
                    value={formData.requirements}
                    fieldKey="requirements"
                    isTextarea={true}
                    placeholder="Key requirements and specifications..."
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <EditableField
                    label="Special Notes"
                    value={formData.special_notes}
                    fieldKey="special_notes"
                    isTextarea={true}
                    placeholder="Any special considerations or notes..."
                    isEditMode={isEditMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                </div>

                {/* Project Phase - Read Only */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center mb-2 space-x-4">
                    <h3 className="text-base font-bold text-gray-800">Project Phase:</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-gray-800 text-sm">Phase 1: Initial Contact</p>
                      <p className="text-gray-500 text-sm">25%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">First client interaction and requirements gathering</p>
                  </div>
                </div>
              </div>

              {/* Configuration Settings */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Configuration Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 font-bold text-base">Event Configuration</p>
                    <div className="mt-2 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Online Vouchers</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={onlineVouchers}
                            onChange={(e) => setOnlineVouchers(e.target.checked)}
                            disabled={!isEditMode}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Online Top-ups</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={onlineTopups}
                            onChange={(e) => setOnlineTopups(e.target.checked)}
                            disabled={!isEditMode}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Refund Window</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={refundWindow}
                            onChange={(e) => setRefundWindow(e.target.checked)}
                            disabled={!isEditMode}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar content remains unchanged */}
            <div className="space-y-6">
              {/* Client Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Client Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-semibold text-gray-800">{project.client?.company || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-gray-800">{project.client?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{project.client?.email || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center">
                    <FileText className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm">Generate Proposal</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center">
                    <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm">Schedule Meeting</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center">
                    <Upload className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-sm">Upload Documents</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}