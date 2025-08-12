import React, { useState } from 'react';
import { ArrowLeft, Info, Calculator, TrendingUp, FileText, Settings, Bell, Zap, Users, UserCheck } from 'lucide-react';
import { Project } from '../../types';
import { CoreInfoPage } from './CoreInfoPage';
import { ROI3 } from '../roi/ROI3';
import { Logistics } from '../logistics/Logistics';
import { OperationsPipeline } from '../operations/OperationsPipeline';
import { ProjectNotifications } from './ProjectNotifications';
import { CrewManagement } from './CrewManagement';
import { ClientRelations } from './ClientRelations';

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
  onNavigate: (section: string) => void;
}

type ProjectTab = 'core-info' | 'roi3' | 'logistics' | 'operations' | 'crew' | 'client-relations' | 'notifications' | 'documents' | 'timeline' | 'settings';

const projectTabs = [
  { id: 'core-info' as ProjectTab, label: 'Core Info', icon: Info },
  { id: 'roi3' as ProjectTab, label: 'ROI', icon: Calculator },
  { id: 'logistics' as ProjectTab, label: 'Logistics', icon: TrendingUp },
  { id: 'operations' as ProjectTab, label: 'Operations', icon: Zap },
  { id: 'crew' as ProjectTab, label: 'Crew', icon: Users },
  { id: 'client-relations' as ProjectTab, label: 'Client Relations', icon: UserCheck },
  { id: 'notifications' as ProjectTab, label: 'Notifications', icon: Bell },
  { id: 'documents' as ProjectTab, label: 'Documents', icon: FileText },
  { id: 'timeline' as ProjectTab, label: 'Timeline', icon: TrendingUp },
  { id: 'settings' as ProjectTab, label: 'Settings', icon: Settings },
];

export function ProjectView({ project, onBack, onNavigate }: ProjectViewProps) {
  const [activeTab, setActiveTab] = useState<ProjectTab>('core-info');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'core-info':
        return <CoreInfoPage project={project} />;
      case 'roi3':
        return <ROI3 project={project} />;
      case 'logistics':
        return <Logistics project={project} />;
      case 'operations':
        return <OperationsPipeline project={project} />;
      case 'crew':
        return <CrewManagement project={project} />;
      case 'client-relations':
        return <ClientRelations project={project} />;
      case 'notifications':
        return <ProjectNotifications project={project} />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">This module is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="layout-content-container flex flex-col flex-1 ml-4">
            {/* Project Header - Sticky */}
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-6 py-4 rounded-t-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Projects
                </button>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{project.project_id}</h1>
                  <p className="text-gray-600">{project.event_location} • {project.client?.company}</p>
                </div>
                </div>
                <button
                  onClick={() => onNavigate('projects')}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#b2cbe5] text-[#101418] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#a5c1db] transition-colors"
                >
                  <span className="truncate">Create New Project</span>
                </button>
              </div>
            </div>

            {/* Project Tabs - Sticky */}
            <div className="sticky top-[88px] z-10 border-b border-gray-200 bg-white shadow-sm">
              <div className="px-6">
                <div className="flex gap-1 overflow-x-auto scrollbar-thin">
                  {projectTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                          ${isActive 
                            ? 'border-blue-600 text-blue-600 bg-blue-50' 
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto bg-white">
              {renderTabContent()}
            </div>
    </div>
  );
}