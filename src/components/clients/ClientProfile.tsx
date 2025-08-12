import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Check, Calendar, Play, Search, ChevronDown, ArrowLeft } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  lastActive: string;
  avatar?: string;
  about: string;
}

interface Project {
  id: string;
  name: string;
  category: string;
  status: number;
  dueDate: string;
  budget: string;
  projectOwner: string;
}

interface ClientProfileProps {
  client: Client;
  onBack: () => void;
}

export function ClientProfile({ client, onBack }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'contracts' | 'documents' | 'invoices' | 'notes'>('projects');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock projects for the client
  const clientProjects: Project[] = [
    {
      id: '1',
      name: 'Project Harmony',
      category: 'Canopy',
      status: 75,
      dueDate: '2024-08-15',
      budget: '€50,000',
      projectOwner: 'Ryan Carter'
    },
    {
      id: '2',
      name: 'Project Rhythm',
      category: 'Sapling',
      status: 100,
      dueDate: '2024-05-20',
      budget: '€30,000',
      projectOwner: 'Olivia Bennett'
    },
    {
      id: '3',
      name: 'Project Melody',
      category: 'Rainforest',
      status: 25,
      dueDate: '2024-11-30',
      budget: '€75,000',
      projectOwner: 'Liam Hayes'
    },
    {
      id: '4',
      name: 'Project Beat',
      category: 'Desert Bloom',
      status: 50,
      dueDate: '2024-09-22',
      budget: '€40,000',
      projectOwner: 'Vibe Events Co'
    },
    {
      id: '5',
      name: 'Project Groove',
      category: 'Mountain Peak',
      status: 90,
      dueDate: '2024-06-10',
      budget: '€60,000',
      projectOwner: 'Noah Foster'
    }
  ];

  const filteredProjects = clientProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'Canopy': return 'bg-green-100 text-green-800';
      case 'Sapling': return 'bg-blue-100 text-blue-800';
      case 'Rainforest': return 'bg-emerald-100 text-emerald-800';
      case 'Desert Bloom': return 'bg-orange-100 text-orange-800';
      case 'Mountain Peak': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Back button */}
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Clients</span>
          </button>
        </div>

        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Left Sidebar */}
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex p-4">
              <div className="flex w-full flex-col gap-4 items-center">
                <div className="flex gap-4 flex-col items-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                    style={{
                      backgroundImage: client.avatar 
                        ? `url("${client.avatar}")` 
                        : 'url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face")'
                    }}
                  ></div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-[#121417] text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">{client.name}</p>
                    <p className="text-[#677283] text-base font-normal leading-normal text-center">Client</p>
                    <p className="text-[#677283] text-base font-normal leading-normal text-center">Last active {client.lastActive}</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-[#121417] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Contact</h3>
            
            {/* Email */}
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
              <div className="text-[#121417] flex items-center justify-center rounded-lg bg-[#f1f2f4] shrink-0 size-12">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[#121417] text-base font-medium leading-normal line-clamp-1">Email</p>
                <p className="text-[#677283] text-sm font-normal leading-normal line-clamp-2">{client.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
              <div className="text-[#121417] flex items-center justify-center rounded-lg bg-[#f1f2f4] shrink-0 size-12">
                <Phone className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[#121417] text-base font-medium leading-normal line-clamp-1">Phone</p>
                <p className="text-[#677283] text-sm font-normal leading-normal line-clamp-2">{client.phone}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
              <div className="text-[#121417] flex items-center justify-center rounded-lg bg-[#f1f2f4] shrink-0 size-12">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[#121417] text-base font-medium leading-normal line-clamp-1">Address</p>
                <p className="text-[#677283] text-sm font-normal leading-normal line-clamp-2">{client.address}</p>
              </div>
            </div>

            <h3 className="text-[#121417] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">About</h3>
            <p className="text-[#121417] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {client.about}
            </p>

            <h3 className="text-[#121417] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Socials</h3>
            
            {/* Website */}
            {client.website && (
              <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
                <div className="text-[#121417] flex items-center justify-center rounded-lg bg-[#f1f2f4] shrink-0 size-12">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#121417] text-base font-medium leading-normal line-clamp-1">Website</p>
                  <p className="text-[#677283] text-sm font-normal leading-normal line-clamp-2">{client.website}</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121417] tracking-light text-[32px] font-bold leading-tight">{client.name}</p>
                <p className="text-[#677283] text-sm font-normal leading-normal">Client</p>
              </div>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f1f2f4] text-[#121417] text-sm font-medium leading-normal">
                <span className="truncate">Edit Client Details</span>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="pb-3">
              <div className="flex border-b border-[#dde0e4] px-4 gap-8">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === 'projects'
                      ? 'border-b-[#121417] text-[#121417]'
                      : 'border-b-transparent text-[#677283]'
                  }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Projects</p>
                </button>
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === 'contracts'
                      ? 'border-b-[#121417] text-[#121417]'
                      : 'border-b-transparent text-[#677283]'
                  }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Contracts</p>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === 'documents'
                      ? 'border-b-[#121417] text-[#121417]'
                      : 'border-b-transparent text-[#677283]'
                  }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Documents</p>
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === 'invoices'
                      ? 'border-b-[#121417] text-[#121417]'
                      : 'border-b-transparent text-[#677283]'
                  }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Invoices</p>
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === 'notes'
                      ? 'border-b-[#121417] text-[#121417]'
                      : 'border-b-transparent text-[#677283]'
                  }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Notes</p>
                </button>
              </div>
            </div>

            {/* Projects Tab Content */}
            {activeTab === 'projects' && (
              <>
                {/* Search */}
                <div className="px-4 py-3">
                  <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                      <div className="text-[#677283] flex border-none bg-[#f1f2f4] items-center justify-center pl-4 rounded-l-lg border-r-0">
                        <Search className="w-6 h-6" />
                      </div>
                      <input
                        placeholder="Search projects"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#121417] focus:outline-0 focus:ring-0 border-none bg-[#f1f2f4] focus:border-none h-full placeholder:text-[#677283] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </label>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-3 p-3 flex-wrap pr-4">
                  <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f1f2f4] pl-4 pr-2">
                    <p className="text-[#121417] text-sm font-medium leading-normal">Status</p>
                    <ChevronDown className="w-5 h-5 text-[#121417]" />
                  </button>
                  <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f1f2f4] pl-4 pr-2">
                    <p className="text-[#121417] text-sm font-medium leading-normal">Due Date</p>
                    <ChevronDown className="w-5 h-5 text-[#121417]" />
                  </button>
                  <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f1f2f4] pl-4 pr-2">
                    <p className="text-[#121417] text-sm font-medium leading-normal">Budget</p>
                    <ChevronDown className="w-5 h-5 text-[#121417]" />
                  </button>
                  <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f1f2f4] pl-4 pr-2">
                    <p className="text-[#121417] text-sm font-medium leading-normal">Category</p>
                    <ChevronDown className="w-5 h-5 text-[#121417]" />
                  </button>
                  <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f1f2f4] pl-4 pr-2">
                    <p className="text-[#121417] text-sm font-medium leading-normal">Project Owner</p>
                    <ChevronDown className="w-5 h-5 text-[#121417]" />
                  </button>
                </div>

                {/* Projects Table */}
                <div className="px-4 py-3">
                  <div className="flex overflow-hidden rounded-lg border border-[#dde0e4] bg-white">
                    <table className="flex-1">
                      <thead>
                        <tr className="bg-white">
                          <th className="px-4 py-3 text-left text-[#121417] w-[400px] text-sm font-medium leading-normal">Project</th>
                          <th className="px-4 py-3 text-left text-[#121417] w-60 text-sm font-medium leading-normal">Category</th>
                          <th className="px-4 py-3 text-left text-[#121417] w-[400px] text-sm font-medium leading-normal">Status</th>
                          <th className="px-4 py-3 text-left text-[#121417] w-[400px] text-sm font-medium leading-normal">Due Date</th>
                          <th className="px-4 py-3 text-left text-[#121417] w-[400px] text-sm font-medium leading-normal">Budget</th>
                          <th className="px-4 py-3 text-left text-[#121417] w-[400px] text-sm font-medium leading-normal">Project Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((project) => (
                          <tr key={project.id} className="border-t border-t-[#dde0e4]">
                            <td className="h-[72px] px-4 py-2 w-[400px] text-[#121417] text-sm font-normal leading-normal">
                              {project.name}
                            </td>
                            <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                              <button className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 text-sm font-medium leading-normal w-full ${getStatusColor(project.category)}`}>
                                <span className="truncate">{project.category}</span>
                              </button>
                            </td>
                            <td className="h-[72px] px-4 py-2 w-[400px] text-sm font-normal leading-normal">
                              <div className="flex items-center gap-3">
                                <div className="w-[88px] overflow-hidden rounded-sm bg-[#dde0e4]">
                                  <div className="h-1 rounded-full bg-[#121417]" style={{ width: `${project.status}%` }}></div>
                                </div>
                                <p className="text-[#121417] text-sm font-medium leading-normal">{project.status}</p>
                              </div>
                            </td>
                            <td className="h-[72px] px-4 py-2 w-[400px] text-[#677283] text-sm font-normal leading-normal">
                              {project.dueDate}
                            </td>
                            <td className="h-[72px] px-4 py-2 w-[400px] text-[#677283] text-sm font-normal leading-normal">
                              {project.budget}
                            </td>
                            <td className="h-[72px] px-4 py-2 w-[400px] text-[#677283] text-sm font-normal leading-normal">
                              {project.projectOwner}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Activity Feed */}
                <h3 className="text-[#121417] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Activity Feed</h3>
                <div className="grid grid-cols-[40px_1fr] gap-x-2 px-4">
                  <div className="flex flex-col items-center gap-1 pt-3">
                    <Calendar className="w-6 h-6 text-[#121417]" />
                    <div className="w-[1.5px] bg-[#dde0e4] h-2 grow"></div>
                  </div>
                  <div className="flex flex-1 flex-col py-3">
                    <p className="text-[#121417] text-base font-medium leading-normal">Project Harmony: Initial Meeting</p>
                    <p className="text-[#677283] text-base font-normal leading-normal">2024-07-01</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-[1.5px] bg-[#dde0e4] h-2"></div>
                    <Check className="w-6 h-6 text-[#121417]" />
                    <div className="w-[1.5px] bg-[#dde0e4] h-2 grow"></div>
                  </div>
                  <div className="flex flex-1 flex-col py-3">
                    <p className="text-[#121417] text-base font-medium leading-normal">Project Rhythm: Final Approval</p>
                    <p className="text-[#677283] text-base font-normal leading-normal">2024-05-15</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 pb-3">
                    <div className="w-[1.5px] bg-[#dde0e4] h-2"></div>
                    <Play className="w-6 h-6 text-[#121417]" />
                  </div>
                  <div className="flex flex-1 flex-col py-3">
                    <p className="text-[#121417] text-base font-medium leading-normal">Project Melody: Kickoff</p>
                    <p className="text-[#677283] text-base font-normal leading-normal">2024-10-20</p>
                  </div>
                </div>
              </>
            )}

            {/* Other tabs content */}
            {activeTab !== 'projects' && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
                  <p className="text-gray-600">This section is under development.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}