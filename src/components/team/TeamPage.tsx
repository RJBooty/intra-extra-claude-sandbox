import React, { useState } from 'react';
import { Users, Mail, Calendar, Star, Eye } from 'lucide-react';

interface TeamPageProps {
  onNavigate: (section: string) => void;
}

type CrewType = 'INTERNAL' | 'SPAIN CREW' | 'CONTRACTOR';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  avatar?: string;
  rating?: number;
  lastActive?: string;
  crewType: CrewType;
}

export function TeamPage({ onNavigate }: TeamPageProps) {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'internal' | 'spain' | 'contractors'>('all');

  // Mock profiles data - in a real app this would come from the database
  const profiles: UserProfile[] = [
    {
      id: 'james-tyson',
      name: 'James Tyson',
      email: 'tyson@casfid.com',
      role: 'Master User',
      status: 'active',
      joinDate: '2024-01-01',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      rating: 5.0,
      lastActive: '5 minutes ago',
      crewType: 'INTERNAL'
    },
    {
      id: 'maria-rodriguez',
      name: 'Maria Rodriguez',
      email: 'maria@casfid.com',
      role: 'Technical Lead',
      status: 'active',
      joinDate: '2023-06-15',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      rating: 4.8,
      lastActive: '2 hours ago',
      crewType: 'SPAIN CREW'
    },
    {
      id: 'alex-johnson',
      name: 'Alex Johnson',
      email: 'alex.johnson@contractor.com',
      role: 'Event Coordinator',
      status: 'active',
      joinDate: '2023-09-20',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      rating: 4.5,
      lastActive: '1 day ago',
      crewType: 'CONTRACTOR'
    }
  ];

  const getFilteredProfiles = () => {
    switch (activeTab) {
      case 'internal':
        return profiles.filter(p => p.crewType === 'INTERNAL');
      case 'spain':
        return profiles.filter(p => p.crewType === 'SPAIN CREW');
      case 'contractors':
        return profiles.filter(p => p.crewType === 'CONTRACTOR');
      default:
        return profiles;
    }
  };

  const getCrewTypeColor = (crewType: CrewType) => {
    switch (crewType) {
      case 'INTERNAL': return 'bg-blue-100 text-blue-800';
      case 'SPAIN CREW': return 'bg-red-100 text-red-800';
      case 'CONTRACTOR': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStarRating = (rating?: number) => {
    if (!rating) return <span className="text-xs text-gray-400">Not rated</span>;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const filteredProfiles = getFilteredProfiles();

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Team CASFID</h1>
            </div>
            <p className="text-gray-600">
              Manage all user profiles created on the IntraExtra platform
            </p>
          </div>

          {/* Platform Statistics */}
          <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{filteredProfiles.filter(p => p.status === 'active').length}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{filteredProfiles.filter(p => p.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Pending Approval</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{profiles.filter(p => p.crewType === 'INTERNAL').length}</div>
                <div className="text-sm text-gray-600">Internal</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{profiles.filter(p => p.crewType === 'SPAIN CREW').length}</div>
                <div className="text-sm text-gray-600">Spain Crew</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{profiles.filter(p => p.crewType === 'CONTRACTOR').length}</div>
                <div className="text-sm text-gray-600">Contractors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{profiles.length}</div>
                <div className="text-sm text-gray-600">Total Profiles</div>
              </div>
            </div>
          </div>

          {/* Crew Type Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All ({profiles.length})
              </button>
              <button
                onClick={() => setActiveTab('internal')}
                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'internal'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Internal ({profiles.filter(p => p.crewType === 'INTERNAL').length})
              </button>
              <button
                onClick={() => setActiveTab('spain')}
                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'spain'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Spain ({profiles.filter(p => p.crewType === 'SPAIN CREW').length})
              </button>
              <button
                onClick={() => setActiveTab('contractors')}
                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === 'contractors'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contractors ({profiles.filter(p => p.crewType === 'CONTRACTOR').length})
              </button>
            </nav>
          </div>

          {/* Profiles List */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'all' ? 'All Platform Profiles' :
                 activeTab === 'internal' ? 'Internal Team' :
                 activeTab === 'spain' ? 'Spain Crew' :
                 'Contractors'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === 'all' ? 'All users who have created profiles on IntraExtra' :
                 `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} team members`}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="h-10 w-10 rounded-full bg-center bg-cover bg-no-repeat flex-shrink-0"
                            style={{ backgroundImage: `url("${profile.avatar}")` }}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {profile.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(profile.status)}`}>
                          {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCrewTypeColor(profile.crewType)}`}>
                          {profile.crewType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profile.role || 'User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(profile.joinDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStarRating(profile.rating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.lastActive || 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedProfile(profile)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty State */}
            {filteredProfiles.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
                <p className="text-gray-500">
                  {activeTab === 'all' 
                    ? 'No users have created profiles on IntraExtra yet.'
                    : `No ${activeTab} team members found.`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Profile Details Modal */}
          {selectedProfile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Details</h2>
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="h-16 w-16 rounded-full bg-center bg-cover bg-no-repeat"
                      style={{ backgroundImage: `url("${selectedProfile.avatar}")` }}
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedProfile.name}</h3>
                      <p className="text-gray-600">{selectedProfile.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedProfile.status)}`}>
                          {selectedProfile.status.charAt(0).toUpperCase() + selectedProfile.status.slice(1)}
                        </span>
                        {selectedProfile.rating && (
                          <div className="flex items-center gap-1">
                            {renderStarRating(selectedProfile.rating)}
                            <span className="text-sm text-gray-500 ml-1">{selectedProfile.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProfile.role || 'User'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Crew Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProfile.crewType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Join Date</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedProfile.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Active</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProfile.lastActive || 'Never'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProfile.status}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedProfile(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}