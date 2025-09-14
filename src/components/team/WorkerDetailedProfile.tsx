import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, Edit, Save, X, User, Briefcase, Clock, Award } from 'lucide-react';

interface WorkerDetailedProfileProps {
  workerId: string;
  onBack: () => void;
}

interface WorkerProfile {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'busy' | 'invited';
  project: string;
  type: 'Internal' | 'External';
  lastActive: string;
  location: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  rating: number;
  skills: string[];
  joinDate: string;
  totalProjects: number;
  currentWorkload: string;
  availability: string;
  bio: string;
  certifications: string[];
  languages: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export function WorkerDetailedProfile({ workerId, onBack }: WorkerDetailedProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'performance' | 'documents'>('overview');

  // Mock worker data - in a real app this would come from an API
  const getWorkerProfile = (id: string): WorkerProfile => {
    const workers: Record<string, WorkerProfile> = {
      '1': {
        id: '1',
        name: 'Sarah Mitchell',
        role: 'Operations Manager',
        status: 'active',
        project: 'Tech Conference 2024',
        type: 'Internal',
        lastActive: '1 hour ago',
        location: 'London, UK',
        department: 'Operations',
        email: 'sarah.mitchell@casfid.com',
        phone: '+44 20 7946 0958',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.8,
        skills: ['Project Management', 'Team Leadership', 'Risk Assessment'],
        joinDate: '2022-03-15',
        totalProjects: 24,
        currentWorkload: '75%',
        availability: 'Available until March 2024',
        bio: 'Experienced operations manager with over 8 years in event production. Specializes in large-scale project coordination and team management.',
        certifications: ['PMP Certification', 'PRINCE2', 'Health & Safety'],
        languages: ['English', 'Spanish'],
        emergencyContact: {
          name: 'James Mitchell',
          phone: '+44 20 7946 1234',
          relationship: 'Spouse'
        }
      },
      '2': {
        id: '2',
        name: 'James Wilson',
        role: 'Technical Lead',
        status: 'active',
        project: 'Music Festival 2024',
        type: 'Internal',
        lastActive: '30 minutes ago',
        location: 'Madrid, Spain',
        department: 'Technical',
        email: 'james.wilson@casfid.com',
        phone: '+34 91 123 4567',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.9,
        skills: ['System Architecture', 'Integration', 'Troubleshooting'],
        joinDate: '2023-01-10',
        totalProjects: 18,
        currentWorkload: '85%',
        availability: 'Available for new projects',
        bio: 'Senior technical lead with expertise in system architecture and integration for large-scale events.',
        certifications: ['AWS Solutions Architect', 'Cisco CCNA', 'ITIL Foundation'],
        languages: ['English', 'Spanish'],
        emergencyContact: {
          name: 'Maria Wilson',
          phone: '+34 91 123 5678',
          relationship: 'Partner'
        }
      },
      '13': {
        id: '13',
        name: 'Alex Johnson',
        role: 'Contract Engineer',
        status: 'active',
        project: 'Exhibition 2024',
        type: 'External',
        lastActive: '2 hours ago',
        location: 'Amsterdam, Netherlands',
        department: 'Technical',
        email: 'alex.johnson.eng@gmail.com',
        phone: '+31 20 123 4567',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.5,
        skills: ['Systems Engineering', 'Network Setup', 'Technical Support'],
        joinDate: '2023-06-20',
        totalProjects: 8,
        currentWorkload: '70%',
        availability: 'Available for short-term contracts',
        bio: 'Freelance systems engineer specializing in network infrastructure and technical support for events.',
        certifications: ['CompTIA Network+', 'Cisco CCNA', 'Microsoft Azure'],
        languages: ['English', 'Dutch'],
        emergencyContact: {
          name: 'Emma Johnson',
          phone: '+31 20 123 5678',
          relationship: 'Sister'
        }
      },
      '14': {
        id: '14',
        name: 'Sophie Martin',
        role: 'Contract Designer',
        status: 'busy',
        project: 'Corporate Summit 2024',
        type: 'External',
        lastActive: '6 hours ago',
        location: 'Paris, France',
        department: 'Design',
        email: 'sophie.martin.design@gmail.com',
        phone: '+33 1 42 86 1234',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 4.7,
        skills: ['Graphic Design', 'UI/UX', 'Brand Identity'],
        joinDate: '2023-09-15',
        totalProjects: 6,
        currentWorkload: '90%',
        availability: 'Fully booked until April 2024',
        bio: 'Creative designer with expertise in brand identity and user experience design for corporate events.',
        certifications: ['Adobe Certified Expert', 'UX Design Certificate', 'Brand Strategy'],
        languages: ['French', 'English'],
        emergencyContact: {
          name: 'Pierre Martin',
          phone: '+33 1 42 86 5678',
          relationship: 'Father'
        }
      },
      'james-tyson': {
        id: 'james-tyson',
        name: 'James Tyson',
        role: 'Master User',
        status: 'active',
        project: 'Platform Administration',
        type: 'Internal',
        lastActive: '5 minutes ago',
        location: '',
        department: 'Administration',
        email: 'tyson@casfid.com',
        phone: '',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        rating: 5.0,
        skills: ['Platform Administration', 'User Management', 'System Oversight'],
        joinDate: '',
        totalProjects: 0,
        currentWorkload: '',
        availability: '',
        bio: '',
        certifications: [],
        languages: [],
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        }
      }
    };

    return workers[id] || workers['1']; // Default to first worker if not found
  };

  const worker = getWorkerProfile(workerId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'invited': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Internal': return 'bg-blue-100 text-blue-800';
      case 'External': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: User },
    { id: 'projects' as const, label: 'Projects', icon: Briefcase },
    { id: 'performance' as const, label: 'Performance', icon: Award },
    { id: 'documents' as const, label: 'Documents', icon: Clock },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <p className="text-slate-900">{worker.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <p className="text-slate-900">{worker.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <p className="text-slate-900">{worker.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <p className="text-slate-900">{worker.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                  <p className="text-slate-900">{worker.joinDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
                  <p className="text-slate-900">{worker.availability}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Biography</h3>
              <p className="text-slate-700">{worker.bio}</p>
            </div>

            {/* Skills & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Certifications</h3>
                <div className="space-y-2">
                  {worker.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <p className="text-slate-900">{worker.emergencyContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <p className="text-slate-900">{worker.emergencyContact.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                  <p className="text-slate-900">{worker.emergencyContact.relationship}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Project History</h3>
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-900">{worker.project}</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">Lead {worker.role} for technical installations</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Started: Jan 2024</span>
                  <span>Duration: 3 months</span>
                  <span>Team size: 8 people</span>
                </div>
              </div>
              
              <div className="text-center py-8">
                <p className="text-slate-500">Previous projects will be displayed here</p>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                <div className="text-2xl font-bold text-slate-900">{worker.totalProjects}</div>
                <div className="text-sm text-slate-600">Total Projects</div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  {renderStarRating(worker.rating)}
                </div>
                <div className="text-sm text-slate-600">Average Rating</div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                <div className="text-2xl font-bold text-slate-900">{worker.currentWorkload}</div>
                <div className="text-sm text-slate-600">Current Workload</div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Metrics</h3>
              <div className="text-center py-8">
                <p className="text-slate-500">Performance metrics and reviews will be displayed here</p>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Documents & Files</h3>
            <div className="text-center py-8">
              <p className="text-slate-500">Worker documents and files will be displayed here</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 bg-white px-10 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-slate-800">
              <div className="size-4">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
                  <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-slate-800 text-lg font-bold leading-tight tracking-[-0.015em]">IntraCasfid</h2>
              <h2 className="text-slate-800 text-lg font-bold leading-tight tracking-[-0.015em]">IntraExtra</h2>
            </div>
            <div className="flex items-center gap-9">
              <button 
                onClick={onBack}
                className="text-slate-800 text-sm font-medium leading-normal hover:text-slate-600 transition-colors"
              >
                Dashboard
              </button>
              <a className="text-slate-800 text-sm font-medium leading-normal" href="#">Projects</a>
              <a className="text-slate-800 text-sm font-medium leading-normal" href="#">Workers</a>
              <a className="text-slate-800 text-sm font-medium leading-normal" href="#">Reports</a>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: `url("${worker.avatar}")` }}
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Back Button and Header */}
            <div className="flex items-center gap-4 p-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Workers
              </button>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div
                    className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-full"
                    style={{ backgroundImage: `url("${worker.avatar}")` }}
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{worker.name}</h1>
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(worker.status)}`}>
                        {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(worker.type)}`}>
                        {worker.type}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span>{worker.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span>{worker.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{worker.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>Last active: {worker.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {renderStarRating(worker.rating)}
                  <span className="text-sm text-slate-600 ml-2">{worker.rating}</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-slate-800 text-slate-800'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}