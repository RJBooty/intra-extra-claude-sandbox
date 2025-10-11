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
  ExternalLink,
  Clock,
  CreditCard,
  Shield,
  Truck,
  DollarSign,
  Eye,
  Trash2,
  RefreshCw,
  Link,
  Download,
  Plus
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
    special_notes: project.special_notes || '',
    // Key Dates
    onsite_start_date: project.onsite_start_date || '',
    onsite_end_date: project.onsite_end_date || '',
    show_start_date: project.show_start_date || '',
    show_end_date: project.show_end_date || '',
    load_in_date: project.load_in_date || '',
    load_out_date: project.load_out_date || '',
    // Cashless Info
    voucher_sale_start: project.voucher_sale_start || '',
    voucher_sale_end: project.voucher_sale_end || '',
    topup_start: project.topup_start || '',
    topup_end: project.topup_end || '',
    // Refund Info
    refund_window_start: project.refund_window_start || '',
    refund_window_end: project.refund_window_end || '',
    refund_fee: project.refund_fee || '',
    // Delivery & Deadlines
    wristband_order_deadline: project.wristband_order_deadline || '',
    hardware_onsite_deadline: project.hardware_onsite_deadline || '',
    delivery_address: project.delivery_address || '',
    delivery_contact_name: project.delivery_contact_name || '',
    delivery_contact_phone: project.delivery_contact_phone || '',
    delivery_contact_email: project.delivery_contact_email || '',
    collection_address: project.collection_address || '',
    collection_contact_name: project.collection_contact_name || '',
    collection_contact_phone: project.collection_contact_phone || '',
    collection_contact_email: project.collection_contact_email || '',
    same_as_delivery: project.same_as_delivery || false
  });

  // Handle form input changes - memoized to prevent recreation
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Enter edit mode
  const handleEditMode = () => {
    setIsEditMode(true);
    // Reset form data to current project values - ALL FIELDS
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
      special_notes: project.special_notes || '',
      // Key Dates
      onsite_start_date: project.onsite_start_date || '',
      onsite_end_date: project.onsite_end_date || '',
      show_start_date: project.show_start_date || '',
      show_end_date: project.show_end_date || '',
      load_in_date: project.load_in_date || '',
      load_out_date: project.load_out_date || '',
      // Cashless Info
      voucher_sale_start: project.voucher_sale_start || '',
      voucher_sale_end: project.voucher_sale_end || '',
      topup_start: project.topup_start || '',
      topup_end: project.topup_end || '',
      // Refund Info
      refund_window_start: project.refund_window_start || '',
      refund_window_end: project.refund_window_end || '',
      refund_fee: project.refund_fee || '',
      // Delivery & Deadlines
      wristband_order_deadline: project.wristband_order_deadline || '',
      hardware_onsite_deadline: project.hardware_onsite_deadline || '',
      delivery_address: project.delivery_address || '',
      delivery_contact_name: project.delivery_contact_name || '',
      delivery_contact_phone: project.delivery_contact_phone || '',
      delivery_contact_email: project.delivery_contact_email || '',
      collection_address: project.collection_address || '',
      collection_contact_name: project.collection_contact_name || '',
      collection_contact_phone: project.collection_contact_phone || '',
      collection_contact_email: project.collection_contact_email || '',
      same_as_delivery: project.same_as_delivery || false
    });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form data to original values - ALL FIELDS
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
      special_notes: project.special_notes || '',
      // Key Dates
      onsite_start_date: project.onsite_start_date || '',
      onsite_end_date: project.onsite_end_date || '',
      show_start_date: project.show_start_date || '',
      show_end_date: project.show_end_date || '',
      load_in_date: project.load_in_date || '',
      load_out_date: project.load_out_date || '',
      // Cashless Info
      voucher_sale_start: project.voucher_sale_start || '',
      voucher_sale_end: project.voucher_sale_end || '',
      topup_start: project.topup_start || '',
      topup_end: project.topup_end || '',
      // Refund Info
      refund_window_start: project.refund_window_start || '',
      refund_window_end: project.refund_window_end || '',
      refund_fee: project.refund_fee || '',
      // Delivery & Deadlines
      wristband_order_deadline: project.wristband_order_deadline || '',
      hardware_onsite_deadline: project.hardware_onsite_deadline || '',
      delivery_address: project.delivery_address || '',
      delivery_contact_name: project.delivery_contact_name || '',
      delivery_contact_phone: project.delivery_contact_phone || '',
      delivery_contact_email: project.delivery_contact_email || '',
      collection_address: project.collection_address || '',
      collection_contact_name: project.collection_contact_name || '',
      collection_contact_phone: project.collection_contact_phone || '',
      collection_contact_email: project.collection_contact_email || '',
      same_as_delivery: project.same_as_delivery || false
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

      // Combine form data with configuration toggles
      const dataToSave = {
        ...formData,
        online_vouchers_enabled: onlineVouchers,
        online_topups_enabled: onlineTopups,
        refund_window_enabled: refundWindow
      };

      // Use the Supabase service
      const updatedProject = await updateProject(project.id, dataToSave);

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

              {/* Key Dates */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Key Dates</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* On-site Dates */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">On-site</h4>
                    <div className="space-y-3">
                      <EditableField
                        label="Start Date/Time"
                        value={formData.onsite_start_date || ''}
                        fieldKey="onsite_start_date"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="End Date/Time"
                        value={formData.onsite_end_date || ''}
                        fieldKey="onsite_end_date"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Show Dates */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Show Dates</h4>
                    <div className="space-y-3">
                      <EditableField
                        label="Start Date/Time"
                        value={formData.show_start_date || ''}
                        fieldKey="show_start_date"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="End Date/Time"
                        value={formData.show_end_date || ''}
                        fieldKey="show_end_date"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Load In/Out */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Load In/Out</h4>
                    <div className="space-y-3">
                      <EditableField
                        label="Load In Date/Time"
                        value={formData.load_in_date || ''}
                        fieldKey="load_in_date"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="Load Out Date/Time"
                        value={formData.load_out_date || ''}
                        fieldKey="load_out_date"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cashless Info */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-800">Cashless Info</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Online Vouchers */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Online Vouchers</h4>
                    <div className="space-y-3">
                      <EditableField
                        label="Start Date/Time"
                        value={formData.voucher_sale_start || ''}
                        fieldKey="voucher_sale_start"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="End Date/Time"
                        value={formData.voucher_sale_end || ''}
                        fieldKey="voucher_sale_end"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Online TopUps */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Online TopUps</h4>
                    <div className="space-y-3">
                      <EditableField
                        label="Start Date/Time"
                        value={formData.topup_start || ''}
                        fieldKey="topup_start"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="End Date/Time"
                        value={formData.topup_end || ''}
                        fieldKey="topup_end"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund Info */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Shield className="w-5 h-5 mr-2 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">Refund Info</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Refund Window */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Refund Window</h4>
                    <div className="space-y-3">
                      <EditableField
                        label="Start Date/Time"
                        value={formData.refund_window_start || ''}
                        fieldKey="refund_window_start"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="End Date/Time"
                        value={formData.refund_window_end || ''}
                        fieldKey="refund_window_end"
                        type="datetime-local"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Refund Terms */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Refund Terms</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Refund Terms Document
                        </label>
                        {!isEditMode ? (
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <FileText className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-700">refund_terms.pdf</span>
                            <button className="ml-auto text-blue-600 hover:text-blue-800">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        )}
                      </div>
                      <EditableField
                        label="Refund Fee (€)"
                        value={formData.refund_fee || ''}
                        fieldKey="refund_fee"
                        type="number"
                        placeholder="5.00"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery & Deadlines */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Truck className="w-5 h-5 mr-2 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-800">Delivery & Deadlines</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deadlines */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Deadlines</h4>
                    <div className="space-y-3">
                      <EditableField
                        label="Wristband Order Deadline"
                        value={formData.wristband_order_deadline || ''}
                        fieldKey="wristband_order_deadline"
                        type="date"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="Hardware On-Site Deadline"
                        value={formData.hardware_onsite_deadline || ''}
                        fieldKey="hardware_onsite_deadline"
                        type="date"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Delivery On-Site Address</h4>
                    <div className="space-y-3">
                      <EditableField
                        label="Point of Contact Name"
                        value={formData.delivery_contact_name || ''}
                        fieldKey="delivery_contact_name"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="Point of Contact Phone"
                        value={formData.delivery_contact_phone || ''}
                        fieldKey="delivery_contact_phone"
                        type="tel"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="Point of Contact Email"
                        value={formData.delivery_contact_email || ''}
                        fieldKey="delivery_contact_email"
                        type="email"
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                      <EditableField
                        label="Delivery Address"
                        value={formData.delivery_address || ''}
                        fieldKey="delivery_address"
                        isTextarea={true}
                        isEditMode={isEditMode}
                        formData={formData}
                        handleInputChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Collection Address */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-base font-semibold text-gray-800 mb-3">Collection On-Site Address</h4>
                  
                  {isEditMode && (
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.same_as_delivery}
                          onChange={(e) => handleInputChange('same_as_delivery', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Same as Delivery Address</span>
                      </label>
                    </div>
                  )}

                  {(!formData.same_as_delivery || !isEditMode) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <EditableField
                          label="Point of Contact Name"
                          value={formData.same_as_delivery ? formData.delivery_contact_name : formData.collection_contact_name || ''}
                          fieldKey="collection_contact_name"
                          isEditMode={isEditMode && !formData.same_as_delivery}
                          formData={formData}
                          handleInputChange={handleInputChange}
                        />
                        <EditableField
                          label="Point of Contact Phone"
                          value={formData.same_as_delivery ? formData.delivery_contact_phone : formData.collection_contact_phone || ''}
                          fieldKey="collection_contact_phone"
                          type="tel"
                          isEditMode={isEditMode && !formData.same_as_delivery}
                          formData={formData}
                          handleInputChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-3">
                        <EditableField
                          label="Point of Contact Email"
                          value={formData.same_as_delivery ? formData.delivery_contact_email : formData.collection_contact_email || ''}
                          fieldKey="collection_contact_email"
                          type="email"
                          isEditMode={isEditMode && !formData.same_as_delivery}
                          formData={formData}
                          handleInputChange={handleInputChange}
                        />
                        <EditableField
                          label="Collection Address"
                          value={formData.same_as_delivery ? formData.delivery_address : formData.collection_address || ''}
                          fieldKey="collection_address"
                          isTextarea={true}
                          isEditMode={isEditMode && !formData.same_as_delivery}
                          formData={formData}
                          handleInputChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fees Overview */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-800">Fees Overview</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ticketing Fees</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Service Fee (per ticket)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€2.50</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Processing Fee (per order)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3.0%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Cashless Fees</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Activation Fee (per wristband)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€1.00</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Top-Up Fee (online)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.5%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Top-Up Fee (on-site)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5.0%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Refund Processing Fee</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€5.00</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Additional Fees</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mailing Fee</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-orange-600">Not set</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">On-site Support</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€1,500 / day</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Overview */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Summary Overview</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Contract Status</p>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="font-semibold text-green-600">Signed</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ROI Status</p>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="font-semibold text-yellow-600">Pending</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Margin Threshold</p>
                    <p className="font-semibold text-gray-800 mt-1">15%</p>
                  </div>
                </div>
              </div>

              {/* Documents Hub */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">Documents Hub</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">Contract</span>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">Service Level Agreement</span>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">Scope of Work</span>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-base font-semibold text-gray-800 mb-3">Project x Client Docs</h4>
                    <div className="space-y-2">
                      {['Project Info Request', 'Menus & Products', 'Device Allocation', 'Technical Rider'].map((docName) => (
                        <div key={docName} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-700">{docName}</span>
                          </div>
                          <div className="flex space-x-1">
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-orange-600 hover:bg-orange-50 rounded">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Document
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back-Office Connections */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-6">
                  <Link className="w-5 h-5 mr-2 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-800">Back-Office Connections</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Enterticket', status: 'connected', color: 'green' },
                    { name: 'IDASEvent', status: 'connected', color: 'green' },
                    { name: 'CASE', status: 'disconnected', color: 'red' },
                    { name: 'Charity', status: 'pending', color: 'yellow' },
                    { name: 'Promotor Panel', status: 'connected', color: 'green' }
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          integration.color === 'green' ? 'bg-green-500' :
                          integration.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium text-gray-900">{integration.name}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 flex items-center">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        <span className="text-sm">Manage</span>
                      </button>
                    </div>
                  ))}
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