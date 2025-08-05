import React from 'react';
import { Opportunity } from '../../types';
import { Calendar, DollarSign, Thermometer } from 'lucide-react';
import { format } from 'date-fns';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick: () => void;
}

export function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'Hot': return 'text-red-600 bg-red-100';
      case 'Warm': return 'text-orange-600 bg-orange-100';
      case 'Cold': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDaysUntilEvent = () => {
    if (!opportunity.event_date) return null;
    const eventDate = new Date(opportunity.event_date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilEvent = getDaysUntilEvent();

  return (
    <div
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', opportunity.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {opportunity.company_name}
        </h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTemperatureColor(opportunity.temperature)}`}>
          {opportunity.temperature}
        </span>
      </div>

      {/* Event Name */}
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
        {opportunity.event_name}
      </p>

      {/* Deal Value */}
      <div className="flex items-center gap-1 mb-2">
        <DollarSign className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-gray-900">
          ${opportunity.deal_value.toLocaleString()}
        </span>
        <span className="text-xs text-gray-500">
          {opportunity.currency}
        </span>
      </div>

      {/* Event Date */}
      {opportunity.event_date && (
        <div className="flex items-center gap-1 mb-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-gray-600">
            {format(new Date(opportunity.event_date), 'MMM dd, yyyy')}
          </span>
          {daysUntilEvent !== null && (
            <span className={`text-xs px-1 py-0.5 rounded ${
              daysUntilEvent < 30 ? 'bg-red-100 text-red-700' :
              daysUntilEvent < 90 ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {daysUntilEvent}d
            </span>
          )}
        </div>
      )}

      {/* Lead Score */}
      <div className="flex items-center gap-1">
        <Thermometer className="w-4 h-4 text-purple-600" />
        <span className="text-xs text-gray-600">
          Score: {opportunity.lead_score}
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-1 ml-2">
          <div 
            className="bg-purple-600 h-1 rounded-full transition-all"
            style={{ width: `${Math.min(opportunity.lead_score, 100)}%` }}
          />
        </div>
      </div>

      {/* Client Tier */}
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {opportunity.client_tier}
        </span>
        <span className="text-xs text-gray-500">
          {opportunity.win_probability}% win
        </span>
      </div>
    </div>
  );
}