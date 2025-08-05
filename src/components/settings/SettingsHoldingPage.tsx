import React from 'react';
import { Settings, Wrench, User, Bell, Shield, Database, Palette, Globe, Users } from 'lucide-react';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { SystemSettingsPage } from './SystemSettingsPage';
import { UserProfilePage } from './UserProfilePage';
import { TeamPage } from '../team/TeamPage';

interface SettingsHoldingPageProps {
  onNavigate: (section: string) => void;
}

export function SettingsHoldingPage({ onNavigate }: SettingsHoldingPageProps) {
  const [currentPage, setCurrentPage] = React.useState<'main' | 'profile' | 'system' | 'team' | 'user-profile' | 'input-fields'>('main');

  if (currentPage === 'profile') {
    return <ProfileSettingsPage onBack={() => setCurrentPage('main')} />;
  }

  if (currentPage === 'system') {
    return <SystemSettingsPage onBack={() => setCurrentPage('main')} />;
  }

  if (currentPage === 'team') {
    return <TeamPage onNavigate={onNavigate} />;
  }

  if (currentPage === 'user-profile') {
    return <UserProfilePage onBack={() => setCurrentPage('main')} />;
  }

  const settingsCategories = [
    {
      icon: User,
      title: 'Profile Settings',
      description: 'Manage your personal information and account details',
      status: 'Available',
      onClick: () => setCurrentPage('user-profile')
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure email alerts and system notifications',
      status: 'Coming Soon',
      onClick: () => {}
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Password management and two-factor authentication',
      status: 'Coming Soon',
      onClick: () => {}
    },
    {
      icon: Database,
      title: 'Integrations',
      description: 'Connect external systems like Jira, JUE, and RMS',
      status: 'Coming Soon',
      onClick: () => {}
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize theme, language, and display preferences',
      status: 'Coming Soon',
      onClick: () => {}
    },
    {
      icon: Globe,
      title: 'System',
      description: 'System information, template docs, input fields and data tools',
      status: 'Available',
      onClick: () => setCurrentPage('system')
    }
  ];

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>
            <p className="text-gray-600">
              Configure your account settings, preferences, and system integrations
            </p>
          </div>

          {/* Under Construction Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-yellow-600" />
              <div>
                <h2 className="text-lg font-semibold text-yellow-800">Settings Module Under Development</h2>
                <p className="text-yellow-700 mt-1">
                  We're working hard to bring you comprehensive settings management. 
                  Check back soon for updates!
                </p>
              </div>
            </div>
          </div>

          {/* Settings Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCategories.map((category, index) => {
              const Icon = category.icon;
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={category.onClick}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      category.status === 'Available' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.status}
                    </span>
                    <button
                      disabled={category.status === 'Coming Soon'}
                      className={`text-sm ${
                        category.status === 'Available'
                          ? 'text-blue-600 hover:text-blue-800'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        category.onClick();
                      }}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current System Info */}
          <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Platform Version:</span>
                  <span className="text-sm text-gray-900">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                  <span className="text-sm text-gray-900">January 21, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Environment:</span>
                  <span className="text-sm text-gray-900">Production</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Database Status:</span>
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connected
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Active Users:</span>
                  <span className="text-sm text-gray-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Projects:</span>
                  <span className="text-sm text-gray-900">48</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Need help configuring your settings or have questions?
            </p>
            <button
              onClick={() => onNavigate('support')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}