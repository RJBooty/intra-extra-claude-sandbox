import React from 'react';
import { House, Folder, Users, Users as UsersThree, Presentation as PresentationChart, BarChart3, Settings, Section as Security } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (section: string) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const handleProjectsClick = () => {
    console.log('=== PROJECTS SIDEBAR CLICKED ===');
    console.log('Current currentView before click:', currentView);
    console.log('Calling onNavigate with: "projects"');
    onNavigate('projects');
    console.log('=== END PROJECTS SIDEBAR CLICK ===');
  };

  const handleSalesClick = () => {
    console.log('=== SALES SIDEBAR CLICKED (for comparison) ===');
    console.log('Current currentView before click:', currentView);
    console.log('Calling onNavigate with: "sales"');
    onNavigate('sales');
    console.log('=== END SALES SIDEBAR CLICK ===');
  };

  const handleDashboardClick = () => {
    console.log('=== DASHBOARD SIDEBAR CLICKED (for comparison) ===');
    console.log('Current currentView before click:', currentView);
    console.log('Calling onNavigate with: "dashboard"');
    onNavigate('dashboard');
    console.log('=== END DASHBOARD SIDEBAR CLICK ===');
  };

  return (
    <div className="layout-content-container flex flex-col w-40">
      <div className="flex h-full min-h-[700px] flex-col justify-between bg-gray-50 p-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[#101418] text-base font-medium leading-normal">IntraExtra</h1>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleDashboardClick}
              className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                currentView === 'dashboard' 
                  ? 'rounded-full bg-[#eaedf1]' 
                  : 'hover:bg-gray-100 rounded-lg'
              }`}
            >
              <House className="w-6 h-6 text-[#101418]" />
              <p className="text-[#101418] text-sm font-medium leading-normal">Dashboard</p>
            </button>
            
            <button
              onClick={handleSalesClick}
              className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                currentView === 'sales' 
                  ? 'rounded-full bg-[#eaedf1]' 
                  : 'hover:bg-gray-100 rounded-lg'
              }`}
            >
              <PresentationChart className="w-6 h-6 text-[#101418]" />
              <p className="text-[#101418] text-sm font-medium leading-normal">Pipeline</p>
            </button>
            
            <button
              onClick={handleProjectsClick}
              className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                currentView === 'projects'
                  ? 'rounded-full bg-[#eaedf1]' 
                  : 'hover:bg-gray-100 rounded-lg'
              }`}
            >
              <Folder className="w-6 h-6 text-[#101418]" />
              <p className="text-[#101418] text-sm font-medium leading-normal">Projects</p>
            </button>
            
            <button
              onClick={() => onNavigate('clients')}
              className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                currentView === 'clients' 
                  ? 'rounded-full bg-[#eaedf1]' 
                  : 'hover:bg-gray-100 rounded-lg'
              }`}
            >
              <Users className="w-6 h-6 text-[#101418]" />
              <p className="text-[#101418] text-sm font-medium leading-normal">Clients</p>
            </button>
            
            <button
              onClick={() => onNavigate('team')}
              className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                currentView === 'team' 
                  ? 'rounded-full bg-[#eaedf1]' 
                  : 'hover:bg-gray-100 rounded-lg'
              }`}
            >
              <UsersThree className="w-6 h-6 text-[#101418]" />
              <p className="text-[#101418] text-sm font-medium leading-normal">Team</p>
            </button>
            
            <button
              onClick={() => onNavigate('guards')}
              className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                currentView === 'guards' 
                  ? 'rounded-full bg-[#eaedf1]' 
                  : 'hover:bg-gray-100 rounded-lg'
              }`}
            >
              <Security className="w-6 h-6 text-[#101418]" />
              <p className="text-[#101418] text-sm font-medium leading-normal">Guards</p>
            </button>
            
            <button
              onClick={() => onNavigate('reports')}
              className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                currentView === 'reports' 
                  ? 'rounded-full bg-[#eaedf1]' 
                  : 'hover:bg-gray-100 rounded-lg'
              }`}
            >
              <BarChart3 className="w-6 h-6 text-[#101418]" />
              <p className="text-[#101418] text-sm font-medium leading-normal">Reports</p>
            </button>
            
            <button
              onClick={() => onNavigate('settings')}
              className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                currentView === 'settings' 
                  ? 'rounded-full bg-[#eaedf1]' 
                  : 'hover:bg-gray-100 rounded-lg'
              }`}
            >
              <Settings className="w-6 h-6 text-[#101418]" />
              <p className="text-[#101418] text-sm font-medium leading-normal">Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}