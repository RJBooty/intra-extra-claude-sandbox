import React, { useState } from 'react';
import { X, Search, Clock, Edit, User, Circle, Upload } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface IssueReportFormProps {
  onClose: () => void;
  onSubmit: (reportData: any) => void;
}

export function IssueReportForm({ onClose, onSubmit }: IssueReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectSearch: '',
    selectedIncident: '',
    severity: '',
    projectEvent: '',
    issueTitle: '',
    description: '',
    affectedSystems: {
      idasEvent: true,
      cashlessApp: true,
      taquilaApp: false,
      enterticket: false,
      intraExtra: false
    },
    relatedIncidents: '',
    duplicateReports: ''
  });

  const [progress] = useState(20);
  const [activeTab, setActiveTab] = useState<'report' | 'update'>('update');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemChange = (system: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      affectedSystems: {
        ...prev.affectedSystems,
        [system]: checked
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reportData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        submittedBy: 'Ethan Walker',
        id: Date.now().toString()
      };
      
      onSubmit(reportData);
      toast.success('Incident report submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineEvents = [
    {
      icon: Clock,
      title: 'Incident Created',
      time: '2 hours ago',
      color: 'text-gray-600'
    },
    {
      icon: Edit,
      title: 'Severity Updated',
      time: '1 hour ago',
      color: 'text-gray-600'
    },
    {
      icon: User,
      title: 'Assigned to Ethan Walker',
      time: '30 minutes ago',
      color: 'text-gray-600'
    }
  ];

  const escalationLevels = [
    { level: 1, name: 'Ethan Walker', active: true },
    { level: 2, name: 'Team Lead, Sophia Bennett', active: false },
    { level: 3, name: 'Engineering Manager, Owen Carter', active: false }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex">
        {/* Main Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Report New Incident</h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-900 font-medium">Incident Report Progress</p>
                <span className="text-sm text-gray-500">{progress}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'report'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Report Incident
                </button>
                <button
                  onClick={() => setActiveTab('update')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'update'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Update Incident
                </button>
              </nav>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Project Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Project"
                    value={formData.projectSearch}
                    onChange={(e) => handleInputChange('projectSearch', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Select Incident */}
              <div>
                <label className="block text-gray-900 font-medium mb-2">Select Incident</label>
                <select
                  value={formData.selectedIncident}
                  onChange={(e) => handleInputChange('selectedIncident', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an incident type...</option>
                  <option value="database-issue">Database Connection Issue</option>
                  <option value="login-failure">Login Service Failure</option>
                  <option value="api-latency">API Gateway Latency</option>
                  <option value="dashboard-slow">Dashboard Performance</option>
                </select>
              </div>

              {/* Incident Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Incident Summary</h3>
                    <p className="text-gray-600 text-sm">
                      Brief description of the selected incident will appear here.
                    </p>
                  </div>
                  <div 
                    className="w-32 h-20 bg-center bg-cover rounded-lg flex-shrink-0"
                    style={{
                      backgroundImage: `url("https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop")`
                    }}
                  />
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-gray-900 font-medium mb-2">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select severity level...</option>
                  <option value="critical">Critical</option>
                  <option value="severe">Severe</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              {/* Project/Event Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Select Project/Event"
                    value={formData.projectEvent}
                    onChange={(e) => handleInputChange('projectEvent', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Issue Title */}
              <div>
                <label className="block text-gray-900 font-medium mb-2">Issue Title</label>
                <input
                  type="text"
                  value={formData.issueTitle}
                  onChange={(e) => handleInputChange('issueTitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a descriptive title for the issue"
                />
              </div>

              {/* Affected Systems */}
              <div>
                <label className="block text-gray-900 font-medium mb-4">Affected Systems</label>
                <div className="space-y-3">
                  {[
                    { key: 'idasEvent', label: 'IDASEvent' },
                    { key: 'cashlessApp', label: 'Cashless App' },
                    { key: 'taquilaApp', label: 'Taquila App' },
                    { key: 'enterticket', label: 'Enterticket' },
                    { key: 'intraExtra', label: 'IntraExtra' }
                  ].map((system) => (
                    <label key={system.key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.affectedSystems[system.key as keyof typeof formData.affectedSystems]}
                        onChange={(e) => handleSystemChange(system.key, e.target.checked)}
                        className="w-5 h-5 text-red-200 border-2 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-900">{system.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-900 font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Provide detailed description of the issue..."
                />
              </div>

              {/* Upload Button */}
              <div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload Photo/Video
                </button>
              </div>

              {/* Reporter Info */}
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                <div 
                  className="w-14 h-14 bg-center bg-cover rounded-full"
                  style={{
                    backgroundImage: `url("https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop")`
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900">Ethan Walker</p>
                  <p className="text-sm text-gray-600">ethan.walker@email.com, 555-987-6543</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <LoadingSpinner size="sm" />}
                  Submit
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-red-100 text-gray-900 rounded-full hover:bg-red-200 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Auto-save Notice */}
              <p className="text-sm text-gray-500">
                Auto-saving enabled. Last saved: Just now
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Incident Details */}
        <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Incident Detail</h2>

            {/* Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                {timelineEvents.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        {index < timelineEvents.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">{event.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Escalation Chain */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Escalation Chain</h3>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-900 font-medium">Current Escalation Level</span>
                  <span className="text-sm text-gray-600">33%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-900 h-2 rounded-full" style={{ width: '33%' }} />
                </div>
                <p className="text-sm text-gray-600 mt-1">Level 1</p>
              </div>
              
              <div className="space-y-3">
                {escalationLevels.map((level) => (
                  <div key={level.level} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      level.active ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Circle className={`w-5 h-5 ${level.active ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <p className={`font-medium ${level.active ? 'text-gray-900' : 'text-gray-600'}`}>
                      Level {level.level}: {level.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Log */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Communication Log</h3>
              <p className="text-gray-600">No communication logs yet.</p>
            </div>

            {/* Resolution Notes */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resolution Notes</h3>
              <p className="text-gray-600">No resolution notes yet.</p>
            </div>

            {/* Related Jira Tickets */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Related Jira Tickets</h3>
              <p className="text-gray-600">No related tickets yet.</p>
            </div>

            {/* Related Incidents */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Related Incidents</h3>
              <input
                type="text"
                placeholder="Enter incident IDs to link"
                value={formData.relatedIncidents}
                onChange={(e) => handleInputChange('relatedIncidents', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Merge Duplicate Reports */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Merge Duplicate Reports</h3>
              <input
                type="text"
                placeholder="Enter incident IDs to merge"
                value={formData.duplicateReports}
                onChange={(e) => handleInputChange('duplicateReports', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit to Channel */}
            <button className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-colors font-medium">
              Submit to Incident Support Channel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}