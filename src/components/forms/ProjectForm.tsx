import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, X, Upload, Image } from 'lucide-react';
import { Client, Project } from '../../types';
import { getClients, createProject } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ClientForm } from './ClientForm';
import { previewProjectCode, validateProjectCode, getCountryCode, parseLocation, isSameCountry } from '../../lib/projectCode';

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
  const [previewCode, setPreviewCode] = useState<string>('');
  const [lastCountryCode, setLastCountryCode] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Generate preview code when country changes (but don't reserve it)
  useEffect(() => {
    const generatePreview = async () => {
      if (!eventLocation || eventLocation.trim() === '') {
        setPreviewCode('');
        setValue('project_code', '');
        setLastCountryCode('');
        return;
      }

      const parsed = parseLocation(eventLocation);
      const currentCountryCode = parsed.countryCode;
      
      // Only generate new preview if country actually changed
      if (currentCountryCode !== lastCountryCode) {
        setIsGeneratingPreview(true);
        try {
          const preview = await previewProjectCode(eventLocation);
          setPreviewCode(preview);
          setValue('project_code', preview);
          setLastCountryCode(currentCountryCode);
        } catch (error) {
          console.error('Error generating preview code:', error);
          // Fallback to basic format
          const fallback = `${currentCountryCode}-0001`;
          setPreviewCode(fallback);
          setValue('project_code', fallback);
          setLastCountryCode(currentCountryCode);
        } finally {
          setIsGeneratingPreview(false);
        }
      }
    };

    // Debounce the preview generation to avoid too many calls
    const timeout = setTimeout(generatePreview, 300);
    return () => clearTimeout(timeout);
  }, [eventLocation, setValue, lastCountryCode]);

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
      let eventImageUrl = '';
      
      // Convert file to data URL if a file is selected
      if (selectedFile) {
        eventImageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }

      const projectData = {
        ...data,
        // TODO: Re-enable when event_image column is added to database
        event_image: eventImageUrl || undefined,
        current_phase: 1,
        phase_progress: 25,
        status: 'Active' as const,
        // The backend will reserve the actual project code during creation
        project_code: undefined, // Let backend handle code generation
      };

      const newProject = await createProject(projectData);
      toast.success('Project created successfully!');
      reset();
      setPreviewCode('');
      setLastCountryCode('');
      removeFile();
      onProjectCreated?.(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      if (error instanceof Error && error.message.includes('project code')) {
        toast.error('Failed to generate unique project code. Please try again.');
      } else {
        toast.error('Failed to create project. Please try again.');
      }
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
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
            Project Code (Preview)
          </p>
          <div className="flex gap-2">
            <input
              {...register('project_code')}
              value={previewCode}
              readOnly
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border border-[#d4dbe2] bg-gray-100 focus:border-blue-500 h-14 placeholder:text-[#5c728a] p-[15px] text-base font-normal leading-normal"
              placeholder={isGeneratingPreview ? "Generating preview..." : "Enter location to preview code"}
            />
            <button
              type="button"
              onClick={async () => {
                if (eventLocation) {
                  setIsGeneratingPreview(true);
                  try {
                    const code = await previewProjectCode(eventLocation);
                    setPreviewCode(code);
                    setValue('project_code', code);
                    toast.success('Project code preview updated');
                  } catch (error) {
                    toast.error('Failed to generate preview');
                  } finally {
                    setIsGeneratingPreview(false);
                  }
                } else {
                  toast.error('Please enter event location first');
                }
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium disabled:bg-gray-200 disabled:text-gray-500"
              disabled={!eventLocation || isGeneratingPreview}
            >
              {isGeneratingPreview ? 'Loading...' : 'Refresh Preview'}
            </button>
          </div>
          <p className="text-[#5c728a] text-sm mt-1">
            📋 Preview only - actual code assigned on creation. Format: {getCountryCode(eventLocation || '')}-#### (e.g., GB-0001, ES-0001).
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

      {/* Event Image */}
      <div className="flex max-w-[480px] flex-wrap items-start gap-4 px-4 py-3">
        <div className="flex flex-col min-w-40 flex-1">
          <p className="text-[#101418] text-base font-medium leading-normal pb-2">
            Event Image
          </p>
          
          {!selectedFile ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          ) : (
            <div className="relative">
              <div className="w-full h-32 border-2 border-gray-200 rounded-xl overflow-hidden">
                <img
                  src={previewUrl || ''}
                  alt="Event preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Image className="w-4 h-4 mr-2" />
                <span className="truncate">{selectedFile.name}</span>
                <span className="ml-2 text-gray-400">
                  ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
            </div>
          )}
          
          <p className="text-[#5c728a] text-sm mt-2">
            Optional: Upload an image that represents your event
          </p>
        </div>
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