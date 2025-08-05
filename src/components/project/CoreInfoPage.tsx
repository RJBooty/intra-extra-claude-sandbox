import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText, Download, Edit, X, Save } from 'lucide-react';
import { Project, Client } from '../../types';
import { PhaseTracker } from './PhaseTracker';
import { ProjectMetadata } from './ProjectMetadata';
import { DocumentManager } from './DocumentManager';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const projectSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  client_id: z.string().min(1, 'Client selection is required'),
  event_location: z.string().min(1, 'Event location (City, Country) is required'),
  event_start_date: z.string().min(1, 'Start date is required'),
  event_end_date: z.string().min(1, 'End date is required'),
  expected_attendance: z.number().min(1, 'Expected attendance must be greater than 0'),
  event_type: z.enum(['Conference', 'Festival', 'Exhibition', 'Sports', 'Corporate', 'Other']),
  // Additional metadata fields
  onsite_start_date: z.string().optional(),
  onsite_end_date: z.string().optional(),
  show_start_date: z.string().optional(),
  show_end_date: z.string().optional(),
  voucher_sale_start: z.string().optional(),
  voucher_sale_end: z.string().optional(),
  topup_start: z.string().optional(),
  topup_end: z.string().optional(),
  refund_window_start: z.string().optional(),
  refund_window_end: z.string().optional(),
  delivery_address: z.string().optional(),
  delivery_contact_name: z.string().optional(),
  delivery_contact_phone: z.string().optional(),
  delivery_contact_email: z.string().optional(),
  wristband_order_deadline: z.string().optional(),
  load_in_date: z.string().optional(),
  load_out_date: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CoreInfoPageProps {
  project: Project;
}

const mockClients: Client[] = [
  { id: '1', name: 'John Smith', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1-555-0123', classification: 'Canopy', created_at: '', updated_at: '' },
  { id: '2', name: 'Sarah Johnson', company: 'Event Solutions', email: 'sarah@eventsolutions.com', phone: '+1-555-0124', classification: 'Direct', created_at: '', updated_at: '' },
  { id: '3', name: 'Mike Davis', company: 'Festival Group', email: 'mike@festivalgroup.com', phone: '+1-555-0125', classification: 'Partner', created_at: '', updated_at: '' }
];

// Classification definitions for tooltips
const eventClassificationDefinitions = {
  'Canopy': 'Premium tier clients with comprehensive service packages and priority support',
  'Direct': 'Direct clients working exclusively with CASFID without intermediaries',
  'Partner': 'Strategic partner organizations with collaborative service agreements',
  'Vendor': 'Vendor relationships for specialized services and equipment provision'
};

export function CoreInfoPage({ project }: CoreInfoPageProps) {
  const [activeDocumentTab, setActiveDocumentTab] = useState<'proposal' | 'contract' | 'custom'>('proposal');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_id: project.project_id,
      client_id: project.client_id,
      event_location: project.event_location,
      event_start_date: project.event_start_date,
      event_end_date: project.event_end_date,
      expected_attendance: project.expected_attendance,
      event_type: project.event_type,
      // Additional metadata fields
      onsite_start_date: project.onsite_start_date || '',
      onsite_end_date: project.onsite_end_date || '',
      show_start_date: project.show_start_date || '',
      show_end_date: project.show_end_date || '',
      voucher_sale_start: project.voucher_sale_start || '',
      voucher_sale_end: project.voucher_sale_end || '',
      topup_start: project.topup_start || '',
      topup_end: project.topup_end || '',
      refund_window_start: project.refund_window_start || '',
      refund_window_end: project.refund_window_end || '',
      delivery_address: project.delivery_address || '',
      delivery_contact_name: project.delivery_contact_name || '',
      delivery_contact_phone: project.delivery_contact_phone || '',
      delivery_contact_email: project.delivery_contact_email || '',
      wristband_order_deadline: project.wristband_order_deadline || '',
      load_in_date: project.load_in_date || '',
      load_out_date: project.load_out_date || '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    console.log('Updating project:', data);
    toast.success('Project updated successfully!');
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    }
  };

  const documentTemplates = [
    { id: '1', name: 'Standard Event Proposal', description: 'Template for general events' },
    { id: '2', name: 'Conference Proposal', description: 'Template for conference events' },
    { id: '3', name: 'Exhibition Proposal', description: 'Template for exhibition events' },
  ];

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-6">
          {/* Project Information Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Project Information</h2>
              <button
                onClick={() => setShowEditForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Info
              </button>
            </div>

            {/* Project Details Display */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
                  <p className="text-gray-900">{project.project_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <p className="text-gray-900">{project.client?.name} - {project.client?.company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Classification</label>
                  <p className="text-gray-900">{project.client?.classification}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Location (City, Country)</label>
                  <p className="text-gray-900">{project.event_location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <p className="text-gray-900">{project.classification}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendance</label>
                  <p className="text-gray-900">{project.expected_attendance?.toLocaleString()}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Dates</label>
                  <p className="text-gray-900">
                    {project.event_start_date && project.event_end_date 
                      ? `${format(new Date(project.event_start_date), 'dd/MM/yyyy')} to ${format(new Date(project.event_end_date), 'dd/MM/yyyy')}`
                      : 'Not set'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase Tracker */}
          <div className="mb-8">
            <PhaseTracker
              currentPhase={project.current_phase}
              phaseProgress={project.phase_progress}
            />
          </div>

          {/* Document Management */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Management</h2>
            
            {/* Document Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveDocumentTab('proposal')}
                  className={`pb-3 pt-4 text-sm font-bold tracking-wide border-b-3 transition-colors ${
                    activeDocumentTab === 'proposal'
                      ? 'border-blue-600 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Proposal Templates
                </button>
                <button
                  onClick={() => setActiveDocumentTab('contract')}
                  className={`pb-3 pt-4 text-sm font-bold tracking-wide border-b-3 transition-colors ${
                    activeDocumentTab === 'contract'
                      ? 'border-blue-600 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Contract Templates
                </button>
                <button
                  onClick={() => setActiveDocumentTab('custom')}
                  className={`pb-3 pt-4 text-sm font-bold tracking-wide border-b-3 transition-colors ${
                    activeDocumentTab === 'custom'
                      ? 'border-blue-600 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upload Custom Documents
                </button>
              </div>
            </div>

            {/* Document Content */}
            {(activeDocumentTab === 'proposal' || activeDocumentTab === 'contract') && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Template Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {documentTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900">{template.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{template.description}</td>
                        <td className="px-4 py-4">
                          <button className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                            Use Template
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeDocumentTab === 'custom' && (
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Drag and drop files here</h3>
                  <p className="text-gray-600 mb-4">Or click to browse your files</p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Upload Files
                  </label>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Files</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                Generate Proposal
              </button>
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-colors">
                Create Contract
              </button>
            </div>
          </div>
        </div>
          {/* Cashless Fees */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cashless Fees</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Fee Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Our Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Activation Fee</td>
                    <td className="px-4 py-3 text-sm text-gray-900">%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Refund Fee</td>
                    <td className="px-4 py-3 text-sm text-gray-900">2.5%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">TopUp Trxn Fee</td>
                    <td className="px-4 py-3 text-sm text-gray-900">5000</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Online Trxn Fee</td>
                    <td className="px-4 py-3 text-sm text-gray-900">€20</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">SoftPos Fee</td>
                    <td className="px-4 py-3 text-sm text-gray-900">€0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval Workflow */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Approval Workflow</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-yellow-800">Margin Threshold Alert</h3>
                    <p className="text-sm text-yellow-700">
                      Margins below 50% require approval from Commercial Director
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                    Pending Review
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-green-800">Cost Ratio Check</h3>
                    <p className="text-sm text-green-700">
                      Total costs are within recommended 60% of revenue
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                    Approved
                  </span>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Approval History</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Initial ROI submitted - Pending review</p>
                    <p>• Awaiting Commercial Director approval</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <ProjectEditForm
          project={project}
          onClose={() => setShowEditForm(false)}
          onSave={(updatedProject) => {
            // Handle project update
            setShowEditForm(false);
            toast.success('Project updated successfully!');
          }}
        />
      )}

      {/* Sidebar */}
      <div className="w-96 border-l border-gray-200 bg-white overflow-y-auto">
        <ProjectMetadata project={project} />
      </div>
    </div>
  );
}

// Project Edit Form Component
interface ProjectEditFormProps {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => void;
}

function ProjectEditForm({ project, onClose, onSave }: ProjectEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_id: project.project_id,
      client_id: project.client_id,
      event_location: project.event_location,
      event_start_date: project.event_start_date,
      event_end_date: project.event_end_date,
      expected_attendance: project.expected_attendance,
      event_type: project.classification,
      onsite_start_date: project.onsite_start_date || '',
      onsite_end_date: project.onsite_end_date || '',
      show_start_date: project.show_start_date || '',
      show_end_date: project.show_end_date || '',
      voucher_sale_start: project.voucher_sale_start || '',
      voucher_sale_end: project.voucher_sale_end || '',
      topup_start: project.topup_start || '',
      topup_end: project.topup_end || '',
      refund_window_start: project.refund_window_start || '',
      refund_window_end: project.refund_window_end || '',
      delivery_address: project.delivery_address || '',
      delivery_contact_name: project.delivery_contact_name || '',
      delivery_contact_phone: project.delivery_contact_phone || '',
      delivery_contact_email: project.delivery_contact_email || '',
      wristband_order_deadline: project.wristband_order_deadline || '',
      load_in_date: project.load_in_date || '',
      load_out_date: project.load_out_date || '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    console.log('Updating project:', data);
    toast.success('Project updated successfully!');
    setShowEditForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Project Information</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Project ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project ID
            </label>
            <input
              {...register('project_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <select
              {...register('client_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Client</option>
              {mockClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="text-red-600 text-sm mt-1">{errors.client_id.message}</p>
            )}
          </div>

          {/* Event Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Location (City, Country)
            </label>
            <input
              {...register('event_location')}
              placeholder="Enter Location (City, Country)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.event_location && (
              <p className="text-red-600 text-sm mt-1">{errors.event_location.message}</p>
            )}
          </div>

          {/* Expected Attendance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Attendance
            </label>
            <input
              {...register('expected_attendance', { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.expected_attendance && (
              <p className="text-red-600 text-sm mt-1">{errors.expected_attendance.message}</p>
            )}
          </div>

          {/* Classification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              {...register('event_type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Conference">Conference</option>
              <option value="Festival">Festival</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Sports">Sports</option>
              <option value="Corporate">Corporate</option>
              <option value="Other">Other</option>
            </select>
            {errors.event_type && (
              <p className="text-red-600 text-sm mt-1">{errors.event_type.message}</p>
            )}
          </div>

          {/* Event Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Start Date
              </label>
              <input
                {...register('event_start_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.event_start_date && (
                <p className="text-red-600 text-sm mt-1">{errors.event_start_date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event End Date
              </label>
              <input
                {...register('event_end_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.event_end_date && (
                <p className="text-red-600 text-sm mt-1">{errors.event_end_date.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Update Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}