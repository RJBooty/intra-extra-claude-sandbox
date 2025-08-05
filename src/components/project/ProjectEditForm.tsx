import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Project, Client } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

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

interface ProjectEditFormProps {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => void;
}

const mockClients: Client[] = [
  { id: '1', name: 'John Smith', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1-555-0123', classification: 'Canopy', created_at: '', updated_at: '' },
  { id: '2', name: 'Sarah Johnson', company: 'Event Solutions', email: 'sarah@eventsolutions.com', phone: '+1-555-0124', classification: 'Direct', created_at: '', updated_at: '' },
  { id: '3', name: 'Mike Davis', company: 'Festival Group', email: 'mike@festivalgroup.com', phone: '+1-555-0125', classification: 'Partner', created_at: '', updated_at: '' }
];

export function ProjectEditForm({ project, onClose, onSave }: ProjectEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      console.log('Updating project:', data);
      toast.success('Project updated successfully!');
      onSave({ ...project, ...data } as Project);
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Event Type */}
              <div className="md:col-span-2">
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
            </div>
          </div>

          {/* Event Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  On-site Start Date
                </label>
                <input
                  {...register('onsite_start_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  On-site End Date
                </label>
                <input
                  {...register('onsite_end_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Start Date
                </label>
                <input
                  {...register('show_start_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show End Date
                </label>
                <input
                  {...register('show_end_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load In Date
                </label>
                <input
                  {...register('load_in_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load Out Date
                </label>
                <input
                  {...register('load_out_date')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sales & Voucher Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales & Voucher Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voucher Sale Start
                </label>
                <input
                  {...register('voucher_sale_start')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voucher Sale End
                </label>
                <input
                  {...register('voucher_sale_end')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TopUp Start
                </label>
                <input
                  {...register('topup_start')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TopUp End
                </label>
                <input
                  {...register('topup_end')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Window Start
                </label>
                <input
                  {...register('refund_window_start')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Window End
                </label>
                <input
                  {...register('refund_window_end')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wristband Order Deadline
                </label>
                <input
                  {...register('wristband_order_deadline')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address On-Site
                </label>
                <textarea
                  {...register('delivery_address')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter delivery address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  {...register('delivery_contact_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  {...register('delivery_contact_phone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  {...register('delivery_contact_email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                />
              </div>
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              Update Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}