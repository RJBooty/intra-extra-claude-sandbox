import React, { useState } from 'react';
import { 
  FileCheck, 
  AlertTriangle, 
  Monitor, 
  Settings,
  Play,
  Users,
  Shield,
  Database,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PermissionsTesting } from './PermissionsTesting';
import { TroubleshootingGuide } from './TroubleshootingGuide';
import { PerformanceMonitor } from './PerformanceMonitor';

type TestingTab = 'overview' | 'automated-tests' | 'troubleshooting' | 'performance' | 'documentation';

interface TestingOverviewProps {
  onTabChange: (tab: TestingTab) => void;
}

function TestingOverview({ onTabChange }: TestingOverviewProps) {
  const testingFeatures = [
    {
      id: 'automated-tests',
      title: 'Automated Test Suite',
      description: 'Comprehensive automated tests for all permission scenarios',
      icon: FileCheck,
      color: 'blue',
      features: [
        'Master user workflow validation',
        'Permission enforcement testing',
        'Hierarchical inheritance tests',
        'Bulk operations validation',
        'Advanced features testing'
      ],
      onClick: () => onTabChange('automated-tests')
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Guide',
      description: 'Common issues, symptoms, causes, and solutions',
      icon: AlertTriangle,
      color: 'amber',
      features: [
        'Permission not saving issues',
        'Inheritance problems',
        'Access denied errors',
        'Performance problems',
        'UI state inconsistencies'
      ],
      onClick: () => onTabChange('troubleshooting')
    },
    {
      id: 'performance',
      title: 'Performance Monitor',
      description: 'Real-time performance monitoring and benchmarking',
      icon: Monitor,
      color: 'green',
      features: [
        'Dashboard load time testing',
        'Permission change response time',
        'Bulk operations performance',
        'Memory usage monitoring',
        'Search/filter performance'
      ],
      onClick: () => onTabChange('performance')
    }
  ];

  const testScenarios = [
    {
      id: 'scenario-1',
      title: 'Master User Workflow',
      description: 'Test complete Master user permission management',
      steps: 4,
      duration: '2-3 minutes',
      difficulty: 'Easy'
    },
    {
      id: 'scenario-2',
      title: 'Permission Enforcement',
      description: 'Verify permissions are enforced across user tiers',
      steps: 6,
      duration: '5-7 minutes',
      difficulty: 'Medium'
    },
    {
      id: 'scenario-3',
      title: 'Hierarchical Inheritance',
      description: 'Test permission inheritance and cascading',
      steps: 8,
      duration: '7-10 minutes',
      difficulty: 'Advanced'
    },
    {
      id: 'scenario-4',
      title: 'Bulk Operations',
      description: 'Test bulk permission management features',
      steps: 5,
      duration: '3-5 minutes',
      difficulty: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <FileCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Permissions Testing Suite</h2>
            <p className="text-gray-700">Comprehensive testing tools for the IntraExtra permissions system</p>
          </div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Start</h3>
          <ol className="text-sm text-gray-700 space-y-1">
            <li>1. <strong>Automated Tests</strong> - Run comprehensive test suites to validate all functionality</li>
            <li>2. <strong>Performance Monitor</strong> - Check system performance under various loads</li>
            <li>3. <strong>Troubleshooting</strong> - Reference guide for common issues and solutions</li>
            <li>4. <strong>Manual Testing</strong> - Follow step-by-step testing scenarios</li>
          </ol>
        </div>
      </div>

      {/* Testing Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {testingFeatures.map(feature => {
          const Icon = feature.icon;
          const colorClasses = {
            blue: 'bg-blue-50 border-blue-200 text-blue-800',
            amber: 'bg-amber-50 border-amber-200 text-amber-800',
            green: 'bg-green-50 border-green-200 text-green-800'
          };
          
          return (
            <div key={feature.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {feature.features.map((feat, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={feature.onClick}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Open {feature.title}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Scenarios */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-green-600" />
          Manual Testing Scenarios
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testScenarios.map(scenario => {
            const difficultyColors = {
              'Easy': 'bg-green-100 text-green-800',
              'Medium': 'bg-amber-100 text-amber-800',
              'Advanced': 'bg-red-100 text-red-800'
            };
            
            return (
              <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{scenario.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${difficultyColors[scenario.difficulty as keyof typeof difficultyColors]}`}>
                    {scenario.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{scenario.steps} steps</span>
                  <span>{scenario.duration}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Testing Documentation
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            Detailed testing instructions and procedures are available in the documentation.
          </p>
          <button 
            onClick={() => onTabChange('documentation')}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            View Documentation
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-blue-600" />
          System Status
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Database</p>
            <p className="text-xs text-green-600">Connected</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Auth Service</p>
            <p className="text-xs text-green-600">Active</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Permissions API</p>
            <p className="text-xs text-green-600">Running</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">User Service</p>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentationTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Testing Documentation</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">📋 Quick Reference</h3>
          <p className="text-blue-800">
            Complete testing documentation is available in <code>PERMISSIONS_TESTING.md</code> in the project root.
            This includes detailed test scenarios, troubleshooting guides, and performance benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">🚀 Getting Started</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Ensure you're logged in as a Master user</li>
              <li>• Have test data available in the database</li>
              <li>• Open browser developer tools for monitoring</li>
              <li>• Clear cache before starting tests</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">⚡ Performance Standards</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Dashboard load: &lt; 3 seconds</li>
              <li>• Permission changes: &lt; 1 second</li>
              <li>• Bulk operations: &lt; 10 seconds (100 items)</li>
              <li>• Search/filter: &lt; 500ms</li>
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3">🔧 Test Environment Setup</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-800 overflow-x-auto">
{`# Create test users
npm run seed:test-users

# Load test permissions data
npm run seed:test-permissions

# Start development server
npm run dev

# Run automated tests
npm run test:permissions`}
            </pre>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">📊 Reporting Issues</h3>
          <p className="text-gray-700 mb-3">
            When reporting issues found during testing:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
            <li>Include browser and OS information</li>
            <li>Provide step-by-step reproduction steps</li>
            <li>Include screenshots or video recordings</li>
            <li>Export test results and attach to report</li>
            <li>Include console errors or network failures</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export function PermissionsTestSuite() {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<TestingTab>('overview');

  // Only allow Master users to access testing suite
  if (userRole !== 'master') {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only Master users can access the permissions testing suite.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileCheck },
    { id: 'automated-tests', label: 'Automated Tests', icon: Play },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
    { id: 'performance', label: 'Performance', icon: Monitor },
    { id: 'documentation', label: 'Documentation', icon: BookOpen }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TestingTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
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
      <div>
        {activeTab === 'overview' && <TestingOverview onTabChange={setActiveTab} />}
        {activeTab === 'automated-tests' && <PermissionsTesting />}
        {activeTab === 'troubleshooting' && <TroubleshootingGuide />}
        {activeTab === 'performance' && <PerformanceMonitor />}
        {activeTab === 'documentation' && <DocumentationTab />}
      </div>
    </div>
  );
}