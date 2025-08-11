import React, { useState } from 'react';
import { Truck, Package, MapPin, ArrowRight, X, Plus, Clock, Mail, MessageSquare, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LogisticsProps {
  project?: any;
}

type LogisticsMainTab = 'equipment-planning' | 'site-allocation' | 'shipping-documentation';
type EquipmentCategory = 'cashless' | 'network' | 'power' | 'other';

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  comments: string;
}

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  mentions: string[];
  replies?: Comment[];
}

type JUEStatus = 'awaiting-push' | 'awaiting-confirmation' | 'request-received';

export function Logistics({ project }: LogisticsProps) {
  const [activeMainTab, setActiveMainTab] = useState<LogisticsMainTab>('equipment-planning');
  const [activeEquipmentCategory, setActiveEquipmentCategory] = useState<EquipmentCategory>('network');
  const [isEditing, setIsEditing] = useState(false);
  const [jueStatus, setJueStatus] = useState<JUEStatus>('awaiting-push');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [hasBeenPushedToROI, setHasBeenPushedToROI] = useState(false);
  const [showCriticalIssueModal, setShowCriticalIssueModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: {
        name: 'Maria Rodriguez',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      content: 'Updated shipping costs based on latest quotes from courier.',
      timestamp: '2 hours ago',
      mentions: [],
      replies: []
    }
  ]);
  const [newComment, setNewComment] = useState('');

  // Equipment data organized by category
  const [equipmentData, setEquipmentData] = useState<Record<EquipmentCategory, EquipmentItem[]>>({
    cashless: [
      { id: '1', name: 'Access Phones', quantity: 10, comments: 'Standard access phones for site use.' },
      { id: '2', name: 'Cashless Phones', quantity: 5, comments: 'Cashless payment terminals.' },
      { id: '3', name: 'Other / Extra Phones', quantity: 0, comments: '' },
      { id: '4', name: 'EPOS/SoftPOS Devices', quantity: 0, comments: '' },
      { id: '5', name: 'Totems', quantity: 0, comments: '' },
      { id: '6', name: 'Mini-Totems', quantity: 0, comments: '' },
    ],
    network: [
      { id: '7', name: 'Mikrotik Negro 3011 Router', quantity: 0, comments: '' },
      { id: '8', name: 'Mikrotik Negro 4011 Router', quantity: 0, comments: '' },
      { id: '9', name: 'Mikrotik Blanco CCR 1009 Router', quantity: 0, comments: '' },
      { id: '10', name: 'Cloud Key Controller', quantity: 0, comments: '' },
      { id: '11', name: 'Cloud Key Controller Gen 2', quantity: 0, comments: '' },
      { id: '12', name: 'Small Sectorial (120º)', quantity: 0, comments: '' },
      { id: '13', name: 'Large Sectorial (90º)', quantity: 0, comments: '' },
      { id: '14', name: 'Omnidirectional', quantity: 0, comments: '' },
      { id: '15', name: 'Prism 5GHz + PoE 24V-1A', quantity: 0, comments: '' },
      { id: '16', name: 'Satellite Dishes', quantity: 0, comments: '' },
      { id: '17', name: 'Nanobeam Gen2 + PoE', quantity: 0, comments: '' },
      { id: '18', name: 'Nanobeam M5', quantity: 0, comments: '' },
      { id: '19', name: 'Litebeam + PoE', quantity: 0, comments: '' },
    ],
    power: [
      { id: '20', name: '6 Gang Extension (3m)', quantity: 0, comments: '' },
      { id: '21', name: 'USB Hub (60 Port)', quantity: 0, comments: '' },
      { id: '22', name: 'IEC Cable (UK)', quantity: 0, comments: '' },
      { id: '23', name: '30m Extension Reel (UK)', quantity: 0, comments: '' },
      { id: '24', name: 'Single USB Charger (UK)', quantity: 0, comments: '' },
    ],
    other: [
      { id: '25', name: 'Scooter', quantity: 0, comments: '' },
      { id: '26', name: 'First Aid Kit', quantity: 0, comments: '' },
      { id: '27', name: 'Coffee Machine', quantity: 0, comments: '' },
      { id: '28', name: 'Racking (1600 x 500 x 500)', quantity: 0, comments: '' },
      { id: '29', name: 'Macbook Pro', quantity: 0, comments: '' },
    ],
  });

  const mainTabs = [
    { id: 'equipment-planning' as LogisticsMainTab, label: 'Equipment Planning', icon: Package },
    { id: 'site-allocation' as LogisticsMainTab, label: 'Site Allocation', icon: MapPin },
    { id: 'shipping-documentation' as LogisticsMainTab, label: 'Shipping', icon: Truck },
  ];

  const equipmentCategories = [
    { id: 'cashless' as EquipmentCategory, label: 'Cashless' },
    { id: 'network' as EquipmentCategory, label: 'Network' },
    { id: 'power' as EquipmentCategory, label: 'Power' },
    { id: 'other' as EquipmentCategory, label: 'Other' },
  ];

  const handleEditToggle = () => {
    if (isEditing) {
      setShowSaveConfirm(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveConfirm = (confirmed: boolean) => {
    setShowSaveConfirm(false);
    if (confirmed) {
      setIsEditing(false);
      // Here you would save the data
      console.log('Saving equipment data:', equipmentData);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setShowDeleteConfirm(itemId);
  };

  const confirmDelete = (confirmed: boolean) => {
    if (confirmed && showDeleteConfirm) {
      setEquipmentData(prev => ({
        ...prev,
        [activeEquipmentCategory]: prev[activeEquipmentCategory].filter(item => item.id !== showDeleteConfirm)
      }));
    }
    setShowDeleteConfirm(null);
  };

  const handleAddItem = (afterId: string) => {
    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      comments: ''
    };

    setEquipmentData(prev => {
      const items = [...prev[activeEquipmentCategory]];
      const index = items.findIndex(item => item.id === afterId);
      items.splice(index + 1, 0, newItem);
      return {
        ...prev,
        [activeEquipmentCategory]: items
      };
    });
  };

  const handleItemChange = (itemId: string, field: keyof EquipmentItem, value: string | number) => {
    setEquipmentData(prev => ({
      ...prev,
      [activeEquipmentCategory]: prev[activeEquipmentCategory].map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const handlePushToJUE = () => {
    setJueStatus('awaiting-confirmation');
    // Simulate JUE response after 3 seconds
    setTimeout(() => {
      setJueStatus('request-received');
    }, 3000);
  };

  const handlePushToROI = () => {
    // Simulate pushing totals to ROI
    console.log('Pushing logistics costs to ROI...');
    setHasBeenPushedToROI(true);
    // toast.success('Logistics costs pushed to ROI successfully!');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: 'Current User',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      content: newComment,
      timestamp: 'Just now',
      mentions: [],
      replies: []
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const getJUEStatusText = () => {
    switch (jueStatus) {
      case 'awaiting-push': return 'Awaiting Push to JUE';
      case 'awaiting-confirmation': return 'Awaiting Confirmation';
      case 'request-received': return 'Request Received';
    }
  };

  const getJUEStatusColor = () => {
    switch (jueStatus) {
      case 'awaiting-push': return 'text-gray-600 bg-gray-100';
      case 'awaiting-confirmation': return 'text-yellow-600 bg-yellow-100';
      case 'request-received': return 'text-green-600 bg-green-100';
    }
  };

  const renderEquipmentPlanning = () => (
    <div className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hardware Request Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Hardware Request</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Hardware Request Status:</span>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Potential</span>
          </div>
        </div>

        {/* Equipment Category Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <nav className="-mb-px flex space-x-8">
              {equipmentCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveEquipmentCategory(category.id)}
                  className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeEquipmentCategory === category.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </nav>

            {/* Status and Action Buttons */}
            <div className="flex items-center gap-4 py-2">
              <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full whitespace-nowrap ${getJUEStatusColor()}`}>
                <span>Request Status</span>
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEditToggle}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  {isEditing ? 'Confirm Changes?' : 'Edit Data'}
                </button>
                <button
                  onClick={handlePushToJUE}
                  disabled={jueStatus !== 'awaiting-push'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg"
                >
                  <ArrowRight className="w-4 h-4" />
                  Push to JUE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                Equipment
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Quantity
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                Comments
              </th>
              {isEditing && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipmentData[activeEquipmentCategory].map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-24 text-center border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.comments}
                      onChange={(e) => handleItemChange(item.id, 'comments', e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50"
                    />
                  ) : (
                    item.comments
                  )}
                </td>
                {isEditing && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddItem(item.id)}
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSiteAllocation = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Site Allocation</h2>
        <p className="text-gray-600">Site allocation planning tools coming soon.</p>
      </div>
    </div>
  );

  const renderShippingDocumentation = () => (
    <div className="space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header with Team Info */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Shipping & Documentation</h1>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 border border-gray-200">
          <div className="flex items-center gap-3 rounded-md p-2">
            <img alt="Project Lead Photo" className="h-10 w-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf4HElzaw15rTRlccl6v4z2BfVCOIqarVasQdfuS_-jMR048MQdMyPaiBUdcYBTHzEA6LdOjHN7grLH5_ad4d3j55JMMwUsNTkEseSJ1NMpnibnwZIKCCBPJOORzzKIFlZON2AViDqiPrUZPZlm_-XQ4Hov445VhNA_Ziu2QJkATJ3eJi7xhlfMbCH9auu9tthbM2mh4z1A_liDTcS_03UYBNAlLik6P9jUV726MkdUVfSDjhWvlg6EWJve_oswnerwhMPO3BMiOg"/>
            <div>
              <p className="text-sm font-semibold text-gray-900">Maria Rodriguez</p>
              <p className="text-xs text-gray-600">Project Lead</p>
              <div className="flex items-center gap-2 mt-1">
                <a className="text-xs text-blue-600 hover:underline flex items-center gap-1" href="mailto:maria.rodriguez@logistics.pro">
                  <Mail className="w-3 h-3" />
                  Email
                </a>
                <a className="text-xs text-blue-600 hover:underline flex items-center gap-1" href="#">
                  <MessageSquare className="w-3 h-3" />
                  Teams
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-md bg-white shadow-sm border border-gray-200">
            <img alt="Logistics Lead Photo" className="h-10 w-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Rm2hnjNCuCURxfw5y0hD14oX-tmXJ07WMyNW4UiRH-U5DyvdnRL744IjsPgkXqwZ21xgWAOxA3dyLzMT63B1CSDwbjrUHbG9EBDW3JXupbm9nagtJziC2eIn0rFv-ajWGg6N_kpqpXlhAM3uivzvHIwhtYOyeLXL6TDtetsDwkpTlARjkmrs63vmlkLrzYUsQmj9b_UmMkz3RYtQ4dxH50WaxQlEJIknoi_jYzp7VGr29saxfc3ycWnrkZRsnBoa2hxhhjASMBc"/>
            <div>
              <p className="text-sm font-semibold text-gray-900">Alex Hartman</p>
              <p className="text-xs text-gray-600">Logistics Lead</p>
              <div className="flex items-center gap-2 mt-1">
                <a className="text-xs text-blue-600 hover:underline flex items-center gap-1" href="mailto:alex.hartman@logistics.pro">
                  <Mail className="w-3 h-3" />
                  Email
                </a>
                <a className="text-xs text-blue-600 hover:underline flex items-center gap-1" href="#">
                  <MessageSquare className="w-3 h-3" />
                  Teams
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="relative pt-10 pb-4">
          <div className="absolute top-0 left-[70%] -translate-x-1/2 flex flex-col items-center">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div className="w-0.5 h-4 bg-blue-600"></div>
          </div>
          <div className="absolute top-2 left-0 h-0.5 w-full bg-gray-200">
            <div className="h-full bg-blue-600" style={{ width: '70%' }}></div>
          </div>
          <div className="flex justify-between">
            <div className="relative w-1/6 text-center group">
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full bg-blue-600"></div>
              <p className="font-semibold text-sm text-gray-900 mt-6">Packing Deadline</p>
              <p className="text-xs text-gray-600">15/08/2024</p>
              <div className="invisible absolute z-10 w-48 p-2 text-xs font-normal text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 -top-full left-1/2 -translate-x-1/2 group-hover:visible group-hover:opacity-100">
                All equipment must be packed and ready for pickup. Responsible: Warehouse Team.
              </div>
            </div>
            <div className="relative w-1/6 text-center group">
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full bg-blue-600"></div>
              <p className="font-semibold text-sm text-gray-900 mt-6">Shipping Date</p>
              <p className="text-xs text-gray-600">16/08/2024</p>
              <div className="invisible absolute z-10 w-48 p-2 text-xs font-normal text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 -top-full left-1/2 -translate-x-1/2 group-hover:visible group-hover:opacity-100">
                Courier picks up the shipment. Tracking number to be updated. Responsible: Alex Hartman.
              </div>
            </div>
            <div className="relative w-1/6 text-center group">
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full bg-blue-600"></div>
              <p className="font-semibold text-sm text-gray-900 mt-6">Expected Delivery</p>
              <p className="text-xs text-gray-600">20/08/2024</p>
              <div className="invisible absolute z-10 w-48 p-2 text-xs font-normal text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 -top-full left-1/2 -translate-x-1/2 group-hover:visible group-hover:opacity-100">
                Shipment scheduled to arrive at the destination address. On-site contact will be notified.
              </div>
            </div>
            <div className="relative w-1/6 text-center group">
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full bg-blue-600"></div>
              <p className="font-semibold text-sm text-gray-900 mt-6">On-Site Date</p>
              <p className="text-xs text-gray-600">21/08/2024</p>
              <div className="invisible absolute z-10 w-48 p-2 text-xs font-normal text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 -top-full left-1/2 -translate-x-1/2 group-hover:visible group-hover:opacity-100">
                Equipment to be available for setup at the event venue. Responsible: On-site Team.
              </div>
            </div>
            <div className="relative w-1/6 text-center group">
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
              <p className="font-semibold text-sm text-gray-500 mt-6">Event Dates</p>
              <p className="text-xs text-gray-400">22 - 24/08/2024</p>
              <div className="invisible absolute z-10 w-48 p-2 text-xs font-normal text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 -top-full left-1/2 -translate-x-1/2 group-hover:visible group-hover:opacity-100">
                Main event duration. All equipment should be operational.
              </div>
            </div>
            <div className="relative w-1/6 text-center group">
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
              <p className="font-semibold text-sm text-gray-500 mt-6">Return Shipping Date</p>
              <p className="text-xs text-gray-400">25/08/2024</p>
              <div className="invisible absolute z-10 w-48 p-2 text-xs font-normal text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 -top-full left-1/2 -translate-x-1/2 group-hover:visible group-hover:opacity-100">
                Equipment to be packed and ready for return shipment. Responsible: On-site Team.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Shipping Details & Cost Tracking */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="origin-location">
                  Origin Location
                </label>
                <select className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" id="origin-location">
                  <option>Select Origin Location</option>
                  <option selected>Warehouse A</option>
                  <option>Warehouse B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="destination-address">
                  Destination Address
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                  id="destination-address" 
                  type="text" 
                  defaultValue="123 Main St, Anytown, USA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="onsite-contact-name">
                  On-site Contact Name
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                  id="onsite-contact-name" 
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="onsite-contact-phone">
                  On-site Contact Phone
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                  id="onsite-contact-phone" 
                  type="tel"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="onsite-contact-email">
                  On-site Contact Email
                </label>
                <input 
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                  id="onsite-contact-email" 
                  type="email"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Courier Details
                </label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input 
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                    placeholder="Company" 
                    type="text"
                  />
                  <input 
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                    placeholder="Tracking Number" 
                    type="text"
                  />
                </div>
              </div>
              <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Carnet Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="carnet-number">
                      Carnet Number
                    </label>
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      id="carnet-number" 
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="carnet-expiry">
                      Expiry Date
                    </label>
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      id="carnet-expiry" 
                      type="date"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Carnet Document</p>
                      <p className="text-xs text-gray-500 mt-1">15/07/2024, 3:00 PM</p>
                    </div>
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all">
                      Upload
                    </button>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="special-instructions">
                  Special Instructions
                </label>
                <textarea 
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-24" 
                  id="special-instructions"
                />
              </div>
            </div>
          </div>

          {/* Cost Tracking */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cost Tracking</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="actual-shipping-cost">
                    Actual Shipping
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      id="actual-shipping-cost" 
                      type="text" 
                      defaultValue="1,200.00"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="customs-duties">
                    Customs/Duties
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      id="customs-duties" 
                      type="text" 
                      defaultValue="170.00"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="insurance">
                    Insurance
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      id="insurance" 
                      type="text" 
                      defaultValue="45.00"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="local-transport">
                    Local Transport
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      id="local-transport" 
                      type="text" 
                      defaultValue="85.00"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="carnet-cost">
                    Carnet
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      id="carnet-cost" 
                      type="text" 
                      defaultValue="150.00"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="other-cost">
                    Other
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                      id="other-cost" 
                      type="text" 
                      defaultValue=""
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                </div>
                <div className="flex items-end">
                  <button className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full h-[38px] flex items-center justify-center text-sm font-semibold px-3 py-2">
                    <Plus className="inline-block mr-1.5 h-4 w-4" />
                    Add Cost
                  </button>
                </div>
              </div>
              <hr className="my-4 border-gray-200" />
              <div className="flex justify-between items-center text-sm">
                <p className="font-semibold text-gray-600">Total Logistics Cost:</p>
                <p className="font-bold text-lg text-gray-900">€1,650.00</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="font-semibold text-gray-600">Variance from Budget:</p>
                <p className="font-bold text-lg text-green-600">-€40.00</p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="cost-comments">
                  Comments / Notes
                </label>
                <textarea 
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-20" 
                  id="cost-comments" 
                  placeholder="Add any relevant details about the costs..."
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handlePushToROI}
                  className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center gap-2"
                >
                  Push Totals to ROI Page
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="m5 12 5 5L20 7"></path>
                  </svg>
                </button>
              </div>
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Push History Log</h3>
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-20"></div>
                  <div className="overflow-auto max-h-60 shadow-inner rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3" scope="col">User</th>
                          <th className="px-6 py-3" scope="col">Date & Time</th>
                          <th className="px-6 py-3 text-right" scope="col">Total Cost Pushed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr className="bg-white">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img alt="Alex Hartman" className="h-6 w-6 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Rm2hnjNCuCURxfw5y0hD14oX-tmXJ07WMyNW4UiRH-U5DyvdnRL744IjsPgkXqwZ21xgWAOxA3dyLzMT63B1CSDwbjrUHbG9EBDW3JXupbm9nagtJziC2eIn0rFv-ajWGg6N_kpqpXlhAM3uivzvHIwhtYOyeLXL6TDtetsDwkpTlARjkmrs63vmlkLrzYUsQmj9b_UmMkz3RYtQ4dxH50WaxQlEJIknoi_jYzp7VGr29saxfc3ycWnrkZRsnBoa2hxhhjASMBc"/>
                              <span>Alex Hartman</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">2024-07-29 14:32:10</td>
                          <td className="px-6 py-4 text-right font-medium">€1,650.00</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img alt="Maria Rodriguez" className="h-6 w-6 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf4HElzaw15rTRlccl6v4z2BfVCOIqarVasQdfuS_-jMR048MQdMyPaiBUdcYBTHzEA6LdOjHN7grLH5_ad4d3j55JMMwUsNTkEseSJ1NMpnibnwZIKCCBPJOORzzKIFlZON2AViDqiPrUZPZlm_-XQ4Hov445VhNA_Ziu2QJkATJ3eJi7xhlfMbCH9auu9tthbM2mh4z1A_liDTcS_03UYBNAlLik6P9jUV726MkdUVfSDjhWvlg6EWJve_oswnerwhMPO3BMiOg"/>
                              <span>Maria Rodriguez</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">2024-07-28 09:15:45</td>
                          <td className="px-6 py-4 text-right font-medium">€1,610.00</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img alt="Alex Hartman" className="h-6 w-6 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Rm2hnjNCuCURxfw5y0hD14oX-tmXJ07WMyNW4UiRH-U5DyvdnRL744IjsPgkXqwZ21xgWAOxA3dyLzMT63B1CSDwbjrUHbG9EBDW3JXupbm9nagtJziC2eIn0rFv-ajWGg6N_kpqpXlhAM3uivzvHIwhtYOyeLXL6TDtetsDwkpTlARjkmrs63vmlkLrzYUsQmj9b_UmMkz3RYtQ4dxH50WaxQlEJIknoi_jYzp7VGr29saxfc3ycWnrkZRsnBoa2hxhhjASMBc"/>
                              <span>Alex Hartman</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">2024-07-27 11:05:20</td>
                          <td className="px-6 py-4 text-right font-medium">€1,580.00</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img alt="Maria Rodriguez" className="h-6 w-6 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf4HElzaw15rTRlccl6v4z2BfVCOIqarVasQdfuS_-jMR048MQdMyPaiBUdcYBTHzEA6LdOjHN7grLH5_ad4d3j55JMMwUsNTkEseSJ1NMpnibnwZIKCCBPJOORzzKIFlZON2AViDqiPrUZPZlm_-XQ4Hov445VhNA_Ziu2QJkATJ3eJi7xhlfMbCH9auu9tthbM2mh4z1A_liDTcS_03UYBNAlLik6P9jUV726MkdUVfSDjhWvlg6EWJve_oswnerwhMPO3BMiOg"/>
                              <span>Maria Rodriguez</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">2024-07-26 16:45:00</td>
                          <td className="px-6 py-4 text-right font-medium">€1,550.00</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img alt="Alex Hartman" className="h-6 w-6 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Rm2hnjNCuCURxfw5y0hD14oX-tmXJ07WMyNW4UiRH-U5DyvdnRL744IjsPgkXqwZ21xgWAOxA3dyLzMT63B1CSDwbjrUHbG9EBDW3JXupbm9nagtJziC2eIn0rFv-ajWGg6N_kpqpXlhAM3uivzvHIwhtYOyeLXL6TDtetsDwkpTlARjkmrs63vmlkLrzYUsQmj9b_UmMkz3RYtQ4dxH50WaxQlEJIknoi_jYzp7VGr29saxfc3ycWnrkZRsnBoa2hxhhjASMBc"/>
                              <span>Alex Hartman</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">2024-07-25 10:00:05</td>
                          <td className="px-6 py-4 text-right font-medium">€1,500.00</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img alt="Maria Rodriguez" className="h-6 w-6 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf4HElzaw15rTRlccl6v4z2BfVCOIqarVasQdfuS_-jMR048MQdMyPaiBUdcYBTHzEA6LdOjHN7grLH5_ad4d3j55JMMwUsNTkEseSJ1NMpnibnwZIKCCBPJOORzzKIFlZON2AViDqiPrUZPZlm_-XQ4Hov445VhNA_Ziu2QJkATJ3eJi7xhlfMbCH9auu9tthbM2mh4z1A_liDTcS_03UYBNAlLik6P9jUV726MkdUVfSDjhWvlg6EWJve_oswnerwhMPO3BMiOg"/>
                              <span>Maria Rodriguez</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">2024-07-24 15:20:18</td>
                          <td className="px-6 py-4 text-right font-medium">€1,480.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Critical Escalation & Document Checklist */}
        <div className="space-y-8">
          {/* Critical Escalation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Critical Escalation</h2>
            <div className="space-y-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Emergency Contact</h3>
                    <div className="flex items-center gap-3">
                      <img alt="Logistics Lead Photo" className="h-10 w-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Rm2hnjNCuCURxfw5y0hD14oX-tmXJ07WMyNW4UiRH-U5DyvdnRL744IjsPgkXqwZ21xgWAOxA3dyLzMT63B1CSDwbjrUHbG9EBDW3JXupbm9nagtJziC2eIn0rFv-ajWGg6N_kpqpXlhAM3uivzvHIwhtYOyeLXL6TDtetsDwkpTlARjkmrs63vmlkLrzYUsQmj9b_UmMkz3RYtQ4dxH50WaxQlEJIknoi_jYzp7VGr29saxfc3ycWnrkZRsnBoa2hxhhjASMBc"/>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Alex Hartman</p>
                        <p className="text-xs text-gray-600">Logistics Lead</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all text-xs px-3 py-1 flex items-center gap-1">
                      Edit Guard
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">This person is the designated contact for issue reporting and escalation for this project.</p>
                <div className="mt-4 flex items-center space-x-3">
                  <a className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors" href="#">
                    <MessageSquare className="h-5 w-5" />
                  </a>
                  <a className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors" href="#">
                    <Package className="h-5 w-5" />
                  </a>
                  <a className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors" href="#">
                    <Phone className="h-5 w-5" />
                  </a>
                  <a className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors" href="#">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
              <button 
                onClick={() => setShowCriticalIssueModal(true)}
                className="w-full rounded-md px-4 py-2 text-sm mt-4 bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 font-bold border border-red-700"
              >
                Submit Critical Issue
              </button>
            </div>
          </div>

          {/* Document Checklist */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Document Checklist</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium text-gray-900 truncate">Commercial Invoice</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <AlertTriangle className="h-3 w-3" />
                      Required
                    </span>
                    <p className="text-xs text-gray-500">Today, 2:45 PM</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all">
                    Generate
                  </button>
                  <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all">
                    Upload
                  </button>
                </div>
              </li>
              <li className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium text-gray-900 truncate">Packing List</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3" />
                      Submitted
                    </span>
                    <p className="text-xs text-gray-500">Today, 11:10 AM</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all">
                    Generate
                  </button>
                  <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all">
                    Replace
                  </button>
                </div>
              </li>
              <li className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium text-gray-900 truncate">Insurance Certificate</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="h-3 w-3" />
                      Error
                    </span>
                    <p className="text-xs text-gray-500">Yesterday, 4:20 PM</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all">
                    Generate
                  </button>
                  <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all">
                    Upload
                  </button>
                </div>
              </li>
              <li className="flex items-center justify-between pt-3">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium text-gray-900 truncate">Equipment Certificates</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3" />
                      Submitted
                    </span>
                    <p className="text-xs text-gray-500">Yesterday, 9:30 AM</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all">
                    Generate
                  </button>
                  <button className="bg-white text-gray-600 rounded-md px-3 py-2 text-xs font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 border border-gray-300 shadow-sm transition-all">
                    Replace
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Comments & Collaboration</h2>
        
        {/* Add Comment */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div
              className="w-8 h-8 bg-center bg-no-repeat bg-cover rounded-full flex-shrink-0"
              style={{ backgroundImage: `url("https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop")` }}
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment... Use @ to mention colleagues"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  Use @ to mention colleagues
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
              <div
                className="w-8 h-8 bg-center bg-no-repeat bg-cover rounded-full flex-shrink-0"
                style={{ backgroundImage: `url("${comment.user.avatar}")` }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
                
                {/* Reply functionality */}
                <div className="mt-2 flex items-center gap-4">
                  <button className="text-xs text-blue-600 hover:text-blue-800">Reply</button>
                  <button className="text-xs text-gray-500 hover:text-gray-700">Like</button>
                </div>
                
                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 ml-4 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <div
                          className="w-6 h-6 bg-center bg-no-repeat bg-cover rounded-full flex-shrink-0"
                          style={{ backgroundImage: `url("${reply.user.avatar}")` }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs text-gray-900">{reply.user.name}</span>
                            <span className="text-xs text-gray-500">{reply.timestamp}</span>
                          </div>
                          <p className="text-xs text-gray-700">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No comments yet. Start the conversation!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeMainTab) {
      case 'equipment-planning':
        return renderEquipmentPlanning();
      case 'site-allocation':
        return renderSiteAllocation();
      case 'shipping-documentation':
        return renderShippingDocumentation();
      default:
        return renderEquipmentPlanning();
    }
  };

  return (
    <div className="flex h-full bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Logistics & Hardware</h1>
          <p className="text-gray-600 mb-6">Define what's needed for the site.</p>

          {/* Main Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id)}
                    className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                      activeMainTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="mt-8">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this equipment item?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => confirmDelete(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                No
              </button>
              <button
                onClick={() => confirmDelete(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Changes</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to save these changes?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleSaveConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                No
              </button>
              <button
                onClick={() => handleSaveConfirm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Critical Issue Modal */}
      {showCriticalIssueModal && (
        <CriticalIssueModal 
          onClose={() => setShowCriticalIssueModal(false)}
          onSubmit={(formData) => {
            // Handle form submission here
            console.log('Critical issue submitted:', formData);
            toast.success('Critical issue submitted successfully');
            setShowCriticalIssueModal(false);
          }}
        />
      )}
    </div>
  );
}

interface CriticalIssueFormData {
  project: string;
  subject: string;
  priority: 'high' | 'medium' | 'low' | '';
  description: string;
  attachments: FileList | null;
}

interface CriticalIssueModalProps {
  onClose: () => void;
  onSubmit: (formData: CriticalIssueFormData) => void;
}

function CriticalIssueModal({ onClose, onSubmit }: CriticalIssueModalProps) {
  const [formData, setFormData] = useState<CriticalIssueFormData>({
    project: '',
    subject: '',
    priority: '',
    description: '',
    attachments: null
  });
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');

  const projects = [
    'Project Alpha',
    'Project Beta', 
    'Project Gamma',
    'Project Delta',
    'Project Epsilon'
  ];

  const filteredProjects = projects.filter(project =>
    project.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleProjectSelect = (project: string) => {
    setFormData(prev => ({ ...prev, project }));
    setProjectSearchTerm(project);
    setShowProjectDropdown(false);
  };

  const getPriorityDescription = () => {
    switch (formData.priority) {
      case 'high':
        return { 
          title: 'High Priority',
          text: 'Immediate impact on operations; requires urgent attention.',
          className: 'bg-red-50 border-red-500 text-red-900'
        };
      case 'medium':
        return {
          title: 'Medium Priority', 
          text: 'Significant but not immediate impact; requires attention soon.',
          className: 'bg-yellow-50 border-yellow-500 text-yellow-900'
        };
      case 'low':
        return {
          title: 'Low Priority',
          text: 'Minor issue with minimal impact; can be addressed in due course.',
          className: 'bg-green-50 border-green-500 text-green-900'
        };
      default:
        return null;
    }
  };

  const priorityDesc = getPriorityDescription();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-gray-900"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">Submit a Critical Issue</h2>
        <p className="text-center mb-6 text-gray-600">Please provide details about the shipping or documentation problem.</p>
        
        <form onSubmit={handleSubmit}>
          {/* Project Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-600">Project</label>
            <div className="relative">
              <input
                type="text"
                value={projectSearchTerm}
                onChange={(e) => {
                  setProjectSearchTerm(e.target.value);
                  setShowProjectDropdown(true);
                }}
                onFocus={() => setShowProjectDropdown(true)}
                onBlur={() => setTimeout(() => setShowProjectDropdown(false), 200)}
                className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 p-3 pr-10"
                placeholder="Search and select a project"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              {showProjectDropdown && (
                <ul className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredProjects.map((project) => (
                    <li
                      key={project}
                      onMouseDown={() => handleProjectSelect(project)}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100"
                    >
                      {project}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-600">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 p-3"
              placeholder="e.g., Damaged Goods in Shipment #ABC-123"
            />
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-600">Priority Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 p-3"
            >
              <option value="" disabled>Select a priority level</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Priority Description */}
          {priorityDesc && (
            <div className={`p-4 border-l-4 rounded-md mb-6 ${priorityDesc.className}`}>
              <p className="font-semibold text-sm">{priorityDesc.title}</p>
              <p className="text-sm mt-1">{priorityDesc.text}</p>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-600">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 h-32 p-3 resize-none"
              placeholder="Describe the issue in detail, including what happened, when it occurred, and any other relevant information."
            />
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-600">Attachments</label>
            <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 hover:border-red-500 transition-colors">
              <input
                type="file"
                multiple
                onChange={(e) => setFormData(prev => ({ ...prev, attachments: e.target.files }))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center text-gray-600">
                <ArrowRight className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>
                  <span className="font-semibold text-red-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md shadow-sm px-4 py-3 text-base font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}