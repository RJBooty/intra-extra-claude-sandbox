import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
import { Opportunity, OpportunityStage, ClientTier, User } from '../../types';
import { createOpportunity, getUsers, calculateLeadScore } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { UserForm } from '../forms/UserForm';
import toast from 'react-hot-toast';

const opportunitySchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  event_name: z.string().min(1, 'Event name is required'),
  deal_value: z.number().min(1, 'Deal value must be greater than 0'),
  currency: z.string().default('USD'),
  stage: z.enum(['Contacted', 'Qualified', 'First Meet Scheduled', 'Proposal Sent', 'Negotiations', 'Contract Signature', 'Kickoff', 'Operations']),
  client_tier: z.enum(['Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest']),
  event_type: z.string().min(1, 'Event type is required'),
  owner_id: z.string().min(1, 'Owner is required'),
  event_date: z.string().optional(),
  decision_date: z.string().optional(),
  win_probability: z.number().min(0).max(100).default(50),
  is_previous_client: z.boolean().default(false),
  budget_confirmed: z.boolean().default(false),
  multiple_events: z.boolean().default(false),
  referral_source: z.string().optional(),
  decision_maker_engaged: z.boolean().default(false),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface OpportunityFormProps {
  onClose: () => void;
  onSubmit: (opportunity: Opportunity) => void;
  opportunity?: Opportunity;
}

export function OpportunityForm({ onClose, onSubmit, opportunity }: OpportunityFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: opportunity ? {
      company_name: opportunity.company_name,
      event_name: opportunity.event_name,
      deal_value: opportunity.deal_value,
      currency: opportunity.currency,
      stage: opportunity.stage,
      client_tier: opportunity.client_tier,
      event_type: opportunity.event_type,
      owner_id: opportunity.owner_id,
      event_date: opportunity.event_date,
      decision_date: opportunity.decision_date,
      win_probability: opportunity.win_probability,
      is_previous_client: opportunity.is_previous_client,
      budget_confirmed: opportunity.budget_confirmed,
      multiple_events: opportunity.multiple_events,
      referral_source: opportunity.referral_source,
      decision_maker_engaged: opportunity.decision_maker_engaged,
    } : {
      stage: 'Contacted',
      client_tier: 'Sapling',
      currency: 'USD',
      win_probability: 50,
      is_previous_client: false,
      budget_confirmed: false,
      multiple_events: false,
      decision_maker_engaged: false,
    }
  });

  const watchedFields = watch();

  useEffect(() => {
    loadUsers();
  }, []);

  // Calculate lead score in real-time
  useEffect(() => {
    const mockOpportunity: Partial<Opportunity> = {
      client_tier: watchedFields.client_tier,
      is_previous_client: watchedFields.is_previous_client,
      budget_confirmed: watchedFields.budget_confirmed,
      event_date: watchedFields.event_date,
      multiple_events: watchedFields.multiple_events,
      referral_source: watchedFields.referral_source,
      decision_maker_engaged: watchedFields.decision_maker_engaged,
    };
    
    const { score } = calculateLeadScore(mockOpportunity);
    // You could display this score in the form if needed
  }, [watchedFields]);

  const loadUsers = async () => {
    try {
      const userData = await getUsers();
      setUsers(userData || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUserCreated = (newUser: User) => {
    console.log('✅ New user created, adding to list:', newUser);
    setUsers(prev => [newUser, ...prev]);
    // Auto-select the newly created user
    setValue('owner_id', newUser.id);
    toast.success(`User "${newUser.name}" added and selected`);
  };

  const onFormSubmit = async (data: OpportunityFormData) => {
    setIsLoading(true);
    try {
      const { score, temperature } = calculateLeadScore(data);
      
      const opportunityData = {
        ...data,
        lead_score: score,
        temperature,
      };

      const newOpportunity = await createOpportunity(opportunityData);
      onSubmit(newOpportunity as Opportunity);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Failed to create opportunity');
    } finally {
      setIsLoading(false);
    }
  };

  const stages: OpportunityStage[] = [
    'Contacted',
    'Qualified',
    'First Meet Scheduled',
    'Proposal Sent',
    'Negotiations',
    'Contract Signature',
    'Kickoff',
    'Operations'
  ];

  const clientTiers: ClientTier[] = ['Seed', 'Sapling', 'Canopy', 'Jungle', 'Rainforest'];

  const eventTypes = [
    'Conference',
    'Festival',
    'Exhibition',
    'Sports',
    'Corporate',
    'Concert',
    'Trade Show',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {opportunity ? 'Edit Opportunity' : 'New Opportunity'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                {...register('company_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
              />
              {errors.company_name && (
                <p className="text-red-600 text-sm mt-1">{errors.company_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                {...register('event_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event name"
              />
              {errors.event_name && (
                <p className="text-red-600 text-sm mt-1">{errors.event_name.message}</p>
              )}
            </div>
          </div>

          {/* Deal Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Value *
              </label>
              <input
                {...register('deal_value', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              {errors.deal_value && (
                <p className="text-red-600 text-sm mt-1">{errors.deal_value.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Win Probability (%)
              </label>
              <input
                {...register('win_probability', { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage *
              </label>
              <select
                {...register('stage')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Tier *
              </label>
              <select
                {...register('client_tier')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {clientTiers.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                {...register('event_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.event_type && (
                <p className="text-red-600 text-sm mt-1">{errors.event_type.message}</p>
              )}
            </div>
          </div>

          {/* Owner and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner *
              </label>
              <div className="flex gap-2">
                <select
                  {...register('owner_id')}
                  disabled={isLoadingUsers}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {isLoadingUsers ? 'Loading...' : 'Select owner'}
                  </option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowUserForm(true)}
                  className="flex items-center justify-center w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  title="Add New Team Member"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {errors.owner_id && (
                <p className="text-red-600 text-sm mt-1">{errors.owner_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <input
                {...register('event_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decision Date
              </label>
              <input
                {...register('decision_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lead Scoring Factors */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Scoring Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  {...register('is_previous_client')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Previous Client</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('budget_confirmed')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Budget Confirmed</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('multiple_events')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Multiple Events</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('decision_maker_engaged')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Decision Maker Engaged</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Source
              </label>
              <input
                {...register('referral_source')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How did they hear about us?"
              />
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
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              {opportunity ? 'Update' : 'Create'} Opportunity
            </button>
          </div>
        </form>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          onClose={() => setShowUserForm(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
}