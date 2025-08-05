import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, User, Building, TrendingUp, MessageSquare, Phone, Mail, FileText } from 'lucide-react';
import { Opportunity, OpportunityActivity } from '../../types';
import { getOpportunityActivities, createOpportunityActivity, convertOpportunityToProject } from '../../lib/supabase';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface OpportunityDetailsProps {
  opportunity: Opportunity;
  onClose: () => void;
  onUpdate: (opportunity: Opportunity) => void;
}

export function OpportunityDetails({ opportunity, onClose, onUpdate }: OpportunityDetailsProps) {
  const [activities, setActivities] = useState<OpportunityActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [opportunity.id]);

  const loadActivities = async () => {
    try {
      const data = await getOpportunityActivities(opportunity.id);
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const handleConvertToProject = async () => {
    if (opportunity.stage !== 'Contract Signature') {
      toast.error('Opportunity must be in Contract Signature stage to convert');
      return;
    }

    setIsConverting(true);
    try {
      const project = await convertOpportunityToProject(opportunity.id);
      toast.success(`Project ${project.project_id} created successfully!`);
      onUpdate({ ...opportunity, created_project_id: project.id, stage: 'Operations' });
    } catch (error) {
      console.error('Error converting to project:', error);
      toast.error('Failed to convert to project');
    } finally {
      setIsConverting(false);
    }
  };

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'Hot': return 'text-red-600 bg-red-100';
      case 'Warm': return 'text-orange-600 bg-orange-100';
      case 'Cold': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'Contacted': 'bg-gray-100 text-gray-800',
      'Qualified': 'bg-blue-100 text-blue-800',
      'First Meet Scheduled': 'bg-yellow-100 text-yellow-800',
      'Proposal Sent': 'bg-orange-100 text-orange-800',
      'Negotiations': 'bg-purple-100 text-purple-800',
      'Contract Signature': 'bg-green-100 text-green-800',
      'Kickoff': 'bg-emerald-100 text-emerald-800',
      'Operations': 'bg-teal-100 text-teal-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Opportunity Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{opportunity.company_name}</h3>
              <p className="text-gray-600">{opportunity.event_name}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTemperatureColor(opportunity.temperature)}`}>
                {opportunity.temperature}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                {opportunity.stage}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span>${opportunity.deal_value.toLocaleString()} {opportunity.currency}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Score: {opportunity.lead_score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>{opportunity.client_tier}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <span>{opportunity.owner?.name || 'Unassigned'}</span>
            </div>
            {opportunity.event_date && (
              <div className="flex items-center gap-2 col-span-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{format(new Date(opportunity.event_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Win Probability</span>
            <span>{opportunity.win_probability}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${opportunity.win_probability}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {opportunity.stage === 'Contract Signature' && !opportunity.created_project_id && (
            <button
              onClick={handleConvertToProject}
              disabled={isConverting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isConverting && <LoadingSpinner size="sm" />}
              Convert to Project
            </button>
          )}
          
          {opportunity.created_project_id && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Converted to Project: {opportunity.created_project_id}
              </p>
            </div>
          )}
        </div>

        {/* Activities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Activities</h4>
            <button
              onClick={() => setShowActivityForm(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Add Activity
            </button>
          </div>

          {isLoadingActivities ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {activity.activity_type === 'Email' && <Mail className="w-4 h-4 text-blue-600" />}
                    {activity.activity_type === 'Call' && <Phone className="w-4 h-4 text-green-600" />}
                    {activity.activity_type === 'Meeting' && <Calendar className="w-4 h-4 text-purple-600" />}
                    {activity.activity_type === 'Note' && <FileText className="w-4 h-4 text-gray-600" />}
                    <span className="font-medium text-sm">{activity.subject}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              ))}
              
              {activities.length === 0 && (
                <p className="text-center text-gray-500 py-4">No activities yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activity Form Modal */}
      {showActivityForm && (
        <ActivityForm
          opportunityId={opportunity.id}
          onClose={() => setShowActivityForm(false)}
          onSubmit={(activity) => {
            setActivities(prev => [activity, ...prev]);
            setShowActivityForm(false);
            toast.success('Activity added successfully!');
          }}
        />
      )}
    </div>
  );
}

// Activity Form Component
interface ActivityFormProps {
  opportunityId: string;
  onClose: () => void;
  onSubmit: (activity: OpportunityActivity) => void;
}

function ActivityForm({ opportunityId, onClose, onSubmit }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    activity_type: 'Note' as OpportunityActivity['activity_type'],
    subject: '',
    description: '',
    duration: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      const activity = await createOpportunityActivity({
        opportunity_id: opportunityId,
        ...formData,
        created_by: 'current_user', // Replace with actual user ID
      });
      onSubmit(activity as OpportunityActivity);
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Add Activity</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.activity_type}
              onChange={(e) => setFormData(prev => ({ ...prev, activity_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Note">Note</option>
              <option value="Email">Email</option>
              <option value="Call">Call</option>
              <option value="Meeting">Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Activity subject"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Activity details"
              required
            />
          </div>

          {formData.activity_type === 'Call' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
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
              Add Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}