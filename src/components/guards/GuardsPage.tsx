import React, { useState } from 'react';
import { Section as Security, Proportions as ReportProblem, List as ListAlt, Phone, ArrowDown as ArrowDownward, ArrowUp as ArrowUpward, LayoutDashboard as Dashboard, Parentheses as Assessment, FolderOpen, TypeOutline as PeopleOutline, Group, BarChart, Settings, Bell, Search, Timer, Users, AlertTriangle, CheckCircle, MessageSquare, Video, Mail, MessageCircle, UserPlus, X, ChevronDown } from 'lucide-react';
import { IssueReportForm } from './IssueReportForm';
import toast from 'react-hot-toast';

interface GuardsPageProps {
  onNavigate: (section: string) => void;
}

interface OnCallPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
  startTime: string;
  startDate: string;
  endTime: string;
  endDate: string;
}

interface Incident {
  id: string;
  title: string;
  severity: 'Critical' | 'Severe' | 'Minimal';
  status: string;
  event: string;
  zone: string;
  reporter: string;
  timeElapsed: string;
  slaRemaining?: string;
  assignees: {
    name: string;
    role: string;
    avatar: string;
  }[];
  isNew?: boolean;
  lastUpdated: string;
  timeline?: {
    time: string;
    action: string;
    icon: string;
  }[];
  updates?: {
    time: string;
    author: string;
    message: string;
  }[];
}

interface Notification {
  id: string;
  type: 'new' | 'update' | 'assign' | 'escalate';
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

interface TodayEvent {
  id: string;
  projectName: string;
  time: string;
  capacity?: number;
  class?: string;
  topic?: string;
  guardName: string;
  guardAvatar: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  time: string;
  type: 'Maintenance' | 'Team' | 'Deployment' | 'Security';
}

interface Statistic {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  changeColor: string;
}

export function GuardsPage({ onNavigate }: GuardsPageProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'critical-requests' | 'on-call-calendar'>('dashboard');
  const [selectedIncident, setSelectedIncident] = useState<string>('db-exhaustion');
  const [showIssueReportForm, setShowIssueReportForm] = useState(false);
  const [incidentTab, setIncidentTab] = useState<'active' | 'past'>('active');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUpdate, setNewUpdate] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');

  // Mock data
  const onCallPersonnel: OnCallPerson[] = [
    {
      id: '1',
      name: 'James Tyson',
      role: 'Primary On-Call',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      startTime: '09:00 AM',
      startDate: '01/01/2025',
      endTime: '09:00 AM',
      endDate: '01/02/2025'
    },
    {
      id: '2',
      name: 'Sarah Jones',
      role: 'Secondary On-Call',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      startTime: '09:00 AM',
      startDate: '01/01/2025',
      endTime: '09:00 AM',
      endDate: '01/02/2025'
    },
    {
      id: '3',
      name: 'Michael Chen',
      role: 'Tertiary On-Call',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      startTime: '09:00 AM',
      startDate: '01/01/2025',
      endTime: '09:00 AM',
      endDate: '01/02/2025'
    },
    {
      id: '4',
      name: 'Emily Davis',
      role: 'Support Specialist',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      startTime: '09:00 AM',
      startDate: '01/01/2025',
      endTime: '09:00 AM',
      endDate: '01/02/2025'
    }
  ];

  const todayEvents: TodayEvent[] = [
    {
      id: '1',
      projectName: 'Project Phoenix',
      time: '10:00 - 11:00 AM',
      capacity: 25,
      class: '3: Sapling',
      guardName: 'James Tyson',
      guardAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '2',
      projectName: 'Project Chimera',
      time: '02:30 - 03:00 PM',
      capacity: 10,
      class: '5: Rainforest',
      guardName: 'Sarah Jones',
      guardAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '3',
      projectName: 'Internal Sync',
      time: '04:00 - 04:30 PM',
      topic: 'Q1 Review',
      guardName: 'James Tyson',
      guardAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '4',
      projectName: 'Project Griffin',
      time: '05:00 - 05:30 PM',
      capacity: 5,
      class: '1: Seedling',
      guardName: 'Sarah Jones',
      guardAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  const upcomingEvents: UpcomingEvent[] = [
    {
      id: '1',
      title: 'System Maintenance Window',
      time: 'Tomorrow, 01:00 - 03:00 AM',
      type: 'Maintenance'
    },
    {
      id: '2',
      title: 'On-Call Handover Meeting',
      time: 'Jan 31, 04:00 PM',
      type: 'Team'
    },
    {
      id: '3',
      title: 'Project Titan Go-Live',
      time: 'Feb 03, 09:00 AM',
      type: 'Deployment'
    },
    {
      id: '4',
      title: 'Quarterly Security Audit',
      time: 'Feb 15, 10:00 AM',
      type: 'Security'
    }
  ];

  const statistics: Statistic[] = [
    {
      title: 'Avg. Response Time',
      value: '12m 45s',
      change: '5% from last month',
      trend: 'down',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Incidents (Month)',
      value: '84',
      change: '10% from last month',
      trend: 'up',
      changeColor: 'text-red-600'
    },
    {
      title: 'SLA Compliance',
      value: '98.5%',
      change: '1.2% from last month',
      trend: 'up',
      changeColor: 'text-green-600'
    }
  ];

  const incidents: Incident[] = [
    {
      id: 'db-exhaustion',
      title: 'Database Connection Pool Exhausted',
      severity: 'Critical',
      status: 'Escalated to On-Call SRE',
      event: 'Core Service',
      zone: 'us-east-1a',
      reporter: 'Auto-Alert',
      timeElapsed: '00:07:32',
      slaRemaining: '00:02:28',
      lastUpdated: '2m ago',
      assignees: [
        {
          name: 'Alex Chen',
          role: 'Technical Respondee',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        },
        {
          name: 'Sarah Lee',
          role: 'Project Manager',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        }
      ],
      timeline: [
        { time: '10:22:43 AM', action: 'Incident Reported via Auto-Alert', icon: 'report_problem' },
        { time: '10:23:15 AM', action: 'Acknowledged by On-Call SRE (Alex)', icon: 'person_search' },
        { time: '10:28:02 AM', action: 'Status changed to Investigating', icon: 'search' },
        { time: '10:30:15 AM', action: 'Escalated to Engineering Manager', icon: 'arrow_circle_up' }
      ],
      updates: [
        {
          time: '10:28 AM',
          author: 'Alex (SRE)',
          message: 'Initial investigation shows connection pools for the primary replica are maxed out. Attempting to cycle the pods.'
        },
        {
          time: '10:30 AM',
          author: 'Alex (SRE)',
          message: 'Pod cycling had no effect. The issue appears to be upstream. Escalating to the Eng Manager and posting to #incidents channel.'
        }
      ]
    },
    {
      id: 'login-failures',
      title: 'Website Login Service Intermittent Failures',
      severity: 'Severe',
      status: 'Acknowledged by eng-web',
      event: 'Project Bravo',
      zone: 'Global',
      reporter: 'Jane Doe',
      timeElapsed: '00:28:15',
      slaRemaining: '00:31:45',
      lastUpdated: '15m ago',
      isNew: true,
      assignees: [
        {
          name: 'Mike Ross',
          role: 'Technical Respondee',
          avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        },
        {
          name: 'Jessica Pearson',
          role: 'Project Manager',
          avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        },
        {
          name: 'David Kim',
          role: 'Colleague',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        }
      ]
    },
    {
      id: 'api-latency',
      title: 'API Gateway High Latency',
      severity: 'Severe',
      status: 'Monitoring',
      event: 'API Maintenance',
      zone: 'eu-west-1',
      reporter: 'John Smith',
      timeElapsed: '01:12:44',
      lastUpdated: '1h ago',
      assignees: [
        {
          name: 'John Smith',
          role: 'Technical Respondee',
          avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        }
      ]
    },
    {
      id: 'dashboard-slow',
      title: 'Analytics Dashboard Slow to Load',
      severity: 'Minimal',
      status: 'Investigating',
      event: 'Internal Tools',
      zone: 'N/A',
      reporter: 'Support Team',
      timeElapsed: '02:45:09',
      lastUpdated: '1h ago',
      assignees: [
        {
          name: 'Emily White',
          role: 'Technical Respondee',
          avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        }
      ]
    }
  ];

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'new',
      title: 'New Incident: Website Login Service Intermittent Failures',
      description: 'A new incident has been reported by Jane Doe.',
      time: '2 minutes ago',
      icon: 'add_task',
      color: 'green'
    },
    {
      id: '2',
      type: 'update',
      title: 'Incident Updated: Database Connection Pool Exhausted',
      description: 'Alex Chen changed the status to Investigating.',
      time: '5 minutes ago',
      icon: 'sync_problem',
      color: 'red'
    },
    {
      id: '3',
      type: 'assign',
      title: 'Reassigned: API Gateway High Latency',
      description: 'Incident reassigned from Unassigned to John Smith.',
      time: '12 minutes ago',
      icon: 'person_add',
      color: 'yellow'
    },
    {
      id: '4',
      type: 'escalate',
      title: 'Escalated: Database Connection Pool Exhausted',
      description: 'Incident escalated to Engineering Manager.',
      time: '1 hour ago',
      icon: 'arrow_circle_up',
      color: 'red'
    }
  ];

  const pastIncidents = [
    {
      id: 'payment-timeout',
      title: 'Payment Gateway Timeout',
      event: 'Core Service',
      resolved: '2 days ago',
      duration: '45 minutes',
      description: 'The payment gateway was experiencing timeouts due to a configuration error. The issue was resolved by rolling back the latest deployment.'
    },
    {
      id: 'cdn-failure',
      title: 'CDN Image Loading Failure',
      event: 'Media Services',
      resolved: '5 days ago',
      duration: '2 hours',
      description: 'An expired SSL certificate on the CDN caused images to fail loading across the platform. Certificate was renewed to resolve the issue.'
    }
  ];

  const getEventTypeColor = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Team': return 'bg-blue-100 text-blue-800';
      case 'Deployment': return 'bg-green-100 text-green-800';
      case 'Security': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'Severe': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'Minimal': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Severe': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Minimal': return <ReportProblem className="w-5 h-5 text-yellow-500" />;
      default: return <ReportProblem className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleAssignIncident = (incidentId: string) => {
    setShowAssignModal(null);
    toast.success('Incident assigned successfully');
  };

  const handleEscalateIncident = (incidentId: string) => {
    toast.success('Incident escalated to next level');
  };

  const handleAddUpdate = (incidentId: string) => {
    if (!newUpdate.trim()) return;
    toast.success('Update added to incident');
    setNewUpdate('');
  };

  const handleResolveIncident = (incidentId: string) => {
    if (!resolutionDetails.trim()) return;
    toast.success('Incident marked as resolved');
    setResolutionDetails('');
  };

  const handleReportIncident = () => {
    setShowIssueReportForm(true);
  };

  const handleIssueReportSubmit = (reportData: any) => {
    console.log('Issue report submitted:', reportData);
    // Here you would typically send the data to your backend
    toast.success('Incident report submitted successfully!');
  };

  const renderCriticalRequestsContent = () => (
    <div className="p-6">
      {/* Header with Notifications */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <AlertTriangle className="text-red-500 mr-3 w-8 h-8" />
            Critical Escalation & Incidents
          </h1>
          <p className="text-gray-600 mt-1">Dashboard for monitoring and managing active service incidents.</p>
        </div>
        
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute z-20 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 right-0">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">Notifications</h3>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  Mark all as read
                </button>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 bg-${notification.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                        {notification.type === 'new' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {notification.type === 'update' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                        {notification.type === 'assign' && <UserPlus className="w-5 h-5 text-yellow-600" />}
                        {notification.type === 'escalate' && <ArrowUpward className="w-5 h-5 text-red-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.description}</p>
                        <p className="text-xs text-blue-500 font-semibold mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-3 text-center border-t border-gray-200">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report New Incident Button */}
      <div className="mb-8">
        <button 
          onClick={handleReportIncident}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <ReportProblem className="w-5 h-5 mr-2" />
          REPORT NEW INCIDENT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Incidents Section */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            {/* Tab Navigation */}
            <div className="border-b-2 border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setIncidentTab('active')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    incidentTab === 'active'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Active Incidents
                </button>
                <button
                  onClick={() => setIncidentTab('past')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    incidentTab === 'past'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Past Incidents
                </button>
              </nav>
            </div>

            {/* Active Incidents Tab */}
            {incidentTab === 'active' && (
              <div>
                {/* Summary Stats */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Total Active Incidents</h4>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        <span>Critical: <strong className="text-gray-900">1</strong></span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                        <span>Severe: <strong className="text-gray-900">2</strong></span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        <span>Minimal: <strong className="text-gray-900">1</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search incidents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-56 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Incidents List */}
                <div className="mt-6 space-y-4">
                  {incidents.map((incident) => (
                    <div
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident.id)}
                      className={`border-l-4 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                        selectedIncident === incident.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : `${getSeverityColor(incident.severity)} shadow-sm hover:shadow-md hover:border-blue-300`
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {getSeverityIcon(incident.severity)}
                          <h3 className={`font-bold ml-3 mb-2 ${
                            incident.severity === 'Critical' ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {incident.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${
                            incident.severity === 'Critical' ? 'text-red-700' :
                            incident.severity === 'Severe' ? 'text-orange-700' :
                            'text-yellow-700'
                          }`}>
                            {incident.severity}
                          </span>
                          {incident.isNew && (
                            <>
                              <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
                              <span className="text-xs font-medium text-green-600">New</span>
                            </>
                          )}
                          <span className="text-xs font-medium text-gray-500">Updated {incident.lastUpdated}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 flex space-x-4 my-3 ml-8">
                        <span>Event: {incident.event}</span>
                        <span>Zone: {incident.zone}</span>
                        <span>Reporter: {incident.reporter}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mb-4">
                        <div className="flex items-center space-x-4 ml-8">
                          <span className="flex items-center text-gray-600">
                            <Timer className="w-4 h-4 mr-1" />
                            Time Elapsed: <strong>{incident.timeElapsed}</strong>
                          </span>
                          {incident.slaRemaining && (
                            <span className={`flex items-center font-medium ${
                              incident.severity === 'Critical' ? 'text-red-600' : 'text-orange-600'
                            }`}>
                              SLA Remaining: <strong className={incident.severity === 'Critical' ? 'animate-pulse' : ''}>
                                {incident.slaRemaining}
                              </strong>
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          incident.status.includes('Escalated') ? 'text-red-700 bg-red-100' :
                          incident.status.includes('Acknowledged') ? 'text-blue-700 bg-blue-100' :
                          incident.status.includes('Monitoring') ? 'text-purple-700 bg-purple-100' :
                          'text-gray-700 bg-gray-200'
                        }`}>
                          Status: {incident.status}
                        </span>
                      </div>
                      
                      <div className="border-t-2 border-gray-200 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {incident.assignees.map((assignee, index) => (
                              <div key={index} className="flex items-center">
                                <img
                                  src={assignee.avatar}
                                  alt={assignee.name}
                                  className={`w-8 h-8 rounded-full mr-2 ${
                                    incident.severity === 'Critical' ? 'border-2 border-red-500' : ''
                                  }`}
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{assignee.name}</p>
                                  <p className="text-xs text-gray-600">{assignee.role}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDetailsModal(incident.id);
                              }}
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            >
                              Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAssignModal(incident.id);
                              }}
                              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center transition-colors"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Assign
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEscalateIncident(incident.id);
                              }}
                              className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                              Escalate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Incidents Tab */}
            {incidentTab === 'past' && (
              <div>
                <div className="mt-6 flex justify-end">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search incidents..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  {pastIncidents.map((incident) => (
                    <div key={incident.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{incident.title}</h3>
                          <div className="text-xs text-gray-600 flex space-x-4 mb-2">
                            <span>Event: {incident.event}</span>
                            <span>Resolved: {incident.resolved}</span>
                            <span>Duration: {incident.duration}</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          Resolved
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{incident.description}</p>
                      <div className="border-t-2 border-gray-200 pt-3 mt-3 flex justify-end">
                        <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                          View Postmortem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Communication Channels */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Communication Channels</h2>
            <p className="text-sm text-gray-600 mb-6">
              Integrate with your team's favorite tools for instant alerts and streamlined communication during incidents.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                <div className="flex items-center space-x-4">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Slack</h3>
                    <p className="text-xs text-gray-600">Connect to #incidents channel</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                <div className="flex items-center space-x-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Microsoft Teams</h3>
                    <p className="text-xs text-gray-600">Not connected</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-6 border-t-2 border-gray-200 pt-4">
              <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 py-2 flex items-center justify-center transition-colors">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Integration
              </button>
            </div>
          </div>
        </div>

        {/* Incident Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Incident Details</h2>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              
              {selectedIncident && (
                <div className="border-t-2 border-gray-200 pt-6">
                  {(() => {
                    const incident = incidents.find(i => i.id === selectedIncident);
                    if (!incident) return null;
                    
                    return (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <h3 className={`text-base font-bold ${
                              incident.severity === 'Critical' ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {incident.title}
                            </h3>
                            <span className={`text-xs font-medium text-white px-3 py-1 rounded-full ml-4 flex-shrink-0 ${
                              incident.severity === 'Critical' ? 'bg-red-500' :
                              incident.severity === 'Severe' ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`}>
                              {incident.severity}
                            </span>
                          </div>
                          
                          {incident.timeline && (
                            <>
                              <h4 className="text-base font-semibold text-gray-600 mb-3">Timeline</h4>
                              <div className="relative">
                                {incident.timeline.map((item, index) => (
                                  <div key={index} className="relative pb-6 pl-8">
                                    <div className={`absolute left-0 top-0 flex items-center justify-center w-6 h-6 rounded-full ${
                                      item.icon === 'report_problem' ? 'bg-red-100' :
                                      item.icon === 'person_search' ? 'bg-blue-100' :
                                      item.icon === 'search' ? 'bg-yellow-100' :
                                      'bg-red-100'
                                    }`}>
                                      {item.icon === 'report_problem' && <ReportProblem className="w-4 h-4 text-red-500" />}
                                      {item.icon === 'person_search' && <Search className="w-4 h-4 text-blue-500" />}
                                      {item.icon === 'search' && <Search className="w-4 h-4 text-yellow-500" />}
                                      {item.icon === 'arrow_circle_up' && <ArrowUpward className="w-4 h-4 text-red-500" />}
                                    </div>
                                    <p className="text-xs text-gray-600">{item.time}</p>
                                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                    {index < incident.timeline!.length - 1 && (
                                      <div className="absolute left-[11px] top-[28px] h-full w-0.5 bg-gray-200"></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        
                        {incident.updates && (
                          <div>
                            <h4 className="text-base font-semibold text-gray-600 mb-3">Update & Communication Log</h4>
                            <div className="space-y-3">
                              {incident.updates.map((update, index) => (
                                <div key={index} className="bg-gray-100 p-3 rounded-lg">
                                  <p className="text-sm text-gray-600">
                                    <strong>[{update.time}] {update.author}:</strong> {update.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4">
                              <textarea
                                value={newUpdate}
                                onChange={(e) => setNewUpdate(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-50 placeholder-gray-500 focus:ring-red-500 focus:border-red-500"
                                placeholder="Add update..."
                                rows={3}
                              />
                              <button
                                onClick={() => handleAddUpdate(incident.id)}
                                className="mt-2 w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Add Update
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-sm transition-all shadow-lg hover:shadow-xl mb-4 transform hover:-translate-y-0.5">
                            <Video className="w-4 h-4 mr-2" />
                            ENGAGE WAR ROOM
                          </button>
                          
                          <h4 className="text-base font-semibold text-gray-600 mb-3">Resolution</h4>
                          <textarea
                            value={resolutionDetails}
                            onChange={(e) => setResolutionDetails(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-50 placeholder-gray-500 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter resolution details once the incident is resolved..."
                            rows={3}
                          />
                          <button
                            onClick={() => handleResolveIncident(incident.id)}
                            className="mt-2 w-full py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                          >
                            Mark as Resolved
                          </button>
                        </div>
                        
                        <div>
                          <h4 className="text-base font-semibold text-gray-600 mb-3">On-Call Panel</h4>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-sm text-gray-900">Alex Chen (SRE)</p>
                                <p className="text-xs text-gray-600">PST (UTC-8)</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-transform transform hover:scale-110">
                                  <Phone className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-transform transform hover:scale-110">
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-transform transform hover:scale-110">
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-transform transform hover:scale-110">
                                  <Users className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <button className="mt-3 text-xs font-medium text-blue-600 hover:underline transition-colors">
                              View full schedule
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {!selectedIncident && (
                <div className="text-center text-gray-500 py-8">
                  <ReportProblem className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">Select an incident to view details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Assign Respondee</h3>
              <button
                onClick={() => setShowAssignModal(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option>On-Call SRE</option>
                <option>On-Call Web</option>
                <option>On-Call Data</option>
              </select>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowAssignModal(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignIncident(showAssignModal)}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboardContent = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Current On-Call Personnel */}
        <div className="lg:col-span-2">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Guards Dashboard</h3>
          <div className="space-y-4 max-h-[33rem] overflow-y-auto pr-2 scrollbar-thin">
            {onCallPersonnel.map((person) => (
              <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-4 flex-shrink-0">
                <div className="flex items-center">
                  <img
                    alt={`${person.name} avatar`}
                    className="w-12 h-12 rounded-full mr-4"
                    src={person.avatar}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{person.name}</p>
                        <p className="text-sm text-gray-500">{person.role}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href="#"
                          className="flex items-center text-sm font-medium text-white bg-[#6264A7] hover:bg-[#4a4c8c] rounded-md px-3 py-1"
                        >
                          <i className="fab fa-microsoft-teams text-base mr-1.5"></i>
                          <span>Teams</span>
                        </a>
                        <a
                          href="#"
                          className="flex items-center text-sm font-medium text-white bg-[#4A154B] hover:bg-[#350d36] rounded-md px-3 py-1"
                        >
                          <i className="fab fa-slack text-base mr-1.5"></i>
                          <span>Slack</span>
                        </a>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Start:</span>
                        <span>{person.startTime}</span>
                        <span className="border-l border-gray-300 h-3"></span>
                        <span>{person.startDate}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-medium">End:</span>
                        <span className="ml-1.5">{person.endTime}</span>
                        <span className="border-l border-gray-300 h-3"></span>
                        <span>{person.endDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Events */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Events</h3>
          <div className="space-y-3 h-[33rem] overflow-y-auto pr-2 scrollbar-thin">
            {todayEvents.map((event) => (
              <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex-shrink-0">
                <p className="font-semibold text-gray-800">{event.projectName}</p>
                <p className="text-sm text-gray-500 mt-1">{event.time}</p>
                {event.capacity && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium text-gray-600">Capacity:</span> {event.capacity} Customers
                  </p>
                )}
                {event.class && (
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium text-gray-600">Class:</span> {event.class}
                  </p>
                )}
                {event.topic && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium text-gray-600">Topic:</span> {event.topic}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <img
                    alt="Guard avatar"
                    className="w-6 h-6 rounded-full mr-2"
                    src={event.guardAvatar}
                  />
                  <span className="font-medium text-gray-600">{event.guardName}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events and Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Upcoming Events */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Events</h3>
          <div className="space-y-4 h-[19rem] overflow-y-auto pr-2 scrollbar-thin">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center flex-shrink-0">
                <div>
                  <p className="font-medium text-gray-800">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.time}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getEventTypeColor(event.type)}`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h3>
          <div className="space-y-4">
            {statistics.map((stat, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className={`text-sm ${stat.changeColor} flex items-center mt-1`}>
                  {stat.trend === 'down' ? (
                    <ArrowDownward className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowUpward className="w-4 h-4 mr-1" />
                  )}
                  <span>{stat.change}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'critical-requests':
        return renderCriticalRequestsContent();
      case 'on-call-calendar':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <ListAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">On-Call Calendar</h3>
              <p className="text-gray-500">On-call calendar management coming soon.</p>
            </div>
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <header className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Guards Dashboard
              </h1>
              <p className="text-gray-600">Monitor and manage on-call personnel and incidents</p>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </button>
            
            {showNotifications && (
              <div className="absolute z-20 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 right-0">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800">Notifications</h3>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    Mark all as read
                  </button>
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-${notification.color}-100`}>
                          {notification.type === 'new' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {notification.type === 'update' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                          {notification.type === 'assign' && <UserPlus className="w-5 h-5 text-yellow-600" />}
                          {notification.type === 'escalate' && <ArrowUpward className="w-5 h-5 text-red-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.description}</p>
                          <p className="text-xs text-blue-500 font-semibold mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 p-3 text-center border-t border-gray-200">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>


        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav aria-label="Tabs" className="flex -mb-px px-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 mr-8 font-medium text-sm border-b-2 ${
                  activeTab === 'dashboard'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('critical-requests')}
                className={`py-4 px-1 mr-8 font-medium text-sm border-b-2 ${
                  activeTab === 'critical-requests'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                }`}
              >
                Critical Requests
              </button>
              <button
                onClick={() => setActiveTab('on-call-calendar')}
                className={`py-4 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'on-call-calendar'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                }`}
              >
                On-Call Calendar
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* Issue Report Form Modal */}
      {showIssueReportForm && (
        <IssueReportForm
          onClose={() => setShowIssueReportForm(false)}
          onSubmit={handleIssueReportSubmit}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Assign Respondee</h3>
              <button
                onClick={() => setShowAssignModal(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option>On-Call SRE</option>
                <option>On-Call Web</option>
                <option>On-Call Data</option>
              </select>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowAssignModal(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignIncident(showAssignModal)}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}