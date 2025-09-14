import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Columns, ChevronUpDown } from 'lucide-react';
import { CreateClientModal } from './CreateClientModal';
import { ClientProfile } from './ClientProfile';

type ClientStatus = 'Active' | 'Prospect' | 'On Hold' | 'Inactive';
type FilterType = 'all' | 'high-value' | 'new' | 'at-risk' | 'inactive';

interface Client {
  id: string;
  name: string;
  dateAdded: string;
  primaryContact: string;
  country: string;
  assignedTo: string;
  status: ClientStatus;
  value?: number;
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

interface ColumnConfig {
  id: keyof Client | 'value';
  label: string;
  visible: boolean;
}

export function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'name', label: 'Client Name', visible: true },
    { id: 'dateAdded', label: 'Date Added', visible: true },
    { id: 'primaryContact', label: 'Primary Contact', visible: true },
    { id: 'country', label: 'Country', visible: true },
    { id: 'assignedTo', label: 'Assigned To', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'value', label: 'Value', visible: false },
  ]);

  // Sample data - in production this would come from an API
  const [clients] = useState<Client[]>([
    {
      id: '1',
      name: 'Vibe Events Co',
      dateAdded: '2023-11-15',
      primaryContact: 'John Doe',
      country: 'USA',
      assignedTo: 'Alex Bennett',
      status: 'Active',
      email: 'vibeevents@email.com',
      phone: '+1-555-987-6543',
      address: '123 Festival Grounds, Anytown, USA',
      website: 'vibeevents.com',
      linkedin: 'linkedin.com/company/vibeevents',
      instagram: 'instagram.com/vibeevents',
      twitter: 'twitter.com/vibeevents',
      lastActive: '2d ago',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg2clo-WxfcRw8LIMTPld4TnO84G2-sE9ARwyXnkz6soHGvLG-i6Wt19GhMdhxQOuAFvry7oSgE3k368_Jd4FuG1e1FdoMRY_h_uCjMSLNPr-vA_HOxpTl8WozlUyDoJchBA-5TSmFy0hl5Pr16qngvnMQTAb1rgMAtiNut3-vr8yOMe-K8wuyqRfBtugMKjdQcqnNRZtW4t6L83a5De8wQtkN_X7T0CxvFxqvCWOdabqxhCLvaQpPl301yKkgK3pK30pHLjDEhAFh',
      about: 'Vibe Events Co is a valued client known for organizing vibrant and memorable music festivals. They have a strong focus on creating immersive experiences for attendees, blending diverse musical genres with engaging visual and interactive elements. Their events are characterized by high energy and a commitment to delivering top-tier entertainment.'
    },
    {
      id: '2',
      name: 'Harmony Events',
      dateAdded: '2023-12-01',
      primaryContact: 'Jane Smith',
      country: 'UK',
      assignedTo: 'Sophia Carter',
      status: 'Active',
      email: 'contact@harmony-events.com',
      phone: '+44-123-456-7890',
      address: '456 Music Lane, London, UK',
      lastActive: '1w ago',
      about: 'Harmony Events specializes in creating harmonious and well-coordinated events with a focus on music and entertainment.'
    },
    {
      id: '3',
      name: 'Global Sports Inc.',
      dateAdded: '2024-01-10',
      primaryContact: 'Mike Johnson',
      country: 'Spain',
      assignedTo: 'Ethan Davis',
      status: 'Prospect',
      email: 'mike.johnson@globalsports.com',
      phone: '+34-987-654-3210',
      address: '789 Sports Plaza, Madrid, Spain',
      lastActive: '3d ago',
      about: 'Global Sports Inc. is a leading sports event management company specializing in international tournaments and competitions.'
    },
    {
      id: '4',
      name: 'Business Leaders Group',
      dateAdded: '2024-02-20',
      primaryContact: 'Emily Williams',
      country: 'Germany',
      assignedTo: 'Olivia Evans',
      status: 'On Hold',
    },
    {
      id: '5',
      name: 'Creative Arts Society',
      dateAdded: '2024-03-05',
      primaryContact: 'Chris Brown',
      country: 'France',
      assignedTo: 'Liam Foster',
      status: 'Active',
    },
    {
      id: '6',
      name: 'Cinema World',
      dateAdded: '2024-04-15',
      primaryContact: 'Patricia Miller',
      country: 'Italy',
      assignedTo: 'Ava Green',
      status: 'Inactive',
    },
    {
      id: '7',
      name: 'Taste of the World',
      dateAdded: '2024-05-01',
      primaryContact: 'David Wilson',
      country: 'Australia',
      assignedTo: 'Noah Harris',
      status: 'Prospect',
    },
    {
      id: '8',
      name: 'Style & Glamour',
      dateAdded: '2024-06-10',
      primaryContact: 'Sarah Moore',
      country: 'Japan',
      assignedTo: 'Isabella Jones',
      status: 'Inactive',
    },
    {
      id: '9',
      name: 'Game On Inc.',
      dateAdded: '2024-07-20',
      primaryContact: 'James Taylor',
      country: 'South Korea',
      assignedTo: 'Jackson King',
      status: 'Active',
    },
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleCreateClient = (clientData: any) => {
    // In a real application, this would make an API call
    console.log('Creating new client:', clientData);
    
    // For now, we'll just log the data and close the modal
    // In production, you would add the client to your state/database
  };

  const getStatusClass = (status: ClientStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-50 text-blue-600';
      case 'Prospect':
        return 'bg-yellow-50 text-yellow-700';
      case 'On Hold':
        return 'bg-orange-50 text-orange-600';
      case 'Inactive':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredClients = clients.filter(client => {
    // Apply search filter
    if (searchQuery && !client.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !client.primaryContact.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !client.country.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply status filter
    switch (activeFilter) {
      case 'high-value':
        return client.status === 'Active'; // Simplified logic
      case 'new':
        return new Date(client.dateAdded) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      case 'at-risk':
        return client.status === 'On Hold';
      case 'inactive':
        return client.status === 'Inactive';
      default:
        return true;
    }
  });

  // Show client profile if a client is selected
  if (selectedClient) {
    return (
      <ClientProfile 
        client={selectedClient} 
        onBack={() => setSelectedClient(null)} 
      />
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Clients</h2>
          <p className="text-gray-600 mt-1">Manage all your clients in one place</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#b2cbe5] text-[#101418] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#a5c1db] transition-colors gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="truncate">Create New Client</span>
        </button>
      </div>

      {/* Search and Columns */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
          <input
            className="bg-gray-100 text-gray-900 placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl w-full border-0 focus:ring-2 focus:ring-blue-300"
            placeholder="Search clients"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ml-4 relative" ref={dropdownRef}>
          <button
            className="bg-white hover:bg-gray-100 text-gray-600 font-medium flex items-center px-4 py-2 rounded-xl border border-gray-300"
            onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
          >
            <span className="material-icons mr-2">view_column</span>
            Columns
          </button>
          
          {/* Columns Dropdown */}
          {showColumnsDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-10">
              <div className="p-4 border-b border-gray-200">
                <p className="font-semibold text-gray-900">Edit Columns</p>
                <p className="text-sm text-gray-600">Select the columns to display.</p>
              </div>
              <div className="p-4 space-y-3">
                {columns.map(column => (
                  <label key={column.id} className="flex items-center space-x-3">
                    <input
                      checked={column.visible}
                      className="form-checkbox h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      type="checkbox"
                      onChange={() => toggleColumn(column.id)}
                    />
                    <span className="text-gray-900 text-sm">{column.label}</span>
                  </label>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <label className="flex items-center space-x-3">
                  <input
                    className="form-checkbox h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">Save as default view</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeFilter === 'all' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Clients
        </button>
        <button
          onClick={() => setActiveFilter('high-value')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeFilter === 'high-value' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          High Value
        </button>
        <button
          onClick={() => setActiveFilter('new')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeFilter === 'new' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          New
        </button>
        <button
          onClick={() => setActiveFilter('at-risk')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeFilter === 'at-risk' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          At Risk
        </button>
        <button
          onClick={() => setActiveFilter('inactive')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeFilter === 'inactive' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          Inactive
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.filter(col => col.visible).map(column => (
                <th
                  key={column.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <span>{column.label}</span>
                    <span className="material-icons text-sm ml-1 text-gray-400">unfold_more</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map(client => (
              <tr key={client.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedClient(client)}>
                {columns.filter(col => col.visible).map(column => (
                  <td key={column.id} className="px-6 py-4 whitespace-nowrap text-sm">
                    {column.id === 'name' && (
                      <span className="font-medium text-gray-900">{client.name}</span>
                    )}
                    {column.id === 'dateAdded' && (
                      <span className="text-gray-600">{client.dateAdded}</span>
                    )}
                    {column.id === 'primaryContact' && (
                      <span className="text-gray-600">{client.primaryContact}</span>
                    )}
                    {column.id === 'country' && (
                      <span className="text-gray-600">{client.country}</span>
                    )}
                    {column.id === 'assignedTo' && (
                      <span className="text-gray-600">{client.assignedTo}</span>
                    )}
                    {column.id === 'status' && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-xs ${getStatusClass(client.status)}`}>
                        {client.status}
                      </span>
                    )}
                    {column.id === 'value' && (
                      <span className="text-gray-600">{client.value ? `$${client.value.toLocaleString()}` : '-'}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClient}
      />
    </div>
  );
}