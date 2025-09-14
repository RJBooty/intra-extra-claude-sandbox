import React from 'react';
import { Opportunity } from '../../types';
import { format } from 'date-fns';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface OpportunityListProps {
  opportunities: Opportunity[];
  onOpportunitySelect: (opportunity: Opportunity) => void;
  onOpportunityUpdate: (opportunity: Opportunity) => void;
}

export function OpportunityList({ opportunities, onOpportunitySelect }: OpportunityListProps) {
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
    <div className="p-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Company</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Event</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stage</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Value</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Temperature</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Event Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {opportunities.map((opportunity) => (
                <tr
                  key={opportunity.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onOpportunitySelect(opportunity)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{opportunity.company_name}</div>
                      <div className="text-sm text-gray-500">{opportunity.client_tier}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{opportunity.event_name}</div>
                    <div className="text-sm text-gray-500">{opportunity.event_type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStageColor(opportunity.stage)}`}>
                      {opportunity.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">€{opportunity.deal_value.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTemperatureColor(opportunity.temperature)}`}>
                      {opportunity.temperature}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {opportunity.event_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{format(new Date(opportunity.event_date), 'MMM dd, yyyy')}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">{opportunity.lead_score}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-purple-600 h-1 rounded-full"
                          style={{ width: `${Math.min(opportunity.lead_score, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {opportunity.owner?.name || 'Unassigned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {opportunities.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500">Create your first opportunity to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}