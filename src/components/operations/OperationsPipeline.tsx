import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle, CheckCircle, Clock, FileText, Settings, Zap } from 'lucide-react';
import { Project } from '../../types';
import { ProjectPhase, TeamMember, IntegrationStatus, KeyDocument, ProjectTimeline } from '../../types/operations';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { OverviewTab } from './OverviewTab';
import { TasksTab } from './TasksTab';
import { PhaseTab } from './PhaseTab';
import { getProjectPhases, getProjectTeam, getIntegrationStatus, getProjectTimeline } from '../../lib/operations-api';
import toast from 'react-hot-toast';

interface OperationsPipelineProps {
  project?: Project;
}

type OperationsTab = 'overview' | 'tasks' | 'discover' | 'build' | 'prepare' | 'deliver' | 'roundup';

export function OperationsPipeline({ project }: OperationsPipelineProps) {
  const [activeTab, setActiveTab] = useState<OperationsTab>('overview');
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contractWarning, setContractWarning] = useState(false);

  useEffect(() => {
    if (project) {
      loadOperationsData();
      checkContractualCompletion();
    }
  }, [project]);

  const loadOperationsData = async () => {
    if (!project) return;
    
    try {
      setIsLoading(true);
      console.log('🔧 Loading operations data for project:', project.id);
      
      const [phasesData, teamData, integrationData, timelineData] = await Promise.all([
        getProjectPhases(project.id),
        getProjectTeam(project.id),
        getIntegrationStatus(project.id),
        getProjectTimeline(project.id)
      ]);
      
      setPhases(phasesData || []);
      setTeam(teamData || []);
      setIntegrationStatus(integrationData);
      setTimeline(timelineData);
      
      console.log('✅ Operations data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading operations data:', error);
      toast.error('Failed to load operations data');
    } finally {
      setIsLoading(false);
    }
  };

  const checkContractualCompletion = () => {
    // Check if contract is signed and SOW is approved
    // This would come from the Sales Pipeline module
    const hasContract = true; // Mock - would check project.contract_signed
    const hasSOW = true; // Mock - would check project.sow_approved
    
    if (!hasContract || !hasSOW) {
      setContractWarning(true);
    }
  };

  const handlePhaseUpdate = (updatedPhase: ProjectPhase) => {
    setPhases(prev => prev.map(phase => 
      phase.id === updatedPhase.id ? updatedPhase : phase
    ));
  };

  const tabs = [
    { id: 'overview' as OperationsTab, label: 'Overview', icon: Calendar },
    { id: 'tasks' as OperationsTab, label: 'Tasks', icon: CheckCircle },
    { id: 'discover' as OperationsTab, label: 'Discover', icon: Users },
    { id: 'build' as OperationsTab, label: 'Build', icon: Settings },
    { id: 'prepare' as OperationsTab, label: 'Prepare', icon: Clock },
    { id: 'deliver' as OperationsTab, label: 'Deliver', icon: Zap },
    { id: 'roundup' as OperationsTab, label: 'Roundup', icon: FileText },
  ];

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            project={project}
            phases={phases}
            team={team}
            integrationStatus={integrationStatus}
            timeline={timeline}
            onPhaseUpdate={handlePhaseUpdate}
          />
        );
      case 'tasks':
        return (
          <TasksTab
            project={project}
            phases={phases}
          />
        );
      case 'discover':
      case 'build':
      case 'prepare':
      case 'deliver':
      case 'roundup':
        const currentPhase = phases.find(p => p.phase_name === activeTab);
        return (
          <PhaseTab
            project={project}
            phase={currentPhase}
            onPhaseUpdate={handlePhaseUpdate}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project to view operations pipeline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#101418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Operations Pipeline
        </p>
      </div>

      {/* Contract Warning Banner */}
      {contractWarning && (
        <div className="mx-4 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Warning: Contractual Elements Incomplete</h3>
              <p className="text-sm text-yellow-700">
                Contract signature and SOW approval are required before operations can begin.
              </p>
            </div>
            <button
              onClick={() => setContractWarning(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="pb-3">
        <div className="flex border-b border-[#d0dbe7] px-4 gap-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-b-[#197ce5] text-[#0e141b]'
                    : 'border-b-transparent text-[#4e7297] hover:text-[#0e141b]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${isActive ? 'text-[#0e141b]' : 'text-[#4e7297]'}`}>
                    {tab.id === 'tasks' ? 'All Tasks' : tab.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}