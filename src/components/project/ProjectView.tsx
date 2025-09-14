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
  const [currentProject, setCurrentProject] = useState<Project>(project);

  // Handle project updates from child components
  const handleProjectUpdate = (updatedProject: Project) => {
    setCurrentProject(updatedProject);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'core-info':
        return (
          <CoreInfoPage 
            project={currentProject} 
            onProjectUpdate={handleProjectUpdate}
          />
        );
      case 'roi3':
        return <ROI3 project={currentProject} />;
      case 'logistics':
        return <Logistics project={currentProject} />;
      case 'operations':
        return <OperationsPipeline project={currentProject} />;
      case 'crew':
        return <CrewManagement project={currentProject} />;
      case 'client-relations':
        return <ClientRelations project={currentProject} />;
      case 'notifications':
        return <ProjectNotifications project={currentProject} />;
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
            <div className="border-l border-gray-200 pl-4">
              <h1 className="text-xl font-bold text-gray-900">
                {currentProject.project_id} - {currentProject.project_code}
              </h1>
              <p className="text-sm text-gray-600">
                {currentProject.event_location} • {currentProject.client?.company}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-gray-200 mt-4 -mb-4">
          {projectTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
}