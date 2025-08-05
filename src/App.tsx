import React, { useState } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/layout/Dashboard';
import { Header } from './components/layout/Header';
import { ProjectView } from './components/project/ProjectView';
import { ProjectForm } from './components/forms/ProjectForm';
import { PhaseTracker } from './components/project/PhaseTracker';
import { DocumentManager } from './components/project/DocumentManager';
import { ProjectMetadata } from './components/project/ProjectMetadata';
import { SalesPipeline } from './components/sales/SalesPipeline';
import { Toast } from './components/ui/Toast';
import { Sidebar } from './components/layout/Sidebar';
import { SettingsHoldingPage } from './components/settings/SettingsHoldingPage';
import { TeamPage } from './components/team/TeamPage';
import { ProjectsList } from './components/project/ProjectsList';
import { GuardsPage } from './components/guards/GuardsPage';
import { Project } from './types';

type TabId = 'projects' | 'sales' | 'roi' | 'operations' | 'clients' | 'marketing' | 'support' | 'analytics' | 'settings' | 'guards';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isDevelopment = import.meta.env.DEV;

  // Development bypass for authentication
  React.useEffect(() => {
    if (isDevelopment) {
      setIsAuthenticated(true);
    }
  }, [isDevelopment]);

  const [currentView, setCurrentView] = useState<'dashboard' | 'app'>('dashboard');
  const [activeTab, setActiveTab] = useState<TabId>('projects');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProjectCreated = (project: Project) => {
    setCurrentProject(project);
    setShowProjectDetail(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  const handleNavigate = (section: string) => {
    console.log('=== HANDLE NAVIGATE CALLED ===');
    console.log('Section requested:', section);
    console.log('Before navigation - currentView:', currentView);
    console.log('Before navigation - activeTab:', activeTab);
    console.log('Before navigation - showProjectDetail:', showProjectDetail);
    console.log('Before navigation - currentProject:', currentProject?.id || 'null');
    
    console.log('🧭 Navigation requested:', section);
    
    if (section === 'dashboard') {
      console.log('>>> DASHBOARD NAVIGATION PATH');
      setCurrentView('dashboard');
      setShowProjectDetail(false);
      setCurrentProject(null);
    } else if (section === 'new-project') {
      console.log('>>> NEW PROJECT NAVIGATION PATH');
      setCurrentView('app');
      setActiveTab('new-project');
      setShowProjectDetail(true);
      setCurrentProject(null);
    } else if (section === 'projects') {
      console.log('>>> PROJECTS NAVIGATION PATH');
      console.log('🎯 Projects navigation - setting view to app with projects tab');
      // Use batch state update to prevent timing issues
      setCurrentView('app');
      setActiveTab('projects');
      setShowProjectDetail(false);
      setCurrentProject(null);
    } else {
      console.log('>>> OTHER SECTION NAVIGATION PATH');
      // All other sections go directly to app view
      setCurrentView('app');
      
      // Map sections to their corresponding tabs
      if (section === 'sales') {
        console.log('Setting activeTab to: sales');
        setActiveTab('sales');
      } else if (section === 'team') {
        console.log('Setting activeTab to: team');
        setActiveTab('team');
      } else if (section === 'clients') {
        console.log('Setting activeTab to: clients');
        setActiveTab('clients');
      } else if (section === 'reports') {
        console.log('Setting activeTab to: analytics');
        setActiveTab('analytics');
      } else if (section === 'settings') {
        console.log('Setting activeTab to: settings');
        setActiveTab('settings');
      } else if (section === 'guards') {
        console.log('Setting activeTab to: guards');
        setActiveTab('guards');
      } else {
        console.log('Setting activeTab to: projects (default)');
        // Default fallback
        setActiveTab('projects');
      }
      
      setShowProjectDetail(false);
      setCurrentProject(null);
    }
    
    // Log state after navigation (will show in next render)
    // Remove setTimeout to prevent confusion in logs
    console.log('Navigation state changes queued');
    console.log('=== END HANDLE NAVIGATE ===');
    
    console.log('🎯 Navigation completed:', { 
      currentView,
      activeTab,
      showProjectDetail: section === 'new-project'
    });
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  // Show dashboard view
  if (currentView === 'dashboard') {
    console.log('🎯 RENDERING DASHBOARD VIEW');
    console.log('currentView:', currentView);
    console.log('activeTab:', activeTab);
    return <Dashboard onNavigate={handleNavigate} />;
  }

  console.log('🎯 RENDERING APP VIEW');
  console.log('currentView:', currentView);
  console.log('activeTab:', activeTab);
  console.log('showProjectDetail:', showProjectDetail);

  // Show main application view
  const renderTabContent = () => {
    console.log('🎯 RENDER TAB CONTENT CALLED');
    console.log('activeTab:', activeTab);
    console.log('showProjectDetail:', showProjectDetail);
    console.log('currentProject:', currentProject?.id || 'null');
    
    // Show project detail view if a project is selected
    if (showProjectDetail && currentProject) {
      console.log('>>> RENDERING PROJECT DETAIL VIEW');
      return (
        <ProjectView
          project={currentProject}
          onBack={() => setShowProjectDetail(false)}
          onNavigate={handleNavigate}
        />
      );
    }

    switch (activeTab) {
      case 'projects':
        console.log('>>> PROJECTS TAB CASE');
        console.log('>>> RENDERING PROJECTS LIST');
        return (
        <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
          <div className="layout-container flex h-full grow flex-col">
            <div className="gap-1 px-3 flex flex-1 justify-start py-5">
            {/* Persistent Sidebar */}
            <Sidebar currentView="projects" onNavigate={handleNavigate} />
            
            <div className="layout-content-container flex flex-col flex-1 ml-4">
              <ProjectsList onNavigate={handleNavigate} />
            </div>
            </div>
          </div>
          </div>
        );
      
      case 'new-project':
        console.log('>>> NEW PROJECT FORM CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView="projects" onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <div className="flex flex-wrap justify-between gap-3 p-4">
                    <h1 className="text-[#101418] tracking-light text-[32px] font-bold leading-tight min-w-72">
                      New Project
                    </h1>
                  </div>

                  {/* Project Form */}
                  <ProjectForm onProjectCreated={handleProjectCreated} />

                  {/* Phase Tracker */}
                  <PhaseTracker 
                    currentPhase={currentProject?.current_phase || 1}
                    phaseProgress={currentProject?.phase_progress || 25}
                  />

                  {/* Document Management */}
                  <DocumentManager projectId={currentProject?.id} />
                </div>

                {/* Project Metadata Sidebar */}
                <ProjectMetadata project={currentProject} />
              </div>
            </div>
          </div>
        );
      
      case 'sales':
        console.log('>>> SALES TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView="sales" onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <SalesPipeline />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'roi':
        console.log('>>> ROI TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="flex-1 ml-4">
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">ROI Analysis</h2>
                      <p className="text-gray-600">ROI analysis is available in the project view under ROI3 tab.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'team':
        console.log('>>> TEAM TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <TeamPage onNavigate={handleNavigate} />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'guards':
        console.log('>>> GUARDS TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <GuardsPage onNavigate={handleNavigate} />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        console.log('>>> DEFAULT TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  {activeTab === 'settings' ? (
                    <SettingsHoldingPage onNavigate={handleNavigate} />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
                        <p className="text-gray-600">This module is under development.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
      <Toast />
      
      <div className="layout-container flex h-full grow flex-col">
        <Header onSearch={handleSearch} onNavigateToDashboard={() => setCurrentView('dashboard')} />
        
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default App;