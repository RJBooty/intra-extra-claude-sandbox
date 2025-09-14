import React, { useState } from 'react';
import { Project } from '../../types';
import { Search, Plus, Phone, Mail, Calendar, MessageCircle, User, Building, Star, Edit, MessageSquare, AlertTriangle, FileText } from 'lucide-react';
import { InternalDebrief } from './client-relations/InternalDebrief';

interface ClientRelationsProps {
  project: Project;
}

type ClientRelationsTab = 'internal-debrief' | 'client-feedback' | 'incidents-review' | 'summary-actions';

const clientRelationsTabs = [
  { id: 'internal-debrief' as ClientRelationsTab, label: 'Internal Debrief', icon: Edit },
  { id: 'client-feedback' as ClientRelationsTab, label: 'Client Feedback', icon: MessageSquare },
  { id: 'incidents-review' as ClientRelationsTab, label: 'Incidents Review', icon: AlertTriangle },
  { id: 'summary-actions' as ClientRelationsTab, label: 'Summary & Actions', icon: FileText },
];

export function ClientRelations({ project }: ClientRelationsProps) {
  const [activeTab, setActiveTab] = useState<ClientRelationsTab>('internal-debrief');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'internal-debrief':
        return <InternalDebrief project={project} />;
      case 'client-feedback':
        return (
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Feedback</h2>
                <p className="text-gray-600">This module is under development.</p>
              </div>
            </div>
          </div>
        );
      case 'incidents-review':
        return (
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Incidents Review</h2>
                <p className="text-gray-600">This module is under development.</p>
              </div>
            </div>
          </div>
        );
      case 'summary-actions':
        return (
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Summary & Actions</h2>
                <p className="text-gray-600">This module is under development.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white">
      {/* Sub-tabs Navigation */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6">
        <nav className="-mb-px flex space-x-6">
          {clientRelationsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 
                  whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2
                  ${isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}