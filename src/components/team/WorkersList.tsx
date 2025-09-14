import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Users, Plus, Mail, Phone, MapPin, Calendar, Star } from 'lucide-react';

interface WorkersListProps {
  onBack: () => void;
  onWorkerSelect?: (worker: any) => void;
  workerType?: 'Internal' | 'External' | 'All';
  title?: string;
  description?: string;
}

export function WorkersList({ 
  onBack, 
  onWorkerSelect, 
  workerType = 'All',
  title = 'All Workers',
  description = 'Manage all workers across CASFID International'
}: WorkersListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'invited'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Only James Tyson profile exists - all others must be created through IntraExtra
  const allWorkers = [
    {
      id: 'james-tyson',
      name: 'James Tyson',
      role: 'Master User',
      status: 'active' as const,
      project: 'Platform Administration',
      type: 'Internal' as const,
      lastActive: '5 minutes ago',
      location: '',
      department: 'Administration',
      email: 'tyson@casfid.com',
      phone: '',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      rating: 5.0,
      skills: ['Platform Administration', 'User Management', 'System Oversight']
    }
  ];

  const getFilteredWorkers = () => {
    let filtered = allWorkers;
    
    // Filter by worker type
    if (workerType !== 'All') {
      filtered = filtered.filter(worker => worker.type === workerType);
    }
    
    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(worker => worker.status === activeTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

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

  const handleSelectAll = () => {
    const filteredWorkers = getFilteredWorkers();
    if (selectAll) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(filteredWorkers.map(worker => worker.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectWorker = (workerId: string) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const renderStarRating = (rating: number) => {
    if (rating === 0) return <span className="text-xs text-gray-400">Not rated</span>;
    
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

  const filteredWorkers = getFilteredWorkers();

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 px-10 py-3">
          <div className="flex items-center gap-4 text-slate-800">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div>
                <p className="text-slate-800 tracking-light text-[32px] font-bold leading-tight min-w-72">{title}</p>
                <p className="text-slate-500 text-sm font-normal leading-normal mt-1">
                  {description}
                </p>
              </div>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-slate-800 text-white text-sm font-medium leading-normal">
                <Plus className="w-4 h-4 mr-2" />
                <span className="truncate">Add New Worker</span>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="pb-3">
              <div className="flex border-b border-slate-200 px-4 gap-8">
                <button
                  onClick={() => { setActiveTab('all'); setSelectAll(false); setSelectedWorkers([]); }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === 'all' ? 'border-b-slate-800 text-slate-800' : 'border-b-transparent text-slate-500'
                  }`}
                >
                  <p className="text-sm font-bold leading-tight tracking-[0.015em]">All</p>
                </button>
                
                <button
                  onClick={() => { setActiveTab('active'); setSelectAll(false); setSelectedWorkers([]); }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === 'active' ? 'border-b-slate-800 text-slate-800' : 'border-b-transparent text-slate-500'
                  }`}
                >
                  <p className="text-sm font-bold leading-tight tracking-[0.015em]">Active</p>
                </button>
                
                <button
                  onClick={() => { setActiveTab('inactive'); setSelectAll(false); setSelectedWorkers([]); }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === 'inactive' ? 'border-b-slate-800 text-slate-800' : 'border-b-transparent text-slate-500'
                  }`}
                >
                  <p className="text-sm font-bold leading-tight tracking-[0.015em]">Inactive</p>
                </button>
                
                <button
                  onClick={() => { setActiveTab('invited'); setSelectAll(false); setSelectedWorkers([]); }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === 'invited' ? 'border-b-slate-800 text-slate-800' : 'border-b-transparent text-slate-500'
                  }`}
                >
                  <p className="text-sm font-bold leading-tight tracking-[0.015em]">Invited</p>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex justify-between items-center px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full max-w-md">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-slate-500 flex border-none bg-slate-100 items-center justify-center pl-3 rounded-l-lg border-r-0">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 focus:outline-0 focus:ring-0 border-none bg-slate-100 focus:border-none h-full placeholder:text-slate-500 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    placeholder="Search workers by name, role, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
              <div className="flex items-center gap-4">
                {selectedWorkers.length > 0 && (
                  <span className="text-sm text-slate-600">
                    {selectedWorkers.length} selected
                  </span>
                )}
                <button 
                  onClick={() => { setSearchQuery(''); setSelectAll(false); setSelectedWorkers([]); }}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
              </div>
            </div>

            {/* Workers Table */}
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white">
                      <th className="px-4 py-3 text-left text-slate-800 w-[400px] text-sm font-medium leading-normal">
                        <div className="flex items-center gap-2 cursor-pointer">
                          <input 
                            className="form-checkbox rounded border-slate-300 text-slate-800 focus:ring-slate-800" 
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                          Name
                          <Filter className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-slate-800 w-[400px] text-sm font-medium leading-normal">
                        <div className="flex items-center gap-2">Role & Department<Filter className="w-4 h-4" /></div>
                      </th>
                      <th className="px-4 py-3 text-left text-slate-800 w-60 text-sm font-medium leading-normal">
                        <div className="flex items-center gap-2">Status<Filter className="w-4 h-4" /></div>
                      </th>
                      <th className="px-4 py-3 text-left text-slate-800 w-[400px] text-sm font-medium leading-normal">
                        <div className="flex items-center gap-2">Current Project<Filter className="w-4 h-4" /></div>
                      </th>
                      <th className="px-4 py-3 text-left text-slate-800 w-[400px] text-sm font-medium leading-normal">
                        <div className="flex items-center gap-2">Type & Location<Filter className="w-4 h-4" /></div>
                      </th>
                      <th className="px-4 py-3 text-left text-slate-800 w-[300px] text-sm font-medium leading-normal">
                        <div className="flex items-center gap-2">Contact & Rating<Filter className="w-4 h-4" /></div>
                      </th>
                      <th className="px-4 py-3 text-left text-slate-800 w-[400px] text-sm font-medium leading-normal">
                        <div className="flex items-center gap-2">Last Active<Filter className="w-4 h-4" /></div>
                      </th>
                      <th className="px-4 py-3 text-left text-slate-800 w-60 text-sm font-medium leading-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.map((worker) => (
                      <tr key={worker.id} className="border-t border-t-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="h-[72px] px-4 py-2 w-[400px] text-slate-800 text-sm font-normal leading-normal">
                          <div className="flex items-center gap-2">
                            <input 
                              className="form-checkbox rounded border-slate-300 text-slate-800 focus:ring-slate-800" 
                              type="checkbox"
                              checked={selectedWorkers.includes(worker.id)}
                              onChange={() => handleSelectWorker(worker.id)}
                            />
                            <div className="flex items-center gap-3">
                              {worker.avatar ? (
                                <img
                                  src={worker.avatar}
                                  alt={worker.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <button
                                onClick={() => onWorkerSelect?.(worker)}
                                className="font-medium text-slate-800 hover:text-blue-600 transition-colors"
                              >
                                {worker.name}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-slate-500 text-sm font-normal leading-normal">
                          <div>
                            <div className="font-medium text-slate-800">{worker.role}</div>
                            <div className="text-xs text-slate-500">{worker.department}</div>
                          </div>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                          <button className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 text-sm font-medium leading-normal w-full ${getStatusColor(worker.status)}`}>
                            <span className="truncate capitalize">{worker.status}</span>
                          </button>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-slate-500 text-sm font-normal leading-normal">
                          {worker.project}
                        </td>
                        <td className="h-[72px] px-4 py-2 text-slate-500 text-sm font-normal leading-normal">
                          <div>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(worker.type)}`}>
                              {worker.type}
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{worker.location}</span>
                            </div>
                          </div>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[300px] text-slate-500 text-sm font-normal leading-normal">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="text-xs truncate">{worker.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="text-xs">{worker.phone}</span>
                            </div>
                            {worker.rating > 0 && (
                              <div className="flex items-center gap-1">
                                {renderStarRating(worker.rating)}
                                <span className="text-xs text-slate-500 ml-1">{worker.rating}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-slate-500 text-sm font-normal leading-normal">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-xs">{worker.lastActive}</span>
                          </div>
                        </td>
                        <td className="h-[72px] px-4 py-2 w-60 text-slate-500 text-sm font-bold leading-normal tracking-[0.015em]">
                          <button 
                            onClick={() => onWorkerSelect?.(worker)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Empty State */}
              {filteredWorkers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No workers found</h3>
                  <p className="text-slate-500">
                    {searchQuery ? 'Try adjusting your search criteria' : 'No workers match the current filter'}
                  </p>
                </div>
              )}
              
              {/* Summary Stats */}
              <div className="mt-6 bg-white rounded-lg border border-slate-200 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{filteredWorkers.filter(w => w.status === 'active').length}</div>
                    <div className="text-sm text-slate-500">Active Workers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{filteredWorkers.filter(w => w.type === 'Internal').length}</div>
                    <div className="text-sm text-slate-500">Internal</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{filteredWorkers.filter(w => w.type === 'External').length}</div>
                    <div className="text-sm text-slate-500">External</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{filteredWorkers.filter(w => w.status === 'busy').length}</div>
                    <div className="text-sm text-slate-500">Busy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}