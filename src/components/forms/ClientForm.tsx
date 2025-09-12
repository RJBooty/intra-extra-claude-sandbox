import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Client } from '../../types';
import { createClientRecord } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  classification: z.enum(['Canopy', 'Direct', 'Partner', 'Vendor']),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onClose: () => void;
  onClientCreated: (client: Client) => void;
}

export function ClientForm({ onClose, onClientCreated }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      classification: 'Canopy',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      console.log('👤 ClientForm: Starting client creation...');
      console.log('👤 ClientForm: Form data:', data);
      console.log('👤 ClientForm: About to call createClientRecord...');
      
      const newClient = await createClientRecord(data);
      
      console.log('✅ ClientForm: Client created successfully:', newClient);
      
      toast.success('Client created successfully!');
      reset();
      onClientCreated(newClient);
      onClose();
    } catch (error) {
      console.error('❌ ClientForm: Error creating client:', error);
      console.error('❌ ClientForm: Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      toast.error(`Failed to create client: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Client</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name *
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact name"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company *
            </label>
            <input
              {...register('company')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter company name"
            />
            {errors.company && (
              <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          </div>

          {/* Classification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classification *
            </label>
            <select
              {...register('classification')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Canopy">Canopy</option>
              <option value="Direct">Direct</option>
              <option value="Partner">Partner</option>
              <option value="Vendor">Vendor</option>
            </select>
            {errors.classification && (
              <p className="text-red-600 text-sm mt-1">{errors.classification.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              Create Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}