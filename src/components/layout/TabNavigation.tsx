import React from 'react';
import { FolderOpen, TrendingUp, Calculator, Users, BarChart3, Settings, Headphones, Megaphone, Calendar } from 'lucide-react';

export type TabId = 'projects' | 'sales' | 'roi' | 'clients' | 'marketing' | 'support' | 'analytics' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'projects',
    label: 'Proposal Data Management',
    icon: FolderOpen,
    description: 'Manage project proposals and documentation'
  },
  {
    id: 'sales',
    label: 'Discovery & Sales Pipeline',
    icon: TrendingUp,
    description: 'Track opportunities from contact to conversion'
  },
  {
    id: 'roi',
    label: 'ROI',
    icon: Calculator,
    description: 'Return on investment analysis and calculations'
  },
  {
    id: 'clients',
    label: 'Client Management',
    icon: Users,
    description: 'Manage client relationships and data'
  },
  {
    id: 'marketing',
    label: 'Marketing Automation',
    icon: Megaphone,
    description: 'Automated marketing campaigns and lead nurturing'
  },
  {
    id: 'support',
    label: 'Operations Pipeline',
    icon: Calendar,
    description: 'Event planning and execution management'
  },
  {
    id: 'analytics',
    label: 'Support & Ticketing',
    icon: Headphones,
    description: 'Customer support and issue tracking'
  },
  {
    id: 'settings',
    label: 'Analytics & Reporting',
    icon: BarChart3,
    description: 'Business intelligence and performance metrics'
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: Settings,
    description: 'Platform configuration and user management'
  }
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-[#eaedf1] bg-white">
      <div className="px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = !['projects', 'sales', 'roi'].includes(tab.id);
            
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                  ${isActive 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : isDisabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
                title={isDisabled ? 'Coming Soon' : tab.description}
              >
                <Icon className={`w-4 h-4 ${isDisabled ? 'opacity-50' : ''}`} />
                <span className={isDisabled ? 'opacity-50' : ''}>{tab.label}</span>
                {isDisabled && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}