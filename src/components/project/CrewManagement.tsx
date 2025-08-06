import React, { useState } from 'react';
import { Users, Calendar, DollarSign, Clock, Plus, Search, Filter, Edit, Save, CheckCircle, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight, Printer, Maximize, Mail, MessageSquare, Trash2, ChevronDown, GripVertical, Lock, Unlock, Upload, Download, Bell, Plane, Car } from 'lucide-react';
import { Project } from '../../types';

interface CrewManagementProps {
  project: Project;
}

type CrewTab = 'assignment' | 'compliance' | 'travel' | 'costs' | 'rota';

interface FlightData {
  id: string;
  number: string;
  airport: string;
  dateTime: string;
  crew: string;
  avatar: string;
  status: 'On Time' | 'Delayed' | 'Cancelled';
  direction: 'Outbound' | 'Inbound';
}

interface DriveData {
  id: string;
  details: string;
  vehicle: string;
  dateTime: string;
  crew: string;
  avatar: string;
  status: 'Confirmed' | 'Pending';
  direction: 'Outbound' | 'Inbound';
}

interface AccommodationData {
  id: string;
  hotel: string;
  address: string;
  dates: string;
  roomAssignment: string;
  cost: string;
  status: 'Booked' | 'Not Booked' | 'Pending';
}

export function CrewManagement({ project }: CrewManagementProps) {
  const [activeTab, setActiveTab] = useState<CrewTab>('assignment');
  const [isRateTypeLocked, setIsRateTypeLocked] = useState(true);
  const [expenseRows, setExpenseRows] = useState([1]);
  const [showRatesModal, setShowRatesModal] = useState(false);

  const addExpenseRow = () => {
    setExpenseRows(prev => [...prev, prev.length + 1]);
  };

  const removeExpenseRow = (index: number) => {
    setExpenseRows(prev => prev.filter((_, i) => i !== index));
  };
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Cashless', 'Access Control']);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState('day');
  const [activeCrewFilter, setActiveCrewFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [overrideDates, setOverrideDates] = useState(false);
  const [startDate, setStartDate] = useState('2024-06-10');
  const [endDate, setEndDate] = useState('2024-06-16');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState<string | null>(null);

  const crewRota = [
    {
      id: '1',
      name: 'Alex Johnson',
      role: 'Lighting Technician',
      area: 'Main Stage',
      areaColor: 'purple',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      schedule: {
        'Mon': { shift: '09:00 - 17:00', status: 'working' },
        'Tue': { shift: '09:00 - 17:00', status: 'working' },
        'Wed': { shift: 'Off', status: 'off' },
        'Thu': { shift: '09:00 - 17:00', status: 'working' },
        'Fri': { shift: '09:00 - 17:00', status: 'working' },
        'Sat': { shift: '09:00 - 17:00', status: 'working' },
        'Sun': { shift: 'Off', status: 'off' }
      }
    },
    {
      id: '2',
      name: 'Maria Garcia',
      role: 'Sound Engineer',
      area: 'FOH',
      areaColor: 'blue',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      schedule: {
        'Mon': { shift: 'Off', status: 'off' },
        'Tue': { shift: '11:00 - 19:00', status: 'working' },
        'Wed': { shift: '11:00 - 19:00', status: 'working' },
        'Thu': { shift: '11:00 - 19:00', status: 'working' },
        'Fri': { shift: 'Off', status: 'off' },
        'Sat': { shift: '11:00 - 19:00', status: 'working' },
        'Sun': { shift: '11:00 - 19:00', status: 'working' }
      }
    },
    {
      id: '3',
      name: 'James Smith',
      role: 'Stage Hand',
      area: 'Backstage',
      areaColor: 'green',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      schedule: {
        'Mon': { shift: '14:00 - 22:00', status: 'working' },
        'Tue': { shift: '14:00 - 22:00', status: 'working' },
        'Wed': { shift: '14:00 - 22:00', status: 'working' },
        'Thu': { shift: 'Off', status: 'off' },
        'Fri': { shift: '14:00 - 22:00', status: 'working' },
        'Sat': { shift: 'Off', status: 'off' },
        'Sun': { shift: '14:00 - 22:00', status: 'working' }
      }
    }
  ];

  // Available staff for search
  const availableStaff = [
    {
      id: '4',
      name: 'Emily White',
      role: 'Rigger',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '5',
      name: 'Michael Brown',
      role: 'Catering',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  const weekDays = [
    { short: 'Mon', date: '10' },
    { short: 'Tue', date: '11' },
    { short: 'Wed', date: '12' },
    { short: 'Thu', date: '13' },
    { short: 'Fri', date: '14' },
    { short: 'Sat', date: '15' },
    { short: 'Sun', date: '16' }
  ];

  const getAreaColorClass = (color: string, status: string) => {
    if (status === 'off') {
      return 'bg-gray-100 text-gray-500';
    }
    
    switch (color) {
      case 'purple':
        return 'bg-purple-100 border-l-4 border-purple-500 text-purple-800';
      case 'blue':
        return 'bg-blue-100 border-l-4 border-blue-500 text-blue-800';
      case 'green':
        return 'bg-green-100 border-l-4 border-green-500 text-green-800';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const getAreaDotColor = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-purple-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredStaff = availableStaff.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteCrewMember = (crewId: string, crewName: string) => {
    setSelectedCrewMember(crewName);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // Handle deletion logic here
    setShowDeleteDialog(false);
    setSelectedCrewMember(null);
    // toast.success('Crew member removed from rota');
  };

  const renderAssignmentTab = () => (
    <div className="space-y-8">
      {/* Three Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Requirements Column */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Requirements</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <select className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option>Team Lead</option>
                <option>Technician</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity</label>
                <input 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" 
                  type="number" 
                  defaultValue="5"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Dates</label>
                <input 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm" 
                  type="text" 
                  defaultValue="20/05 - 24/05"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Skills Required</label>
              <button
                onClick={() => setShowSkillsModal(true)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm bg-white text-left flex justify-between items-center"
              >
                <span className="text-gray-700">
                  {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'Select skills'}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <button className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-4 rounded-lg border border-blue-200 flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Role</span>
            </button>
          </div>
        </div>

        {/* AI Suggestions Column */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">AI Suggestions</h2>
          <div className="space-y-4">
            {/* Top Suggestion */}
            <div className="bg-white p-3 rounded-lg border border-yellow-400 shadow-sm relative">
              <div className="absolute top-2 right-2 text-yellow-500 text-2xl">🥇</div>
              <div className="flex items-center space-x-3">
                <img 
                  alt="John Smith" 
                  className="w-10 h-10 rounded-full" 
                  src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                />
                <div>
                  <p className="font-semibold text-gray-800">John Smith <span className="text-green-600">✓</span></p>
                  <p className="text-sm text-gray-500">London | ⭐4.8</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Skills:</span> Cashless, Access Control, Team Lead</p>
                <p><span className="font-medium">Last event:</span> Similar client (May 2025)</p>
                <p className="font-semibold text-gray-800">Cost: €350/day | Total: €1,750</p>
              </div>
            </div>

            {/* Second Suggestion */}
            <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-sm relative">
              <div className="absolute top-2 right-2 text-gray-400 text-2xl">🥈</div>
              <div className="flex items-center space-x-3">
                <img 
                  alt="Sarah Jones" 
                  className="w-10 h-10 rounded-full" 
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                />
                <div>
                  <p className="font-semibold text-gray-800">Sarah Jones <span className="text-green-600">✓</span></p>
                  <p className="text-sm text-gray-500">Manchester | ⭐4.6</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Skills:</span> Cashless, Customer Service</p>
                <p><span className="font-medium">Travel required:</span> €180</p>
                <p className="font-semibold text-gray-800">Cost: €300/day | Total: €1,680</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Crew Column */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Assigned Crew (5)</h2>
          <div className="mb-4">
            <input 
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm" 
              placeholder="Search or add crew manually" 
              type="text"
            />
          </div>
          <div className="space-y-3">
            {/* Assigned Crew Member 1 */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  alt="Mike Ross" 
                  className="w-10 h-10 rounded-full" 
                  src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                />
                <div>
                  <p className="font-semibold text-gray-800">Mike Ross</p>
                  <p className="text-sm text-gray-500">Team Lead</p>
                </div>
              </div>
              <GripVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
            </div>

            {/* Assigned Crew Member 2 with Warning */}
            <div className="bg-white p-3 rounded-lg border border-red-300 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img 
                    alt="Emily White" 
                    className="w-10 h-10 rounded-full" 
                    src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">Emily White</p>
                    <p className="text-sm text-gray-500">Technician</p>
                  </div>
                </div>
                <GripVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Double booked on Day 3</span>
              </div>
            </div>
          </div>

          {/* Backup Crew Section */}
          <h3 className="text-md font-semibold mt-6 mb-2 text-gray-600">Backup Crew</h3>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-500">
              Drag crew here or search to add
            </div>
          </div>
        </div>
      </div>

      {/* Crew Details Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Crew Details</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Crew Member</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img 
                      alt="Mike Ross" 
                      className="w-10 h-10 rounded-full" 
                      src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Mike Ross</p>
                      <p className="text-sm text-gray-500">m.ross@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">Team Lead</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">20/05 - 24/05</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">07123456789</td>
                <td className="p-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>
                </td>
                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Details</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img 
                      alt="Emily White" 
                      className="w-10 h-10 rounded-full" 
                      src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Emily White</p>
                      <p className="text-sm text-gray-500">e.white@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">Technician</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">20/05 - 24/05</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">07987654321</td>
                <td className="p-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Double Booked</span>
                </td>
                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Details</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img 
                      alt="David Chen" 
                      className="w-16 h-16 rounded-full mx-auto" 
                      src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">David Chen</p>
                      <p className="text-sm text-gray-500">d.chen@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">Technician</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">20/05 - 24/05</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">07111222333</td>
                <td className="p-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>
                </td>
                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Details</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img 
                      alt="Jessica Miller" 
                      className="w-10 h-10 rounded-full" 
                      src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Jessica Miller</p>
                      <p className="text-sm text-gray-500">j.miller@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">Team Lead</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">21/05 - 23/05</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">07444555666</td>
                <td className="p-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                </td>
                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Details</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img 
                      alt="Brian Wilson" 
                      className="w-10 h-10 rounded-full" 
                      src="https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Brian Wilson</p>
                      <p className="text-sm text-gray-500">b.wilson@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">Technician</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">20/05 - 22/05</td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-600">07778889990</td>
                <td className="p-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>
                </td>
                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRotaTab = () => (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Edit className="w-4 h-4 mr-1.5" /> Edit Mode
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Staff Rota</h2>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 relative">
                <div className="flex items-center absolute top-[-3rem] right-0">
                  <input 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                    id="override-dates" 
                    type="checkbox"
                  />
                  <label className="ml-2 text-gray-700" htmlFor="override-dates">Override project dates</label>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="font-medium" htmlFor="start-date">Start:</label>
                  <input 
                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm p-1.5 w-36" 
                    id="start-date" 
                    type="date" 
                    defaultValue="2024-06-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="font-medium" htmlFor="end-date">End:</label>
                  <input 
                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm p-1.5 w-36" 
                    id="end-date" 
                    type="date" 
                    defaultValue="2024-06-16"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 whitespace-nowrap">
                <Printer className="w-4 h-4 mr-2" /> Print
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" /> Add Shift
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 whitespace-nowrap">
                <CheckCircle className="w-4 h-4 mr-2" /> Save Changes
              </button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-md hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-base sm:text-lg font-medium text-gray-700">June 2024</span>
              <button className="p-2 rounded-md hover:bg-gray-100">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex border rounded-md">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-l-md">Day</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">Week</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-r-md">Month</button>
              </div>
              <button className="p-2 rounded-md hover:bg-gray-100" title="Fullscreen">
                <Maximize className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs and Search */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-2 gap-4">
              <nav className="flex-1 -mb-px flex flex-wrap space-x-4 sm:space-x-6">
                <button className="shrink-0 px-1 pb-4 text-sm font-medium text-indigo-600 border-b-2 border-indigo-500">
                  All Crew
                </button>
                <button className="shrink-0 px-1 pb-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                  Seniors
                </button>
                <button className="shrink-0 px-1 pb-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2"></span>Zone A
                </button>
                <button className="shrink-0 px-1 pb-4 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>Zone B
                </button>
                <button className="flex items-center px-2 py-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                  <Plus className="w-4 h-4 mr-1" /> group
                </button>
              </nav>
              <div className="flex items-center w-full lg:w-auto">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    className="pl-10 pr-4 py-2 w-full lg:w-64 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm" 
                    placeholder="Search to add staff..." 
                    type="text"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rota Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3" scope="col">Crew Member</th>
                  <th className="px-6 py-3 hidden md:table-cell" scope="col">Role</th>
                  <th className="px-6 py-3 hidden lg:table-cell" scope="col">Area</th>
                  <th className="px-2 py-3 text-center" scope="col">
                    <div>Mon</div>
                    <div>10</div>
                  </th>
                  <th className="px-2 py-3 text-center" scope="col">
                    <div>Tue</div>
                    <div>11</div>
                  </th>
                  <th className="px-2 py-3 text-center bg-indigo-50" scope="col">
                    <div>Wed</div>
                    <div>12</div>
                  </th>
                  <th className="px-2 py-3 text-center" scope="col">
                    <div>Thu</div>
                    <div>13</div>
                  </th>
                  <th className="px-2 py-3 text-center" scope="col">
                    <div>Fri</div>
                    <div>14</div>
                  </th>
                  <th className="px-2 py-3 text-center" scope="col">
                    <div>Sat</div>
                    <div>15</div>
                  </th>
                  <th className="px-2 py-3 text-center" scope="col">
                    <div>Sun</div>
                    <div>16</div>
                  </th>
                  <th className="px-2 py-3" scope="col"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Alex Johnson */}
                <tr className="bg-white hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        alt="Alex Johnson avatar" 
                        className="w-8 h-8 rounded-full mr-3" 
                        src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                      />
                      <div>
                        <div className="font-semibold">Alex Johnson</div>
                        <div className="text-gray-500 text-xs md:hidden">Lighting Technician</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">Lighting Technician</td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500 mr-2"></span>Main Stage
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>09:00 - 17:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>09:00 - 17:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center bg-indigo-50">
                    <div className="bg-gray-100 text-gray-500 p-2 rounded-md text-xs leading-tight h-full flex items-center justify-center">Off</div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>09:00 - 17:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>09:00 - 17:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>09:00 - 17:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-gray-100 text-gray-500 p-2 rounded-md text-xs leading-tight h-full flex items-center justify-center">Off</div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button className="text-red-500 opacity-50 hover:opacity-100 transition-opacity p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>

                {/* Maria Garcia */}
                <tr className="bg-white hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        alt="Maria Garcia avatar" 
                        className="w-8 h-8 rounded-full mr-3" 
                        src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                      />
                      <div>
                        <div className="font-semibold">Maria Garcia</div>
                        <div className="text-gray-500 text-xs md:hidden">Sound Engineer</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">Sound Engineer</td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>FOH
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-gray-100 text-gray-500 p-2 rounded-md text-xs leading-tight h-full flex items-center justify-center">Off</div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>11:00 - 19:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center bg-indigo-50">
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>11:00 - 19:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>11:00 - 19:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-gray-100 text-gray-500 p-2 rounded-md text-xs leading-tight h-full flex items-center justify-center">Off</div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>11:00 - 19:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>11:00 - 19:00</div>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button className="text-red-500 opacity-50 hover:opacity-100 transition-opacity p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>

                {/* James Smith */}
                <tr className="bg-white hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        alt="James Smith avatar" 
                        className="w-8 h-8 rounded-full mr-3" 
                        src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                      />
                      <div>
                        <div className="font-semibold">James Smith</div>
                        <div className="text-gray-500 text-xs md:hidden">Stage Hand</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">Stage Hand</td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>Backstage
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>14:00 - 22:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>14:00 - 22:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center bg-indigo-50">
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>14:00 - 22:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-gray-100 text-gray-500 p-2 rounded-md text-xs leading-tight h-full flex items-center justify-center">Off</div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>14:00 - 22:00</div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-gray-100 text-gray-500 p-2 rounded-md text-xs leading-tight h-full flex items-center justify-center">Off</div>
                  </td>
                  <td className="p-1 text-center">
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-2 rounded-r-md text-xs leading-tight">
                      <div>14:00 - 22:00</div>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button className="text-red-500 opacity-50 hover:opacity-100 transition-opacity p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>

                {/* Add Staff Row */}
                <tr className="bg-gray-50 h-16 border-t border-dashed border-gray-300 transition-all duration-200">
                  <td className="px-6 py-4 font-medium text-gray-400 whitespace-nowrap text-center italic" colSpan={11}>
                    Add a new crew member to the rota by searching above and dragging them here.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            <h4 className="font-semibold text-gray-700 w-full sm:w-auto">Legend:</h4>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
              <span>Main Stage</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              <span>FOH</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span>Backstage</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-gray-100 mr-2 border border-gray-300"></div>
              <span>Off</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end mt-6 space-y-2 sm:space-y-0 sm:space-x-3">
            <button className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button className="w-full sm:w-auto px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              Save Changes
            </button>
          </div>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-white p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
        {/* Communication Section */}
        <h3 className="text-lg font-semibold text-gray-800">Communication</h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <button className="w-full flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            <Mail className="w-5 h-5 mr-3 text-gray-500" /> Email All Crew
          </button>
          <button className="w-full flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            <MessageSquare className="w-5 h-5 mr-3 text-gray-500" /> WhatsApp Group
          </button>
          <button className="w-full flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            <Users className="w-5 h-5 mr-3 text-gray-500" /> Teams Channel
          </button>
        </div>

        {/* Project Status */}
        <h3 className="text-lg font-semibold text-gray-800 mt-8">Project Status</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Invited to project</span>
            <span className="font-semibold text-gray-800">25</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Accepted project</span>
            <span className="font-semibold text-green-600">18</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Rejected project</span>
            <span className="font-semibold text-red-600">2</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Roles still need filling</span>
            <span className="font-semibold text-yellow-600">5</span>
          </div>
        </div>

        {/* Crew Advance Doc */}
        <h3 className="text-lg font-semibold text-gray-800 mt-8">Crew Advance Doc</h3>
        <div className="mt-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="font-medium text-green-600">Sent</span>
            </div>
          </div>
          <p className="text-gray-500 mt-1">15 of 18 viewed</p>
        </div>

        {/* Integration Indicators */}
        <h3 className="text-lg font-semibold text-gray-800 mt-8">Integration Indicators</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Team Database</span>
            <div className="flex items-center text-green-600 font-medium">
              Connected
              <CheckCircle className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Project Requirements</span>
            <div className="flex items-center text-green-600 font-medium">
              Imported
              <CheckCircle className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Budget</span>
            <span className="font-semibold text-gray-800">€15,000 allocated</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Operations</span>
            <div className="flex items-center text-green-600 font-medium">
              Dates synced
              <CheckCircle className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Finalize Button */}
        <div className="mt-8">
          <button className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 flex items-center justify-center">
            Finalize & Notify Crew
          </button>
        </div>
      </aside>
    </div>
  );

  // Mock data
  const flights: FlightData[] = [
    {
      id: '1',
      number: 'BA2490',
      airport: 'LHR',
      dateTime: '2024-08-15 08:30',
      crew: 'Alex Johnson, Maria Garcia',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      status: 'On Time',
      direction: 'Outbound'
    },
    {
      id: '2',
      number: 'UA123',
      airport: 'JFK',
      dateTime: '2024-08-22 18:00',
      crew: 'John Smith',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      status: 'Delayed',
      direction: 'Inbound'
    }
  ];

  const drives: DriveData[] = [
    {
      id: '1',
      details: 'London to [Event Location]',
      vehicle: 'Personal Car',
      dateTime: '2024-08-15 09:00',
      crew: 'Mike Ross',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      status: 'Confirmed',
      direction: 'Outbound'
    },
    {
      id: '2',
      details: '[Event Location] to London',
      vehicle: 'Personal Car',
      dateTime: '2024-08-22 17:00',
      crew: 'Mike Ross',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      status: 'Confirmed',
      direction: 'Inbound'
    }
  ];

  const accommodations: AccommodationData[] = [
    {
      id: '1',
      hotel: 'The Plaza Hotel',
      address: 'Fifth Avenue at Central Park South',
      dates: 'Aug 15 - Aug 20',
      roomAssignment: 'John Smith (Room 501)',
      cost: '€1,250.00',
      status: 'Booked'
    },
    {
      id: '2',
      hotel: 'Marriott Marquis',
      address: '1535 Broadway, New York',
      dates: 'Aug 15 - Aug 20',
      roomAssignment: 'Sarah Jones, Mike Ross (Sharing Twin Room 812)',
      cost: '€1,800.00',
      status: 'Booked'
    },
    {
      id: '3',
      hotel: '-',
      address: '',
      dates: '-',
      roomAssignment: 'James Miller',
      cost: '-',
      status: 'Not Booked'
    }
  ];

  const tabs = [
    { id: 'assignment' as CrewTab, label: 'Assignment', icon: Users },
    { id: 'compliance' as CrewTab, label: 'Compliance', icon: CheckCircle },
    { id: 'travel' as CrewTab, label: 'Travel & Accommodation', icon: Plane },
    { id: 'costs' as CrewTab, label: 'Costs', icon: DollarSign },
    { id: 'rota' as CrewTab, label: 'Rota', icon: Clock },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time':
      case 'Confirmed':
      case 'Booked':
        return 'bg-green-100 text-green-800';
      case 'Delayed':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
      case 'Not Booked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCostsTab = () => {
    return (
      <div className="flex flex-col">
        {/* Cost Summary Dashboard */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Cost Summary Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 col-span-1 flex flex-col justify-between h-full text-center">
              <p className="text-xs text-blue-700 whitespace-nowrap">Total Crew Cost</p>
              <p className="text-xl font-bold text-blue-900 mt-1">€12,500</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 col-span-1 flex flex-col justify-between h-full text-center">
              <p className="text-xs text-red-700 whitespace-nowrap">Cost vs Estimate</p>
              <p className="text-xl font-bold text-red-900 mt-1">-€2,500</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 col-span-1 flex flex-col justify-between h-full text-center">
              <p className="text-xs text-gray-500 whitespace-nowrap">Daily Rates</p>
              <p className="text-xl font-bold text-gray-800 mt-1">€8,000</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 col-span-1 flex flex-col justify-between h-full text-center">
              <p className="text-xs text-gray-500 whitespace-nowrap">Travel Expenses</p>
              <p className="text-xl font-bold text-gray-800 mt-1">€1,500</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 col-span-1 flex flex-col justify-between h-full text-center">
              <p className="text-xs text-gray-500 whitespace-nowrap">Accommodation</p>
              <p className="text-xl font-bold text-gray-800 mt-1">€2,000</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 col-span-1 flex flex-col justify-between h-full text-center">
              <p className="text-xs text-gray-500 whitespace-nowrap">Per Diem</p>
              <p className="text-xl font-bold text-gray-800 mt-1">€1,000</p>
            </div>
          </div>
        </div>

        {/* Individual Crew Costs */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Individual Crew Costs</h2>
            <button 
              onClick={() => setIsRateTypeLocked(!isRateTypeLocked)}
              className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              {isRateTypeLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{isRateTypeLocked ? 'Unlock Rate Types' : 'Lock Rate Types'}</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Crew Member</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate Type</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Travel</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Accom.</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Per Diem</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img 
                        alt="John Smith" 
                        className="w-10 h-10 rounded-full" 
                        src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">John Smith</p>
                        <p className="text-xs text-gray-500">Lead Technician</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Lead</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <select 
                      disabled={isRateTypeLocked}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-sm ${
                        isRateTypeLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      <option>Day Rate</option>
                      <option>Hourly</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-center text-sm">5</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€350</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€1,750</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€150</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€250</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€125</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right font-bold text-sm text-gray-900">€2,275</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img 
                        alt="Sarah Jones" 
                        className="w-10 h-10 rounded-full" 
                        src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Sarah Jones</p>
                        <p className="text-xs text-gray-500">Sound Engineer</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Senior</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <select 
                      disabled={isRateTypeLocked}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-sm ${
                        isRateTypeLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      <option>Day Rate</option>
                      <option>Hourly</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-center text-sm">5</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€300</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€1,500</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€100</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€250</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€125</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right font-bold text-sm text-gray-900">€1,975</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img 
                        alt="Mike Ross" 
                        className="w-10 h-10 rounded-full" 
                        src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Mike Ross</p>
                        <p className="text-xs text-gray-500">Rigger</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Junior</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <select 
                      disabled={isRateTypeLocked}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-sm ${
                        isRateTypeLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      <option>Day Rate</option>
                      <option>Hourly</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-center text-sm">4</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€220</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€880</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€80</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€200</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm">€100</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right font-bold text-sm text-gray-900">€1,260</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Expenses */}
        <div className="w-full pb-10">
          <div className="flex justify-between items-center mb-6 mt-12">
            <h2 className="text-xl font-semibold text-gray-800">Additional Expenses</h2>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload CSV</span>
                <input type="file" accept=".csv" className="hidden" />
              </label>
              <a 
                href="path/to/template.csv" 
                download 
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </a>
            </div>
          </div>
          <div className="space-y-4">
            {expenseRows.map((row, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Staff Member</label>
                  <div className="mt-1 relative">
                    <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 w-4 h-4 ml-3 mt-2" />
                    <input 
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                      placeholder="Search staff member" 
                      type="text"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option>Travel</option>
                    <option>Accommodation</option>
                    <option>Per Diem</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                    <input 
                      className="block w-full rounded-md border-gray-300 pl-7 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                      placeholder="0.00" 
                      type="number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qty</label>
                  <input 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                    type="number" 
                    defaultValue="1"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total</label>
                    <div className="mt-1 relative rounded-md">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">€</span>
                      </div>
                      <input 
                        className="block w-full rounded-md border-gray-300 bg-gray-100 pl-7 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                        placeholder="0.00" 
                        readOnly 
                        type="text"
                      />
                    </div>
                  </div>
                  {expenseRows.length > 1 && (
                    <button 
                      onClick={() => setExpenseRows(prev => prev.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-red-600 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <button 
              onClick={() => setExpenseRows(prev => [...prev, prev.length + 1])}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg flex items-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Row</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleEditClick = (type: string, direction: string, data: any) => {
    setModalData({ type, direction, ...data });
    setIsModalOpen(true);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const renderComplianceTab = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Compliance Dashboard</h2>
          <div className="flex items-center space-x-2">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded-md flex items-center space-x-2 text-sm">
              <span className="material-icons" style={{ fontSize: '16px' }}>download</span>
              <span>Export All Documents</span>
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md flex items-center space-x-2 text-sm">
              <span className="material-icons" style={{ fontSize: '16px' }}>file_upload</span>
              <span>Request Documents</span>
            </button>
          </div>
        </div>

        {/* Crew Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
            <div className="relative inline-block">
              <img 
                alt="Sarah Jones" 
                className="w-16 h-16 rounded-full mx-auto" 
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
              />
              <span className="absolute bottom-0 right-0 block h-5 w-5 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-white" />
              </span>
            </div>
            <p className="font-semibold text-gray-800 mt-2 text-sm">Sarah Jones</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
            <div className="relative inline-block">
              <img 
                alt="Mike Ross" 
                className="w-16 h-16 rounded-full mx-auto" 
                src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
              />
              <span className="absolute bottom-0 right-0 block h-5 w-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs">×</span>
              </span>
            </div>
            <p className="font-semibold text-gray-800 mt-2 text-sm">Mike Ross</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-center">
            <div className="relative inline-block">
              <img 
                alt="Jessica Miller" 
                className="w-16 h-16 rounded-full mx-auto" 
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
              />
              <span className="absolute bottom-0 right-0 block h-5 w-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs">×</span>
              </span>
            </div>
            <p className="font-semibold text-gray-800 mt-2 text-sm">Jessica Miller</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg mb-6 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5" />
          <p>The above crew need to complete their documentation</p>
        </div>

        {/* Document Status Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Document Status</h2>
          <div className="flex items-center space-x-4">
            <div className="text-gray-600">
              <span className="font-semibold">Crew Required:</span> 25
            </div>
            <div className="text-gray-600">
              <span className="font-semibold">Assigned:</span> 18
            </div>
          </div>
        </div>

        {/* Document Status Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Crew Member</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contract</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PLI</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Travel Insurance</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bank Details</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Passport</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Certs</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img 
                      alt="John Smith" 
                      className="w-10 h-10 rounded-full" 
                      src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">John Smith</p>
                      <p className="text-sm text-gray-500">j.smith@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Exp. 10 days</span>
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Send Reminder</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img 
                      alt="Sarah Jones" 
                      className="w-10 h-10 rounded-full" 
                      src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Sarah Jones</p>
                      <p className="text-sm text-gray-500">s.jones@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Exp. 5 days</span>
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Send Reminder</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <img 
                      alt="Mike Ross" 
                      className="w-10 h-10 rounded-full" 
                      src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Mike Ross</p>
                      <p className="text-sm text-gray-500">m.ross@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <span className="text-red-500 text-xl">×</span>
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <span className="text-red-500 text-xl">×</span>
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Send Reminder</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Project: {project?.project_id || '[Event Name]'}</h1>
          <div className="flex items-center space-x-4">
            <div className="text-gray-600">
              <span className="font-semibold">Crew Required:</span> 25
            </div>
            <div className="text-gray-600">
              <span className="font-semibold">Assigned:</span> 18
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 mr-4 pb-2 px-1 cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'assignment' && renderAssignmentTab()}
          {activeTab === 'compliance' && renderComplianceTab()}
          {activeTab === 'costs' && renderCostsTab()}
          {activeTab === 'rota' && renderRotaTab()}
          {activeTab === 'travel' && (
            <>
              {/* Travel Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 rounded-full p-3">
                      <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Travel Summary</h2>
                    <div className="flex items-center space-x-8">
                      <div>
                        <p className="text-sm text-gray-600">Total Traveling Crew</p>
                        <p className="text-2xl font-semibold text-blue-700">4</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Destinations</p>
                        <div className="flex space-x-2 mt-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200">
                            <Plane className="w-4 h-4 mr-1.5 text-blue-500" />
                            JFK
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200">
                            <Plane className="w-4 h-4 mr-1.5 text-blue-500" />
                            LHR
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200">
                            <Car className="w-4 h-4 mr-1.5 text-green-500" />
                            [Event Location]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Notifications */}
                {notifications.length > 0 && (
                  <div className="mb-6 space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg flex items-start space-x-4 ${
                          notification.newStatus === 'Delayed'
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'bg-red-50 border-red-300'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <AlertTriangle
                            className={`w-5 h-5 ${
                              notification.newStatus === 'Delayed' ? 'text-yellow-500' : 'text-red-500'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              notification.newStatus === 'Delayed' ? 'text-yellow-800' : 'text-red-800'
                            }`}
                          >
                            Flight {notification.flightNumber} Status Change
                          </p>
                          <p
                            className={`text-sm ${
                              notification.newStatus === 'Delayed' ? 'text-yellow-700' : 'text-red-700'
                            }`}
                          >
                            The status for flight <strong>{notification.flightNumber}</strong> (Crew:{' '}
                            <strong>{notification.crew}</strong>, {notification.dateTime}) has changed from{' '}
                            <span className="font-medium">{notification.oldStatus}</span> to{' '}
                            <span className="font-medium">{notification.newStatus}</span>.
                          </p>
                        </div>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Travel Planning */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Travel Planning</h2>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600">
                        <Bell className="w-4 h-4 mr-1" />
                        <span>Notification Preferences</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Flying Crew */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 flex items-center">
                          <Plane className="w-5 h-5 mr-2 text-blue-500" />
                          Flying Crew
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          <span>Live Status Refreshing...</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-6">
                        {/* Outbound Flights */}
                        <div>
                          <h4 className="font-semibold text-blue-800 bg-blue-50 p-2 rounded-t-lg">
                            Outbound Flights
                          </h4>
                          <div className="overflow-x-auto border rounded-b-lg border-t-0 bg-blue-50/20">
                            <table className="min-w-full">
                              <thead>
                                <tr>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Flight Number
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Airport
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Time & Date
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Crew Assigned
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Status
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {flights
                                  .filter((f) => f.direction === 'Outbound')
                                  .map((flight) => (
                                    <tr key={flight.id} className="border-b border-gray-200">
                                      <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                        {flight.number}
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">{flight.airport}</td>
                                      <td className="py-3 px-4 text-sm text-gray-700">{flight.dateTime}</td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <div className="flex items-center space-x-2">
                                          <img
                                            src={flight.avatar}
                                            alt="Crew avatar"
                                            className="w-8 h-8 rounded-full"
                                          />
                                          <span className="text-sm">{flight.crew}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                            flight.status
                                          )}`}
                                        >
                                          {flight.status}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <button
                                          onClick={() =>
                                            handleEditClick('flight', 'Outbound', {
                                              flightNumber: flight.number,
                                              airport: flight.airport,
                                              dateTime: flight.dateTime,
                                              crew: flight.crew,
                                            })
                                          }
                                          className="text-gray-500 hover:text-blue-600 p-1"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-600 p-1">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Inbound Flights */}
                        <div>
                          <h4 className="font-semibold text-indigo-800 bg-indigo-50 p-2 rounded-t-lg">
                            Inbound Flights
                          </h4>
                          <div className="overflow-x-auto border rounded-b-lg border-t-0 bg-indigo-50/20">
                            <table className="min-w-full">
                              <thead>
                                <tr>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Flight Number
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Airport
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Time & Date
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Crew Assigned
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Status
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {flights
                                  .filter((f) => f.direction === 'Inbound')
                                  .map((flight) => (
                                    <tr key={flight.id} className="border-b border-gray-200">
                                      <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                        {flight.number}
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">{flight.airport}</td>
                                      <td className="py-3 px-4 text-sm text-gray-700">{flight.dateTime}</td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <div className="flex items-center space-x-2">
                                          <img
                                            src={flight.avatar}
                                            alt="Crew avatar"
                                            className="w-8 h-8 rounded-full"
                                          />
                                          <span className="text-sm">{flight.crew}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                            flight.status
                                          )}`}
                                        >
                                          {flight.status}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <button
                                          onClick={() =>
                                            handleEditClick('flight', 'Inbound', {
                                              flightNumber: flight.number,
                                              airport: flight.airport,
                                              dateTime: flight.dateTime,
                                              crew: flight.crew,
                                            })
                                          }
                                          className="text-gray-500 hover:text-blue-600 p-1"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-600 p-1">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                {/* Unassigned row */}
                                <tr className="border-b border-gray-200">
                                  <td className="py-3 px-4 text-sm text-gray-700 font-semibold">Unassigned</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">-</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">-</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">
                                    <div className="flex items-center space-x-2">
                                      <img
                                        alt="Sarah Jones"
                                        className="w-8 h-8 rounded-full"
                                        src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                                      />
                                      <span className="text-sm">Sarah Jones</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-700">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Pending
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-700">
                                    <button className="text-gray-500 hover:text-blue-600 p-1">
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Driving Crew */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-700 flex items-center">
                          <Car className="w-5 h-5 mr-2 text-blue-500" />
                          Driving Crew
                        </h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Outbound Journeys */}
                        <div>
                          <h4 className="font-semibold text-gray-600 mb-2">Outbound Journeys</h4>
                          <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full">
                              <thead>
                                <tr>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Journey Details
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Vehicle
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Time & Date
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Crew Assigned
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Status
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {drives
                                  .filter((d) => d.direction === 'Outbound')
                                  .map((drive) => (
                                    <tr key={drive.id} className="border-b border-gray-200">
                                      <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                        {drive.details}
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">{drive.vehicle}</td>
                                      <td className="py-3 px-4 text-sm text-gray-700">{drive.dateTime}</td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <div className="flex items-center space-x-2">
                                          <img
                                            alt={drive.crew}
                                            className="w-8 h-8 rounded-full"
                                            src={drive.avatar}
                                          />
                                          <span className="text-sm">{drive.crew}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                            drive.status
                                          )}`}
                                        >
                                          {drive.status}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <button
                                          onClick={() =>
                                            handleEditClick('drive', 'Outbound', {
                                              details: drive.details,
                                              vehicle: drive.vehicle,
                                              dateTime: drive.dateTime,
                                              crew: drive.crew,
                                            })
                                          }
                                          className="text-gray-500 hover:text-blue-600 p-1"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-600 p-1">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Inbound Journeys */}
                        <div>
                          <h4 className="font-semibold text-gray-600 mb-2">Inbound Journeys</h4>
                          <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full">
                              <thead>
                                <tr>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Journey Details
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Vehicle
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Time & Date
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Crew Assigned
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Status
                                  </th>
                                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {drives
                                  .filter((d) => d.direction === 'Inbound')
                                  .map((drive) => (
                                    <tr key={drive.id} className="border-b border-gray-200">
                                      <td className="py-3 px-4 text-sm text-gray-700 font-semibold">
                                        {drive.details}
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">{drive.vehicle}</td>
                                      <td className="py-3 px-4 text-sm text-gray-700">{drive.dateTime}</td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <div className="flex items-center space-x-2">
                                          <img
                                            alt={drive.crew}
                                            className="w-8 h-8 rounded-full"
                                            src={drive.avatar}
                                          />
                                          <span className="text-sm">{drive.crew}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                            drive.status
                                          )}`}
                                        >
                                          {drive.status}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-700">
                                        <button
                                          onClick={() =>
                                            handleEditClick('drive', 'Inbound', {
                                              details: drive.details,
                                              vehicle: drive.vehicle,
                                              dateTime: drive.dateTime,
                                              crew: drive.crew,
                                            })
                                          }
                                          className="text-gray-500 hover:text-blue-600 p-1"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-500 hover:text-red-600 p-1">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accommodation */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Accommodation</h2>
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                              Hotel / Location
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                              Dates
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                              Room Assignment
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                              Cost
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                              Status
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {accommodations.map((accommodation) => (
                            <tr key={accommodation.id} className="border-b border-gray-200">
                              <td className="py-3 px-4 text-sm text-gray-700">
                                <div className="font-semibold">{accommodation.hotel}</div>
                                {accommodation.address && (
                                  <div className="text-xs text-gray-500">{accommodation.address}</div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700">{accommodation.dates}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{accommodation.roomAssignment}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{accommodation.cost}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    accommodation.status
                                  )}`}
                                >
                                  {accommodation.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700">
                                {accommodation.status === 'Not Booked' ? (
                                  <button className="text-gray-500 hover:text-blue-600 p-1">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <>
                                    <button className="text-gray-500 hover:text-blue-600 p-1">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="text-gray-500 hover:text-red-600 p-1">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Booking Actions */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm border border-gray-300">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span>Generate Travel Packs</span>
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm border border-gray-300">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <span>Send Itineraries to Crew</span>
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm border border-gray-300">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span>Export for Accounting</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 bg-white border-l border-gray-200 p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Communication</h3>
        <div className="space-y-3">
          <button className="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <span>Email All Crew</span>
          </button>
          <button className="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            <span>WhatsApp Group</span>
          </button>
          <button className="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span>Teams Channel</span>
          </button>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Project Status</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>Invited to project</span>
              <span className="font-semibold text-gray-800">25</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Accepted project</span>
              <span className="font-semibold text-green-600">18</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rejected project</span>
              <span className="font-semibold text-red-600">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Roles still need filling</span>
              <span className="font-semibold text-yellow-600">5</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Crew Advance Doc</h4>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Status:</span>
            <span className="text-green-600 font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Sent
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">15 of 18 viewed</p>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Integration Indicators</h4>
          <ul className="text-sm space-y-2 text-gray-600">
            <li className="flex justify-between items-center">
              Team Database 
              <span className="text-green-600 flex items-center text-xs font-bold">Connected ✓</span>
            </li>
            <li className="flex justify-between items-center">
              Project Requirements 
              <span className="text-green-600 flex items-center text-xs font-bold">Imported ✓</span>
            </li>
            <li className="flex justify-between items-center">
              Budget 
              <span className="text-gray-700">€15,000 allocated</span>
            </li>
            <li className="flex justify-between items-center">
              Operations 
              <span className="text-green-600 flex items-center text-xs font-bold">Dates synced ✓</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-auto pt-6 border-t border-gray-200">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            Finalize & Notify Crew
          </button>
        </div>
      </div>

      {/* Skills Selection Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Select Skills</h3>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {['Cashless', 'Access Control', 'Team Lead', 'Customer Service', 'Technical Support', 'Event Management'].map((skill) => (
                <label key={skill} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSkills([...selectedSkills, skill]);
                      } else {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSkillsModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Edit {modalData.direction} {modalData.type === 'flight' ? 'Flight' : 'Journey'}
            </h2>
            <form>
              <div className="space-y-4">
                {modalData.type === 'flight' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="flightNumber">
                        Flight Number
                      </label>
                      <input
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        id="flightNumber"
                        type="text"
                        defaultValue={modalData.flightNumber}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="airport">
                        Airport
                      </label>
                      <input
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        id="airport"
                        type="text"
                        defaultValue={modalData.airport}
                      />
                    </div>
                  </>
                )}
                {modalData.type === 'drive' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="journeyDetails">
                        Journey Details
                      </label>
                      <input
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        id="journeyDetails"
                        type="text"
                        defaultValue={modalData.details}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="vehicle">
                        Vehicle
                      </label>
                      <input
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        id="vehicle"
                        type="text"
                        defaultValue={modalData.vehicle}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="dateTime">
                    Time & Date
                  </label>
                  <input
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    id="dateTime"
                    type="datetime-local"
                    defaultValue={modalData.dateTime}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="crew">
                    Crew Assigned
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    id="crew"
                    defaultValue={modalData.crew}
                  >
                    <option>John Smith</option>
                    <option>Sarah Jones</option>
                    <option>Mike Ross</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="status">
                    Status
                  </label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option>Confirmed</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                  type="submit"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
            <div className="flex justify-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-gray-800">Confirm Removal</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to remove <span className="font-semibold">{selectedCrewMember}</span> from this rota? All their shifts will be unassigned. This action cannot be undone.
              </p>
            </div>
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}