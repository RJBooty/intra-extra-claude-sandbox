import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { Client, Project } from '../../types';
import { getClients, createProject } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ClientForm } from './ClientForm';
import { generateProjectCode, validateProjectCode } from '../../lib/projectCode';

const projectSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  project_code: z.string().optional(),
  client_id: z.string().min(1, 'Client selection is required'),
  event_location: z.string().min(1, 'Event location is required'),
  event_start_date: z.string().min(1, 'Start date is required'),
  event_end_date: z.string().min(1, 'End date is required'),
  expected_attendance: z.number().min(1, 'Expected attendance must be greater than 0'),
  event_type: z.enum(['Conference', 'Festival', 'Exhibition', 'Sports', 'Corporate', 'Other']),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onProjectCreated?: (project: Project) => void;
}

export function ProjectForm({ onProjectCreated }: ProjectFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      event_type: 'Conference',
    },
  });

  const watchedFields = watch();
  const eventLocation = watch('event_location');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    // Generate project code when location changes
    const generateCode = async () => {
      if (eventLocation && eventLocation.trim() !== '') {
        const code = await generateProjectCode(eventLocation);
        setGeneratedCode(code);
        setValue('project_code', code);
      }
    };
    generateCode();
  }, [eventLocation, setValue]);

  const loadClients = async () => {
    try {
      console.log('📋 ProjectForm: Loading clients from database...');
      const clientData = await getClients();
      console.log('✅ ProjectForm: Successfully loaded', clientData?.length || 0, 'clients');
      setClients(clientData || []);
    } catch (error) {
      console.error('❌ ProjectForm: Error loading clients:', error);
      if (error instanceof Error) {
        console.error('📝 Error details:', error.message);
      }
      toast.error('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      // Ensure project code is set
      if (!data.project_code) {
        data.project_code = await generateProjectCode(data.event_location);
      }

      const projectData = {
        ...data,
        current_phase: 1,
        phase_progress: 25,
        status: 'Active' as const,
      };

      const newProject = await createProject(projectData);
      toast.success('Project created successfully!');
      reset();
      setGeneratedCode('');
      onProjectCreated?.(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientCreated = (newClient: Client) => {
    console.log('✅ New client created, adding to list:', newClient);
    setClients(prev => [newClient, ...prev]);
    // Auto-select the newly created client
    setValue('client_id', newClient.id);
    toast.success(`Client "${newClient.company}" added and selected`);
  };

  const generateProjectId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PR-CAS-${year}${month}${day}-${random}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Project ID */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#101418] text-base font-medium leading-normal pb-2">
            Project ID *
          </p>
          <div className="flex gap-2">
            <input
              {...register('project_id')}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal"
              placeholder="Enter project ID"
            />
            <button
              type="button"
              onClick={() => {
                const newId = generateProjectId();
                setValue('project_id', newId);
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Generate
            </button>
          </div>
          {errors.project_id && (
            <p className="text-red-600 text-sm mt-1">{errors.project_id.message}</p>
          )}
        </label>
      </div>

      {/* Client Selection */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#101418] text-base font-medium leading-normal pb-2">
            Client *
          </p>
          <div className="flex gap-2">
            <select
              {...register('client_id')}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-50 focus:border-blue-500 h-14 bg-[image:--select-button-svg] placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal"
              disabled={isLoadingClients}
            >
              <option value="">
                {isLoadingClients ? 'Loading clients...' : 'Select Client'}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowClientForm(true)}
              className="flex items-center justify-center w-14 h-14 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
              title="Add New Client"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {errors.client_id && (
            <p className="text-red-600 text-sm mt-1">{errors.client_id.message}</p>
          )}
        </label>
      </div>

      {/* Event Location */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#101418] text-base font-medium leading-normal pb-2">
            Event Location (City, Country) *
          </p>
          <input
            {...register('event_location')}
            placeholder="Enter Location (City, Country)"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal"
          />
          {errors.event_location && (
            <p className="text-red-600 text-sm mt-1">{errors.event_location.message}</p>
          )}
        </label>
      </div>

      {/* Project Code */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#101418] text-base font-medium leading-normal pb-2">
            Project Code (Auto-generated)
          </p>
          <div className="flex gap-2">
            <input
              {...register('project_code')}
              value={generatedCode}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-100 focus:border-blue-500 h-14 placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal"
              placeholder="Enter location first to generate code"
            />
            <button
              type="button"
              onClick={async () => {
                if (eventLocation) {
                  const code = await generateProjectCode(eventLocation);
                  setGeneratedCode(code);
                  setValue('project_code', code);
                  toast.success('New project code generated');
                } else {
                  toast.error('Please enter event location first');
                }
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium"
              disabled={!eventLocation}
            >
              Regenerate
            </button>
          </div>
          <p className="text-[#5c728a] text-sm mt-1">
            Format: REGION-#### (e.g., UK-0001). Can be edited if needed.
          </p>
        </label>
      </div>

      {/* Event Dates */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#101418] text-base font-medium leading-normal pb-2">
            Event Start Date *
          </p>
          <input
            {...register('event_start_date')}
            type="date"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal"
          />
          {errors.event_start_date && (
            <p className="text-red-600 text-sm mt-1">{errors.event_start_date.message}</p>
          )}
        </label>
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#101418] text-base font-medium leading-normal pb-2">
            Event End Date *
          </p>
          <input
            {...register('event_end_date')}
            type="date"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal"
          />
          {errors.event_end_date && (
            <p className="text-red-600 text-sm mt-1">{errors.event_end_date.message}</p>
          )}
        </label>
      </div>

      {/* Expected Attendance */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#101418] text-base font-medium leading-normal pb-2">
            Expected Attendance *
          </p>
          <input
            {...register('expected_attendance', { valueAsNumber: true })}
            type="number"
            placeholder="Enter Attendance"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-50 focus:border-blue-500 h-14 placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal"
          />
          {errors.expected_attendance && (
            <p className="text-red-600 text-sm mt-1">{errors.expected_attendance.message}</p>
          )}
        </label>
      </div>

      {/* Classification */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#101418] text-base font-medium leading-normal pb-2">
            Event Type *
          </p>
          <select
            {...register('event_type')}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-50 focus:border-blue-500 h-14 bg-[image:--select-button-svg] placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal"
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
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-stretch px-4 py-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating Project...
            </>
          ) : (
            'Create Project'
          )}
        </button>
      </div>

      {/* Client Form Modal */}
      {showClientForm && (
        <ClientForm
          onClose={() => setShowClientForm(false)}
          onClientCreated={handleClientCreated}
        />
      )}
    </form>
  );
}