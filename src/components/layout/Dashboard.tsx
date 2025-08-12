import React, { useState } from 'react';
import { HomeDashboard } from './HomeDashboard';
import { ProjectsList } from '../project/ProjectsList';
import { Header } from './Header';
import { Sidebar } from './Sidebar';


interface DashboardProps {
  onNavigate: (section: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [currentView, setCurrentView] = useState<'home' | 'projects'>('home');


  // Show home dashboard when Dashboard is selected
  if (currentView === 'home') {
    return <HomeDashboard onNavigate={(section) => {
      if (section === 'dashboard') {
        setCurrentView('home');
      } else if (section === 'projects') {
        setCurrentView('projects');
      } else {
        onNavigate(section);
      }
    }} />;
  }


  // Show projects view - use the same component as App.tsx
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header onSearch={() => {}} onNavigateToDashboard={() => setCurrentView('home')} />
        <div className="gap-1 px-3 flex flex-1 justify-start py-5">
          {/* Persistent Sidebar */}
          <Sidebar 
            currentView="projects" 
            onNavigate={onNavigate}
          />

          {/* Main Content - Use ProjectsList component for consistency */}
          <div className="layout-content-container flex flex-col flex-1 ml-4">
            <ProjectsList onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
}